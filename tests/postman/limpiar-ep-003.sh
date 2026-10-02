#!/usr/bin/env bash
# Deja la BD aislada como estaba tras una corrida de la colección EP-003 (sufijo <RUN>): borra las sesiones,
# el enlace y su invitado, los perfiles y alcances SARO que la colección creó y los dos usuarios del panel.
# Lo que la auditoría inmutable referencie y no se pueda borrar queda (con el sufijo de la corrida) y se avisa.
set -uo pipefail
RUN="${1:?uso: limpiar-ep-003.sh <RUN>}"
BD="${PS_BD_SIEMBRA:-postgres://ps_instalacion@127.0.0.1:54329/ps_ep003}"
case "$BD" in */ps) echo "limpiar-ep-003: me niego a tocar la BD ps" >&2; exit 2 ;; esac
paso() { psql "$BD" -qAt -c "$1" >/dev/null 2>&1 || echo "limpiar-ep-003: no se pudo: $2" >&2; }
paso "DELETE FROM identidad.sesiones_portal WHERE enlace_id IN (SELECT id FROM identidad.enlaces WHERE cuenta_nombre = 'Cuenta Newman EP-003 $RUN')" "sesiones de portal"
paso "DELETE FROM identidad.equipos WHERE enlace_id IN (SELECT id FROM identidad.enlaces WHERE cuenta_nombre = 'Cuenta Newman EP-003 $RUN')" "equipo del enlace"
paso "DELETE FROM identidad.enlace_invitados WHERE enlace_id IN (SELECT id FROM identidad.enlaces WHERE cuenta_nombre = 'Cuenta Newman EP-003 $RUN')" "invitado"
paso "DELETE FROM identidad.enlaces WHERE cuenta_nombre = 'Cuenta Newman EP-003 $RUN'" "enlace"
for t in perfil_tecnologias perfil_experiencias perfil_sectores perfil_roles consentimientos validaciones; do
  paso "DELETE FROM inventario.$t WHERE perfil_id IN (SELECT id FROM inventario.perfiles WHERE primer_apellido = 'Newman$RUN')" "$t"
done
paso "DELETE FROM inventario.perfiles WHERE primer_apellido = 'Newman$RUN'" "perfiles creados"
paso "DELETE FROM inventario.catalogo_alcances_saro WHERE nombre ILIKE '%n3-$RUN%'" "alcances SARO creados"
paso "DELETE FROM identidad_panel.sesiones_panel WHERE usuario_id IN (SELECT id FROM identidad_panel.usuarios_panel WHERE correo LIKE 'newman3-%-$RUN@trycore.com')" "sesiones del panel"
paso "DELETE FROM identidad_panel.usuarios_panel WHERE correo LIKE 'newman3-%-$RUN@trycore.com'" "usuarios del panel"
psql "$BD" -At -c "SELECT 'quedan: perfiles=' || (SELECT count(*) FROM inventario.perfiles WHERE primer_apellido = 'Newman$RUN') || ' alcances=' || (SELECT count(*) FROM inventario.catalogo_alcances_saro WHERE nombre ILIKE '%n3-$RUN%') || ' usuarios=' || (SELECT count(*) FROM identidad_panel.usuarios_panel WHERE correo LIKE 'newman3-%-$RUN@trycore.com')" >&2
