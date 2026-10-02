#!/usr/bin/env bash
# Variables de entorno de desarrollo local por proceso (ADR-0010 §3.3), con todas las fronteras
# como dobles declarados. Secretos de desarrollo fijos: nunca valen fuera de local.
#
#   eval "$(scripts/entorno-dev.sh portal)"    # o panel, worker, migrar, sembrar
set -euo pipefail
PROCESO="${1:?uso: entorno-dev.sh portal|panel|worker|migrar|sembrar}"
POOL=postgres://ps_%s:dev@127.0.0.1:64329/ps
DIRECTA=postgres://ps_%s:dev@127.0.0.1:54329/ps
s() { printf 'dev-%s-%s' "$1" "0123456789abcdef0123456789abcdef"; }

comun() {
  echo "export APP_ENV=local"
  echo "export DOBLES=mailgun,gemini,spaces,latido"
  echo "export EMAIL_HMAC_KEY=$(s email)"
  echo "export EDGE_SECRET=$(s borde)"
  echo "export SALUD_TOKEN=$(s salud)"
}

case "$PROCESO" in
  portal)
    comun
    echo "export DATABASE_URL=$(printf "$POOL" portal)"
    echo "export OTP_PEPPER_CLIENTE=$(s pepper-cliente)"
    ;;
  panel)
    comun
    echo "export DATABASE_URL=$(printf "$POOL" panel)"
    echo "export OTP_PEPPER_PANEL=$(s pepper-panel)"
    echo "export PORTAL_ORIGEN=http://127.0.0.1:3100"
    echo "export AUDIT_HMAC_KEY=$(s auditoria)"
    echo "export AUDIT_KEK=$(s kek)"
    ;;
  worker)
    comun
    echo "export DATABASE_URL=$(printf "$POOL" worker)"
    echo "export DATABASE_DIRECT_URL=$(printf "$DIRECTA" worker)"
    echo "export EXPORT_DATABASE_URL=$(printf "$DIRECTA" exportador)"
    echo "export OTP_PEPPER_CLIENTE=$(s pepper-cliente)"
    echo "export OTP_PEPPER_PANEL=$(s pepper-panel)"
    echo "export AUDIT_HMAC_KEY=$(s auditoria)"
    echo "export AUDIT_KEK=$(s kek)"
    echo "export EVENTOS_SEUDONIMO_SAL=$(s sal)"
    echo "export EXPORT_AGE_RECIPIENT=age1desarrollo"
    echo "export PANEL_ADMIN_INICIAL=admin@trycore.com"
    echo "export PORTAL_ORIGEN=http://127.0.0.1:3100"
    echo "export CORREO_TALENTO_HUMANO=people.service@trycore.com"
    ;;
  migrar)
    echo "export APP_ENV=local"
    echo "export MIGRATOR_DATABASE_URL=$(printf "$DIRECTA" migrador)"
    ;;
  sembrar)
    echo "export APP_ENV=local"
    echo "export SEMBRAR_PANEL_URL=$(printf "$POOL" panel)"
    echo "export SEMBRAR_WORKER_URL=$(printf "$POOL" worker)"
    echo "export AUDIT_HMAC_KEY=$(s auditoria)"
    echo "export AUDIT_KEK=$(s kek)"
    ;;
  *) echo "proceso desconocido: $PROCESO" >&2; exit 2 ;;
esac
