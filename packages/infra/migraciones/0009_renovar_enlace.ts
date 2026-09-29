// EP-001 · sub-slice 5 (HU-092, design §2; enmienda menor de ADR-0009): renovación del enlace vencido
// por la cola. El portal registra la petición y encola `renovar_enlace {renovacion}` SIN mirar si el
// correo estaba invitado (respuesta neutra en tiempo constante); el worker lo comprueba, consulta
// HubSpot y emite el enlace nuevo, avisa al propietario o a Talento Humano.
//  - `renovaciones`: una fila por petición; `publico` es lo único que el portal devuelve y depende
//    solo del estado de la cuenta (automatica | persona), nunca de la invitación.
//  - `identidad.emitir_renovacion`: única vía del worker para crear el enlace nuevo (V2-6: ps_worker no
//    tiene INSERT directo en enlaces ni en enlace_tokens).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;

CREATE TABLE identidad.renovaciones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enlace_id    uuid NOT NULL REFERENCES identidad.enlaces(id),
  correo_hmac  bytea NOT NULL,                 -- el correo en claro no se guarda: puede no estar invitado
  pedida_en    timestamptz NOT NULL DEFAULT now(),
  resultado    text CHECK (resultado IN ('enlace_enviado', 'aviso_propietario', 'aviso_talento', 'sin_efecto')),
  publico      text CHECK (publico IN ('automatica', 'persona')),
  enlace_nuevo uuid REFERENCES identidad.enlaces(id),
  resuelta_en  timestamptz,
  CHECK ((resultado IS NULL) = (publico IS NULL))
);
CREATE INDEX ON identidad.renovaciones (enlace_id, correo_hmac, pedida_en DESC);

-- Payload {renovacion: uuid} de una fila existente y sin resolver.
CREATE FUNCTION operacion._validar_renovar_enlace(p jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
DECLARE r uuid;
BEGIN
  IF (SELECT count(*) FROM jsonb_object_keys(p)) <> 1 OR p ? 'renovacion' IS NOT TRUE THEN
    RAISE EXCEPTION 'renovar_enlace: payload inválido';
  END IF;
  BEGIN
    r := (p->>'renovacion')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'renovar_enlace: renovacion inválida';
  END;
  IF NOT EXISTS (SELECT 1 FROM identidad.renovaciones WHERE id = r AND resultado IS NULL) THEN
    RAISE EXCEPTION 'renovar_enlace: renovacion inexistente o resuelta';
  END IF;
END
$f$;

CREATE OR REPLACE FUNCTION operacion.encolar_portal(p_tipo text, p_payload jsonb) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = operacion, pg_temp AS $f$
BEGIN
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'payload debe ser un objeto';
  END IF;
  CASE p_tipo
    WHEN 'enviar_codigo' THEN PERFORM operacion._validar_enviar_codigo(p_payload, 'cliente');
    WHEN 'renovar_enlace' THEN PERFORM operacion._validar_renovar_enlace(p_payload);
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

CREATE OR REPLACE FUNCTION operacion.origen_permitido(p_tipo text, p_origen text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $f$
  SELECT CASE p_origen
    WHEN 'portal' THEN p_tipo IN ('enviar_codigo', 'renovar_enlace', 'crear_negocio', 'voto', 'notificar')
    WHEN 'panel' THEN p_tipo IN ('enviar_codigo', 'aplicar_importacion', 'revertir_importacion', 'retirar_supresion')
    WHEN 'worker' THEN p_tipo IN ('notificar')
    ELSE false
  END
$f$;

-- Crea el enlace renovado (misma cuenta, proyecto, razón y selección; vigencia nueva) con el invitado
-- que lo pidió y un token con su invitado fijo. Solo con el trabajo renovar_enlace de esa renovación
-- reclamado por quien llama; marca la renovación como resuelta.
CREATE FUNCTION identidad.emitir_renovacion(p_trabajo bigint, p_reclamo text, p_renovacion uuid,
                                            p_invitado uuid, p_token_hash bytea, p_vigente_hasta timestamptz)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
DECLARE
  v_enlace identidad.enlaces%ROWTYPE;
  v_inv identidad.enlace_invitados%ROWTYPE;
  v_nuevo uuid;
  v_nuevo_inv uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM operacion.trabajos
                  WHERE id = p_trabajo AND tipo = 'renovar_enlace' AND estado = 'en_curso'
                    AND locked_by = p_reclamo AND payload->>'renovacion' = p_renovacion::text) THEN
    RAISE EXCEPTION 'emitir_renovacion: trabajo no reclamado por este worker';
  END IF;
  SELECT e.* INTO v_enlace FROM identidad.enlaces e JOIN identidad.renovaciones r ON r.enlace_id = e.id
   WHERE r.id = p_renovacion AND r.resultado IS NULL FOR UPDATE OF r;
  IF NOT FOUND THEN RAISE EXCEPTION 'emitir_renovacion: renovación inexistente o resuelta'; END IF;
  SELECT * INTO v_inv FROM identidad.enlace_invitados
   WHERE id = p_invitado AND enlace_id = v_enlace.id AND activo
     AND correo_hmac = (SELECT correo_hmac FROM identidad.renovaciones WHERE id = p_renovacion);
  IF NOT FOUND THEN RAISE EXCEPTION 'emitir_renovacion: el invitado no pidió esta renovación'; END IF;
  IF v_enlace.estado <> 'activo' OR v_enlace.vigente_hasta > now() THEN
    RAISE EXCEPTION 'emitir_renovacion: solo se renueva un enlace vencido';
  END IF;
  IF p_vigente_hasta <= now() OR p_vigente_hasta > now() + interval '365 days' THEN
    RAISE EXCEPTION 'emitir_renovacion: vigencia fuera de rango';
  END IF;

  INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde,
                                 vigente_hasta, generado_por)
  VALUES (v_enlace.cuenta_ref, v_enlace.cuenta_nombre, v_enlace.proyecto, v_enlace.razon, v_enlace.codigos_perfil,
          now(), p_vigente_hasta, v_enlace.generado_por)
  RETURNING id INTO v_nuevo;
  INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac, origen)
  VALUES (v_nuevo, v_inv.correo, v_inv.correo_hmac, 'inicial') RETURNING id INTO v_nuevo_inv;
  INSERT INTO identidad.enlace_tokens (enlace_id, invitado_id, token_hash) VALUES (v_nuevo, v_nuevo_inv, p_token_hash);
  UPDATE identidad.renovaciones SET resultado = 'enlace_enviado', publico = 'automatica', enlace_nuevo = v_nuevo,
         resuelta_en = now() WHERE id = p_renovacion;
  RETURN v_nuevo;
