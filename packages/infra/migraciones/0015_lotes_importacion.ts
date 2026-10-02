// EP-006 · sub-slice 3 (HU-086, HU-148; diseño §3; ADR-0003 I-2):
//  - `lotes_importacion`: el plan calculado de una importación, con el estado del contrato I-2
//    (`calculado`·`aplicando`·`aplicado`·`abortado`·`revertido`). En este sub-slice solo nace
//    `calculado`; aplicar y revertir son del worker (sub-slice 4), que lee y actualiza.
//  - `lote_filas`: por fila, su grupo, las celdas ya emparejadas, el diff, los errores y los avisos.
//    `rechazadas` guarda el nombre de las columnas rechazadas para recalcular al desmarcar.
//    Solo claves del formato (la lista se fija aquí, copia de CLAVES_CAMPO a esta fecha): una columna
//    B.4 no tiene dónde guardarse. El texto original de la fila (HU-142) lo decide el sub-slice 4.
//  - `plantillas_emparejamiento`: nombre único normalizado y `columnas` (columna → campo o null).
// Sin DELETE para nadie (CON-11), `ps_portal` sin acceso (V3-2) y sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

const CLAVES_FORMATO = [
  "codigo",
  "estado",
  "nombre",
  "primerApellido",
  "rol",
  "familia",
  "seniority",
  "aniosExperiencia",
  "tecnologias",
  "sectores",
  "modalidad",
  "ciudad",
  "disponibilidad",
  "modalidadPrueba",
  "capacidad",
  "anclaje",
  "resumen",
  "formacion",
  "vinculo",
  "idiomas",
  "selloPersonal",
  "experiencias",
  "motivoPausa",
];

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE FUNCTION inventario.solo_claves_de_formato(d jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $f$
  SELECT jsonb_typeof(d) = 'object'
     AND NOT EXISTS (
       SELECT 1 FROM jsonb_object_keys(d) k
        WHERE k <> ALL (ARRAY[${CLAVES_FORMATO.map((c) => `'${c}'`).join(", ")}]))
$f$;

CREATE TABLE inventario.lotes_importacion (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estado          text NOT NULL DEFAULT 'calculado'
                  CHECK (estado IN ('calculado', 'aplicando', 'aplicado', 'abortado', 'revertido')),
  modo            text NOT NULL CHECK (modo IN ('crear_y_actualizar', 'solo_actualizar', 'solo_crear')),
  formato         text NOT NULL CHECK (formato IN ('csv', 'tsv', 'json')),
  archivo_hash    text NOT NULL CHECK (archivo_hash ~ '^[0-9a-f]{64}$'),
  total_filas     integer NOT NULL CHECK (total_filas BETWEEN 1 AND 200),
  conteos         jsonb NOT NULL CHECK (jsonb_typeof(conteos) = 'object'),
  emparejamiento  jsonb NOT NULL CHECK (jsonb_typeof(emparejamiento) = 'array'),
  bloqueado       boolean NOT NULL,
  creado_por      uuid NOT NULL REFERENCES identidad_panel.usuarios_panel(id),
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en  timestamptz NOT NULL DEFAULT now(),
  motivo_aborto   text,
  CHECK ((estado = 'abortado') = (motivo_aborto IS NOT NULL))
);
CREATE INDEX lotes_importacion_creado_en ON inventario.lotes_importacion (creado_en DESC);

CREATE TABLE inventario.lote_filas (
  lote_id   uuid NOT NULL REFERENCES inventario.lotes_importacion(id),
  numero    integer NOT NULL CHECK (numero >= 1),
  codigo    text CHECK (codigo IS NULL OR codigo ~ '^PS-[0-9]{4}$'),
  grupo     text NOT NULL
            CHECK (grupo IN ('nuevo', 'actualizado', 'archivado', 'sin_cambios', 'omitido', 'con_error')),
  incluida  boolean NOT NULL DEFAULT true,
  datos     jsonb NOT NULL CHECK (inventario.solo_claves_de_formato(datos)),
  cambios   jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(cambios) = 'array'),
  errores   jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(errores) = 'array'),
  avisos    jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(avisos) = 'array'),
  -- Columnas rechazadas (consentimiento, validación) que traían algo: solo su nombre y el motivo.
  rechazadas jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(rechazadas) = 'array'),
  motivo_omision text,
  PRIMARY KEY (lote_id, numero)
);

CREATE TABLE inventario.plantillas_emparejamiento (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL CHECK (length(btrim(nombre)) BETWEEN 1 AND 80),
  nombre_normal   text GENERATED ALWAYS AS (inventario.normalizar_nombre(nombre)) STORED,
  columnas        jsonb NOT NULL CHECK (jsonb_typeof(columnas) = 'array'),
  creada_por      uuid NOT NULL REFERENCES identidad_panel.usuarios_panel(id),
  creada_en       timestamptz NOT NULL DEFAULT now(),
  actualizada_por uuid NOT NULL REFERENCES identidad_panel.usuarios_panel(id),
  actualizada_en  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX plantillas_emparejamiento_nombre_normal
  ON inventario.plantillas_emparejamiento (nombre_normal);

-- ─── permisos (sin DELETE para nadie: CON-11) ────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON inventario.lotes_importacion, inventario.lote_filas,
  inventario.plantillas_emparejamiento TO ps_panel;
GRANT SELECT, UPDATE ON inventario.lotes_importacion, inventario.lote_filas TO ps_worker;
GRANT EXECUTE ON FUNCTION inventario.solo_claves_de_formato(jsonb) TO ps_panel, ps_worker;
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
DROP TABLE IF EXISTS inventario.plantillas_emparejamiento;
DROP TABLE IF EXISTS inventario.lote_filas;
DROP TABLE IF EXISTS inventario.lotes_importacion;
DROP FUNCTION IF EXISTS inventario.solo_claves_de_formato(jsonb);
RESET ROLE;
`,
    )
    .execute(db);
}
