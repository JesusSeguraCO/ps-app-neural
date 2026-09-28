-- Script de roles único (ADR-0008 §3 «Roles y aprovisionamiento de la BD»).
-- Idempotente. Lo ejecuta a mano el responsable técnico con el superusuario de instalación
-- (`doadmin` en DO) una vez por entorno y de nuevo cuando cambian sus objetos. Nunca CI ni `migrar`
-- en producción; en local y CI lo aplica el arranque de la BD de pruebas.
--
-- Precondición: existen los usuarios con LOGIN `ps_portal`, `ps_panel`, `ps_worker`,
-- `ps_exportador` y `ps_migrador` (en DO se crean con `doctl databases user create`; en local,
-- scripts/bd-local.sh).
--
-- El esquema `auditoria` (ADR-0003) y su dueño `ps_auditoria_dueno` viven aquí, no en migraciones:
-- `ps_migrador` no puede tocarlos. `telemetria` (ADR-0006) se añade con EP-008.

SET client_min_messages = warning;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps_duenio') THEN
    CREATE ROLE ps_duenio NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ps_auditoria_dueno') THEN
    CREATE ROLE ps_auditoria_dueno NOLOGIN;
  END IF;
  -- PG16: quien instala necesita poder hacer SET ROLE a los dueños para crearles objetos. Solo el
  -- usuario de instalación (`doadmin`), nunca un rol de conexión, y sin heredar sus permisos.
  EXECUTE format('GRANT ps_duenio TO %I WITH INHERIT FALSE, SET TRUE', current_user);
  EXECUTE format('GRANT ps_auditoria_dueno TO %I WITH INHERIT FALSE, SET TRUE', current_user);
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

-- ─── auditoria (ADR-0003 «Revisión adversarial» H1, H25, H42) ───────────────────────────
-- Cadena encadenada con HMAC por tramos, compromiso de valor (HMAC con clave de titular) y valores
-- cifrados aparte. La BD no tiene la clave HMAC: la aplicación bloquea la cabeza, calcula los hashes
-- y `registrar` comprueba el enlace antes de insertar. Nadie escribe las tablas directamente.
CREATE SCHEMA IF NOT EXISTS auditoria AUTHORIZATION ps_auditoria_dueno;
SET ROLE ps_auditoria_dueno;

CREATE TABLE IF NOT EXISTS auditoria.auditoria_cabeza (
  tramo  integer PRIMARY KEY,
  seq    bigint NOT NULL,
  hash   bytea NOT NULL
);

CREATE TABLE IF NOT EXISTS auditoria.auditoria (
  seq            bigint PRIMARY KEY,
  tramo          integer NOT NULL REFERENCES auditoria.auditoria_cabeza(tramo),
  actor          text NOT NULL,
  entidad        text NOT NULL,
  entidad_id     text NOT NULL,
  campo          text NOT NULL,
  titular        text NOT NULL,              -- perfil_id, o 'sistema' para entidades sin titular
  antes_hmac     bytea,
  despues_hmac   bytea,
  origen         text NOT NULL CHECK (origen IN ('panel', 'importacion', 'reversion', 'sincronizacion',
                   'fusion', 'revocacion', 'migracion', 'worker', 'restauracion', 'rotacion', 'supresion')),
  cuando         timestamptz NOT NULL,
  hash_anterior  bytea NOT NULL,
  hash           bytea NOT NULL
);
CREATE INDEX IF NOT EXISTS auditoria_entidad ON auditoria.auditoria (entidad, entidad_id);

CREATE TABLE IF NOT EXISTS auditoria.auditoria_valores (
  seq              bigint PRIMARY KEY REFERENCES auditoria.auditoria(seq),
  antes_cifrado    bytea,
  despues_cifrado  bytea
);

-- Solo inserción: ni el dueño modifica ni borra filas de la cadena (se vigila tgenabled = 'O').
CREATE OR REPLACE FUNCTION auditoria._solo_insercion() RETURNS trigger
LANGUAGE plpgsql AS $f$
BEGIN
  RAISE EXCEPTION 'auditoria es de solo inserción';
END
$f$;
DROP TRIGGER IF EXISTS auditoria_solo_insercion ON auditoria.auditoria;
CREATE TRIGGER auditoria_solo_insercion BEFORE UPDATE OR DELETE OR TRUNCATE ON auditoria.auditoria
  FOR EACH STATEMENT EXECUTE FUNCTION auditoria._solo_insercion();

