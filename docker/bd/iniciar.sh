#!/usr/bin/env bash
# Primer arranque del PostgreSQL de docker-compose (lo ejecuta la imagen oficial una sola vez, con el
# superusuario de instalación): crea los roles de conexión con la contraseña de desarrollo y aplica el
# script de roles único (packages/infra/bootstrap/roles.sql), como scripts/bd-local.sh arrancar.
set -euo pipefail
for u in ps_portal ps_panel ps_worker ps_exportador ps_migrador; do
  psql -X -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres \
    -c "CREATE ROLE $u LOGIN PASSWORD 'dev'"
done
psql -X -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /ps/roles.sql
