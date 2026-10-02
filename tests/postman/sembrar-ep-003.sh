#!/usr/bin/env bash
# Siembra (solo INSERT, datos sintéticos con sufijo de corrida) lo que la colección Newman de EP-003 no puede
# crear por API, en la BD aislada del worktree (por defecto ps_ep003, NUNCA ps):
#  - una administradora y una observadora del panel con su sesión abierta;
#  - un enlace vigente con un invitado y su sesión de portal abierta (para el contrato del catálogo);
#  - los ids de catálogo que usa el perfil de prueba (de los ficticios sembrados).
# Uso: sembrar-ep-003.sh <RUN> > vars.txt   ·   limpiar con limpiar-ep-003.sh <RUN>
set -euo pipefail
RUN="${1:?uso: sembrar-ep-003.sh <RUN>}"
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
BD="${PS_BD_SIEMBRA:-postgres://ps_instalacion@127.0.0.1:54329/ps_ep003}"
case "$BD" in */ps) echo "sembrar-ep-003: me niego a sembrar en la BD ps" >&2; exit 2 ;; esac
EMAIL_HMAC_KEY="$(bash "$RAIZ/scripts/entorno-dev.sh" panel | sed -n 's/^export EMAIL_HMAC_KEY=//p')"
ADMIN="newman3-adm-$RUN@trycore.com"; OBS="newman3-obs-$RUN@trycore.com"; INV="newman3-inv-$RUN@cliente-sintetico.test"
eval "$(EMAIL_HMAC_KEY="$EMAIL_HMAC_KEY" ADMIN="$ADMIN" OBS="$OBS" INV="$INV" node -e '
const c = require("node:crypto");
const h = (s) => c.createHmac("sha256", process.env.EMAIL_HMAC_KEY).update(s.trim().toLowerCase()).digest("hex");
const r = () => c.randomBytes(32).toString("base64url");
const sha = (s) => c.createHash("sha256").update(s).digest("hex");
const a = r(), o = r(), p = r();
const out = { H_ADMIN: h(process.env.ADMIN), H_OBS: h(process.env.OBS), H_INV: h(process.env.INV),
  SES_A: a, SES_A_H: sha(a), SES_O: o, SES_O_H: sha(o), SES_P: p, SES_P_H: sha(p) };
for (const [k, v] of Object.entries(out)) console.log(`${k}=${v}`);
')"
psql "$BD" -v ON_ERROR_STOP=1 -qAt >/dev/null <<SQL
BEGIN;
INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES
  ('$ADMIN', decode('$H_ADMIN','hex'), 'administrador'), ('$OBS', decode('$H_OBS','hex'), 'observador');
INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
  SELECT decode('$SES_A_H','hex'), id, now() + interval '11 hours', 'administrador' FROM identidad_panel.usuarios_panel WHERE correo = '$ADMIN';
INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
  SELECT decode('$SES_O_H','hex'), id, now() + interval '11 hours', 'observador' FROM identidad_panel.usuarios_panel WHERE correo = '$OBS';
WITH e AS (
  INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
  SELECT 'Cuenta Newman EP-003 $RUN', 'Newman', 'Contrato del catálogo (EP-003)',
         (SELECT array_agg(codigo ORDER BY codigo) FROM (SELECT codigo FROM inventario.perfiles WHERE estado = 'publicado' ORDER BY codigo LIMIT 5) x),
         now() - interval '1 hour', now() + interval '20 days', id
    FROM identidad_panel.usuarios_panel WHERE correo = '$ADMIN' RETURNING id
), i AS (
  INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) SELECT id, '$INV', decode('$H_INV','hex') FROM e RETURNING id, enlace_id
)
INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira)
  SELECT decode('$SES_P_H','hex'), enlace_id, id, now() + interval '2 hours' FROM i;
COMMIT;
SQL
q() { psql "$BD" -At -c "$1"; }
cat <<VARS
run=$RUN
adminSesion=$SES_A
obsSesion=$SES_O
portalSesion=$SES_P
rolId=$(q "SELECT id FROM inventario.catalogo_roles WHERE nombre = 'Desarrolladora backend Java'")
tecnologiaId=$(q "SELECT id FROM inventario.catalogo_tecnologias WHERE nombre = 'Kafka'")
seniorityId=$(q "SELECT id FROM inventario.catalogo_seniorities WHERE nombre = 'Senior'")
ciudadId=$(q "SELECT id FROM inventario.catalogo_ciudades WHERE nombre = 'Medellín'")
modalidadId=$(q "SELECT id FROM inventario.catalogo_modalidades WHERE nombre = 'hibrido'")
modalidadPruebaId=$(q "SELECT id FROM inventario.catalogo_modalidades_prueba WHERE nombre = 'Prueba práctica revisada por un arquitecto'")
alcanceUsoId=$(q "SELECT saro_alcance_id FROM inventario.perfiles WHERE estado = 'publicado' AND saro_alcance_id IS NOT NULL GROUP BY 1 ORDER BY count(*) DESC LIMIT 1")
hoy=$(TZ=America/Bogota date +%F)
manana=$(TZ=America/Bogota date -v+1d +%F 2>/dev/null || TZ=America/Bogota date -d tomorrow +%F)
VARS
