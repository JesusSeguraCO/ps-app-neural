// EP-006 · sub-slice 10, contacto de Trycore (HU-147; diseño §10):
//  - `inventario.configuracion_contacto`: fila única (`unica = true`), correo con el mismo CHECK
//    `@trycore.com` que `usuarios_panel`, nombre y cargo opcionales (sin texto vacío) y quién lo cambió
//    por última vez. Solo la escribe el panel; cada cambio va a la auditoría en la misma transacción.
//  - `operacion.contacto_trycore`: lo único que lee el portal. Sin fila, da el buzón
//    `people.service@trycore.com` sin nombre ni cargo: el portal nunca queda «sin contacto» y la
//    migración no siembra nada.
// Solo DDL (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
CREATE TABLE inventario.configuracion_contacto (
  unica           boolean PRIMARY KEY DEFAULT true CHECK (unica),
  correo          text NOT NULL CHECK (correo ~ '^[^@[:space:]]+@trycore\\.com$'),
  nombre          text CHECK (nombre IS NULL OR length(btrim(nombre)) BETWEEN 1 AND 80),
  cargo           text CHECK (cargo IS NULL OR length(btrim(cargo)) BETWEEN 1 AND 80),
  actualizado_por uuid NOT NULL REFERENCES identidad_panel.usuarios_panel (id),
  actualizado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE VIEW operacion.contacto_trycore WITH (security_barrier = true) AS
SELECT COALESCE(c.correo, 'people.service@trycore.com') AS correo, c.nombre, c.cargo
  FROM (VALUES (true)) AS v (unica)
  LEFT JOIN inventario.configuracion_contacto c ON c.unica = v.unica;

GRANT SELECT, INSERT, UPDATE ON inventario.configuracion_contacto TO ps_panel;
GRANT SELECT ON operacion.contacto_trycore TO ps_portal, ps_panel;
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
DROP VIEW operacion.contacto_trycore;
DROP TABLE inventario.configuracion_contacto;
RESET ROLE;
`,
    )
    .execute(db);
}