END
$f$;

-- Cierre de una renovación sin enlace automático (aviso a una persona o sin efecto).
CREATE FUNCTION identidad.resolver_renovacion(p_trabajo bigint, p_reclamo text, p_renovacion uuid,
                                              p_resultado text, p_publico text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
BEGIN
  IF p_resultado NOT IN ('aviso_propietario', 'aviso_talento', 'sin_efecto') THEN
    RAISE EXCEPTION 'resolver_renovacion: resultado no permitido';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM operacion.trabajos
                  WHERE id = p_trabajo AND tipo = 'renovar_enlace' AND estado = 'en_curso'
                    AND locked_by = p_reclamo AND payload->>'renovacion' = p_renovacion::text) THEN
    RAISE EXCEPTION 'resolver_renovacion: trabajo no reclamado por este worker';
  END IF;
  UPDATE identidad.renovaciones SET resultado = p_resultado, publico = p_publico, resuelta_en = now()
   WHERE id = p_renovacion AND resultado IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'resolver_renovacion: renovación inexistente o resuelta'; END IF;
END
$f$;

REVOKE ALL ON FUNCTION identidad.emitir_renovacion(bigint, text, uuid, uuid, bytea, timestamptz),
  identidad.resolver_renovacion(bigint, text, uuid, text, text), operacion._validar_renovar_enlace(jsonb) FROM PUBLIC;
GRANT SELECT, INSERT ON identidad.renovaciones TO ps_portal;
GRANT SELECT ON identidad.renovaciones TO ps_worker;
GRANT SELECT (id, cuenta_ref, cuenta_nombre, proyecto, codigo, estado, vigente_hasta) ON identidad.enlaces TO ps_worker;
GRANT SELECT (enlace_id, correo_hmac) ON identidad.enlace_invitados TO ps_worker;
GRANT EXECUTE ON FUNCTION identidad.emitir_renovacion(bigint, text, uuid, uuid, bytea, timestamptz),
  identidad.resolver_renovacion(bigint, text, uuid, text, text) TO ps_worker;
RESET ROLE;
`).execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
CREATE OR REPLACE FUNCTION operacion.origen_permitido(p_tipo text, p_origen text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $f$
  SELECT CASE p_origen
    WHEN 'portal' THEN p_tipo IN ('enviar_codigo', 'crear_negocio', 'voto', 'notificar')
    WHEN 'panel' THEN p_tipo IN ('enviar_codigo', 'aplicar_importacion', 'revertir_importacion', 'retirar_supresion')
    WHEN 'worker' THEN p_tipo IN ('notificar')
    ELSE false
  END
$f$;
CREATE OR REPLACE FUNCTION operacion.encolar_portal(p_tipo text, p_payload jsonb) RETURNS bigint
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
DROP FUNCTION IF EXISTS identidad.emitir_renovacion(bigint, text, uuid, uuid, bytea, timestamptz),
  identidad.resolver_renovacion(bigint, text, uuid, text, text), operacion._validar_renovar_enlace(jsonb);
REVOKE SELECT ON identidad.enlaces FROM ps_worker;
REVOKE SELECT (enlace_id, correo_hmac) ON identidad.enlace_invitados FROM ps_worker;
DROP TABLE IF EXISTS identidad.renovaciones;
RESET ROLE;
`).execute(db);
}
