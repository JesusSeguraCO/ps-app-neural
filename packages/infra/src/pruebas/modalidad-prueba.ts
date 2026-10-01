// Para los tests que publican un perfil por SQL: publicar exige una modalidad de prueba activa de la
// familia del perfil (D10, migración 0017). Si el perfil no tiene familia se le da una de prueba; la
// modalidad se crea una sola vez por familia.
import type pg from "pg";

export async function darModalidadDePrueba(bd: pg.Pool, perfilId: string): Promise<string> {
  const p = (
    await bd.query(`SELECT familia_id FROM inventario.perfiles WHERE id = $1`, [perfilId])
  ).rows[0];
  let familia = p.familia_id as string | null;
  if (!familia) {
    await bd.query(
      `INSERT INTO inventario.catalogo_familias (nombre) SELECT 'Familia de prueba'
        WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_familias WHERE nombre = 'Familia de prueba')`,
    );
    familia = (
      await bd.query(`SELECT id FROM inventario.catalogo_familias WHERE nombre = 'Familia de prueba'`)
    ).rows[0].id as string;
  }
  await bd.query(
    `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente)
     SELECT $1, 'Modalidad de prueba', 'Resolvió un ejercicio práctico revisado por Trycore.'
      WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_modalidades_prueba WHERE familia_id = $1 AND activo)`,
    [familia],
  );
  const modalidad = (
    await bd.query(
      `SELECT id FROM inventario.catalogo_modalidades_prueba WHERE familia_id = $1 AND activo ORDER BY nombre LIMIT 1`,
      [familia],
    )
  ).rows[0].id as string;
  await bd.query(
    `UPDATE inventario.perfiles SET familia_id = $2, modalidad_prueba_id = $3 WHERE id = $1`,
    [perfilId, familia, modalidad],
  );
  return modalidad;
}
