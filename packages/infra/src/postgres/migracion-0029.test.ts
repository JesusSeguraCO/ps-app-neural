// Migración 0029 (EP-003 · sub-slice 2, tarea 2.4; HU-178, D80): `operacion.indicadores_publicacion`,
// una fila por publicado con solo booleanos y enteros —sin código, sin identificador, sin datos
// personales—, legible por `ps_portal` (y el panel); el worker no la lee. `down` la retira y `up` la
// devuelve. V3-7 (sin DML) la cubre migracion-0013.test.ts para toda migración ≥ 0013.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import pg from "pg";
import {
  HEREDADOS_INCOMPLETOS,
  PERFILES_FICTICIOS,
  sembrarFicticios,
  sembrarHeredadosIncompletos,
} from "../../../../apps/worker/src/sembrar-ficticios";
import {
  HAY_BD,
  PERMISO_DENEGADO,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";
import { MIGRACIONES } from "../../migraciones/indice";
import { TABLA_MIGRACIONES_ESQUEMA } from "./migrar";

const COLUMNAS = [
  ["tiene_nombre", "boolean"],
  ["tiene_primer_apellido", "boolean"],
  ["tiene_rol", "boolean"],
  ["tecnologias", "integer"],
  ["tiene_seniority", "boolean"],
  ["tiene_anios_experiencia", "boolean"],
  ["tiene_ciudad", "boolean"],
  ["tiene_modalidad_trabajo", "boolean"],
  ["tiene_disponibilidad", "boolean"],
  ["experiencias", "integer"],
  ["prueba_elegida", "boolean"],
  ["prueba_activa", "boolean"],
  ["familia_con_modalidades", "boolean"],
  ["consentimiento_registrado", "boolean"],
  ["consentimiento_vigente", "boolean"],
  ["consentimiento_nominal", "boolean"],
  ["saro_alcance", "boolean"],
  ["saro_fecha", "boolean"],
  ["disc_fecha", "boolean"],
];

describe("índice: la 0029 está registrada", () => {
  it("0029_indicadores_publicacion en el proveedor estático, la última", () => {
    expect(Object.keys(MIGRACIONES).at(-1)).toBe("0029_indicadores_publicacion");
  });
});

describe.skipIf(!HAY_BD)("migración 0029: indicadores de publicación", () => {
  let bd: BdPrueba;
  const claves = {
    hmac: randomBytes(32).toString("base64"),
    kek: randomBytes(32).toString("base64"),
  };

  const columnas = async () =>
    (
      await bd.instalacion.query(
        `SELECT column_name, data_type FROM information_schema.columns
          WHERE table_schema = 'operacion' AND table_name = 'indicadores_publicacion' ORDER BY ordinal_position`,
      )
    ).rows.map((f) => [f.column_name, f.data_type]);

  beforeAll(async () => {
    bd = await crearBdPrueba();
    await sembrarFicticios({
      bd: bd.como("ps_panel"),
      auditoria: claves,
      appEnv: "ci",
      registrar: () => {},
    });
    await sembrarHeredadosIncompletos({
      bd: bd.como("ps_panel"),
      auditoria: claves,
      appEnv: "ci",
      registrar: () => {},
    });
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("solo booleanos y enteros: ni código, ni identificador, ni dato personal", async () => {
    expect(await columnas()).toEqual(COLUMNAS);
  });

  it("una fila por perfil publicado, legible por ps_portal (los heredados incompletos incluidos)", async () => {
    const r = await bd.como("ps_portal").query(`SELECT * FROM operacion.indicadores_publicacion`);
    expect(r.rows.length).toBe(
      [...PERFILES_FICTICIOS, ...HEREDADOS_INCOMPLETOS].filter((p) => p.estado === "publicado")
        .length,
    );
    // Los heredados sembrados sin SARO, sin DISC o sin modalidad salen con el dato a falso.
    expect(r.rows.filter((f) => !f.saro_alcance && !f.saro_fecha).length).toBe(2);
    expect(r.rows.filter((f) => !f.disc_fecha).length).toBe(2);
    expect(r.rows.filter((f) => !f.prueba_elegida).length).toBe(1);
  });

  it("ps_panel la lee; ps_worker no", async () => {
    await expect(
      bd.como("ps_panel").query(`SELECT count(*) FROM operacion.indicadores_publicacion`),
    ).resolves.toBeDefined();
    expect(
      await codigoDeError(
        bd.como("ps_worker").query(`SELECT * FROM operacion.indicadores_publicacion`),
      ),
    ).toBe(PERMISO_DENEGADO);
  });

  it("la fila de un lote admite las tres claves nuevas del formato (HU-191) y sigue rechazando las ajenas", async () => {
    const f = (d: object) =>
      bd.instalacion
        .query(`SELECT inventario.solo_claves_de_formato($1::jsonb) AS ok`, [JSON.stringify(d)])
        .then((r) => r.rows[0].ok as boolean);
    expect(await f({ codigo: "PS-0105", saroAlcance: "x", saroFecha: "2026-03-15", discFecha: "2026-04-10" })).toBe(true);
    expect(await f({ codigo: "PS-0105", disc: "D alto" })).toBe(false);
    expect(await f({ codigo: "PS-0105", consentimiento: true })).toBe(false);
  });

  it("down la retira y up la devuelve con la misma lectura del portal", async () => {
    const pool = new pg.Pool({
      connectionString: bd.urlDe("ps_migrador", { directa: true }),
      max: 1,
    });
    try {
      const migrator = new Migrator({
        db: new Kysely<unknown>({ dialect: new PostgresDialect({ pool }) }),
        provider: { getMigrations: async () => MIGRACIONES },
        migrationTableSchema: TABLA_MIGRACIONES_ESQUEMA,
      });
      const abajo = await migrator.migrateTo("0028_saro_disc_perfil");
      expect(abajo.error).toBeUndefined();
      expect(await columnas()).toEqual([]);
      // Abajo, la función vuelve a la de la 0015: las claves SARO/DISC no caben.
      const abajoOk = await bd.instalacion.query(
        `SELECT inventario.solo_claves_de_formato('{"saroFecha":"2026-03-15"}'::jsonb) AS ok`,
      );
      expect(abajoOk.rows[0].ok).toBe(false);
      const arriba = await migrator.migrateToLatest();
      expect(arriba.error).toBeUndefined();
      expect(await columnas()).toEqual(COLUMNAS);
      const r = await bd.como("ps_portal").query(`SELECT * FROM operacion.indicadores_publicacion`);
      expect(r.rows.length).toBeGreaterThan(0);
    } finally {
      await pool.end();
    }
  });
});
