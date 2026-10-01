// `aplicar_importacion` en el despacho real de la cola (EP-006 · sub-slice 4, tarea 4.1; contrato I-2
// de ADR-0003; parte de V3-5): el panel confirma y encola, el worker aplica una sola vez. Un reclamo
// que retoma tras morir el proceso no reaplica: si el lote quedó aplicado cierra `hecho`, si no lo
// deja `abortado` sin filas aplicadas. Con el candado tomado vuelve a la cola sin gastar su intento.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  bancoEnFormato,
  catalogosImportacion,
  confirmarLote,
  registrarLote,
} from "@ps/infra/postgres/importacion";
import { vuelta, type ContextoDespacho } from "./despacho";
import { sembrarFicticios } from "./sembrar-ficticios";

const claves = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);

describe.skipIf(!HAY_BD)("aplicar_importacion en el worker (HU-141, I-2)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let ctx: ContextoDespacho;
  let eventos: Array<Record<string, unknown>>;
  let autor: { usuarioId: string; correo: string };

  const confirmado = async (tsv: string) => {
    const lectura = leer(tsv, "tsv");
    if (!lectura.ok) throw new Error(lectura.motivo);
    const emparejamiento = proponerEmparejamiento(lectura.tabla.encabezados, CAMPOS_IMPORTACION);
    const filas = mapearFilas(lectura.tabla, emparejamiento);
    const banco = await bancoEnFormato(panel);
    const plan = calcularPlan({
      filas,
      modo: "crear_y_actualizar",
      banco: new Map(banco.map((f) => [f.codigo as string, f])),
      catalogos: await catalogosImportacion(panel),
      hoy: HOY,
    });
    const id = await registrarLote(panel, autor, {
      archivoHash: randomBytes(32).toString("hex"),
      formato: "tsv",
      modo: "crear_y_actualizar",
      emparejamiento: [],
      filas,
      plan,
    });
    const { trabajoId } = await confirmarLote(panel, autor, id);
    return { id, trabajoId };
  };
  const trabajo = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT estado, intentos, ultimo_error, proximo_intento > now() + interval '30 seconds' AS diferido
           FROM operacion.trabajos WHERE id = $1`,
        [id],
      )
    ).rows[0];
  const lote = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT estado, motivo_aborto FROM inventario.lotes_importacion WHERE id = $1`,
        [id],
      )
    ).rows[0];
  const anclaje = async (codigo: string) =>
    (
      await bd.instalacion.query(`SELECT anclaje FROM inventario.perfiles WHERE codigo = $1`, [
        codigo,
      ])
    ).rows[0].anclaje;
  // Simula que el proceso que lo había reclamado murió: en curso, intento anotado, arrendamiento vencido.
  const muerto = (id: string) =>
    bd.instalacion.query(
      `UPDATE operacion.trabajos SET estado = 'en_curso', intentos = 1, locked_by = 'muerto',
              locked_until = now() - interval '1 second' WHERE id = $1`,
      [id],
    );

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    const worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: claves, appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    eventos = [];
    ctx = {
      bd: worker,
      correo: new DobleCorreo(),
      peppers: { cliente: "c".repeat(40), panel: "p".repeat(40) },
      reclamo: "prueba",
      registrar: (e) => eventos.push(e),
      importacion: { auditoria: claves },
    };
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("confirmar encola y una vuelta del worker lo aplica y cierra el trabajo «hecho»", async () => {
    const { id, trabajoId } = await confirmado("Código\tAnclaje\nPS-0160\tAplicado por el worker");
    expect(await vuelta(ctx)).toBe(1);
    expect(await lote(id)).toEqual({ estado: "aplicado", motivo_aborto: null });
    expect(await trabajo(trabajoId)).toMatchObject({ estado: "hecho", intentos: 1 });
    expect(await anclaje("PS-0160")).toBe("Aplicado por el worker");
    expect(eventos.at(-1)).toMatchObject({
      evento: "importacion_aplicada",
      lote: id,
      actualizados: 1,
    });
  });

  it("si el proceso murió a mitad, el reclamo que lo retoma lo deja abortado sin aplicar nada", async () => {
    const { id, trabajoId } = await confirmado("Código\tAnclaje\nPS-0187\tNo debe aplicarse");
    const antes = await anclaje("PS-0187");
    await muerto(trabajoId);
    await vuelta(ctx);
    expect(await lote(id)).toEqual({ estado: "abortado", motivo_aborto: "interrumpido" });
    expect(await trabajo(trabajoId)).toMatchObject({
      estado: "fallando",
      ultimo_error: "interrumpido",
    });
    expect(await anclaje("PS-0187")).toBe(antes);
  });

  it("si el lote ya había quedado aplicado, el reclamo que lo retoma cierra «hecho» sin reaplicar", async () => {
    const { id, trabajoId } = await confirmado("Código\tAnclaje\nPS-0201\tUna sola vez");
    await vuelta(ctx);
    const version = (
      await bd.instalacion.query(`SELECT version FROM inventario.perfiles WHERE codigo = 'PS-0201'`)
    ).rows[0].version;
    await muerto(trabajoId);
    await vuelta(ctx);
    expect((await lote(id)).estado).toBe("aplicado");
    expect(await trabajo(trabajoId)).toMatchObject({ estado: "hecho" });
    const despues = (
      await bd.instalacion.query(`SELECT version FROM inventario.perfiles WHERE codigo = 'PS-0201'`)
    ).rows[0].version;
    expect(despues).toBe(version);
  });

  it("con el candado tomado vuelve a la cola en 1 min sin gastar el intento", async () => {
    const { id, trabajoId } = await confirmado("Código\tAnclaje\nPS-0215\tCuando se libere");
    const otra = await bd.instalacion.connect();
    try {
      await otra.query("BEGIN");
      await otra.query(`SELECT pg_advisory_xact_lock(hashtext('inventario.importacion'))`);
      await vuelta(ctx);
    } finally {
      await otra.query("ROLLBACK");
      otra.release();
    }
    expect(await trabajo(trabajoId)).toMatchObject({
      estado: "pendiente",
      intentos: 0,
      diferido: true,
    });
    expect((await lote(id)).estado).toBe("calculado");
  });

  it("si el plan ya no es el que se vio, el lote queda abortado y el trabajo «fallando» sin reintento", async () => {
    const viejo = await confirmado("Código\tAnclaje\nPS-0223\tDel lote viejo");
    const nuevo = await confirmado("Código\tAnclaje\nPS-0223\tDel lote nuevo");
    // El nuevo se aplica primero (lo adelantamos en la cola).
    await bd.instalacion.query(`UPDATE operacion.trabajos SET prioridad = 10 WHERE id = $1`, [
      nuevo.trabajoId,
    ]);
    await vuelta(ctx);
    expect(await lote(viejo.id)).toEqual({ estado: "abortado", motivo_aborto: "banco_cambiado" });
    expect(await trabajo(viejo.trabajoId)).toMatchObject({
      estado: "fallando",
      ultimo_error: "banco_cambiado",
    });
    expect(await anclaje("PS-0223")).toBe("Del lote nuevo");
  });
});
