// EP-006 · sub-slice 9, observador (HU-124; RF-8.1.2; diseño §9):
//  - `identidad.accesos_log` gana el evento `acceso_rechazado` con quién (`usuario_id`), qué acción y
//    sobre qué recurso: un rechazo por rol queda en el registro de accesos del panel, no como cambio
//    del recurso. Solo el panel lo escribe (política `accesos_panel`, host = 'panel').
//  - `encolar_panel` admite `notificar` con el motivo `dato_desactualizado`: el aviso del observador a
//    Talento Humano con el código del perfil (y una nota opcional); `origen_permitido` lo deja pasar en
//    el worker con origen `panel`.
// Solo DDL (V3-7).
import { sql, type Kysely } from "kysely";

const EVENTOS =
  "'enlace_consultado', 'codigo_pedido', 'codigo_descartado', 'verificacion_ok', 'verificacion_fallida', 'bloqueo', 'desbloqueo', 'sesion_cerrada'";

const encolarPanel = (notificar: boolean) => `
CREATE OR REPLACE FUNCTION operacion.encolar_panel(p_tipo text, p_payload jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'payload debe ser un objeto';
  END IF;
  CASE p_tipo
    WHEN 'enviar_codigo' THEN PERFORM operacion._validar_enviar_codigo(p_payload, 'panel');
    WHEN 'aplicar_importacion' THEN NULL;
    WHEN 'revertir_importacion' THEN NULL;
    WHEN 'retirar_supresion' THEN NULL;${
      notificar
        ? `
    WHEN 'notificar' THEN
      IF p_payload->>'motivo' IS DISTINCT FROM 'dato_desactualizado'
         OR coalesce(p_payload->>'codigo', '') !~ '^PS-[0-9]{4}$' THEN
        RAISE EXCEPTION 'notificar: motivo o perfil no permitido para el panel';
      END IF;`
        : ""
    }
    ELSE RAISE EXCEPTION 'tipo de trabajo no permitido para el panel: %', p_tipo;
  END CASE;
  RETURN operacion._insertar_trabajo(p_tipo, 'panel', p_payload);
END
$f$;`;

const origenPermitido = (notificar: boolean) => `
CREATE OR REPLACE FUNCTION operacion.origen_permitido(p_tipo text, p_origen text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $f$
  SELECT CASE p_origen
    WHEN 'portal' THEN p_tipo IN ('enviar_codigo', 'renovar_enlace', 'crear_negocio', 'voto', 'notificar')
    WHEN 'panel' THEN p_tipo IN ('enviar_codigo', 'aplicar_importacion', 'revertir_importacion', 'retirar_supresion'${notificar ? ", 'notificar'" : ""})
    WHEN 'worker' THEN p_tipo IN ('notificar')
    ELSE false
  END
$f$;`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.accesos_log DROP CONSTRAINT accesos_log_evento_check;
ALTER TABLE identidad.accesos_log ADD CONSTRAINT accesos_log_evento_check
  CHECK (evento IN (${EVENTOS}, 'acceso_rechazado'));
ALTER TABLE identidad.accesos_log
  ADD COLUMN usuario_id uuid,
  ADD COLUMN accion     text CHECK (accion IS NULL OR length(accion) BETWEEN 1 AND 80),
  ADD COLUMN recurso    text CHECK (recurso IS NULL OR length(recurso) BETWEEN 1 AND 300),
  ADD CONSTRAINT accesos_log_rechazo_completo
    CHECK (evento <> 'acceso_rechazado' OR (usuario_id IS NOT NULL AND accion IS NOT NULL AND recurso IS NOT NULL));
${encolarPanel(true)}
${origenPermitido(true)}
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
${encolarPanel(false)}
${origenPermitido(false)}
ALTER TABLE identidad.accesos_log DROP CONSTRAINT accesos_log_rechazo_completo,
  DROP COLUMN usuario_id, DROP COLUMN accion, DROP COLUMN recurso;
ALTER TABLE identidad.accesos_log DROP CONSTRAINT accesos_log_evento_check;
ALTER TABLE identidad.accesos_log ADD CONSTRAINT accesos_log_evento_check CHECK (evento IN (${EVENTOS}));
RESET ROLE;
`,
    )
    .execute(db);
}
