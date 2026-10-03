// SARO y DISC en la importación contra PostgreSQL real (EP-003 · SS3, tareas 3.2–3.4; HU-191): el banco
// se exporta con el alcance registrado y las fechas; aplicar escribe los tres datos por ServicioPerfiles
// con el worker (`ps_worker`), sin cambiar estados, con origen `importacion` y quien confirmó; revertir
// los devuelve a como estaban; un lote previo a EP-003 (estado previo sin las tres claves) no los vacía
// al revertirse; un alcance desactivado no se asigna a quien no lo tenía.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { CAMPOS_IMPORTACION, leer } from "@ps/contratos/importacion";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas } from "@ps/dominio/importacion/plan";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { leerCambios, type ClavesAuditoria } from "./auditoria";
import { aplicarLote } from "./aplicar-importacion";
import {
  alcanceActivoDeEjemplo,
  bancoEnFormato,
  catalogosImportacion,
  confirmarLote,
  registrarLote,
} from "./importacion";
import { listarInventario } from "./perfiles-panel";
import { confirmarReversion, revertirLote } from "./revertir-importacion";
import {
  sembrarFicticios,
  sembrarHeredadosIncompletos,
} from "../../../../apps/worker/src/sembrar-ficticios";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = "2026-10-02";
const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";
const ENC = (clave: string) => CAMPOS_IMPORTACION.find((c) => c.clave === clave)!.encabezado;

describe.skipIf(!HAY_BD)("SARO y DISC en la importación (HU-191)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let autor: { usuarioId: string; correo: string };

  const calcular = async (tsv: string) => {
    const lectura = leer(tsv, "tsv");
    if (!lectura.ok) throw new Error(lectura.motivo);
    const filas = mapearFilas(
      lectura.tabla,
      proponerEmparejamiento(lectura.tabla.encabezados, CAMPOS_IMPORTACION),
    );
    const banco = await bancoEnFormato(panel);
    return {
      filas,
      plan: calcularPlan({
        filas,
        modo: "crear_y_actualizar",
        banco: new Map(banco.map((f) => [f.codigo as string, f])),
        catalogos: await catalogosImportacion(panel),
        hoy: HOY,
      }),
    };
  };
  const aplicado = async (tsv: string) => {
    const { filas, plan } = await calcular(tsv);
    const id = await registrarLote(panel, autor, {
      archivoHash: randomBytes(32).toString("hex"),
      formato: "tsv",
      modo: "crear_y_actualizar",
      emparejamiento: [],
      filas,
      plan,
    });
    await confirmarLote(panel, autor, id);
    expect((await aplicarLote(worker, claves, id, { hoy: HOY })).tipo).toBe("aplicado");
    return id;
  };
  const datos = async (codigo: string) =>
    (
      await bd.instalacion.query(
        `SELECT p.id, p.estado, sa.nombre AS alcance, p.saro_fecha::text AS saro, p.disc_fecha::text AS disc
           FROM inventario.perfiles p LEFT JOIN inventario.catalogo_alcances_saro sa ON sa.id = p.saro_alcance_id
          WHERE p.codigo = $1`,
        [codigo],
      )
    ).rows[0];

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
    const ctx = { bd: panel, auditoria: claves, appEnv: "ci" as const, registrar: () => {} };
    await sembrarFicticios(ctx);
    await sembrarHeredadosIncompletos(ctx);
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("tarea 3.2 · el banco se exporta con el alcance registrado y las fechas; la plantilla toma uno activo", async () => {
    const banco = await bancoEnFormato(panel);
    expect(banco.find((f) => f.codigo === "PS-0142")).toMatchObject({
      saroAlcance: ANTECEDENTES,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
    });
    expect(banco.find((f) => f.codigo === "PS-0105")).toMatchObject({
      saroAlcance: null,
      saroFecha: null,
    });
    expect(await alcanceActivoDeEjemplo(panel)).toBe(ANTECEDENTES);
  });

  it("tarea 3.4 · aplicar completa los incompletos sin cambiar estados, con origen importación; revertir los devuelve", async () => {
    const codigos = ["PS-0105", "PS-0112"];
    const id = await aplicado(
      [
        ["Código", ENC("saroAlcance"), ENC("saroFecha"), ENC("discFecha")].join("\t"),
        ...codigos.map((c) =>
          [
            c,
            "ANTECEDENTES judiciales, disciplinarios y fiscales",
            "15/03/2026",
            "2026-04-10",
          ].join("\t"),
        ),
      ].join("\n"),
    );
    for (const c of codigos)
      expect(await datos(c), c).toMatchObject({
        estado: "publicado",
        alcance: ANTECEDENTES,
        saro: "2026-03-15",
        disc: "2026-04-10",
      });
    const marcas = (await listarInventario(panel)).filter((f) => f.incompleto).map((f) => f.codigo);
    expect(marcas).not.toContain("PS-0105");
    expect(marcas).not.toContain("PS-0112");
    const cambios = (
      await leerCambios(bd.instalacion, claves.kek, "perfiles", (await datos("PS-0105")).id)
    ).filter((x) => ["saro_alcance", "saro_fecha", "disc_fecha"].includes(x.campo));
    expect(cambios.map((x) => x.campo).sort()).toEqual(["saro_alcance", "saro_fecha"]);
    for (const x of cambios)
      expect(x).toMatchObject({ origen: "importacion", actor: "karen@trycore.com" });

    await confirmarReversion(panel, autor, id, []);
    expect((await revertirLote(worker, claves, id, [])).tipo).toBe("revertido");
    expect(await datos("PS-0105")).toMatchObject({
      estado: "publicado",
      alcance: null,
      saro: null,
    });
    expect(await datos("PS-0112")).toMatchObject({ alcance: null, saro: null, disc: null });
  });

  it("un lote anterior a EP-003 (estado previo sin las tres claves) no vacía SARO ni DISC al revertirse", async () => {
    const id = await aplicado(
      ["Código\tAnclaje de experiencia", "PS-0142\tAnclaje por importación"].join("\n"),
    );
    await bd.instalacion.query(
      `UPDATE inventario.lote_filas SET estado_previo = estado_previo - 'saro_alcance_id' - 'saro_fecha' - 'disc_fecha'
        WHERE lote_id = $1`,
      [id],
    );
    await confirmarReversion(panel, autor, id, []);
    expect((await revertirLote(worker, claves, id, [])).tipo).toBe("revertido");
    expect(await datos("PS-0142")).toMatchObject({
      alcance: ANTECEDENTES,
      saro: "2026-03-15",
      disc: "2026-04-10",
    });
  });

  it("un alcance desactivado no se asigna por importación a quien no lo tenía", async () => {
    await bd.instalacion.query(
      `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente, activo) VALUES ('Solo judiciales', 'Verificamos antecedentes judiciales.', false)`,
    );
    const { plan } = await calcular(
      [["Código", ENC("saroAlcance")].join("\t"), "PS-0118\tsolo judiciales"].join("\n"),
    );
    expect(plan.filas[0]).toMatchObject({
      grupo: "con_error",
      errores: [
        {
          campo: "saroAlcance",
          mensaje: "El alcance SARO está desactivado en el catálogo: «Solo judiciales»",
        },
      ],
    });
    expect(plan.valoresNuevos).toEqual([]);
  });
});
