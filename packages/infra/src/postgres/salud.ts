// Preparación (`/api/v1/salud/lista`, ADR-0010 §3.3): `SELECT 1` con el rol del componente y versión
// de esquema aplicada ≥ la que exige el código, con tope de 2 s. Sin cuerpo informativo.
import "server-only";
import type pg from "pg";
import { MIGRACIONES } from "../../migraciones/indice";

export const MIGRACION_REQUERIDA = Object.keys(MIGRACIONES).sort().at(-1)!;

export async function estaLista(bd: pg.Pool, topeMs = 2_000): Promise<boolean> {
  const comprobar = (async () => {
    const r = await bd.query(`SELECT max(name) AS ultima FROM operacion.kysely_migration`);
    const ultima = r.rows[0]?.ultima as string | null;
    return ultima !== null && ultima >= MIGRACION_REQUERIDA;
  })();
  const tope = new Promise<boolean>((res) => setTimeout(() => res(false), topeMs));
  try {
    return await Promise.race([comprobar, tope]);
  } catch {
    return false;
  }
}
