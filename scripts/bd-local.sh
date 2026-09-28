#!/usr/bin/env bash
# PostgreSQL 16 + PgBouncer (modo transacción) para desarrollo y tests locales sin Docker
# (ADR-0008 «Paridad en staging, CI y local»). Datos en .local/bd (fuera de Git).
#
#   scripts/bd-local.sh arrancar     inicializa si hace falta, arranca ambos y aplica roles.sql
#   scripts/bd-local.sh parar
#   scripts/bd-local.sh estado
#   scripts/bd-local.sh borrar       para y borra .local/bd (solo datos locales de desarrollo)
#   scripts/bd-local.sh entorno      imprime las URL de conexión (export …)
#
# Puertos: PostgreSQL 54329 (directo: migrar, LISTEN, instalación) · PgBouncer 64329 (pools).
# Contraseñas de desarrollo fijas: nunca se usan fuera de local y CI.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$RAIZ/.local/bd"
DATOS="$DIR/datos"
PG_BIN="${PG_BIN:-$(brew --prefix postgresql@16 2>/dev/null)/bin}"
PGB_BIN="${PGB_BIN:-$(brew --prefix pgbouncer 2>/dev/null)/bin}"
PUERTO_PG=54329
PUERTO_PGB=64329
BD=ps
INSTALACION=ps_instalacion
USUARIOS=(ps_portal ps_panel ps_worker ps_exportador ps_migrador)
CLAVE_DEV=dev

psql_inst() { "$PG_BIN/psql" -X -q -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$PUERTO_PG" -U "$INSTALACION" "$@"; }

inicializar() {
  [ -d "$DATOS" ] && return 0
  mkdir -p "$DIR"
  "$PG_BIN/initdb" -D "$DATOS" -U "$INSTALACION" --auth=trust -E UTF8 --locale=C >/dev/null
  cat >>"$DATOS/postgresql.conf" <<EOF
port = $PUERTO_PG
listen_addresses = '127.0.0.1'
unix_socket_directories = '$DIR'
timezone = 'UTC'
EOF
  # Autenticación por contraseña para los roles de aplicación; trust solo para instalación local.
  cat >"$DATOS/pg_hba.conf" <<EOF
host all $INSTALACION 127.0.0.1/32 trust
host all all 127.0.0.1/32 scram-sha-256
EOF
}

configurar_pgbouncer() {
  : >"$DIR/userlist.txt"
  for u in "${USUARIOS[@]}"; do echo "\"$u\" \"$CLAVE_DEV\"" >>"$DIR/userlist.txt"; done
  cat >"$DIR/pgbouncer.ini" <<EOF
[databases]
* = host=127.0.0.1 port=$PUERTO_PG

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = $PUERTO_PGB
unix_socket_dir = $DIR
auth_type = scram-sha-256
auth_file = $DIR/userlist.txt
pool_mode = transaction
max_client_conn = 200
default_pool_size = 5
max_prepared_statements = 0
ignore_startup_parameters = extra_float_digits,options
logfile = $DIR/pgbouncer.log
pidfile = $DIR/pgbouncer.pid
EOF
}

arrancar() {
  inicializar
  if ! "$PG_BIN/pg_ctl" -D "$DATOS" status >/dev/null 2>&1; then
    "$PG_BIN/pg_ctl" -D "$DATOS" -l "$DIR/postgres.log" -w start >/dev/null
  fi
  psql_inst -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='$BD'" | grep -q 1 \
    || psql_inst -d postgres -c "CREATE DATABASE $BD"
  for u in "${USUARIOS[@]}"; do
    psql_inst -d postgres -c "DO \$\$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='$u') THEN CREATE ROLE $u LOGIN PASSWORD '$CLAVE_DEV'; END IF; END\$\$;"
  done
  psql_inst -d "$BD" -f "$RAIZ/packages/infra/bootstrap/roles.sql"
  configurar_pgbouncer
  if [ ! -f "$DIR/pgbouncer.pid" ] || ! kill -0 "$(cat "$DIR/pgbouncer.pid")" 2>/dev/null; then
    "$PGB_BIN/pgbouncer" -d "$DIR/pgbouncer.ini"
  fi
  echo "BD local lista: PostgreSQL :$PUERTO_PG · PgBouncer :$PUERTO_PGB"
}

parar() {
  [ -f "$DIR/pgbouncer.pid" ] && kill "$(cat "$DIR/pgbouncer.pid")" 2>/dev/null || true
  rm -f "$DIR/pgbouncer.pid"
  [ -d "$DATOS" ] && "$PG_BIN/pg_ctl" -D "$DATOS" -m fast stop >/dev/null 2>&1 || true
  echo "BD local detenida"
}

estado() {
  "$PG_BIN/pg_isready" -h 127.0.0.1 -p "$PUERTO_PG" || true
  "$PG_BIN/pg_isready" -h 127.0.0.1 -p "$PUERTO_PGB" || true
}

entorno() {
  cat <<EOF
export BD_INSTALACION_URL=postgres://$INSTALACION@127.0.0.1:$PUERTO_PG/$BD
export MIGRATOR_DATABASE_URL=postgres://ps_migrador:$CLAVE_DEV@127.0.0.1:$PUERTO_PG/$BD
export PORTAL_DATABASE_URL=postgres://ps_portal:$CLAVE_DEV@127.0.0.1:$PUERTO_PGB/$BD
export PANEL_DATABASE_URL=postgres://ps_panel:$CLAVE_DEV@127.0.0.1:$PUERTO_PGB/$BD
export WORKER_DATABASE_URL=postgres://ps_worker:$CLAVE_DEV@127.0.0.1:$PUERTO_PGB/$BD
export WORKER_DATABASE_DIRECT_URL=postgres://ps_worker:$CLAVE_DEV@127.0.0.1:$PUERTO_PG/$BD
EOF
}

case "${1:-}" in
  arrancar) arrancar ;;
  parar) parar ;;
  estado) estado ;;
  borrar) parar; rm -rf "$DIR"; echo "datos locales borrados" ;;
  entorno) entorno ;;
  *) sed -n '2,12p' "$0"; exit 2 ;;
esac
