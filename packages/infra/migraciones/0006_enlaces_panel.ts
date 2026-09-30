// EP-001 · sub-slice 4 (tarea 4.3): la generación del enlace no lee HubSpot (sponsor, 2026-09-28;
// HU-122), así que la cuenta se guarda por su nombre y `cuenta_ref` pasa a ser opcional. Código legible
// `ENL-NNNN` por enlace para citarlo en el panel (prototipo enlaces-acceso / generador-enlace--emitido).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.enlaces ALTER COLUMN cuenta_ref DROP NOT NULL;
ALTER TABLE identidad.enlaces ADD CONSTRAINT enlaces_cuenta_nombre_check CHECK (length(btrim(cuenta_nombre)) > 0);
CREATE SEQUENCE identidad.enlaces_codigo_seq;
ALTER TABLE identidad.enlaces
  ADD COLUMN codigo text NOT NULL UNIQUE
  DEFAULT 'ENL-' || lpad(nextval('identidad.enlaces_codigo_seq')::text, 4, '0');
GRANT USAGE ON SEQUENCE identidad.enlaces_codigo_seq TO ps_panel;
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
ALTER TABLE identidad.enlaces DROP COLUMN IF EXISTS codigo;
DROP SEQUENCE IF EXISTS identidad.enlaces_codigo_seq;
ALTER TABLE identidad.enlaces DROP CONSTRAINT IF EXISTS enlaces_cuenta_nombre_check;
ALTER TABLE identidad.enlaces ALTER COLUMN cuenta_ref SET NOT NULL;
RESET ROLE;
`,
    )
    .execute(db);
}
