// Las migraciones 0027 y 0028 de EP-003 se deshacen (diseño, «Migration Plan»: `down` restaura las vistas
// anteriores) y se vuelven a aplicar: bajar a la 0026 deja el perfil sin SARO/DISC, la ficha y el
// catálogo con sus columnas de antes y sin catálogo de alcances; subir de nuevo los devuelve.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Kysely, PostgresDialect } from "kysely";
import { Migrator } from "kysely/migration";
import pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { MIGRACIONES } from "../../migraciones/indice";
import { TABLA_MIGRACIONES_ESQUEMA } from "./migrar";

describe.skipIf(!HAY_BD)("migraciones 0027 y 0028: down y up", () => {
  let bd: BdPrueba;
  let pool: pg.Pool;
  let migrator: Migrator;

  const columnas = async (esquema: string, tabla: string) =>
    (
      await bd.instalacion.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`,
        [esquema, tabla],
      )
    ).rows.map((f) => f.column_name as string);

  beforeAll(async () => {
    bd = await crearBdPrueba();
    pool = new pg.Pool({ connectionString: bd.urlDe("ps_migrador", { directa: true }), max: 1 });
    migrator = new Migrator({
      db: new Kysely<unknown>({ dialect: new PostgresDialect({ pool }) }),
      provider: { getMigrations: async () => MIGRACIONES },
      migrationTableSchema: TABLA_MIGRACIONES_ESQUEMA,
    });
  }, 60_000);

  afterAll(async () => {
    await pool?.end();
    await bd?.cerrar();
  });

  it("bajar a la 0026 restaura lo anterior; subir lo devuelve", async () => {
    const abajo = await migrator.migrateTo("0026_worker_minimo_inventario");
    expect(abajo.error).toBeUndefined();
    expect(abajo.results?.map((r) => [r.migrationName, r.status])).toEqual([
      ["0029_indicadores_publicacion", "Success"],
      ["0028_saro_disc_perfil", "Success"],
      ["0027_catalogo_alcances_saro", "Success"],
    ]);
    expect(await columnas("inventario", "perfiles")).not.toContain("saro_fecha");
    expect(await columnas("inventario", "catalogo_alcances_saro")).toEqual([]);
    expect(await columnas("operacion", "ficha_publicable")).not.toContain("saro_texto");
    expect(await columnas("operacion", "catalogo_publicable")).not.toContain("sello_personal");
    const arriba = await migrator.migrateToLatest();
    expect(arriba.error).toBeUndefined();
    expect(await columnas("inventario", "perfiles")).toEqual(
      expect.arrayContaining(["saro_alcance_id", "saro_fecha", "disc_fecha"]),
    );
    expect(await columnas("operacion", "ficha_publicable")).toEqual(
      expect.arrayContaining(["saro_texto", "saro_fecha", "disc_fecha"]),
    );
    // El portal conserva su lectura de las vistas recreadas.
    const portal = bd.como("ps_portal");
    expect((await portal.query(`SELECT count(*) FROM operacion.catalogo_publicable`)).rowCount).toBe(1);
    expect((await portal.query(`SELECT count(*) FROM operacion.ficha_publicable`)).rowCount).toBe(1);
  });
});