-- Cabeza génesis del tramo 1.
INSERT INTO auditoria.auditoria_cabeza (tramo, seq, hash)
VALUES (1, 0, sha256(convert_to('people-service:auditoria:genesis', 'UTF8')))
ON CONFLICT (tramo) DO NOTHING;

-- Paso 1: toma la cabeza del tramo vigente con FOR UPDATE (fila fija por clave). El candado dura
-- hasta el fin de la transacción del llamante.
CREATE OR REPLACE FUNCTION auditoria.bloquear_cabeza()
RETURNS TABLE (tramo integer, seq bigint, hash bytea)
LANGUAGE sql SECURITY DEFINER SET search_path = auditoria, pg_temp AS $f$
  SELECT c.tramo, c.seq, c.hash FROM auditoria.auditoria_cabeza c
   WHERE c.tramo = (SELECT max(tramo) FROM auditoria.auditoria_cabeza)
   FOR UPDATE
$f$;

-- Paso 2: inserta el lote de la transacción y avanza la cabeza una sola vez. Comprueba que el lote
-- empieza en la cabeza bloqueada, con seq consecutivos y cada hash_anterior igual al hash previo.
CREATE OR REPLACE FUNCTION auditoria.registrar(p_filas jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = auditoria, pg_temp AS $f$
DECLARE
  c auditoria.auditoria_cabeza;
  f jsonb;
  esperado_seq bigint;
  esperado_hash bytea;
BEGIN
  IF jsonb_typeof(p_filas) <> 'array' OR jsonb_array_length(p_filas) = 0 THEN
    RAISE EXCEPTION 'registrar: lote vacío';
  END IF;
  SELECT * INTO c FROM auditoria.auditoria_cabeza
   WHERE tramo = (SELECT max(tramo) FROM auditoria.auditoria_cabeza) FOR UPDATE;
  esperado_seq := c.seq + 1;
  esperado_hash := c.hash;
  FOR f IN SELECT * FROM jsonb_array_elements(p_filas) LOOP
    IF (f->>'seq')::bigint <> esperado_seq OR (f->>'tramo')::int <> c.tramo
       OR decode(f->>'hash_anterior', 'hex') <> esperado_hash THEN
      RAISE EXCEPTION 'registrar: el lote no enlaza con la cabeza de la cadena';
    END IF;
    IF abs(extract(epoch FROM ((f->>'cuando')::timestamptz - now()))) > 300 THEN
      RAISE EXCEPTION 'registrar: marca de tiempo fuera de margen';
    END IF;
    INSERT INTO auditoria.auditoria (seq, tramo, actor, entidad, entidad_id, campo, titular, antes_hmac,
      despues_hmac, origen, cuando, hash_anterior, hash)
    VALUES (esperado_seq, c.tramo, f->>'actor', f->>'entidad', f->>'entidad_id', f->>'campo', f->>'titular',
      decode(f->>'antes_hmac', 'hex'), decode(f->>'despues_hmac', 'hex'), f->>'origen',
      (f->>'cuando')::timestamptz, esperado_hash, decode(f->>'hash', 'hex'));
    INSERT INTO auditoria.auditoria_valores (seq, antes_cifrado, despues_cifrado)
    VALUES (esperado_seq, decode(f->>'antes_cifrado', 'hex'), decode(f->>'despues_cifrado', 'hex'));
    esperado_hash := decode(f->>'hash', 'hex');
    esperado_seq := esperado_seq + 1;
  END LOOP;
  UPDATE auditoria.auditoria_cabeza SET seq = esperado_seq - 1, hash = esperado_hash WHERE tramo = c.tramo;
  RETURN esperado_seq - 1;
END
$f$;

RESET ROLE;

REVOKE ALL ON SCHEMA auditoria FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA auditoria FROM PUBLIC;
GRANT USAGE ON SCHEMA auditoria TO ps_panel, ps_worker, ps_exportador;
GRANT SELECT ON auditoria.auditoria, auditoria.auditoria_cabeza, auditoria.auditoria_valores
  TO ps_panel, ps_worker, ps_exportador;
GRANT EXECUTE ON FUNCTION auditoria.bloquear_cabeza(), auditoria.registrar(jsonb) TO ps_panel, ps_worker;
