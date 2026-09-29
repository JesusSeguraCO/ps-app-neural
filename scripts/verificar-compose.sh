#!/usr/bin/env bash
# Verificación de la tarea 1.2 (ADR-0010 §3.1): `docker compose up` levanta PostgreSQL 16, PgBouncer
# en modo transacción y el borde emulado; las migraciones corren como `ps_migrador`; ningún proceso
# conecta como superusuario (roles, PgBouncer y pg_stat_activity con el worker vivo); el borde pone la
# cabecera secreta. Requiere Docker y `npm run build -w @ps/worker`. Deja el entorno levantado.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

falla() { echo "✗ $*" >&2; exit 1; }
ok() { echo "✓ $*"; }
sql() { docker compose exec -T postgres psql -X -q -tA -v ON_ERROR_STOP=1 -U ps_instalacion -d ps -c "$1"; }

docker compose up -d --build --wait
ok "docker compose up: postgres, pgbouncer y borde-local sanos"

[ "$(sql "SHOW server_version_num" | cut -c1-2)" = "16" ] || falla "PostgreSQL no es la 16"
[ "$(sql "SELECT count(*) FROM pg_roles WHERE rolname IN ('ps_portal','ps_panel','ps_worker','ps_exportador','ps_migrador') AND NOT rolsuper AND NOT rolcreaterole AND NOT rolcreatedb")" = "5" ] \
  || falla "los cinco roles de conexión deben existir sin SUPERUSER, CREATEROLE ni CREATEDB"
[ "$(sql "SELECT count(*) FROM pg_namespace WHERE nspname IN ('identidad','identidad_panel','operacion','inventario','auditoria')")" = "5" ] \
  || falla "roles.sql no creó los esquemas"
ok "roles.sql aplicado: 5 roles de conexión sin privilegios de superusuario"

for u in ps_portal ps_panel ps_worker ps_migrador; do
  fila="$(docker compose exec -T -e PGPASSWORD=dev pgbouncer psql -X -tA -h 127.0.0.1 -p 6432 -U "$u" -d ps \
    -c "SELECT current_user, (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)")"
  [ "$fila" = "$u|f" ] || falla "por PgBouncer, $u devolvió «$fila»"
done
docker compose exec -T pgbouncer grep -qx 'pool_mode = transaction' /etc/pgbouncer/pgbouncer.ini \
  || falla "PgBouncer no está en modo transacción"
if docker compose exec -T -e PGPASSWORD=dev-instalacion pgbouncer \
  psql -X -tA -h 127.0.0.1 -p 6432 -U ps_instalacion -d ps -c "SELECT 1" >/dev/null 2>&1; then
  falla "PgBouncer deja entrar al superusuario de instalación"
fi
ok "PgBouncer (modo transacción) solo admite roles de conexión; el superusuario no pasa"

eval "$(scripts/entorno-dev.sh migrar)"
node apps/worker/dist/migrar.js
ok "migraciones aplicadas como ps_migrador"

# Con el worker vivo (pool por PgBouncer y LISTEN directo), nadie conectado es superusuario salvo esta
# misma consulta de comprobación.
(eval "$(scripts/entorno-dev.sh worker)"; exec node apps/worker/dist/worker.js) >/tmp/ps-worker-compose.log 2>&1 &
WORKER=$!
trap 'kill $WORKER 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do
  grep -q '"worker_arrancado"' /tmp/ps-worker-compose.log && break
  sleep 1
done
grep -q '"worker_arrancado"' /tmp/ps-worker-compose.log || { cat /tmp/ps-worker-compose.log >&2; falla "el worker no arrancó"; }
conexiones="$(sql "SELECT usename || ':' || r.rolsuper FROM pg_stat_activity a JOIN pg_roles r ON r.rolname = a.usename
                   WHERE a.backend_type = 'client backend' AND a.pid <> pg_backend_pid() ORDER BY 1")"
echo "$conexiones" | grep -q '^ps_worker:false$' || falla "el worker no aparece conectado como ps_worker: «$conexiones»"
if echo "$conexiones" | grep -q ':true$'; then falla "hay conexiones de superusuario: «$conexiones»"; fi
ok "con el worker vivo, conexiones: $(echo "$conexiones" | sort -u | tr '\n' ' ')— ninguna de superusuario"

# Borde emulado: una app de eco en el host recibe la cabecera secreta aunque la petición traiga otra.
node -e "require('http').createServer((q, r) => r.end(String(q.headers['x-ps-edge']))).listen(3100, '0.0.0.0')" &
ECO=$!
trap 'kill $WORKER $ECO 2>/dev/null || true' EXIT
sleep 1
recibido="$(curl -s -H 'x-ps-edge: falso' http://127.0.0.1:3000/)"
[ "$recibido" = "dev-borde-0123456789abcdef0123456789abcdef" ] || falla "el borde entregó «$recibido»"
ok "borde-local :3000 → host:3100 con la cabecera secreta de desarrollo (sustituye la recibida)"
echo "Tarea 1.2 verificada."
