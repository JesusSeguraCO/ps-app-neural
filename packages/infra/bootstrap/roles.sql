-- Script de roles único (ADR-0008 §3 «Roles y aprovisionamiento de la BD»).
-- Idempotente. Lo ejecuta a mano el responsable técnico con el superusuario de instalación
-- (`doadmin` en DO) una vez por entorno y de nuevo cuando cambian sus objetos. Nunca CI ni `migrar`
-- en producción; en local y CI lo aplica el arranque de la BD de pruebas.
--
-- Precondición: existen los usuarios con LOGIN `ps_portal`, `ps_panel`, `ps_worker`,
-- `ps_exportador` y `ps_migrador` (en DO se crean con `doctl databases user create`; en local,
-- scripts/bd-local.sh).
--
-- Los esquemas `auditoria` (ADR-0003) y `telemetria` (ADR-0006) y sus grupos dueños se añaden aquí
-- en los sub-slices que los usan.

SET client_min_messages = warning;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps_duenio') THEN
    CREATE ROLE ps_duenio NOLOGIN;
  END IF;
END
$$;

-- Ningún rol de conexión es superusuario ni puede crear roles o bases.
ALTER ROLE ps_portal NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
ALTER ROLE ps_panel NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
ALTER ROLE ps_worker NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
ALTER ROLE ps_exportador NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
-- `ps_migrador` hereda de `ps_duenio` para hacer DDL y GRANT sobre sus esquemas.
ALTER ROLE ps_migrador NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT;
GRANT ps_duenio TO ps_migrador;

-- Esquemas de `ps_duenio`. Las tablas y funciones las crean las migraciones.
CREATE SCHEMA IF NOT EXISTS identidad AUTHORIZATION ps_duenio;
CREATE SCHEMA IF NOT EXISTS identidad_panel AUTHORIZATION ps_duenio;
CREATE SCHEMA IF NOT EXISTS operacion AUTHORIZATION ps_duenio;
CREATE SCHEMA IF NOT EXISTS inventario AUTHORIZATION ps_duenio;

-- Nadie usa `public` (PG16 ya retira CREATE a PUBLIC; se deja explícito).
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- USAGE por cara (ADR-0002 «H0»): el portal no tiene USAGE sobre `identidad_panel`.
GRANT USAGE ON SCHEMA identidad TO ps_portal, ps_panel, ps_worker, ps_exportador;
GRANT USAGE ON SCHEMA identidad_panel TO ps_panel, ps_worker, ps_exportador;
REVOKE ALL ON SCHEMA identidad_panel FROM ps_portal;
GRANT USAGE ON SCHEMA operacion TO ps_portal, ps_panel, ps_worker, ps_exportador;
GRANT USAGE ON SCHEMA inventario TO ps_panel, ps_worker, ps_exportador;

-- `ps_exportador` lee todo y nada más (ADR-0008).
ALTER DEFAULT PRIVILEGES FOR ROLE ps_duenio IN SCHEMA identidad, identidad_panel, operacion, inventario
  GRANT SELECT ON TABLES TO ps_exportador;

-- Las funciones nuevas no son ejecutables por PUBLIC: cada migración concede EXECUTE a su rol.
ALTER DEFAULT PRIVILEGES FOR ROLE ps_duenio REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- search_path fijo por rol (sin SET de sesión: PgBouncer en modo transacción, ADR-0008).
ALTER ROLE ps_portal SET search_path = pg_catalog, identidad, operacion;
ALTER ROLE ps_panel SET search_path = pg_catalog, identidad_panel, identidad, operacion, inventario;
ALTER ROLE ps_worker SET search_path = pg_catalog, operacion, identidad, identidad_panel, inventario;
ALTER ROLE ps_migrador SET search_path = pg_catalog, operacion;

-- Tiempos máximos por rol (en lugar de SET de sesión).
ALTER ROLE ps_portal SET statement_timeout = '5s';
ALTER ROLE ps_panel SET statement_timeout = '15s';
ALTER ROLE ps_worker SET statement_timeout = '60s';
