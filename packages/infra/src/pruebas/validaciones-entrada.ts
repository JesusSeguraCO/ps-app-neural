// Validaciones de entrada SARO/DISC para las entradas del editor en los tests (EP-003 · SS1; D61):
// publicar exige el alcance del catálogo cerrado, su fecha y la fecha DISC. El alcance es el que
// siembra `sembrarFicticios` (o uno de prueba si la BD no tiene siembra).
import type pg from "pg";
import { ALCANCE_SARO_DE_PRUEBA } from "./modalidad-prueba";

export const FECHA_SARO_DE_PRUEBA = "2026-03-15";
export const FECHA_DISC_DE_PRUEBA = "2026-04-10";

export async function entradaValidaciones(
  bd: pg.Pool,
): Promise<{ saroAlcanceId: string; saroFecha: string; discFecha: string }> {
  await bd.query(
    `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente)
     SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_alcances_saro WHERE activo)`,
    [ALCANCE_SARO_DE_PRUEBA.nombre, ALCANCE_SARO_DE_PRUEBA.texto],
  );
  const id = (
    await bd.query(
      `SELECT id FROM inventario.catalogo_alcances_saro WHERE activo ORDER BY nombre LIMIT 1`,
    )
  ).rows[0].id as string;
  return { saroAlcanceId: id, saroFecha: FECHA_SARO_DE_PRUEBA, discFecha: FECHA_DISC_DE_PRUEBA };
}
