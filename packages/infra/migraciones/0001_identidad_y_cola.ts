// Migración inicial (EP-001 · sub-slice 1, ADR-0008 «Esqueleto andante»).
// Esquemas `identidad` (cara cliente), `identidad_panel` y la cola de `operacion`, con las funciones
// SECURITY DEFINER de ADR-0002 «Revisión adversarial» (H0, H8, H22) y la lista normativa de permisos.
// Solo esquema: sin DML de nivel superior (regla de ADR-0003). Los objetos son de `ps_duenio`.
import { sql, type Kysely } from "kysely";

// Códigos vigentes por (ámbito, sujeto) ante envíos ambiguos: propuesta por defecto de H22,
// pendiente de T-31 (si T-31 elige uno solo, una migración baja este valor a 1).
const RANURAS_CODIGO = 3;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

-- ─── identidad (cara cliente) ────────────────────────────────────────────────────────────
CREATE TABLE identidad.enlaces (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_ref      text NOT NULL,               -- id de la empresa en HubSpot
  cuenta_nombre   text NOT NULL,
  proyecto        text,                        -- contexto de proyecto (puede faltar, HU-093)
  razon           text NOT NULL CHECK (length(btrim(razon)) > 0),
  codigos_perfil  text[] NOT NULL DEFAULT '{}',-- lista explícita; vacía = enlace sin selección
  vigente_desde   timestamptz NOT NULL DEFAULT now(),
  vigente_hasta   timestamptz NOT NULL,
  estado          text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'revocado')),
  generado_por    uuid NOT NULL,
  revocado_por    uuid,
  revocado_en     timestamptz,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  CHECK (vigente_hasta > vigente_desde)
);

CREATE TABLE identidad.enlace_invitados (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enlace_id    uuid NOT NULL REFERENCES identidad.enlaces(id),
  correo       text NOT NULL,                  -- en claro solo para enviar
  correo_hmac  bytea NOT NULL,                 -- unicidad sin exponer el correo (H40)
  origen       text NOT NULL DEFAULT 'inicial' CHECK (origen IN ('inicial', 'invitacion_aprobada')),
  activo       boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enlace_id, correo_hmac)
);

CREATE TABLE identidad.enlace_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enlace_id    uuid NOT NULL REFERENCES identidad.enlaces(id),
  invitado_id  uuid REFERENCES identidad.enlace_invitados(id),
  envio_id     uuid,
  token_hash   bytea NOT NULL UNIQUE,          -- SHA-256 del token opaco (H9)
  emitido_en   timestamptz NOT NULL DEFAULT now(),
  revocado_en  timestamptz
);

CREATE TABLE identidad.invitaciones_solicitadas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enlace_id         uuid NOT NULL REFERENCES identidad.enlaces(id),
  solicitado_por    uuid NOT NULL REFERENCES identidad.enlace_invitados(id),
  correo_propuesto  text NOT NULL,
  correo_hmac       bytea NOT NULL,
  estado            text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  motivo            text,
  resuelto_por      uuid,
  resuelto_en       timestamptz,
  creado_en         timestamptz NOT NULL DEFAULT now(),
  CHECK (estado <> 'rechazada' OR length(btrim(coalesce(motivo, ''))) > 0)
);

CREATE TABLE identidad.codigos_cliente (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitado_id             uuid NOT NULL REFERENCES identidad.enlace_invitados(id),
  trabajo_id              bigint,
  codigo_hmac             bytea NOT NULL,
  emitido_en              timestamptz NOT NULL DEFAULT now(),
  expira_en               timestamptz NOT NULL,
  usado_en                timestamptz,
  invalidado_por_sistema  boolean NOT NULL DEFAULT false,
  resultado_envio         text CHECK (resultado_envio IN ('ok', 'ambiguo', 'definitivo'))
);
CREATE INDEX ON identidad.codigos_cliente (invitado_id, expira_en);

CREATE TABLE identidad.intentos_cliente (
  clave            bytea PRIMARY KEY,          -- HMAC de enlace+correo, o de la IP
  tipo             text NOT NULL CHECK (tipo IN ('par', 'ip')),
  ventana_inicio   timestamptz NOT NULL DEFAULT now(),
  fallos_ventana   integer NOT NULL DEFAULT 0,
  dia_inicio       timestamptz NOT NULL DEFAULT now(),
  fallos_dia       integer NOT NULL DEFAULT 0,
  bloqueado_hasta  timestamptz
);

