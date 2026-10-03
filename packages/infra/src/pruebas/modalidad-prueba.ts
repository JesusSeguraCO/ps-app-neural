// Para los tests que publican un perfil por SQL: publicar exige una modalidad de prueba activa de la
// familia del perfil (D10, migración 0017) y, desde la 0028, las validaciones de entrada SARO (alcance
// y fecha) y DISC (fecha) (D61). Si el perfil no tiene familia se le da una de prueba; la modalidad y
// el alcance se crean una sola vez. Quien prueba la falta de SARO/DISC pasa `validacionesDeEntrada:
// false` y solo recibe la modalidad.
import type pg from "pg";

export const ALCANCE_SARO_DE_PRUEBA = {
  nombre: "Alcance SARO de prueba",
  texto: "Verificamos sus antecedentes judiciales, disciplinarios y fiscales.",
};

export async function darValidacionesDeEntrada(bd: pg.Pool, perfilId: string): Promise<string> {
  await bd.query(
    `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente) SELECT $1, $2
      WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_alcances_saro WHERE nombre = $1)`,
    [ALCANCE_SARO_DE_PRUEBA.nombre, ALCANCE_SARO_DE_PRUEBA.texto],
  );
  const alcance = (
    await bd.query(`SELECT id FROM inventario.catalogo_alcances_saro WHERE nombre = $1`, [
      ALCANCE_SARO_DE_PRUEBA.nombre,
    ])
  ).rows[0].id as string;
  await bd.query(
    `UPDATE inventario.perfiles
        SET saro_alcance_id = COALESCE(saro_alcance_id, $2),
            saro_fecha = COALESCE(saro_fecha, DATE '2026-03-15'),
            disc_fecha = COALESCE(disc_fecha, DATE '2026-04-10')
      WHERE id = $1`,
    [perfilId, alcance],
  );
  return alcance;
}

export async function darModalidadDePrueba(
  bd: pg.Pool,
  perfilId: string,
  o: { validacionesDeEntrada?: boolean } = {},
): Promise<string> {
  const p = (await bd.query(`SELECT familia_id FROM inventario.perfiles WHERE id = $1`, [perfilId]))
    .rows[0];
  let familia = p.familia_id as string | null;
  if (!familia) {
    await bd.query(
      `INSERT INTO inventario.catalogo_familias (nombre) SELECT 'Familia de prueba'
        WHERE NOT EXISTS (SELECT 1 FROM inventario.catalogo_familias WHERE nombre = 'Familia de prueba')`,
    );
    familia = (
      await bd.query(
        `SELECT id FROM inventario.catalogo_familias WHERE nombre = 'Familia de prueba'`,
      )
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
  if (o.validacionesDeEntrada !== false) await darValidacionesDeEntrada(bd, perfilId);
  return modalidad;
}
