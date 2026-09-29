// EP-001 · sub-slice 6b (HU-095, HU-145; design §6): peticiones de invitación de un colega.
//  - nombre y «para qué» opcionales de la petición (prototipo invitar-colega);
//  - una sola petición pendiente por enlace y correo;
//  - el portal lee las peticiones de su invitado (estado y motivo) y el worker las lee para avisar a
//    Talento Humano por `notificar` (ya en la lista blanca de encolar_portal con este motivo).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.invitaciones_solicitadas
  ADD COLUMN nombre_propuesto text CHECK (nombre_propuesto IS NULL OR length(btrim(nombre_propuesto)) BETWEEN 1 AND 120),
  ADD COLUMN para_que text CHECK (para_que IS NULL OR length(btrim(para_que)) BETWEEN 1 AND 500);
CREATE UNIQUE INDEX invitaciones_una_pendiente ON identidad.invitaciones_solicitadas (enlace_id, correo_hmac)
  WHERE estado = 'pendiente';
GRANT SELECT ON identidad.invitaciones_solicitadas TO ps_portal;
GRANT SELECT (id, enlace_id, solicitado_por, correo_propuesto, nombre_propuesto, para_que, estado)
  ON identidad.invitaciones_solicitadas TO ps_worker;
RESET ROLE;
`).execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
REVOKE SELECT ON identidad.invitaciones_solicitadas FROM ps_portal, ps_worker;
DROP INDEX IF EXISTS identidad.invitaciones_una_pendiente;
ALTER TABLE identidad.invitaciones_solicitadas DROP COLUMN IF EXISTS nombre_propuesto, DROP COLUMN IF EXISTS para_que;
RESET ROLE;
`).execute(db);
}
