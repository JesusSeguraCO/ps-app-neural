// Runner de migraciones (ADR-0008 fila CON-19/QA-9, ADR-0010 CON-3, ADR-0003 fila «Migraciones»).
// - Proveedor ESTÁTICO: `migraciones/indice.ts` importa cada migración; nada se lee del disco.
// - Falla si conoce 0 migraciones o si las aplicadas no empiezan por las conocidas.
// - Admite la BD por delante (rollback de imagen) y lo registra.
// - Candado consultivo de sesión `mantenimiento_esquema` compartido con `exportar_banco`
//   (espera como máximo `esperaCandadoMs`, 10 min por omisión) y `lock_timeout = 5s` con 3 reintentos.
import { Kysely, PostgresDialect } from "kysely";
import { Migrator, type Migration } from "kysely/migration";
import pg from "pg";
import { MIGRACIONES } from "../../migraciones/indice";

export const TABLA_MIGRACIONES_ESQUEMA = "operacion";

export class ErrorMigracion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorMigracion";
  }
}

export interface ResultadoMigracion {
  aplicadas: string[];
  porDelante: string[];
}

export interface OpcionesMigrar {
  migraciones?: Record<string, Migration>;
  esperaCandadoMs?: number;
  reintentosLockTimeout?: number;
  registrar?: (evento: Record<string, unknown>) => void;
}

// Clave fija del candado compartido con exportar_banco (ADR-0003, I-7).
const SQL_CANDADO = `SELECT pg_try_advisory_lock(hashtext('mantenimiento_esquema')) AS ok`;
const SQL_SOLTAR = `SELECT pg_advisory_unlock(hashtext('mantenimiento_esquema'))`;

async function tomarCandado(cliente: pg.PoolClient, esperaMs: number): Promise<void> {
  const limite = Date.now() + esperaMs;
  for (;;) {
    const r = await cliente.query(SQL_CANDADO);
    if (r.rows[0].ok) return;
    if (Date.now() >= limite) {
      throw new ErrorMigracion(
        "no se obtuvo el candado mantenimiento_esquema (¿exportar_banco en curso?); no se aplicó nada",
      );
    }
    await new Promise((res) => setTimeout(res, Math.min(2_000, esperaMs)));
  }
}

async function aplicadasEnBd(cliente: pg.PoolClient): Promise<string[]> {
  const existe = await cliente.query(`SELECT to_regclass($1) AS t`, [
    `${TABLA_MIGRACIONES_ESQUEMA}.kysely_migration`,
  ]);
  if (!existe.rows[0].t) return [];
  const r = await cliente.query(
    `SELECT name FROM ${TABLA_MIGRACIONES_ESQUEMA}.kysely_migration ORDER BY name`,
  );
  return r.rows.map((x) => x.name as string);
}

export async function migrarHastaElFinal(
  url: string,
  opciones: OpcionesMigrar = {},
): Promise<ResultadoMigracion> {
  const migraciones = opciones.migraciones ?? MIGRACIONES;
  const registrar = opciones.registrar ?? (() => {});
  const conocidas = Object.keys(migraciones).sort();
  if (conocidas.length === 0) {
    throw new ErrorMigracion("migrar no conoce ninguna migración: el índice está vacío");
  }

  // Un pool de una sola conexión directa: los SET de sesión y el candado viven en ella.
  const pool = new pg.Pool({ connectionString: url, max: 1 });
  const cliente = await pool.connect();
  try {
    await tomarCandado(cliente, opciones.esperaCandadoMs ?? 10 * 60_000);
    try {
      const aplicadas = await aplicadasEnBd(cliente);
      const comun = Math.min(aplicadas.length, conocidas.length);
      for (let i = 0; i < comun; i++) {
        if (aplicadas[i] !== conocidas[i]) {
          throw new ErrorMigracion(
            `las migraciones aplicadas no empiezan por las conocidas: posición ${i + 1} es «${aplicadas[i]}» y se esperaba «${conocidas[i]}»`,
          );
        }
      }
      if (aplicadas.length > conocidas.length) {
        const porDelante = aplicadas.slice(conocidas.length);
        registrar({ evento: "bd_por_delante", porDelante });
        return { aplicadas: [], porDelante };
      }

      await cliente.query(`SET lock_timeout = '5s'`);
      await cliente.query(`SET statement_timeout = '5min'`);
      const db = new Kysely<unknown>({
        dialect: new PostgresDialect({
          // Kysely libera la conexión tras cada uso; esta es la única y la gestionamos aquí.
          pool: {
            connect: async () => ({ query: cliente.query.bind(cliente), release: () => {} }),
            end: async () => {},
          } as unknown as pg.Pool,
        }),
      });
      const migrator = new Migrator({
        db,
        provider: { getMigrations: async () => migraciones },
        migrationTableSchema: TABLA_MIGRACIONES_ESQUEMA,
      });

      const reintentos = opciones.reintentosLockTimeout ?? 3;
      for (let intento = 0; ; intento++) {
        const { error, results } = await migrator.migrateToLatest();
        if (!error) {
          const aplicadasAhora = (results ?? [])
            .filter((r) => r.status === "Success")
            .map((r) => r.migrationName);
          registrar({ evento: "migraciones_aplicadas", aplicadas: aplicadasAhora });
          return { aplicadas: aplicadasAhora, porDelante: [] };
        }
        const codigo = (error as { code?: string }).code;
        if (codigo === "55P03" && intento < reintentos) {
          registrar({ evento: "lock_timeout", intento: intento + 1 });
          await new Promise((res) => setTimeout(res, 2_000));
          continue;
        }
        throw new ErrorMigracion(
          `la migración falló sin dejar cambios: ${(error as Error).message ?? String(error)}`,
        );
      }
    } finally {
      await cliente.query(SQL_SOLTAR).catch(() => {});
    }
  } finally {
    cliente.release();
    await pool.end();
  }
}
