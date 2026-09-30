#!/usr/bin/env bash
# Siembra (solo INSERT, datos sintéticos) lo que la colección Newman de EP-001 no puede crear por API:
#  - un usuario administrador y uno observador del panel, únicos por corrida (el observador con una
#    sesión ya abierta, para el caso 403 «sin permiso»);
#  - un enlace YA VENCIDO con un invitado y su token (para renovar y para «enlace_vencido»);
#  - una petición de invitación pendiente sobre ese enlace vencido (aprobar → 409 enlace_no_vigente).
# Las claves HMAC se leen en tiempo de ejecución de scripts/entorno-dev.sh (valores de desarrollo);
# no se copian a la colección ni al environment. Uso: sembrar-ep-001.sh <RUN> > vars.txt
set -euo pipefail
RUN="${1:?uso: sembrar-ep-001.sh <RUN>}"
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
BD="${PS_BD_SIEMBRA:-postgres://ps_instalacion@127.0.0.1:54329/ps}"
EMAIL_HMAC_KEY="$(bash "$RAIZ/scripts/entorno-dev.sh" panel | sed -n 's/^export EMAIL_HMAC_KEY=//p')"

ADMIN="newman-adm-$RUN@trycore.com"
OBS="newman-obs-$RUN@trycore.com"
VENC_INV="vencido-$RUN@cliente-sintetico.test"
VENC_COLEGA="colega-vencido-$RUN@cliente-sintetico.test"

eval "$(EMAIL_HMAC_KEY="$EMAIL_HMAC_KEY" ADMIN="$ADMIN" OBS="$OBS" VENC_INV="$VENC_INV" VENC_COLEGA="$VENC_COLEGA" node -e '
const c = require("node:crypto");
const h = (s) => c.createHmac("sha256", process.env.EMAIL_HMAC_KEY).update(s.trim().toLowerCase()).digest("hex");
const tokV = c.randomBytes(32).toString("base64url");
const sesObs = c.randomBytes(32).toString("base64url");
const out = {
  H_ADMIN: h(process.env.ADMIN), H_OBS: h(process.env.OBS), H_VINV: h(process.env.VENC_INV), H_VCOL: h(process.env.VENC_COLEGA),
  TOK_V: tokV, TOK_V_HASH: c.createHash("sha256").update(tokV).digest("hex"),
  SES_OBS: sesObs, SES_OBS_HASH: c.createHash("sha256").update(sesObs).digest("hex"),
};
for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
')"

psql "$BD" -v ON_ERROR_STOP=1 -qAt >/dev/null <<SQL
BEGIN;
INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES
  ('$ADMIN', decode('$H_ADMIN','hex'), 'administrador'),
  ('$OBS',   decode('$H_OBS','hex'),   'observador');
INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira)
  SELECT decode('$SES_OBS_HASH','hex'), id, now() + interval '11 hours' FROM identidad_panel.usuarios_panel WHERE correo = '$OBS';
WITH e AS (
  INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
  SELECT 'Cuenta Sintética Vencida $RUN', 'Newman', 'Enlace vencido sembrado para pruebas de contrato', ARRAY['PS-0142'],
         now() - interval '40 days', now() - interval '10 days', id
    FROM identidad_panel.usuarios_panel WHERE correo = '$ADMIN'
  RETURNING id
), i AS (
  INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) SELECT id, '$VENC_INV', decode('$H_VINV','hex') FROM e RETURNING id, enlace_id
), t AS (
  INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) SELECT id, decode('$TOK_V_HASH','hex') FROM e RETURNING enlace_id
)
INSERT INTO identidad.invitaciones_solicitadas (enlace_id, solicitado_por, correo_propuesto, correo_hmac, nombre_propuesto)
  SELECT i.enlace_id, i.id, '$VENC_COLEGA', decode('$H_VCOL','hex'), 'Colega Sintético' FROM i;
COMMIT;
SQL
PET_V="$(psql "$BD" -At -c "SELECT id FROM identidad.invitaciones_solicitadas WHERE correo_propuesto = '$VENC_COLEGA'")"
COD_V="$(psql "$BD" -At -c "SELECT e.codigo FROM identidad.enlaces e WHERE e.cuenta_nombre = 'Cuenta Sintética Vencida $RUN'")"

cat <<VARS
run=$RUN
adminCorreo=$ADMIN
obsCorreo=$OBS
obsSesion=$SES_OBS
tokenVencido=$TOK_V
vencidoInvitado=$VENC_INV
enlaceVencidoCodigo=$COD_V
peticionVencida=$PET_V
VARS
