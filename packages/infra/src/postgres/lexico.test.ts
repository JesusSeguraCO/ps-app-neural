// Léxico contra PostgreSQL real (HU-139; tareas 1.6 y 1.8): el panel escribe con `ps_panel` y la
// búsqueda del portal lee con `ps_portal` por vistas, en la petición siguiente y sin despliegue.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import {
  aprobarPropuesta,
  candidatasDelPeriodo,
  decidirCandidata,
  guardarTermino,
  interpretarConsulta,
  listarLexico,
  propuestasPendientes,
  rechazarPropuesta,
} from "./lexico";
import { RechazoInventario } from "./unidad-inventario";

const claves = { hmac: randomBytes(32).toString("hex"), kek: randomBytes(32).toString("hex") };

async function rechazo(p: Promise<unknown>): Promise<RechazoInventario> {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("se esperaba un rechazo");
}

describe.skipIf(!HAY_BD)("léxico de búsqueda (HU-139)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let karen: { usuarioId: string; correo: string };
  const ids: Record<string, string> = {};

  const propuesta = async (termino: string, equivalencias: Array<{ tipo: string; id: string }>) =>
    (
      await bd.instalacion.query(
        `INSERT INTO inventario.propuestas_lexico (termino, sinonimos, equivalencias, ejemplo, busquedas, cuentas, consultas)
         VALUES ($1, '{}', $2, $3, 4, 3, '{}') RETURNING id`,
        [termino, JSON.stringify(equivalencias), `desarrollador con ${termino}`],
      )
    ).rows[0].id as string;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    const i = bd.instalacion;
    const u = await i.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', '\\x01', 'administrador') RETURNING id`,
    );
    karen = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    const f = (
      await i.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Calidad') RETURNING id`,
      )
    ).rows[0].id;
    ids.qa = (
      await i.query(
        `INSERT INTO inventario.catalogo_roles (nombre, familia_id) VALUES ('Analista QA automatización', $1) RETURNING id`,
        [f],
      )
    ).rows[0].id;
    for (const t of ["Kafka", "RabbitMQ", "Java"])
      ids[t] = (
        await i.query(
          `INSERT INTO inventario.catalogo_tecnologias (nombre) VALUES ($1) RETURNING id`,
          [t],
        )
      ).rows[0].id;
    for (const s of ["Banca", "Seguros"])
      ids[s] = (
        await i.query(
          `INSERT INTO inventario.catalogo_sectores (nombre) VALUES ($1) RETURNING id`,
          [s],
        )
      ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("happy: registro un término con su equivalencia y la búsqueda siguiente del portal lo reconoce", async () => {
    const antes = await interpretarConsulta(portal, "experto en pagos en tiempo real");
    expect(antes.reconocidos).toEqual([]);
    await guardarTermino(panel, claves, karen, {
      termino: "pagos en tiempo real",
      sinonimos: ["pagos inmediatos"],
      tipo: "tecnologia",
      valores: ["kafka"],
    });
    const despues = await interpretarConsulta(portal, "experto en pagos en tiempo real");
    expect(despues.reconocidos).toEqual([
      { texto: "pagos en tiempo real", valores: [{ tipo: "tecnologia", nombre: "Kafka" }] },
    ]);
    expect((await interpretarConsulta(portal, "pagos inmediatos")).reconocidos).toHaveLength(1);
    const audit = await bd.instalacion.query(
      `SELECT campo, actor FROM auditoria.auditoria WHERE entidad = 'lexico' ORDER BY seq`,
    );
    expect(audit.rows.map((r) => r.campo)).toEqual([
      "termino",
      "sinonimos",
      "origen",
      "equivalencias.tecnologia",
    ]);
    expect(audit.rows.every((r) => r.actor === "karen@trycore.com")).toBe(true);
  });

  it("guardar el mismo término (otras mayúsculas) con otro tipo lo completa sin duplicarlo", async () => {
    await guardarTermino(panel, claves, karen, {
      termino: "Pagos en Tiempo Real",
      sinonimos: ["pagos inmediatos"],
      tipo: "sector",
      valores: ["Banca"],
    });
    const lexico = await listarLexico(panel);
    expect(lexico).toHaveLength(1);
    expect(lexico[0]!.equivalencias.map((e) => `${e.tipo}:${e.nombre}`)).toEqual([
      "sector:Banca",
      "tecnologia:Kafka",
    ]);
  });

  it("error: equivalencia a un valor inexistente → rechazo con lo más parecido del catálogo, nada escrito", async () => {
    const e = await rechazo(
      guardarTermino(panel, claves, karen, {
        termino: "pagos instantáneos",
        sinonimos: [],
        tipo: "tecnologia",
        valores: ["Kafka Streams"],
      }),
    );
    expect(e.motivo).toBe("valor_inexistente");
    expect(e.detalle).toMatchObject({ valor: "Kafka Streams", tipo: "tecnologia" });
    expect((e.detalle.sugerencias as string[])[0]).toBe("Kafka");
    expect((await listarLexico(panel)).map((t) => t.termino)).not.toContain("pagos instantáneos");
  });

  it("happy: apruebo una propuesta tal cual → entra con todas sus equivalencias y se reconoce", async () => {
    const id = await propuesta("aseguradoras", [{ tipo: "sector", id: ids.Seguros! }]);
    expect((await propuestasPendientes(panel)).map((p) => p.termino)).toContain("aseguradoras");
    // Pendiente: todavía no cambia la búsqueda.
    expect((await interpretarConsulta(portal, "aseguradoras")).reconocidos).toEqual([]);
    await aprobarPropuesta(panel, claves, karen, id);
    expect((await interpretarConsulta(portal, "aseguradoras")).reconocidos[0]!.valores).toEqual([
      { tipo: "sector", nombre: "Seguros" },
    ]);
    expect((await propuestasPendientes(panel)).map((p) => p.id)).not.toContain(id);
  });

  it("happy: apruebo una propuesta editada → entra tal como quedó (sin lo que quité)", async () => {
    const id = await propuesta("mensajería de eventos", [
      { tipo: "tecnologia", id: ids.Kafka! },
      { tipo: "sector", id: ids.Banca! },
    ]);
    await aprobarPropuesta(panel, claves, karen, id, {
      termino: "mensajería de eventos",
      sinonimos: ["colas de mensajes"],
      tipo: "tecnologia",
      valores: ["Kafka", "RabbitMQ"],
    });
    const r = await interpretarConsulta(portal, "colas de mensajes");
    expect(r.reconocidos[0]!.valores).toEqual([
      { tipo: "tecnologia", nombre: "Kafka" },
      { tipo: "tecnologia", nombre: "RabbitMQ" },
    ]);
  });

  it("edge: rechazo una propuesta → no entra, deja de ofrecerse y no puede volver a proponerse", async () => {
    const id = await propuesta("analista de calidad de software", [{ tipo: "rol", id: ids.qa! }]);
    await rechazarPropuesta(panel, claves, karen, id);
    expect((await propuestasPendientes(panel)).map((p) => p.id)).not.toContain(id);
    expect(
      (await interpretarConsulta(portal, "analista de calidad de software")).reconocidos,
    ).toEqual([]);
    expect((await rechazo(aprobarPropuesta(panel, claves, karen, id))).motivo).toBe("ya_decidida");
    const repetida = await propuesta("Analista de Calidad de Software", [
      { tipo: "rol", id: ids.qa! },
    ]).catch((e: { code?: string }) => e.code);
    expect(repetida).toBe("23505");
  });

  it("edge: las consultas sin coincidencia se ofrecen como candidatas y van al léxico o a reclutamiento", async () => {
    const i = bd.instalacion;
    const c = async (consulta: string, veces: number) =>
      (
        await i.query(
          `INSERT INTO inventario.candidatas_lexico (consulta, periodo, veces, cuentas, sintetica) VALUES ($1, '2026-09-01', $2, 2, true) RETURNING id`,
          [consulta, veces],
        )
      ).rows[0].id as string;
    const integraciones = await c(
      "ingeniero de integraciones con experiencia en pasarelas de pago",
      5,
    );
    const cobol = await c("desarrollador COBOL para migración de core", 4);
    const lista = await candidatasDelPeriodo(panel, "2026-09-01");
    expect(lista.map((x) => x.id)).toEqual([integraciones, cobol]);
    expect(lista[0]!.reconocimiento.sinReconocer).toEqual([
      "ingeniero",
      "integraciones",
      "pasarelas",
      "pago",
    ]);

    await guardarTermino(panel, claves, karen, {
      termino: "pasarelas de pago",
      sinonimos: [],
      tipo: "sector",
      valores: ["Banca"],
      candidataId: integraciones,
    });
    await decidirCandidata(panel, claves, karen, cobol, "agenda_reclutamiento");
    const despues = await candidatasDelPeriodo(panel, "2026-09-01");
    expect(despues.map((x) => [x.consulta.slice(0, 11), x.destino])).toEqual([
      ["ingeniero d", "lexico"],
      ["desarrollad", "agenda_reclutamiento"],
    ]);
    expect(despues[0]!.reconocimiento.reconocidos.map((r) => r.texto)).toEqual([
      "pasarelas de pago",
    ]);
    expect(despues[1]!.decididoPor).toBe("karen@trycore.com");
    expect(
      (await rechazo(decidirCandidata(panel, claves, karen, cobol, "descartada"))).motivo,
    ).toBe("ya_decidida");
  });
});
