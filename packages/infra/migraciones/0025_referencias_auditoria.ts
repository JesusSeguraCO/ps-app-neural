// EP-006 · sub-slice 10, registro por perfil (HU-138; diseño §8):
//  - `inventario.referencias_auditoria`: qué tramo de la cadena (`seq_desde`…`seq_hasta`) escribió una
//    importación, su reversión o una carga de Operaciones. Se escribe en la misma transacción que la
//    auditoría del acto; así el registro de un perfil enlaza el cambio con su lote o su carga (y la fecha
//    de corte) sin tocar el esquema `auditoria`, que es de solo inserción y no se migra.
//  - Solo inserción: ningún rol de aplicación la actualiza ni la borra.
// Solo DDL (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
CREATE TABLE inventario.referencias_auditoria (
  seq_desde bigint PRIMARY KEY,
  seq_hasta bigint NOT NULL,
  tipo      text NOT NULL CHECK (tipo IN ('lote', 'reversion', 'carga')),
  ref_id    uuid NOT NULL,
  CHECK (seq_hasta >= seq_desde)
);
CREATE INDEX referencias_auditoria_hasta ON inventario.referencias_auditoria (seq_hasta);
GRANT SELECT, INSERT ON inventario.referencias_auditoria TO ps_panel, ps_worker;
RESET ROLE;
`,
    )
    .execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
DROP TABLE inventario.referencias_auditoria;
RESET ROLE;
`,
    )
    .execute(db);
}
