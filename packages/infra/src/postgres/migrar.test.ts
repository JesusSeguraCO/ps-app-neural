// V8-11 (migraciones deterministas) y reglas de `migrar` de ADR-0010 CON-3 / ADR-0003.
import { readdirSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MIGRACIONES } from "../../migraciones/indice";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { ErrorMigracion, migrarHastaElFinal } from "./migrar";

describe("índice estático de migraciones (V8-11)", () => {
  it("contiene exactamente los ficheros de la carpeta, en orden", () => {
    const ficheros = readdirSync(new URL("../../migraciones/", import.meta.url))
      .filter((f) => /^\d{4}_.+\.ts$/.test(f))
      .map((f) => f.replace(/\.ts$/, ""))
      .sort();
    expect(Object.keys(MIGRACIONES)).toEqual(ficheros);
  });
});

describe.skipIf(!HAY_BD)("migrar (V8-11)", () => {
  let bd: BdPrueba;

  beforeAll(async () => {
    bd = await crearBdPrueba(); // ya aplica todas las migraciones una vez
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("una segunda ejecución no aplica nada", async () => {
    const r = await migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }));
    expect(r.aplicadas).toEqual([]);
  });

  it("los objetos de las migraciones son de ps_duenio, no de ps_migrador", async () => {
    const r = await bd.instalacion.query(
      `SELECT DISTINCT tableowner FROM pg_tables WHERE schemaname IN ('identidad','identidad_panel','operacion') AND tablename <> 'kysely_migration' AND tablename <> 'kysely_migration_lock'`,
    );
    expect(r.rows.map((x) => x.tableowner)).toEqual(["ps_duenio"]);
  });

  it("falla si conoce 0 migraciones", async () => {
    await expect(
      migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }), { migraciones: {} }),
    ).rejects.toThrow(ErrorMigracion);
  });

  it("falla si las aplicadas no empiezan por las conocidas (nombre distinto)", async () => {
    const [primera] = Object.keys(MIGRACIONES);
    const renombradas = { [`${primera}_otra`]: MIGRACIONES[primera]! };
    await expect(
      migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }), { migraciones: renombradas }),
    ).rejects.toThrow(ErrorMigracion);
  });

  it("admite la BD por delante (rollback) y lo registra", async () => {
    await bd.instalacion.query(
      `INSERT INTO operacion.kysely_migration (name, timestamp) VALUES ('9999_futura', now()::text)`,
    );
    const r = await migrarHastaElFinal(bd.urlDe("ps_migrador", { directa: true }));
    expect(r.aplicadas).toEqual([]);
    expect(r.porDelante).toEqual(["9999_futura"]);
    await bd.instalacion.query(`DELETE FROM operacion.kysely_migration WHERE name = '9999_futura'`);
  });

  it("los roles de conexión pueden leer la versión de esquema (salud/lista)", async () => {
    const r = await bd
      .como("ps_portal")
      .query(`SELECT count(*)::int n FROM operacion.kysely_migration`);
    expect(r.rows[0].n).toBe(Object.keys(MIGRACIONES).length);
  });
});
