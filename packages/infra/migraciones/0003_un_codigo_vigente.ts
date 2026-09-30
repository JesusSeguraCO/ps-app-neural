// T-31 resuelta el 2026-09-28 (decisión del sponsor: «la norma del mercado»): un solo código vigente
// por sujeto. Cada código nuevo —también el de un reintento tras un envío ambiguo— invalida por el
// sistema los anteriores, que siguen sin sumar fallo si alguien los escribe (ADR-0002 H22, V2-5 alt.).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;

CREATE OR REPLACE FUNCTION identidad.guardar_codigo_cliente(p_trabajo bigint, p_reclamo text, p_hmac bytea) RETURNS uuid
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
      ORDER BY emitido_en DESC OFFSET 0);
  INSERT INTO identidad.codigos_cliente (invitado_id, trabajo_id, codigo_hmac, expira_en)
  VALUES (sujeto, p_trabajo, p_hmac, now() + interval '10 minutes')
  RETURNING id INTO nuevo;
  RETURN nuevo;
END
$f$;

CREATE OR REPLACE FUNCTION identidad_panel.guardar_codigo_panel(p_trabajo bigint, p_reclamo text, p_hmac bytea) RETURNS uuid
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
      ORDER BY emitido_en DESC OFFSET 0);
  INSERT INTO identidad_panel.codigos_panel (usuario_id, trabajo_id, codigo_hmac, expira_en)
  VALUES (sujeto, p_trabajo, p_hmac, now() + interval '10 minutes')
  RETURNING id INTO nuevo;
  RETURN nuevo;
END
$f$;

RESET ROLE;
`).execute(db);
}

export async function down(): Promise<void> {
  throw new Error("0003 no se revierte: volver a 3 códigos vigentes exige una decisión de negocio (T-31)");
}