CREATE TABLE identidad.sesiones_portal (
  id_hash           bytea PRIMARY KEY,         -- SHA-256 del identificador de la cookie
  enlace_id         uuid NOT NULL REFERENCES identidad.enlaces(id),
  invitado_id       uuid NOT NULL REFERENCES identidad.enlace_invitados(id),
  creada            timestamptz NOT NULL DEFAULT now(),
  ultima_actividad  timestamptz NOT NULL DEFAULT now(),
  expira            timestamptz NOT NULL
);

CREATE TABLE identidad.accesos_log (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ts           timestamptz NOT NULL DEFAULT now(),
  host         text NOT NULL CHECK (host IN ('portal', 'panel')),
  ambito       text NOT NULL CHECK (ambito IN ('cliente', 'panel')),
  evento       text NOT NULL CHECK (evento IN ('enlace_consultado', 'codigo_pedido', 'codigo_descartado',
                 'verificacion_ok', 'verificacion_fallida', 'bloqueo', 'desbloqueo', 'sesion_cerrada')),
  enlace_id    uuid,
  invitado_id  uuid,
  correo_hash  bytea,
  ip           inet,
  user_agent   text
);
CREATE INDEX ON identidad.accesos_log (enlace_id, ts);

-- ─── identidad_panel ─────────────────────────────────────────────────────────────────────
CREATE TABLE identidad_panel.usuarios_panel (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correo       text NOT NULL CHECK (correo ~ '^[^@[:space:]]+@trycore\\.com$'),
  correo_hmac  bytea NOT NULL UNIQUE,
  rol          text NOT NULL CHECK (rol IN ('administrador', 'observador')),
  activo       boolean NOT NULL DEFAULT true,
  creado_por   uuid,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identidad_panel.codigos_panel (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id              uuid NOT NULL REFERENCES identidad_panel.usuarios_panel(id),
  trabajo_id              bigint,
  codigo_hmac             bytea NOT NULL,
  emitido_en              timestamptz NOT NULL DEFAULT now(),
  expira_en               timestamptz NOT NULL,
  usado_en                timestamptz,
  invalidado_por_sistema  boolean NOT NULL DEFAULT false,
  resultado_envio         text CHECK (resultado_envio IN ('ok', 'ambiguo', 'definitivo'))
);
CREATE INDEX ON identidad_panel.codigos_panel (usuario_id, expira_en);

CREATE TABLE identidad_panel.intentos_panel (
  clave            bytea PRIMARY KEY,
  tipo             text NOT NULL CHECK (tipo IN ('par', 'ip')),
  ventana_inicio   timestamptz NOT NULL DEFAULT now(),
  fallos_ventana   integer NOT NULL DEFAULT 0,
  dia_inicio       timestamptz NOT NULL DEFAULT now(),
  fallos_dia       integer NOT NULL DEFAULT 0,
  bloqueado_hasta  timestamptz
);

CREATE TABLE identidad_panel.sesiones_panel (
  id_hash           bytea PRIMARY KEY,
  usuario_id        uuid NOT NULL REFERENCES identidad_panel.usuarios_panel(id),
  creada            timestamptz NOT NULL DEFAULT now(),
  ultima_actividad  timestamptz NOT NULL DEFAULT now(),
  expira            timestamptz NOT NULL
);

-- ─── operacion: cola ─────────────────────────────────────────────────────────────────────
CREATE TABLE operacion.trabajos (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipo                text NOT NULL,
  prioridad           integer NOT NULL DEFAULT 0,
  origen              text NOT NULL CHECK (origen IN ('portal', 'panel', 'worker', 'migracion')), -- sin DEFAULT: lo fijan las funciones
  payload             jsonb NOT NULL,
  clave_idempotencia  text UNIQUE,
  intentos            integer NOT NULL DEFAULT 0,
  proximo_intento     timestamptz NOT NULL DEFAULT now(),
  estado              text NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'en_curso', 'hecho', 'fallando', 'caducado')),
  locked_by           text,
  locked_until        timestamptz,
  ultimo_error        text,
  caduca_en           timestamptz,
  creado_en           timestamptz NOT NULL DEFAULT now(),
  actualizado_en      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trabajos_despacho ON operacion.trabajos (estado, proximo_intento) WHERE estado IN ('pendiente', 'fallando', 'en_curso');

