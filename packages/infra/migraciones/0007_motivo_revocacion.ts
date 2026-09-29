// EP-001 · sub-slice 4: el motivo de la revocación se muestra en el detalle del enlace (prototipo
// enlaces-acceso: «Queda en el registro con tu nombre y la fecha»); también va en la auditoría.
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.enlaces ADD COLUMN motivo_revocacion text
  CHECK (motivo_revocacion IS NULL OR length(btrim(motivo_revocacion)) > 0);
RESET ROLE;
`).execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.enlaces DROP COLUMN IF EXISTS motivo_revocacion;
RESET ROLE;
`).execute(db);
}
