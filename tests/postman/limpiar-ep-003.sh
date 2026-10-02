#!/usr/bin/env bash
# Deja la BD aislada lo más parecida a como estaba tras una corrida de la colección EP-003 (sufijo <RUN>).
# Los perfiles NO se borran: el código PS-#### se asigna como max+1 y su clave de titular (identidad.claves_titular,
# solo inserción) y su auditoría (solo inserción) sobreviven; borrar el perfil haría que el siguiente alta reuse el
# código y choque con la clave (500). Por eso: los perfiles de la corrida quedan ARCHIVADOS y sin alcance SARO, los
# alcances que la corrida creó se borran si ya nadie los usa, y los usuarios del panel quedan de baja sin sesiones.
set -uo pipefail
RUN="${1:?uso: limpiar-ep-003.sh <RUN>}"
BD="${PS_BD_SIEMBRA:-postgres://ps_instalacion@127.0.0.1:54329/ps_ep003}"
case "$BD" in */ps) echo "limpiar-ep-003: me niego a tocar la BD ps" >&2; exit 2 ;; esac
paso() { psql "$BD" -qAt -c "$1" >/dev/null 2>&1 || echo "limpiar-ep-003: no se pudo: $2" >&2; }
ENL="SELECT id FROM identidad.enlaces WHERE cuenta_nombre = 'Cuenta Newman EP-003 $RUN'"
paso "DELETE FROM identidad.sesiones_portal WHERE enlace_id IN ($ENL)" "sesiones de portal"
paso "DELETE FROM identidad.equipos WHERE enlace_id IN ($ENL)" "equipo del enlace"
paso "DELETE FROM identidad.enlace_invitados WHERE enlace_id IN ($ENL)" "invitado"
paso "DELETE FROM identidad.enlaces WHERE id IN ($ENL)" "enlace"
paso "UPDATE inventario.perfiles SET estado = 'archivado', nombre = COALESCE(nombre, 'Newman'), primer_apellido = 'Newman$RUN', saro_alcance_id = NULL WHERE primer_apellido = 'Newman$RUN'" "archivar perfiles de la corrida"
paso "DELETE FROM inventario.catalogo_alcances_saro a WHERE a.nombre ILIKE '%n3-$RUN%' AND NOT EXISTS (SELECT 1 FROM inventario.perfiles p WHERE p.saro_alcance_id = a.id)" "alcances SARO creados"
U="SELECT id FROM identidad_panel.usuarios_panel WHERE correo LIKE 'newman3-%-$RUN@trycore.com'"
paso "DELETE FROM identidad_panel.sesiones_panel WHERE usuario_id IN ($U)" "sesiones del panel"
paso "DELETE FROM identidad_panel.usuarios_panel WHERE id IN ($U) AND NOT EXISTS (SELECT 1 FROM inventario.perfiles p WHERE p.creado_por = usuarios_panel.id)" "usuarios sin rastro"
paso "UPDATE identidad_panel.usuarios_panel SET activo = false, dado_de_baja_en = now() WHERE id IN ($U)" "dar de baja usuarios"
psql "$BD" -At -c "SELECT 'quedan (archivados) perfiles=' || (SELECT count(*) FROM inventario.perfiles WHERE primer_apellido = 'Newman$RUN' AND estado = 'archivado') || ' no archivados=' || (SELECT count(*) FROM inventario.perfiles WHERE primer_apellido = 'Newman$RUN' AND estado <> 'archivado') || ' alcances=' || (SELECT count(*) FROM inventario.catalogo_alcances_saro WHERE nombre ILIKE '%n3-$RUN%') || ' usuarios activos=' || (SELECT count(*) FROM identidad_panel.usuarios_panel WHERE correo LIKE 'newman3-%-$RUN@trycore.com' AND activo) || ' claves huérfanas=' || (SELECT count(*) FROM identidad.claves_titular k WHERE k.titular ~ '^PS-' AND NOT EXISTS (SELECT 1 FROM inventario.perfiles p WHERE p.codigo = k.titular))" >&2
