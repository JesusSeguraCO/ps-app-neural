// Siembra de perfiles ficticios (EP-001 · tarea 3.2): solo en local, CI y staging; con
// APP_ENV=produccion se niega antes de tocar la BD. Contra PostgreSQL real con `ps_worker`.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { PERFILES_FICTICIOS, sembrarFicticios } from "./sembrar-ficticios";

const CLAVES = { hmac: "h".repeat(48), kek: "k".repeat(48) };

describe("sembrarFicticios se niega en producción", () => {
  it("con APP_ENV=produccion lanza sin usar la BD", async () => {
    const bdQueExplota = {
      query: () => {
        throw new Error("no debió tocar la BD");
      },
      connect: () => {
        throw new Error("no debió tocar la BD");
      },
    } as unknown as pg.Pool;
    await expect(
      sembrarFicticios({
        bd: bdQueExplota,
        auditoria: CLAVES,
        appEnv: "produccion",
        registrar: () => {},
      }),
    ).rejects.toThrow(/producci[oó]n/);
  });
});

describe.skipIf(!HAY_BD)("sembrarFicticios en local (ps_worker)", () => {
  let bd: BdPrueba;
  const eventos: Array<Record<string, unknown>> = [];
  const ctx = () => ({
    bd: bd.como("ps_worker"),
    auditoria: CLAVES,
    appEnv: "ci" as const,
    registrar: (e: Record<string, unknown>) => eventos.push(e),
  });

  beforeAll(async () => {
    bd = await crearBdPrueba();
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("siembra los perfiles con estados variados, consentimiento a los publicados y auditoría", async () => {
    const r = await sembrarFicticios(ctx());
    expect(r.creados).toBe(PERFILES_FICTICIOS.length);
    const estados = await bd.instalacion.query(
      `SELECT estado, count(*)::int n FROM inventario.perfiles GROUP BY estado ORDER BY estado`,
    );
    const porEstado = Object.fromEntries(estados.rows.map((f) => [f.estado, f.n]));
    expect(Object.keys(porEstado).sort()).toEqual([
      "archivado",
      "borrador",
      "pausado",
      "publicado",
    ]);
    // El colocado sigue publicado, con su colocación vigente y su disponibilidad = liberación (HU-137).
    const colocado = (
      await bd.instalacion.query(
        `SELECT p.codigo, p.estado, c.fuente, c.liberacion = p.disponibilidad_fecha AS coincide
           FROM inventario.colocaciones c JOIN inventario.perfiles p ON p.id = c.perfil_id WHERE c.vigente`,
      )
    ).rows;
    expect(colocado).toEqual([
      { codigo: "PS-0137", estado: "publicado", fuente: "siembra", coincide: true },
    ]);
    const publicables = await bd
      .como("ps_portal")
      .query(`SELECT codigo, roles, tecnologias FROM operacion.catalogo_publicable`);
    expect(publicables.rows.length).toBe(porEstado.publicado);
    for (const f of publicables.rows) {
      expect(f.roles.length).toBeGreaterThan(0);
      expect(f.tecnologias.length).toBeGreaterThan(0);
    }
    // Cada perfil auditado con su propio titular y la cadena verifica.
    const a = await bd.instalacion.query(
      `SELECT count(DISTINCT titular)::int n FROM auditoria.auditoria WHERE entidad = 'perfiles'`,
    );
    expect(a.rows[0].n).toBe(PERFILES_FICTICIOS.length);
    expect((await verificarCadena(bd.instalacion, CLAVES.hmac)).ok).toBe(true);
  });

  it("es idempotente: una segunda vez no crea nada ni audita", async () => {
    const antes = (await bd.instalacion.query(`SELECT max(seq) s FROM auditoria.auditoria`)).rows[0]
      .s;
    const r = await sembrarFicticios(ctx());
    expect(r.creados).toBe(0);
    expect(
      (await bd.instalacion.query(`SELECT max(seq) s FROM auditoria.auditoria`)).rows[0].s,
    ).toBe(antes);
  });

  it("los datos no traen ningún campo de la lista negra B.4", () => {
    const campos = new Set(PERFILES_FICTICIOS.flatMap((p) => Object.keys(p)));
    for (const b of [
      "foto",
      "correo",
      "telefono",
      "cv",
      "motivacion",
      "promedio",
      "certificaciones",
      "disc",
    ]) {
      expect(
        [...campos].some((c) => c.toLowerCase().includes(b)),
        b,
      ).toBe(false);
    }
  });
});
