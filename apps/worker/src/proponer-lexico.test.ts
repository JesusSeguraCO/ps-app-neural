// `proponer_lexico` y el planificador contra PostgreSQL real con `ps_worker` y el doble de Gemini
// (tarea 1.7): V9-8/V4-4 (ninguna consulta vetada en el lote enviado), propuestas solo PENDIENTES,
// sin repetir las rechazadas, y fallo del modelo → la corrida no propone nada.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { DobleGemini } from "@ps/infra/gemini/lexico";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { registrarTareas, vueltaPlanificador, type Tarea } from "./planificador";
import { proponerLexico } from "./proponer-lexico";
import { sembrarFicticios } from "./sembrar-ficticios";
import { CANDIDATAS_SINTETICAS, sembrarLexicoFicticio } from "./sembrar-lexico";

const CLAVES = { hmac: "h".repeat(48), kek: "k".repeat(48) };

describe("sembrarLexicoFicticio se niega en producción", () => {
  it("lanza sin tocar la BD", async () => {
    const bd = {
      query: () => Promise.reject(new Error("no debió tocar la BD")),
    } as unknown as pg.Pool;
    await expect(
      sembrarLexicoFicticio({ bd, appEnv: "produccion", registrar: () => {} }),
    ).rejects.toThrow(/producci[oó]n/);
  });
});

describe.skipIf(!HAY_BD)("proponer_lexico con el doble de Gemini (V9-8)", () => {
  let bd: BdPrueba;
  let worker: pg.Pool;
  const eventos: Array<Record<string, unknown>> = [];

  beforeAll(async () => {
    bd = await crearBdPrueba();
    worker = bd.como("ps_worker");
    await sembrarFicticios({ bd: worker, auditoria: CLAVES, appEnv: "ci", registrar: () => {} });
    const s = await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
    expect(s.candidatas).toBe(CANDIDATAS_SINTETICAS.length);
    // Idempotente.
    expect(
      (await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} })).candidatas,
    ).toBe(0);
  }, 90_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("el lote enviado no lleva ni la consulta con un nombre de perfil ni la que no permite el modelo", async () => {
    const doble = new DobleGemini();
    const r = await proponerLexico({
      bd: worker,
      proponedor: doble,
      registrar: (e) => eventos.push(e),
    });
    expect(doble.recibidos).toHaveLength(1);
    const enviado = JSON.stringify(doble.recibidos[0]);
    expect(enviado.toLowerCase()).not.toMatch(/laura|m[eé]ndez/);
    expect(enviado).not.toContain("pasarelas de pago");
    // Solo texto de consulta y taxonomía: ninguna clave fuera del contrato.
    expect(Object.keys(doble.recibidos[0]!).sort()).toEqual(["consultas", "taxonomia"]);
    // «arquitecto cloud-native senior» tiene 9 días: fuera de la semana.
    expect(doble.recibidos[0]!.consultas.map((c) => c.texto)).toEqual([
      "desarrollador con experiencia en pagos en tiempo real para banca",
      "desarrollador COBOL para migración de core",
      "analista de calidad de software con pruebas automatizadas",
      "líder técnico que haya trabajado con aseguradoras",
    ]);
    expect(r.omitidas).toBe(2);
    expect(r.propuestas).toBeGreaterThan(0);
  });

  it("lo propuesto queda pendiente, apunta a valores reales y no se repite en la corrida siguiente", async () => {
    const p = await worker.query(
      `SELECT termino, estado, equivalencias, busquedas FROM inventario.propuestas_lexico ORDER BY termino`,
    );
    expect(p.rows.length).toBeGreaterThan(0);
    expect(p.rows.every((x) => x.estado === "pendiente")).toBe(true);
    const lexico = await worker.query(`SELECT count(*)::int n FROM inventario.lexico`);
    expect(lexico.rows[0].n).toBe(0);
    const antes = p.rows.length;
    const r2 = await proponerLexico({
      bd: worker,
      proponedor: new DobleGemini(),
      registrar: () => {},
    });
    expect(r2.propuestas).toBe(0);
    const despues = await worker.query(`SELECT count(*)::int n FROM inventario.propuestas_lexico`);
    expect(despues.rows[0].n).toBe(antes);
  });

  it("fallo o timeout de Gemini → no se propone nada y la corrida informa el motivo", async () => {
    await bd.instalacion.query(
      `UPDATE inventario.propuestas_lexico SET estado = 'rechazada', decidido_en = now()`,
    );
    await bd.instalacion.query(
      `INSERT INTO inventario.candidatas_lexico (consulta, periodo, modelo_permitido, sintetica)
       VALUES ('ingeniero kafka con banca', date_trunc('month', now())::date, true, true)`,
    );
    const r = await proponerLexico({
      bd: worker,
      proponedor: new DobleGemini({ ok: false, motivo: "timeout" }),
      registrar: () => {},
    });
    expect(r).toMatchObject({ propuestas: 0, fallo: "timeout" });
    const pendientes = await worker.query(
      `SELECT count(*)::int n FROM inventario.propuestas_lexico WHERE estado = 'pendiente'`,
    );
    expect(pendientes.rows[0].n).toBe(0);
  });

  it("el planificador corre la tarea vencida una vez, fija la siguiente y cuenta los fallos", async () => {
    let corridas = 0;
    let fallar = false;
    const tareas: Tarea[] = [
      {
        nombre: "proponer_lexico",
        intervalo: "7 days",
        tope: "10 minutes",
        critica: false,
        ejecutar: async () => {
          corridas++;
          return fallar ? { fallo: "timeout" } : {};
        },
      },
    ];
    await registrarTareas(worker, tareas);
    await vueltaPlanificador(worker, "w-1", tareas, () => {});
    await vueltaPlanificador(worker, "w-1", tareas, () => {});
    expect(corridas).toBe(1);
    const t = await worker.query(
      `SELECT proxima_ejecucion > now() + interval '6 days' AS semana, fallos_consecutivos, lease_por FROM operacion.tareas_programadas`,
    );
    expect(t.rows[0]).toEqual({ semana: true, fallos_consecutivos: 0, lease_por: null });
    await bd.instalacion.query(`UPDATE operacion.tareas_programadas SET proxima_ejecucion = now()`);
    fallar = true;
    await vueltaPlanificador(worker, "w-1", tareas, () => {});
    const f = await worker.query(
      `SELECT proxima_ejecucion <= now() + interval '15 minutes' AS pronto, fallos_consecutivos, ultimo_error FROM operacion.tareas_programadas`,
    );
    expect(f.rows[0]).toEqual({ pronto: true, fallos_consecutivos: 1, ultimo_error: "timeout" });
    const ej = await worker.query(`SELECT resultado FROM operacion.tareas_ejecucion ORDER BY id`);
    expect(ej.rows.map((x) => x.resultado)).toEqual(["exito", "fallo"]);
  });
});
