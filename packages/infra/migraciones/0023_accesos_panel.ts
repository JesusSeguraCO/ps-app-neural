// EP-006 · sub-slice 10, accesos (HU-151; diseño §9, D17):
//  - `usuarios_panel` gana la baja lógica (`dado_de_baja_en`, sin borrado físico) y quién lo cambió por
//    última vez (`actualizado_por`); el correo sigue con su CHECK `@trycore.com` y `correo_hmac` único.
//  - `sesiones_panel.rol_al_abrir`: con qué rol se abrió la sesión. Si el rol actual es menor (bajó de
//    administrador a observador), la sesión se corta en la siguiente petición. Las abiertas antes quedan
//    en `NULL` (cuenta como su rol actual).
//  - `identidad_panel.cambiar_acceso(...)`: cambia rol o activo de un inscrito bloqueando primero las filas
//    de administradores activos (`FOR UPDATE`), así dos bajas o dos cambios de rol concurrentes no dejan el
//    panel sin administradora: el segundo ve el resultado del primero y se niega.
// Solo DDL (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad_panel.usuarios_panel
  ADD COLUMN dado_de_baja_en timestamptz,
  ADD COLUMN actualizado_por uuid REFERENCES identidad_panel.usuarios_panel (id),
  ADD COLUMN actualizado_en  timestamptz;
ALTER TABLE identidad_panel.sesiones_panel
  ADD COLUMN rol_al_abrir text CHECK (rol_al_abrir IS NULL OR rol_al_abrir IN ('administrador', 'observador'));

-- Devuelve la fila anterior (rol y activo) o lanza P0001 «ultimo_administrador» / «no_existe».
CREATE FUNCTION identidad_panel.cambiar_acceso(p_objetivo uuid, p_rol text, p_activo boolean, p_autor uuid)
RETURNS TABLE (rol_anterior text, activo_anterior boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad_panel, pg_temp AS $f$
DECLARE
  v_rol text;
  v_activo boolean;
  v_quedan integer;
BEGIN
  IF p_rol NOT IN ('administrador', 'observador') THEN
    RAISE EXCEPTION 'rol_invalido' USING ERRCODE = 'P0001';
  END IF;
  -- Primero las administradoras activas (orden fijo, sin interbloqueos), luego el objetivo.
  PERFORM 1 FROM usuarios_panel WHERE rol = 'administrador' AND activo ORDER BY id FOR UPDATE;
  SELECT u.rol, u.activo INTO v_rol, v_activo FROM usuarios_panel u WHERE u.id = p_objetivo FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no_existe' USING ERRCODE = 'P0001';
  END IF;
  IF v_rol = 'administrador' AND v_activo AND (p_rol <> 'administrador' OR NOT p_activo) THEN
    SELECT count(*) INTO v_quedan FROM usuarios_panel
     WHERE rol = 'administrador' AND activo AND id <> p_objetivo;
    IF v_quedan = 0 THEN
      RAISE EXCEPTION 'ultimo_administrador' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  UPDATE usuarios_panel
     SET rol = p_rol,
         activo = p_activo,
         dado_de_baja_en = CASE WHEN p_activo THEN NULL WHEN v_activo THEN now() ELSE dado_de_baja_en END,
         actualizado_por = p_autor,
         actualizado_en = now()
   WHERE id = p_objetivo;
  rol_anterior := v_rol;
  activo_anterior := v_activo;
  RETURN NEXT;
END
$f$;
REVOKE ALL ON FUNCTION identidad_panel.cambiar_acceso(uuid, text, boolean, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identidad_panel.cambiar_acceso(uuid, text, boolean, uuid) TO ps_panel;
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
DROP FUNCTION identidad_panel.cambiar_acceso(uuid, text, boolean, uuid);
ALTER TABLE identidad_panel.sesiones_panel DROP COLUMN rol_al_abrir;
ALTER TABLE identidad_panel.usuarios_panel DROP COLUMN dado_de_baja_en, DROP COLUMN actualizado_por, DROP COLUMN actualizado_en;
RESET ROLE;
`,
    )
    .execute(db);
}
