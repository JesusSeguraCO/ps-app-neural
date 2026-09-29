// R-85 (2026-09-28): contador de emisión de códigos por sujeto, junto a los de fallos por par e IP.
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.intentos_cliente DROP CONSTRAINT intentos_cliente_tipo_check,
  ADD CONSTRAINT intentos_cliente_tipo_check CHECK (tipo IN ('par', 'ip', 'emision'));
ALTER TABLE identidad_panel.intentos_panel DROP CONSTRAINT intentos_panel_tipo_check,
  ADD CONSTRAINT intentos_panel_tipo_check CHECK (tipo IN ('par', 'ip', 'emision'));
RESET ROLE;
`).execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.intentos_cliente DROP CONSTRAINT intentos_cliente_tipo_check,
  ADD CONSTRAINT intentos_cliente_tipo_check CHECK (tipo IN ('par', 'ip'));
ALTER TABLE identidad_panel.intentos_panel DROP CONSTRAINT intentos_panel_tipo_check,
  ADD CONSTRAINT intentos_panel_tipo_check CHECK (tipo IN ('par', 'ip'));
RESET ROLE;
`).execute(db);
}