CREATE TABLE operacion.worker_ciclo (
  id             integer PRIMARY KEY CHECK (id = 1),
  ultima_vuelta  timestamptz NOT NULL
);

-- ─── Encolado con lista blanca única (ADR-0002 «H0 — encolado») ──────────────────────────
CREATE FUNCTION operacion._validar_enviar_codigo(p jsonb, ambito_esperado text) RETURNS void
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
DECLARE
  ref uuid;
BEGIN
  IF p->>'ambito' IS DISTINCT FROM ambito_esperado THEN
    RAISE EXCEPTION 'enviar_codigo: ámbito no permitido para este origen';
  END IF;
  IF p ? 'ref' IS NOT TRUE THEN
    RAISE EXCEPTION 'enviar_codigo: falta ref';
  END IF;
  IF jsonb_typeof(p->'ref') = 'null' THEN
    RETURN;
  END IF;
  BEGIN
    ref := (p->>'ref')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'enviar_codigo: ref inválido';
  END;
  IF ambito_esperado = 'cliente' THEN
    PERFORM 1 FROM identidad.enlace_invitados WHERE id = ref AND activo;
  ELSE
    PERFORM 1 FROM identidad_panel.usuarios_panel WHERE id = ref AND activo;
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'enviar_codigo: ref no es un sujeto activo del ámbito';
  END IF;
END
$f$;

