#!/usr/bin/env bash
# Corre el gate api de EP-001 contra portal :3100 y panel :3101 ya levantados (sin cabecera de borde).
#   BUZON_LOG=<log del worker> tests/postman/correr-ep-001.sh [export.json]
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
EXPORT="${1:-$RAIZ/.claude/state/evidencia/ep-001/newman-ep-001.json}"
: "${BUZON_LOG:?BUZON_LOG = ruta del log del worker (líneas correo_doble)}"
RUN="$(date +%s)$RANDOM"
VARS="$(bash "$RAIZ/tests/postman/sembrar-ep-001.sh" "$RUN")"
echo "$VARS" | sed 's/^obsSesion=.*/obsSesion=<sembrada>/;s/^tokenVencido=.*/tokenVencido=<sembrado>/' >&2
BUZON_LOG="$BUZON_LOG" BUZON_PORT=3199 node "$RAIZ/tests/postman/buzon-doble.mjs" >&2 &
BZ=$!
trap 'kill $BZ 2>/dev/null || true' EXIT
sleep 0.5
ARGS=()
while IFS= read -r l; do [ -n "$l" ] && ARGS+=(--env-var "$l"); done <<<"$VARS"
ARGS+=(--env-var "ipBase=198.51.$((RANDOM % 200 + 1))")
cd "$RAIZ"
npx --yes newman run tests/postman/ep-001.postman_collection.json \
  -e tests/postman/environment.json "${ARGS[@]}" \
  --reporters cli,json --reporter-json-export "$EXPORT"
