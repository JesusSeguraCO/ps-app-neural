#!/usr/bin/env bash
# Corre el contrato de EP-006 (tarea 11.2) de punta a punta sobre una BD EFÍMERA propia:
#   1) siembra (roles, migraciones, ficticios, sesiones de administradora y observadora),
#   2) levanta el panel standalone :3101 (sin borde) y el worker (aplica y revierte importaciones),
#   3) corre Newman y exporta el resultado, 4) para todo y borra la BD efímera.
# Requiere `npm run build` y la BD local (scripts/bd-local.sh arrancar). Uso: correr-ep-006.sh [export.json]
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
EXPORT="${1:-$RAIZ/.claude/state/evidencia/ep-006/cierre/newman-ep-006.json}"
DIR="$RAIZ/.local/newman-ep-006"
mkdir -p "$DIR" "$(dirname "$EXPORT")"
cd "$RAIZ"
eval "$(scripts/bd-local.sh entorno)"
RUN="$(date +%s)$RANDOM"
node tests/postman/generar-ep-006.mjs >&2
npx tsx --conditions=react-server tests/postman/sembrar-ep-006.mts "$RUN" >&2
v() { python3 -c "import json;print(json.load(open('$DIR/entorno.json'))['$1'])"; }
BD="$(v BD)"
limpiar() {
  [ -n "${PANEL:-}" ] && kill "$PANEL" 2>/dev/null || true
  [ -n "${WORKER:-}" ] && kill "$WORKER" 2>/dev/null || true
  wait 2>/dev/null || true
  psql "$BD_INSTALACION_URL" -qAt -c "DROP DATABASE IF EXISTS $BD WITH (FORCE)" >/dev/null 2>&1 || true
}
trap limpiar EXIT
(
  eval "$(scripts/entorno-dev.sh panel)"; unset EDGE_SECRET
  DATABASE_URL="$(v PANEL_URL)" PORT=3101 HOSTNAME=127.0.0.1 NODE_ENV=production \
    exec node apps/panel/.next/standalone/apps/panel/server.js
) > "$DIR/panel.log" 2>&1 &
PANEL=$!
(
  eval "$(scripts/entorno-dev.sh worker)"; unset EDGE_SECRET
  DATABASE_URL="$(v WORKER_URL)" DATABASE_DIRECT_URL="$(v WORKER_DIRECTA)" EXPORT_DATABASE_URL="$(v EXPORT_URL)" \
    PANEL_ADMIN_INICIAL="$(v ADMIN)" exec node apps/worker/dist/worker.js
) > "$DIR/worker.log" 2>&1 &
WORKER=$!
for _ in $(seq 1 60); do curl -sf http://127.0.0.1:3101/api/v1/salud/vivo >/dev/null && break; sleep 0.5; done
ARGS=(--env-var "panel=http://127.0.0.1:3101" --env-var "csrf=$(openssl rand -hex 16)")
while IFS= read -r l; do [ -n "$l" ] && ARGS+=(--env-var "$l"); done < "$DIR/vars.txt"
npx --yes newman run tests/postman/ep-006.postman_collection.json "${ARGS[@]}" \
  --reporters cli,json --reporter-json-export "$EXPORT"
