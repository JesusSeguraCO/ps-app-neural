// Aplicar un lote de importación contra PostgreSQL real (EP-006 · sub-slice 4, tareas 4.1–4.2; HU-141;
// contrato I-2 de ADR-0003): el panel registra y confirma con `ps_panel`, el worker aplica con
// `ps_worker`. Todo o nada, una sola vez, con el plan revalidado, fusión ausente/vacío/[vaciar], sin
// publicar ni conceder consentimiento, y auditado con origen `importacion` y actor = quien confirmó.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas, type Modo } from "@ps/dominio/importacion/plan";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { verificarCadena, type ClavesAuditoria } from "./auditoria";
import { aplicarLote } from "./aplicar-importacion";
import { bancoEnFormato, catalogosImportacion, confirmarLote, registrarLote } from "./importacion";
import { leerPerfil } from "./perfiles-panel";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = "2026-10-01";

describe.skipIf(!HAY_BD)("aplicar un lote de importación (HU-141, I-2)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let autor: { usuarioId: string; correo: string };

  const lote = async (tsv: string, modo: Modo = "crear_y_actualizar") => {
    const lectura = leer(tsv, "tsv");
    if (!lectura.ok) throw new Error(lectura.motivo);
    const emparejamiento = proponerEmparejamiento(lectura.tabla.encabezados, CAMPOS_IMPORTACION);
    const filas = mapearFilas(lectura.tabla, emparejamiento);
    const banco = await bancoEnFormato(panel);
    const plan = calcularPlan({
      filas,
      modo,
      banco: new Map(banco.map((f) => [f.codigo as string, f])),
      catalogos: await catalogosImportacion(panel),
      hoy: HOY,
    });
    const id = await registrarLote(panel, autor, {
      archivoHash: randomBytes(32).toString("hex"),
      formato: "tsv",
      modo,
      emparejamiento: emparejamiento.map((c) => ({
        columna: c.columna,
        clave: c.destino.tipo === "campo" ? c.destino.clave : null,
      })),
      filas,
      plan,
    });
    return { id, plan };
  };
  const confirmado = async (tsv: string, modo?: Modo) => {
    const l = await lote(tsv, modo);
    await confirmarLote(panel, autor, l.id);
    return l;
  };
  const aplicar = (id: string, o: Partial<Parameters<typeof aplicarLote>[3]> = {}) =>
    aplicarLote(worker, claves, id, { hoy: HOY, ...o });
  const estadoLote = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT estado, motivo_aborto FROM inventario.lotes_importacion WHERE id = $1`,
        [id],
      )
    ).rows[0];
  const versionGlobal = async () =>
    Number(
      (await bd.instalacion.query(`SELECT version FROM inventario.inventario_version WHERE id = 1`))
        .rows[0].version,
    );

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: claves, appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    await bd.instalacion.query(
      `INSERT INTO inventario.catalogo_motivos_pausa (nombre) VALUES ('Pidió no ser presentado')`,
    );
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("el código manda: el existente se actualiza solo en lo que cambia y el nuevo nace en borrador", async () => {
    const version = await versionGlobal();
    const { id } = await confirmado(
      [
        "Código\tNombre\tPrimer apellido\tAnclaje\tSectores",
        "PS-0160\t\t\tUn año en analítica de retail\tRetail; Banca",
        "PS-0500\tNora\tVélez\tDiez años en seguros\tSeguros; Minería",
      ].join("\n"),
    );
    expect(await aplicar(id)).toEqual({
      tipo: "aplicado",
      creados: 1,
      actualizados: 1,
      archivados: 0,
    });
    const tomas = (await leerPerfil(panel, "PS-0160"))!;
    expect(tomas).toMatchObject({ nombre: "Tomás", estado: "borrador" });
    expect(tomas.anclaje).toBe("Un año en analítica de retail");
    expect(tomas.sectores.map((s) => s.nombre)).toEqual(["Retail", "Banca"]);
    const nora = (await leerPerfil(panel, "PS-0500"))!;
    expect(nora).toMatchObject({ nombre: "Nora", primerApellido: "Vélez", estado: "borrador" });
    expect(nora.sectores.map((s) => s.nombre)).toEqual(["Seguros", "Minería"]);
    const origen = await bd.instalacion.query(
      `SELECT origen_creacion FROM inventario.perfiles WHERE codigo = 'PS-0500'`,
    );
    expect(origen.rows[0].origen_creacion).toBe("importacion");
    expect((await estadoLote(id)).estado).toBe("aplicado");
    // «Minería» es un valor nuevo de la taxonomía: el cliente ve un filtro más → una sola subida.
    expect(await versionGlobal()).toBe(version + 1);

    // Estado previo y versión que dejó la importación (para revertir, HU-087).
    const filas = (
      await bd.instalacion.query(
        `SELECT numero, creado, estado_previo, version_aplicada, perfil_id IS NOT NULL AS con_perfil
           FROM inventario.lote_filas WHERE lote_id = $1 ORDER BY numero`,
        [id],
      )
    ).rows;
    expect(filas[0]).toMatchObject({ creado: false, con_perfil: true });
    expect(filas[0].estado_previo).toMatchObject({ nombre: "Tomás", anclaje: null });
    expect(filas[0].estado_previo.sectores).toHaveLength(1);
    expect(filas[0].version_aplicada).toBe(tomas.version);
    expect(filas[1]).toMatchObject({ creado: true, estado_previo: null });

    // Cada cambio atribuido a la importación y a quien confirmó; la cadena sigue íntegra.
    const audit = (
      await bd.instalacion.query(
        `SELECT DISTINCT actor, origen FROM auditoria.auditoria WHERE origen = 'importacion'`,
      )
    ).rows;
    expect(audit).toEqual([{ actor: "karen@trycore.com", origen: "importacion" }]);
    const campos = (
      await bd.instalacion.query(
        `SELECT entidad, campo FROM auditoria.auditoria WHERE origen = 'importacion' AND titular = 'PS-0160' ORDER BY seq`,
      )
    ).rows.map((r) => r.campo);
    expect([...campos].sort()).toEqual(["anclaje", "sectores"]);
    expect((await verificarCadena(bd.instalacion, claves.hmac)).ok).toBe(true);
  });

  it("aplicar dos veces el mismo lote no hace nada la segunda (un reclamo que lo retome)", async () => {
    const { id } = await confirmado("Código\tAnclaje\nPS-0160\tAnclaje dos");
    expect((await aplicar(id)).tipo).toBe("aplicado");
    const v = (await leerPerfil(panel, "PS-0160"))!.version;
    expect(await aplicar(id)).toEqual({ tipo: "sin_efecto", estado: "aplicado" });
    expect((await leerPerfil(panel, "PS-0160"))!.version).toBe(v);
  });

  it("consentimiento en verdadero y estado publicado se rechazan; lo demás se importa y nada se publica", async () => {
    const { id, plan } = await confirmado(
      ["Código\tEstado\tConsentimiento\tAnclaje", "PS-0160\tpublicado\tsí\tAnclaje tres"].join(
        "\n",
      ),
    );
    expect(plan.filas[0]!.avisos.map((a) => a.mensaje).join(" ")).toMatch(/Consentimiento/);
    expect(plan.filas[0]!.avisos.map((a) => a.mensaje).join(" ")).toMatch(/publicado/);
    expect((await aplicar(id)).tipo).toBe("aplicado");
    const p = (await leerPerfil(panel, "PS-0160"))!;
    expect(p.estado).toBe("borrador");
    expect(p.anclaje).toBe("Anclaje tres");
    expect(p.consentimiento).toBeNull();
  });

  it("campo ausente y celda vacía no tocan; solo [vaciar] vacía", async () => {
    const primero = await confirmado(
      "Código\tFormación\tIdiomas\nPS-0160\tTecnóloga en sistemas\tInglés B1; Francés A2",
    );
    expect((await aplicar(primero.id)).tipo).toBe("aplicado");
    const antes = (await leerPerfil(panel, "PS-0160"))!;
    const { id } = await confirmado("Código\tFormación\tIdiomas\nPS-0160\t\t[vaciar]");
    expect((await aplicar(id)).tipo).toBe("aplicado");
    const p = (await leerPerfil(panel, "PS-0160"))!;
    expect(p.formacion).toBe("Tecnóloga en sistemas");
    expect(p.idiomas).toEqual([]);
    expect(p.ciudad).toEqual(antes.ciudad);
    expect(p.anclaje).toBe(antes.anclaje);
  });

  it("solo actualizar con un código inexistente lo omite con su motivo y no crea nada", async () => {
    const { id, plan } = await confirmado(
      "Código\tAnclaje\nPS-0160\tAnclaje cuatro\nPS-0600\tNo debe existir",
      "solo_actualizar",
    );
    expect(plan.filas[1]).toMatchObject({ grupo: "omitido" });
    expect(plan.filas[1]!.motivoOmision).toMatch(/no existe/);
    expect(await aplicar(id)).toMatchObject({ tipo: "aplicado", creados: 0, actualizados: 1 });
    expect(await leerPerfil(panel, "PS-0600")).toBeNull();
  });

  it("un pausado con motivo y un archivado: estado y motivo se aplican y quedan auditados", async () => {
    const { id } = await confirmado(
      [
        "Código\tEstado\tMotivo de pausa",
        "PS-0160\tpausado\tPidió no ser presentado",
        "PS-0500\tarchivado\t",
      ].join("\n"),
    );
    expect(await aplicar(id)).toMatchObject({ tipo: "aplicado", actualizados: 1, archivados: 1 });
    const r = await bd.instalacion.query(
      `SELECT p.codigo, p.estado, m.nombre AS motivo FROM inventario.perfiles p
         LEFT JOIN inventario.catalogo_motivos_pausa m ON m.id = p.motivo_pausa_id
        WHERE p.codigo IN ('PS-0160', 'PS-0500') ORDER BY p.codigo`,
    );
    expect(r.rows).toEqual([
      { codigo: "PS-0160", estado: "pausado", motivo: "Pidió no ser presentado" },
      { codigo: "PS-0500", estado: "archivado", motivo: null },
    ]);
    const campos = (
      await bd.instalacion.query(
        `SELECT campo FROM auditoria.auditoria WHERE origen = 'importacion' AND titular = 'PS-0160' AND campo IN ('estado', 'motivo_pausa')`,
      )
    ).rows.map((x) => x.campo);
    expect(campos.sort()).toEqual(["estado", "motivo_pausa"]);
  });

  it("si el banco cambió desde la vista previa no se aplica nada y el lote queda abortado", async () => {
    // PS-0160 está pausado: el editor no lo toca; lo cambia otra importación posterior.
    const { id } = await confirmado("Código\tAnclaje\nPS-0151\tAnclaje del lote viejo");
    const otro = await confirmado("Código\tAnclaje\nPS-0151\tAnclaje del lote nuevo");
    expect((await aplicar(otro.id)).tipo).toBe("aplicado");
    expect(await aplicar(id)).toEqual({ tipo: "abortado", motivo: "banco_cambiado" });
    expect(await estadoLote(id)).toEqual({ estado: "abortado", motivo_aborto: "banco_cambiado" });
    expect((await leerPerfil(panel, "PS-0151"))!.anclaje).toBe("Anclaje del lote nuevo");
  });

  it("con otra importación en curso (candado tomado) vuelve «ocupado» sin tocar el lote", async () => {
    const { id } = await confirmado("Código\tAnclaje\nPS-0187\tAnclaje ocupado");
    const otra = await bd.instalacion.connect();
    try {
      await otra.query("BEGIN");
      await otra.query(`SELECT pg_advisory_xact_lock(hashtext('inventario.importacion'))`);
      expect(await aplicar(id)).toEqual({ tipo: "ocupado" });
    } finally {
      await otra.query("ROLLBACK");
      otra.release();
    }
    expect((await estadoLote(id)).estado).toBe("calculado");
    expect((await aplicar(id)).tipo).toBe("aplicado");
  });

  it("agotar el tope de reloj deshace todo y deja el lote abortado", async () => {
    const { id } = await confirmado(
      "Código\tAnclaje\nPS-0201\tAnclaje con tope\nPS-0215\tAnclaje con tope",
    );
    const antes = (await leerPerfil(panel, "PS-0201"))!;
    let t = 0;
    const r = await aplicar(id, { topeMs: 1_000, reloj: () => (t += 600) });
    expect(r).toEqual({ tipo: "abortado", motivo: "tope_de_tiempo" });
    expect((await leerPerfil(panel, "PS-0201"))!.version).toBe(antes.version);
    expect(await estadoLote(id)).toEqual({ estado: "abortado", motivo_aborto: "tope_de_tiempo" });
  });

  it("confirmar dos veces encola un solo trabajo; sin nada que aplicar no se confirma", async () => {
    const l = await lote("Código\tAnclaje\nPS-0223\tAnclaje una vez");
    const a = await confirmarLote(panel, autor, l.id);
    const b = await confirmarLote(panel, autor, l.id);
    expect(b.trabajoId).toBe(a.trabajoId);
    const t = await bd.instalacion.query(
      `SELECT tipo, origen, payload FROM operacion.trabajos WHERE id = $1`,
      [a.trabajoId],
    );
    expect(t.rows[0]).toEqual({
      tipo: "aplicar_importacion",
      origen: "panel",
      payload: { lote: l.id },
    });
    const vacio = await lote("Código\tAnclaje\nPS-0223\t");
    await expect(confirmarLote(panel, autor, vacio.id)).rejects.toMatchObject({
      motivo: "nada_que_aplicar",
    });
  });
});

