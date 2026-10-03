// Siembra de perfiles ficticios (EP-001 · tarea 3.2): solo en local, CI y staging; con
// APP_ENV=produccion se niega antes de tocar la BD. Contra PostgreSQL real con `ps_worker`.
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type pg from "pg";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  HEREDADOS_INCOMPLETOS,
  PERFILES_FICTICIOS,
  fechaEnDias,
  sembrarFicticios,
  sembrarHeredadosIncompletos,
} from "./sembrar-ficticios";

const CLAVES = { hmac: "h".repeat(48), kek: "k".repeat(48) };

// La disponibilidad sembrada cuenta en días civiles de Bogotá, como el portal: a las 19:30 de Colombia
// (00:30 UTC del día siguiente) «disponible hoy» sigue siendo hoy y no mañana.
describe("fecha de disponibilidad sembrada (día civil de Bogotá)", () => {
  afterEach(() => vi.useRealTimers());

  it("de noche en Colombia, hoy es el día de Bogotá aunque UTC ya vaya un día adelante", () => {
    vi.useFakeTimers({ now: new Date("2026-10-03T00:30:00Z") });
    expect(fechaEnDias(0)).toBe("2026-10-02");
    expect(fechaEnDias(7)).toBe("2026-10-09");
  });

  it("de día los dos relojes coinciden", () => {
    vi.useFakeTimers({ now: new Date("2026-10-02T15:00:00Z") });
    expect(fechaEnDias(0)).toBe("2026-10-02");
  });
});

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

describe.skipIf(!HAY_BD)(
  "sembrarFicticios en local (ps_migrador; ps_worker no escribe consentimientos, 0026)",
  () => {
    let bd: BdPrueba;
    const eventos: Array<Record<string, unknown>> = [];
    const ctx = () => ({
      bd: bd.como("ps_panel"),
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
      const antes = (await bd.instalacion.query(`SELECT max(seq) s FROM auditoria.auditoria`))
        .rows[0].s;
      const r = await sembrarFicticios(ctx());
      expect(r.creados).toBe(0);
      expect(
        (await bd.instalacion.query(`SELECT max(seq) s FROM auditoria.auditoria`)).rows[0].s,
      ).toBe(antes);
    });

    it("los heredados incompletos (HU-178) quedan publicados y sin lo que les falta; aparte del banco base e idempotentes", async () => {
      const r = await sembrarHeredadosIncompletos(ctx());
      expect(r.creados).toBe(HEREDADOS_INCOMPLETOS.length);
      const filas = (
        await bd.instalacion.query(
          `SELECT codigo, estado, saro_alcance_id IS NULL AS sin_alcance, saro_fecha IS NULL AS sin_saro,
                disc_fecha IS NULL AS sin_disc, modalidad_prueba_id IS NULL AS sin_modalidad
           FROM inventario.perfiles WHERE codigo = ANY($1) ORDER BY codigo`,
          [HEREDADOS_INCOMPLETOS.map((p) => p.codigo)],
        )
      ).rows;
      expect(filas).toEqual([
        {
          codigo: "PS-0105",
          estado: "publicado",
          sin_alcance: true,
          sin_saro: true,
          sin_disc: false,
          sin_modalidad: false,
        },
        {
          codigo: "PS-0112",
          estado: "publicado",
          sin_alcance: true,
          sin_saro: true,
          sin_disc: true,
          sin_modalidad: false,
        },
        {
          codigo: "PS-0118",
          estado: "publicado",
          sin_alcance: false,
          sin_saro: false,
          sin_disc: true,
          sin_modalidad: false,
        },
        {
          codigo: "PS-0124",
          estado: "publicado",
          sin_alcance: false,
          sin_saro: false,
          sin_disc: false,
          sin_modalidad: true,
        },
      ]);
      // No comparten código ni rol con el banco base: no mueven sus conteos.
      const base = new Set(PERFILES_FICTICIOS.flatMap((p) => [p.codigo, ...p.roles]));
      for (const h of HEREDADOS_INCOMPLETOS)
        for (const x of [h.codigo, ...h.roles]) expect(base.has(x), x).toBe(false);
      expect((await sembrarHeredadosIncompletos(ctx())).creados).toBe(0);
      await expect(sembrarHeredadosIncompletos({ ...ctx(), appEnv: "produccion" })).rejects.toThrow(
        /producci[oó]n/,
      );
    });

    it("los datos no traen ningún campo de la lista negra B.4", () => {
      const campos = new Set(
        [...PERFILES_FICTICIOS, ...HEREDADOS_INCOMPLETOS].flatMap((p) => Object.keys(p)),
      );
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
  },
);
