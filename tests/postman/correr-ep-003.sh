#!/usr/bin/env bash
# Corre el contrato de EP-003 (fase api) de punta a punta sobre la BD AISLADA del worktree (ps_ep003, nunca ps):
#   1) genera la colección y siembra (sufijo de corrida) usuarios del panel con sesión y un enlace con sesión
#      de portal, 2) levanta portal :3210 y panel :3211 standalone (con cabecera de borde) y el ayudante
#      :3219, y un worker sobre la misma BD aislada (aplica los lotes de importación), 3) corre Newman y exporta el resultado, 4) para sus procesos por PID y limpia lo sembrado y lo
#      que la colección creó (limpiar-ep-003.sh). Requiere `npm run build` y la BD local arrancada.
# Uso: correr-ep-003.sh [export.json]
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
EXPORT="${1:-$RAIZ/.claude/state/evidencia/ep-003/newman-ep-003.json}"
DIR="$RAIZ/.local/newman-ep-003"
BDN="${PS_BD_NOMBRE:-ps_ep003}"
[ "$BDN" = "ps" ] && { echo "correr-ep-003: me niego a usar la BD ps" >&2; exit 2; }
export PS_BD_SIEMBRA="postgres://ps_instalacion@127.0.0.1:54329/$BDN"
PORTAL_P=3210; PANEL_P=3211; AYUDANTE_P=3219
mkdir -p "$DIR" "$(dirname "$EXPORT")"
cd "$RAIZ"
for p in $PORTAL_P $PANEL_P $AYUDANTE_P; do
  if lsof -ti "tcp:$p" -sTCP:LISTEN >/dev/null 2>&1; then echo "correr-ep-003: el puerto $p está ocupado" >&2; exit 3; fi
done
RUN="$(date +%s)$RANDOM"
node tests/postman/generar-ep-003.mjs >&2
tests/postman/sembrar-ep-003.sh "$RUN" > "$DIR/vars.txt"
limpiar() {
  for pid in ${PORTAL:-} ${PANEL:-} ${AYUDANTE:-} ${WORKER:-}; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
  tests/postman/limpiar-ep-003.sh "$RUN" || true
}
trap limpiar EXIT
(
  eval "$(scripts/entorno-dev.sh portal)"
  DATABASE_URL="postgres://ps_portal:dev@127.0.0.1:64329/$BDN" PORT=$PORTAL_P HOSTNAME=127.0.0.1 NODE_ENV=production \
    exec node apps/portal/.next/standalone/apps/portal/server.js
) > "$DIR/portal.log" 2>&1 &
PORTAL=$!
(
  eval "$(scripts/entorno-dev.sh panel)"
  DATABASE_URL="postgres://ps_panel:dev@127.0.0.1:64329/$BDN" PORTAL_ORIGEN="http://127.0.0.1:$PORTAL_P" PORT=$PANEL_P \
    HOSTNAME=127.0.0.1 NODE_ENV=production exec node apps/panel/.next/standalone/apps/panel/server.js
) > "$DIR/panel.log" 2>&1 &
PANEL=$!
AYUDANTE_BD="$PS_BD_SIEMBRA" AYUDANTE_RUN="$RUN" AYUDANTE_PORT=$AYUDANTE_P node tests/postman/ayudante-ep-003.mjs > "$DIR/ayudante.log" 2>&1 &
AYUDANTE=$!
# El worker consume TODA la cola de la BD: nadie más (p. ej. el runner de e2e) debe usar $BDN mientras corre.
(
  eval "$(scripts/entorno-dev.sh worker)"
  DATABASE_URL="postgres://ps_worker:dev@127.0.0.1:64329/$BDN" DATABASE_DIRECT_URL="postgres://ps_worker:dev@127.0.0.1:54329/$BDN" \
    EXPORT_DATABASE_URL="postgres://ps_exportador:dev@127.0.0.1:54329/$BDN" PORTAL_ORIGEN="http://127.0.0.1:$PORTAL_P" \
    exec node apps/worker/dist/worker.js
) > "$DIR/worker.log" 2>&1 &
WORKER=$!
BORDE="$(bash scripts/entorno-dev.sh portal | sed -n 's/^export EDGE_SECRET=//p')"
for p in $PORTAL_P $PANEL_P; do
  ok=""; for _ in $(seq 1 60); do curl -sf -H "x-ps-edge: $BORDE" "http://127.0.0.1:$p/api/v1/salud/vivo" >/dev/null && { ok=1; break; }; sleep 0.5; done
  [ -n "$ok" ] || { echo "correr-ep-003: el servidor :$p no respondió" >&2; exit 4; }
done
ARGS=(--env-var "portal=http://127.0.0.1:$PORTAL_P" --env-var "panel=http://127.0.0.1:$PANEL_P" \
  --env-var "ayudante=http://127.0.0.1:$AYUDANTE_P" --env-var "borde=$BORDE" --env-var "csrf=$(openssl rand -hex 16)")
while IFS= read -r l; do [ -n "$l" ] && ARGS+=(--env-var "$l"); done < "$DIR/vars.txt"
set +e
npx --yes newman run tests/postman/ep-003.postman_collection.json -e tests/postman/environment.json "${ARGS[@]}" \
  --reporters cli,json --reporter-json-export "$EXPORT"
RC=$?
set -e
echo "newman rc=$RC" >&2
exit $RC