CREATE FUNCTION operacion._insertar_trabajo(p_tipo text, p_origen text, p_payload jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
DECLARE
  nuevo bigint;
BEGIN
  INSERT INTO operacion.trabajos (tipo, origen, payload, caduca_en)
  VALUES (p_tipo, p_origen, p_payload,
          CASE WHEN p_tipo = 'enviar_codigo' THEN now() + interval '10 minutes' END)
  RETURNING id INTO nuevo;
  PERFORM pg_notify('trabajos', p_tipo);
  RETURN nuevo;
END
$f$;

CREATE FUNCTION operacion.encolar_portal(p_tipo text, p_payload jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'payload debe ser un objeto';
  END IF;
  CASE p_tipo
    WHEN 'enviar_codigo' THEN PERFORM operacion._validar_enviar_codigo(p_payload, 'cliente');
    WHEN 'crear_negocio' THEN NULL;
    WHEN 'voto' THEN NULL;
    WHEN 'notificar' THEN
      IF p_payload->>'motivo' IS DISTINCT FROM 'invitacion_solicitada' THEN
        RAISE EXCEPTION 'notificar: motivo no permitido para el portal';
      END IF;
    ELSE RAISE EXCEPTION 'tipo de trabajo no permitido para el portal: %', p_tipo;
  END CASE;
  RETURN operacion._insertar_trabajo(p_tipo, 'portal', p_payload);
END
$f$;

CREATE FUNCTION operacion.encolar_panel(p_tipo text, p_payload jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'payload debe ser un objeto';
  END IF;
  CASE p_tipo
    WHEN 'enviar_codigo' THEN PERFORM operacion._validar_enviar_codigo(p_payload, 'panel');
    WHEN 'aplicar_importacion' THEN NULL;
    WHEN 'revertir_importacion' THEN NULL;
    WHEN 'retirar_supresion' THEN NULL;
    ELSE RAISE EXCEPTION 'tipo de trabajo no permitido para el panel: %', p_tipo;
  END CASE;
  RETURN operacion._insertar_trabajo(p_tipo, 'panel', p_payload);
END
$f$;

CREATE FUNCTION operacion.encolar_worker(p_tipo text, p_payload jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'payload debe ser un objeto';
  END IF;
  IF p_tipo <> 'notificar' THEN
    RAISE EXCEPTION 'tipo de trabajo no permitido para el worker: %', p_tipo;
  END IF;
  RETURN operacion._insertar_trabajo(p_tipo, 'worker', p_payload);
END
$f$;

-- Lista blanca que el worker vuelve a comprobar antes de ejecutar (V9-10).
CREATE FUNCTION operacion.origen_permitido(p_tipo text, p_origen text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $f$
  SELECT CASE p_origen
    WHEN 'portal' THEN p_tipo IN ('enviar_codigo', 'crear_negocio', 'voto', 'notificar')
    WHEN 'panel' THEN p_tipo IN ('enviar_codigo', 'aplicar_importacion', 'revertir_importacion', 'retirar_supresion')
    WHEN 'worker' THEN p_tipo IN ('notificar')
    ELSE false
  END
$f$;

-- ─── Modo degradado (H8) ─────────────────────────────────────────────────────────────────
CREATE FUNCTION operacion._origen_llamante() RETURNS text
LANGUAGE sql STABLE AS $f$
  SELECT CASE session_user WHEN 'ps_portal' THEN 'portal' WHEN 'ps_panel' THEN 'panel' END
$f$;

CREATE FUNCTION operacion.reclamar_propio(p_id bigint, p_reclamo text)
RETURNS SETOF operacion.trabajos
LANGUAGE sql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
  UPDATE operacion.trabajos
     SET estado = 'en_curso', locked_by = p_reclamo, locked_until = now() + interval '10 minutes',
         actualizado_en = now()
   WHERE id = p_id AND estado = 'pendiente' AND tipo = 'enviar_codigo'
     AND origen = operacion._origen_llamante()
  RETURNING *
$f$;

CREATE FUNCTION operacion.cerrar_propio(p_id bigint, p_reclamo text, p_resultado text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
BEGIN
  IF p_resultado NOT IN ('ok', 'ambiguo', 'definitivo', 'reintentar', 'sin_efecto') THEN
    RAISE EXCEPTION 'resultado no válido';
  END IF;
  UPDATE operacion.trabajos
     SET estado = CASE WHEN p_resultado IN ('reintentar', 'ambiguo') THEN 'pendiente' ELSE 'hecho' END,
         proximo_intento = CASE WHEN p_resultado IN ('reintentar', 'ambiguo') THEN now() + interval '5 seconds' ELSE proximo_intento END,
         intentos = intentos + 1,
         locked_by = NULL, locked_until = NULL, actualizado_en = now(),
         ultimo_error = CASE WHEN p_resultado IN ('ok', 'sin_efecto') THEN NULL ELSE p_resultado END
   WHERE id = p_id AND locked_by = p_reclamo AND estado = 'en_curso' AND tipo = 'enviar_codigo'
     AND origen = operacion._origen_llamante();
  RETURN FOUND;
END
$f$;

-- ─── Códigos: ranuras vigentes por sujeto (H22) ──────────────────────────────────────────
CREATE FUNCTION identidad.guardar_codigo_cliente(p_trabajo bigint, p_reclamo text, p_hmac bytea) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad, operacion, pg_temp AS $f$
DECLARE
  t operacion.trabajos;
  sujeto uuid;
  nuevo uuid;
BEGIN
  SELECT * INTO t FROM operacion.trabajos
   WHERE id = p_trabajo AND estado = 'en_curso' AND locked_by = p_reclamo AND tipo = 'enviar_codigo'
     AND payload->>'ambito' = 'cliente'
     AND (session_user = 'ps_worker' OR origen = operacion._origen_llamante())
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'guardar_codigo_cliente: el trabajo no está reclamado por este reclamo';
  END IF;
  sujeto := (t.payload->>'ref')::uuid;
  IF sujeto IS NULL THEN
    RAISE EXCEPTION 'guardar_codigo_cliente: trabajo sin sujeto';
  END IF;
  -- Al generar el que excede las ranuras, el más antiguo vigente queda invalidado por el sistema.
  UPDATE identidad.codigos_cliente SET invalidado_por_sistema = true
   WHERE id IN (
     SELECT id FROM identidad.codigos_cliente
      WHERE invitado_id = sujeto AND usado_en IS NULL AND NOT invalidado_por_sistema AND expira_en > now()
      ORDER BY emitido_en DESC OFFSET ${RANURAS_CODIGO - 1});
  INSERT INTO identidad.codigos_cliente (invitado_id, trabajo_id, codigo_hmac, expira_en)
  VALUES (sujeto, p_trabajo, p_hmac, now() + interval '10 minutes')
  RETURNING id INTO nuevo;
  RETURN nuevo;
END
$f$;

CREATE FUNCTION identidad_panel.guardar_codigo_panel(p_trabajo bigint, p_reclamo text, p_hmac bytea) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad_panel, operacion, pg_temp AS $f$
DECLARE
  t operacion.trabajos;
  sujeto uuid;
  nuevo uuid;
BEGIN
  SELECT * INTO t FROM operacion.trabajos
   WHERE id = p_trabajo AND estado = 'en_curso' AND locked_by = p_reclamo AND tipo = 'enviar_codigo'
     AND payload->>'ambito' = 'panel'
     AND (session_user = 'ps_worker' OR origen = operacion._origen_llamante())
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'guardar_codigo_panel: el trabajo no está reclamado por este reclamo';
  END IF;
  sujeto := (t.payload->>'ref')::uuid;
  IF sujeto IS NULL THEN
    RAISE EXCEPTION 'guardar_codigo_panel: trabajo sin sujeto';
  END IF;
  UPDATE identidad_panel.codigos_panel SET invalidado_por_sistema = true
   WHERE id IN (
     SELECT id FROM identidad_panel.codigos_panel
      WHERE usuario_id = sujeto AND usado_en IS NULL AND NOT invalidado_por_sistema AND expira_en > now()
      ORDER BY emitido_en DESC OFFSET ${RANURAS_CODIGO - 1});
  INSERT INTO identidad_panel.codigos_panel (usuario_id, trabajo_id, codigo_hmac, expira_en)
  VALUES (sujeto, p_trabajo, p_hmac, now() + interval '10 minutes')
  RETURNING id INTO nuevo;
  RETURN nuevo;
END
$f$;

-- Resultado del envío sobre el código de ese trabajo (H22): definitivo invalida ese código.
CREATE FUNCTION identidad.marcar_envio_codigo(p_codigo uuid, p_resultado text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
  UPDATE identidad.codigos_cliente
     SET resultado_envio = p_resultado,
         invalidado_por_sistema = invalidado_por_sistema OR p_resultado = 'definitivo'
   WHERE id = p_codigo
$f$;

CREATE FUNCTION identidad_panel.marcar_envio_codigo(p_codigo uuid, p_resultado text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = identidad_panel, pg_temp AS $f$
  UPDATE identidad_panel.codigos_panel
     SET resultado_envio = p_resultado,
         invalidado_por_sistema = invalidado_por_sistema OR p_resultado = 'definitivo'
   WHERE id = p_codigo
$f$;

-- ─── Cierre de sesión y purga ────────────────────────────────────────────────────────────
CREATE FUNCTION identidad.cerrar_sesion(p_id_hash bytea) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
  DELETE FROM identidad.sesiones_portal WHERE id_hash = p_id_hash
$f$;

CREATE FUNCTION identidad_panel.cerrar_sesion(p_id_hash bytea) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = identidad_panel, pg_temp AS $f$
  DELETE FROM identidad_panel.sesiones_panel WHERE id_hash = p_id_hash
$f$;

CREATE FUNCTION identidad.purgar_vencidos() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
BEGIN
  DELETE FROM identidad.codigos_cliente WHERE expira_en < now() - interval '1 day' OR usado_en < now() - interval '1 day';
  DELETE FROM identidad.intentos_cliente
   WHERE dia_inicio < now() - interval '1 day' AND (bloqueado_hasta IS NULL OR bloqueado_hasta < now());
  DELETE FROM identidad.sesiones_portal WHERE expira < now();
  DELETE FROM identidad.accesos_log WHERE ts < now() - interval '180 days';
END
$f$;

CREATE FUNCTION identidad_panel.purgar_vencidos() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad_panel, pg_temp AS $f$
BEGIN
  DELETE FROM identidad_panel.codigos_panel WHERE expira_en < now() - interval '1 day' OR usado_en < now() - interval '1 day';
  DELETE FROM identidad_panel.intentos_panel
   WHERE dia_inicio < now() - interval '1 day' AND (bloqueado_hasta IS NULL OR bloqueado_hasta < now());
  DELETE FROM identidad_panel.sesiones_panel WHERE expira < now();
END
$f$;

-- ─── RLS de accesos_log por host y por rol ───────────────────────────────────────────────
ALTER TABLE identidad.accesos_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY accesos_portal ON identidad.accesos_log FOR INSERT TO ps_portal WITH CHECK (host = 'portal');
CREATE POLICY accesos_panel ON identidad.accesos_log FOR INSERT TO ps_panel WITH CHECK (host = 'panel');
CREATE POLICY accesos_worker ON identidad.accesos_log FOR INSERT TO ps_worker WITH CHECK (evento = 'codigo_descartado');

-- ─── Permisos: lista normativa de ADR-0002 «H0 — aislamiento» ─────────────────────────────
-- Las tablas nuevas no conceden nada a PUBLIC; las funciones sí (EXECUTE), así que se retira.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA identidad, identidad_panel, operacion FROM PUBLIC;

-- ps_portal
GRANT SELECT ON identidad.enlaces, identidad.enlace_tokens, identidad.enlace_invitados TO ps_portal;
GRANT INSERT ON identidad.invitaciones_solicitadas TO ps_portal;
GRANT SELECT, UPDATE (usado_en) ON identidad.codigos_cliente TO ps_portal;
GRANT SELECT, INSERT, UPDATE ON identidad.intentos_cliente, identidad.sesiones_portal TO ps_portal;
GRANT INSERT ON identidad.accesos_log TO ps_portal;
GRANT EXECUTE ON FUNCTION identidad.cerrar_sesion(bytea), identidad.guardar_codigo_cliente(bigint, text, bytea),
  identidad.marcar_envio_codigo(uuid, text),
  operacion.reclamar_propio(bigint, text), operacion.cerrar_propio(bigint, text, text),
  operacion.encolar_portal(text, jsonb) TO ps_portal;
GRANT SELECT ON operacion.worker_ciclo TO ps_portal;

-- ps_panel
GRANT SELECT, INSERT, UPDATE ON identidad_panel.usuarios_panel, identidad_panel.sesiones_panel,
  identidad_panel.intentos_panel TO ps_panel;
GRANT SELECT, UPDATE (usado_en) ON identidad_panel.codigos_panel TO ps_panel;
GRANT SELECT, INSERT, UPDATE ON identidad.enlaces, identidad.enlace_tokens, identidad.enlace_invitados,
  identidad.invitaciones_solicitadas TO ps_panel;
GRANT SELECT, UPDATE ON identidad.intentos_cliente TO ps_panel;
GRANT INSERT ON identidad.accesos_log TO ps_panel;
GRANT EXECUTE ON FUNCTION identidad_panel.cerrar_sesion(bytea), identidad_panel.guardar_codigo_panel(bigint, text, bytea),
  identidad_panel.marcar_envio_codigo(uuid, text),
  operacion.reclamar_propio(bigint, text), operacion.cerrar_propio(bigint, text, text),
  operacion.encolar_panel(text, jsonb) TO ps_panel;
GRANT SELECT ON operacion.worker_ciclo TO ps_panel;

-- ps_worker
GRANT SELECT (id, correo, activo) ON identidad.enlace_invitados TO ps_worker;
GRANT SELECT (id, correo, activo) ON identidad_panel.usuarios_panel TO ps_worker;
GRANT SELECT, INSERT, UPDATE ON identidad.codigos_cliente TO ps_worker;
GRANT SELECT, INSERT, UPDATE ON identidad_panel.codigos_panel TO ps_worker;
GRANT INSERT ON identidad.accesos_log TO ps_worker;
GRANT EXECUTE ON FUNCTION identidad.purgar_vencidos(), identidad_panel.purgar_vencidos(),
  identidad.guardar_codigo_cliente(bigint, text, bytea), identidad_panel.guardar_codigo_panel(bigint, text, bytea),
  identidad.marcar_envio_codigo(uuid, text), identidad_panel.marcar_envio_codigo(uuid, text),
  operacion.encolar_worker(text, jsonb), operacion.origen_permitido(text, text) TO ps_worker;
GRANT SELECT ON operacion.trabajos TO ps_worker;
GRANT UPDATE (estado, intentos, proximo_intento, locked_by, locked_until, ultimo_error, actualizado_en)
  ON operacion.trabajos TO ps_worker;
GRANT SELECT, INSERT, UPDATE ON operacion.worker_ciclo TO ps_worker;

RESET ROLE;
-- Tabla de migraciones (de ps_migrador): los roles la leen para salud/lista.
GRANT SELECT ON operacion.kysely_migration TO ps_portal, ps_panel, ps_worker;
`,
    )
    .execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
DROP TABLE IF EXISTS operacion.worker_ciclo, operacion.trabajos CASCADE;
DROP TABLE IF EXISTS identidad_panel.sesiones_panel, identidad_panel.intentos_panel,
  identidad_panel.codigos_panel, identidad_panel.usuarios_panel CASCADE;
DROP TABLE IF EXISTS identidad.accesos_log, identidad.sesiones_portal, identidad.intentos_cliente,
  identidad.codigos_cliente, identidad.invitaciones_solicitadas, identidad.enlace_tokens,
  identidad.enlace_invitados, identidad.enlaces CASCADE;
RESET ROLE;
`,
    )
    .execute(db);
}
