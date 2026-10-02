// Pool por proceso hacia el pool de PgBouncer de su rol (ADR-0008 fila CON-19/QA-6: portal 4,
// panel 4). En modo transacción: sin SET de sesión ni sentencias preparadas con nombre.
import "server-only";
import pg from "pg";
import { cargarConfiguracion, type Proceso } from "../config";

const pools = new Map<Proceso, pg.Pool>();
const MAXIMOS: Record<Proceso, number> = { portal: 4, panel: 4, worker: 5, migrar: 1, sembrar: 1 };

export function poolDe(proceso: Proceso): pg.Pool {
  let p = pools.get(proceso);
  if (!p) {
    const config = cargarConfiguracion(proceso);
    p = new pg.Pool({
      connectionString: config.DATABASE_URL,
      max: MAXIMOS[proceso],
      connectionTimeoutMillis: 2_000,
      idleTimeoutMillis: 30_000,
    });
    pools.set(proceso, p);
  }
  return p;
}
