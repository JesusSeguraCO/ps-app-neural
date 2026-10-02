// EP-006 · sub-slice 4 (HU-141, HU-087, HU-142; diseño §3; ADR-0003 I-2): lo que el worker necesita
// para aplicar y revertir un lote.
//  - `lotes_importacion`: el nombre del archivo cargado, quién confirmó y cuándo (el actor de cada cambio auditado), el trabajo que lo
//    aplica, cuándo quedó aplicado y, para revertir, quién, cuándo y con qué trabajo.
//  - `lote_filas`: el perfil tocado, si la importación lo creó, su `estado_previo` (solo los campos que
//    la importación puede cambiar, nunca B.4 ni el consentimiento: lo fija `solo_claves_de_estado_previo`) y la
//    `version` que dejó la importación (una versión posterior = alguien lo cambió después, HU-087).
// Sin DELETE para nadie (CON-11), `ps_portal` sin acceso (V3-2) y sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

const CLAVES_ESTADO_PREVIO = [
  "nombre",
  "primer_apellido",
  "estado",
  "familia_id",
  "seniority_id",
  "anios_experiencia",
  "modalidad_id",
  "pais_id",
  "ciudad_id",
  "disponibilidad_fecha",
  "disponibilidad_actualizada_en",
  "motivo_pausa_id",
  "modalidad_prueba_id",
  "capacidad",
  "anclaje",
  "resumen",
  "vinculo",
  "formacion",
  "idiomas",
  "sello_personal",
  "roles",
  "tecnologias",
  "sectores",
  "experiencias",
];

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE FUNCTION inventario.solo_claves_de_estado_previo(d jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $f$
  SELECT d IS NULL OR (
    jsonb_typeof(d) = 'object'
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_object_keys(d) k
       WHERE k <> ALL (ARRAY[${CLAVES_ESTADO_PREVIO.map((c) => `'${c}'`).join(", ")}])))
$f$;

ALTER TABLE inventario.lotes_importacion
  -- Nombre del archivo cargado (sin ruta), para reconocer la importación en el historial; null si se pegó.
  ADD COLUMN archivo_nombre      text CHECK (archivo_nombre IS NULL OR length(archivo_nombre) BETWEEN 1 AND 200),
  ADD COLUMN confirmado_por      uuid REFERENCES identidad_panel.usuarios_panel(id),
  ADD COLUMN confirmado_en       timestamptz,
  ADD COLUMN trabajo_id          bigint,
  ADD COLUMN aplicado_en         timestamptz,
  ADD COLUMN revertido_por       uuid REFERENCES identidad_panel.usuarios_panel(id),
  ADD COLUMN revertido_en        timestamptz,
  ADD COLUMN trabajo_reversion_id bigint,
  -- Por qué no se pudo revertir (el lote sigue aplicado y se puede volver a intentar).
  ADD COLUMN motivo_reversion    text,
  ADD CONSTRAINT lotes_confirmado CHECK ((confirmado_por IS NULL) = (confirmado_en IS NULL)),
  ADD CONSTRAINT lotes_aplicado CHECK ((estado IN ('aplicado', 'revertido')) = (aplicado_en IS NOT NULL)),
  ADD CONSTRAINT lotes_revertido CHECK ((estado = 'revertido') = (revertido_en IS NOT NULL));
CREATE INDEX lotes_importacion_aplicado_en ON inventario.lotes_importacion (aplicado_en DESC)
  WHERE aplicado_en IS NOT NULL;

ALTER TABLE inventario.lote_filas
  ADD COLUMN perfil_id        uuid REFERENCES inventario.perfiles(id),
  ADD COLUMN creado           boolean NOT NULL DEFAULT false,
  ADD COLUMN estado_previo      jsonb CHECK (inventario.solo_claves_de_estado_previo(estado_previo)),
  ADD COLUMN version_aplicada integer,
  ADD CONSTRAINT lote_filas_creado_sin_previo CHECK (NOT (creado AND estado_previo IS NOT NULL));

GRANT EXECUTE ON FUNCTION inventario.solo_claves_de_estado_previo(jsonb) TO ps_panel, ps_worker;
REVOKE ALL ON ALL TABLES IN SCHEMA inventario FROM ps_portal;

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
ALTER TABLE inventario.lote_filas
  DROP COLUMN IF EXISTS version_aplicada,
  DROP COLUMN IF EXISTS estado_previo,
  DROP COLUMN IF EXISTS creado,
  DROP COLUMN IF EXISTS perfil_id;
ALTER TABLE inventario.lotes_importacion
  DROP CONSTRAINT IF EXISTS lotes_revertido,
  DROP CONSTRAINT IF EXISTS lotes_aplicado,
  DROP CONSTRAINT IF EXISTS lotes_confirmado,
  DROP COLUMN IF EXISTS motivo_reversion,
  DROP COLUMN IF EXISTS trabajo_reversion_id,
  DROP COLUMN IF EXISTS revertido_en,
  DROP COLUMN IF EXISTS revertido_por,
  DROP COLUMN IF EXISTS aplicado_en,
  DROP COLUMN IF EXISTS trabajo_id,
  DROP COLUMN IF EXISTS confirmado_en,
  DROP COLUMN IF EXISTS confirmado_por,
  DROP COLUMN IF EXISTS archivo_nombre;
DROP FUNCTION IF EXISTS inventario.solo_claves_de_estado_previo(jsonb);
RESET ROLE;
`,
    )
    .execute(db);
}
