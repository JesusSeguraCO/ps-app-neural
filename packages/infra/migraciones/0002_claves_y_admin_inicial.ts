// EP-001 · sub-slice 2: claves de titular para el compromiso de valor de la auditoría (ADR-0003 H42)
// y la siembra del primer administrador del panel (ADR-0002, enmienda: tarea auditada del worker).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

-- Una clave por titular (profesional) envuelta con AUDIT_KEK; 'sistema' para entidades sin titular
-- (enlaces, invitaciones, usuarios del panel), que no se destruye.
CREATE TABLE identidad.claves_titular (
  titular         text PRIMARY KEY,
  clave_envuelta  bytea,
  creada_en       timestamptz NOT NULL DEFAULT now(),
  destruida_en    timestamptz,
  CHECK ((destruida_en IS NULL) = (clave_envuelta IS NOT NULL))
);
GRANT SELECT, INSERT ON identidad.claves_titular TO ps_panel, ps_worker;

-- Primer administrador: solo si no existe ningún usuario del panel (no sirve para añadir más).
CREATE FUNCTION identidad_panel.sembrar_admin_inicial(p_correo text, p_correo_hmac bytea) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad_panel, pg_temp AS $f$
DECLARE
  nuevo uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sembrar_admin_inicial'));
  IF EXISTS (SELECT 1 FROM identidad_panel.usuarios_panel) THEN
    RAISE EXCEPTION 'sembrar_admin_inicial: el panel ya tiene usuarios';
  END IF;
  INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol)
  VALUES (p_correo, p_correo_hmac, 'administrador')
  RETURNING id INTO nuevo;
  RETURN nuevo;
END
$f$;
REVOKE EXECUTE ON FUNCTION identidad_panel.sembrar_admin_inicial(text, bytea) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identidad_panel.sembrar_admin_inicial(text, bytea) TO ps_worker;

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
DROP FUNCTION IF EXISTS identidad_panel.sembrar_admin_inicial(text, bytea);
DROP TABLE IF EXISTS identidad.claves_titular;
RESET ROLE;
`,
    )
    .execute(db);
}
