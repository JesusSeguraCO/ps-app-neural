// EP-001 · sub-slice 6c (HU-092, HU-146; sponsor 2026-09-29): la renovación ya no consulta HubSpot.
//  - `renovaciones.correo`: el correo que escribió quien pide, esté invitado o no, para avisar a
//    Talento Humano quién fue (dato personal nuevo, Ley 1581; plazo a fijar en el Release Gate);
//  - resultado `no_invitado` (sin enlace; antes `sin_efecto`), `entrega` del enlace nuevo y `avisado_en`
//    del aviso a Talento Humano;
//  - `identidad.marcar_entrega_renovacion`: única vía del worker para anotar entrega y aviso;
//  - el panel lee las renovaciones (bandeja de HU-146).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
ALTER TABLE identidad.renovaciones
  ADD COLUMN correo text CHECK (correo IS NULL OR length(correo) BETWEEN 3 AND 254),
  ADD COLUMN entrega text CHECK (entrega IN ('enviado', 'fallido')),
  ADD COLUMN avisado_en timestamptz,
  DROP CONSTRAINT renovaciones_resultado_check,
  ADD CONSTRAINT renovaciones_resultado_check
    CHECK (resultado IN ('enlace_enviado', 'no_invitado', 'aviso_propietario', 'aviso_talento', 'sin_efecto')),
  ADD CHECK (entrega IS NULL OR resultado = 'enlace_enviado');

CREATE OR REPLACE FUNCTION identidad.resolver_renovacion(p_trabajo bigint, p_reclamo text, p_renovacion uuid,
                                                         p_resultado text, p_publico text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
BEGIN
  IF p_resultado NOT IN ('no_invitado', 'sin_efecto') THEN
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

-- Tras resolver: entrega del enlace nuevo (solo si se emitió) y hora del aviso a Talento Humano.
CREATE FUNCTION identidad.marcar_entrega_renovacion(p_trabajo bigint, p_reclamo text, p_renovacion uuid,
                                                    p_entrega text, p_avisado boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = identidad, pg_temp AS $f$
BEGIN
  IF p_entrega IS NOT NULL AND p_entrega NOT IN ('enviado', 'fallido') THEN
    RAISE EXCEPTION 'marcar_entrega_renovacion: entrega no permitida';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM operacion.trabajos
                  WHERE id = p_trabajo AND tipo = 'renovar_enlace' AND estado = 'en_curso'
                    AND locked_by = p_reclamo AND payload->>'renovacion' = p_renovacion::text) THEN
    RAISE EXCEPTION 'marcar_entrega_renovacion: trabajo no reclamado por este worker';
  END IF;
  UPDATE identidad.renovaciones
     SET entrega = coalesce(p_entrega, entrega),
         avisado_en = CASE WHEN p_avisado THEN coalesce(avisado_en, now()) ELSE avisado_en END
   WHERE id = p_renovacion AND resultado IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'marcar_entrega_renovacion: renovación inexistente o sin resolver'; END IF;
END
$f$;

REVOKE ALL ON FUNCTION identidad.marcar_entrega_renovacion(bigint, text, uuid, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION identidad.marcar_entrega_renovacion(bigint, text, uuid, text, boolean) TO ps_worker;
GRANT SELECT ON identidad.renovaciones TO ps_panel;
RESET ROLE;
`,
    )
    .execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
REVOKE SELECT ON identidad.renovaciones FROM ps_panel;
DROP FUNCTION IF EXISTS identidad.marcar_entrega_renovacion(bigint, text, uuid, text, boolean);
CREATE OR REPLACE FUNCTION identidad.resolver_renovacion(p_trabajo bigint, p_reclamo text, p_renovacion uuid,
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
ALTER TABLE identidad.renovaciones DROP COLUMN IF EXISTS correo, DROP COLUMN IF EXISTS entrega,
  DROP COLUMN IF EXISTS avisado_en;
RESET ROLE;
`,
    )
    .execute(db);
}
