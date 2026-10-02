// EP-006 · sub-slice 7 (HU-133, HU-136, HU-132; RF-8.14.2, RF-8.16; diseño §2):
//  - `perfiles.pausado_en`: desde cuándo está pausado. Lo mantiene un disparador: al entrar en pausa
//    pone la hora si nadie la trae (la reversión de una importación sí la trae, para dejarlo exactamente
//    como estaba) y al salir la limpia. Un pausado nuevo exige motivo y fecha de pausa (CHECK `NOT
//    VALID`: los pausados que ya existían sin ellos se ven en la bandeja como «dato incompleto»; sin DML).
//  - Los motivos de pausa son catálogo administrable (RF-8.16): ganan la ayuda que se muestra al elegir
//    y la fusión de valores como los demás catálogos.
//  - `perfiles.archivado_en`: archivar desde la bandeja (HU-133 edge; el resto de HU-135 en el sub-slice 8).
//  - La foto previa de la importación admite `pausado_en`.
// Sin DML de nivel superior (V3-7).
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

const solo = (
  claves: string[],
) => `CREATE OR REPLACE FUNCTION inventario.solo_claves_de_estado_previo(d jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $f$
  SELECT d IS NULL OR (
    jsonb_typeof(d) = 'object'
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_object_keys(d) k
       WHERE k <> ALL (ARRAY[${claves.map((c) => `'${c}'`).join(", ")}])))
$f$;`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

-- ─── pausa (HU-133) ──────────────────────────────────────────────────────────────────────
ALTER TABLE inventario.perfiles ADD COLUMN pausado_en timestamptz;
-- Archivar es «eliminar» sin borrar (HU-135): cuándo salió del banco. La bandeja ya lo ofrece (HU-133).
ALTER TABLE inventario.perfiles ADD COLUMN archivado_en timestamptz;
ALTER TABLE inventario.perfiles
  ADD CONSTRAINT perfiles_pausa_con_motivo CHECK (
    estado <> 'pausado' OR (motivo_pausa_id IS NOT NULL AND pausado_en IS NOT NULL)) NOT VALID;

CREATE FUNCTION inventario._pausado_en() RETURNS trigger
LANGUAGE plpgsql SET search_path = inventario, pg_temp AS $f$
BEGIN
  IF NEW.estado = 'pausado' THEN
    -- Quien la trae (la reversión) manda; si no, la que ya tenía; si no tenía (pausado antiguo), ahora.
    NEW.pausado_en := COALESCE(
      NEW.pausado_en,
      CASE WHEN TG_OP = 'UPDATE' AND OLD.estado = 'pausado' THEN OLD.pausado_en END,
      now());
  ELSE
    NEW.pausado_en := NULL;
    NEW.motivo_pausa_id := NULL;
  END IF;
  RETURN NEW;
END
$f$;
CREATE TRIGGER perfiles_pausado_en BEFORE INSERT OR UPDATE OF estado, pausado_en, motivo_pausa_id
  ON inventario.perfiles FOR EACH ROW EXECUTE FUNCTION inventario._pausado_en();

-- ─── motivos de pausa como catálogo administrable (RF-8.16) ──────────────────────────────
ALTER TABLE inventario.catalogo_motivos_pausa
  ADD COLUMN descripcion text CHECK (descripcion IS NULL OR length(btrim(descripcion)) BETWEEN 1 AND 200),
  ADD COLUMN fusionado_en_id uuid REFERENCES inventario.catalogo_motivos_pausa(id),
  ADD CONSTRAINT catalogo_motivos_pausa_fusion CHECK (fusionado_en_id IS NULL OR NOT activo);

CREATE OR REPLACE FUNCTION inventario.fusionar_valor(p_tipo text, p_origen uuid, p_destino uuid)
RETURNS TABLE (perfil_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = inventario, pg_temp AS $f$
DECLARE
  tabla text;
  hija text;
  vivos integer;
  choque text;
BEGIN
  tabla := CASE p_tipo
    WHEN 'rol' THEN 'catalogo_roles' WHEN 'tecnologia' THEN 'catalogo_tecnologias'
    WHEN 'sector' THEN 'catalogo_sectores' WHEN 'modalidad_prueba' THEN 'catalogo_modalidades_prueba'
    WHEN 'familia' THEN 'catalogo_familias' WHEN 'motivo_pausa' THEN 'catalogo_motivos_pausa' END;
  IF tabla IS NULL THEN RAISE EXCEPTION 'fusion: tipo no admitido %', p_tipo; END IF;
  IF p_origen = p_destino THEN RAISE EXCEPTION 'fusion: mismo_valor'; END IF;
  EXECUTE format('SELECT count(*) FROM (SELECT 1 FROM inventario.%I WHERE id = ANY($1) AND activo AND fusionado_en_id IS NULL FOR UPDATE) x', tabla)
    INTO vivos USING ARRAY[p_origen, p_destino];
  IF vivos <> 2 THEN RAISE EXCEPTION 'fusion: distinto_catalogo'; END IF;

  IF p_tipo IN ('rol', 'tecnologia', 'sector') THEN
    hija := CASE p_tipo WHEN 'rol' THEN 'perfil_roles' WHEN 'tecnologia' THEN 'perfil_tecnologias' ELSE 'perfil_sectores' END;
    RETURN QUERY EXECUTE format('SELECT perfil_id FROM inventario.%I WHERE valor_id = $1', hija) USING p_origen;
    EXECUTE format('INSERT INTO inventario.%I (perfil_id, valor_id, orden)
                    SELECT perfil_id, $2, orden FROM inventario.%I h WHERE valor_id = $1
                       AND NOT EXISTS (SELECT 1 FROM inventario.%I d WHERE d.perfil_id = h.perfil_id AND d.valor_id = $2)',
                   hija, hija, hija) USING p_origen, p_destino;
    EXECUTE format('DELETE FROM inventario.%I WHERE valor_id = $1', hija) USING p_origen;
    UPDATE inventario.lexico_equivalencias SET vigente = false, retirada_en = now()
     WHERE vigente AND CASE p_tipo WHEN 'rol' THEN rol_id WHEN 'tecnologia' THEN tecnologia_id ELSE sector_id END = p_origen
       AND EXISTS (SELECT 1 FROM inventario.lexico_equivalencias d WHERE d.vigente AND d.lexico_id = lexico_equivalencias.lexico_id
                     AND CASE p_tipo WHEN 'rol' THEN d.rol_id WHEN 'tecnologia' THEN d.tecnologia_id ELSE d.sector_id END = p_destino);
    IF p_tipo = 'rol' THEN
      UPDATE inventario.lexico_equivalencias SET rol_id = p_destino WHERE vigente AND rol_id = p_origen;
    ELSIF p_tipo = 'tecnologia' THEN
      UPDATE inventario.lexico_equivalencias SET tecnologia_id = p_destino WHERE vigente AND tecnologia_id = p_origen;
    ELSE
      UPDATE inventario.lexico_equivalencias SET sector_id = p_destino WHERE vigente AND sector_id = p_origen;
    END IF;
  ELSIF p_tipo = 'modalidad_prueba' THEN
    IF (SELECT familia_id FROM inventario.catalogo_modalidades_prueba WHERE id = p_origen)
       IS DISTINCT FROM (SELECT familia_id FROM inventario.catalogo_modalidades_prueba WHERE id = p_destino) THEN
      RAISE EXCEPTION 'fusion: distinta_familia';
    END IF;
    RETURN QUERY UPDATE inventario.perfiles p SET modalidad_prueba_id = p_destino
                  WHERE p.modalidad_prueba_id = p_origen RETURNING p.id;
  ELSIF p_tipo = 'motivo_pausa' THEN
    RETURN QUERY UPDATE inventario.perfiles p SET motivo_pausa_id = p_destino
                  WHERE p.motivo_pausa_id = p_origen RETURNING p.id;
  ELSE
    SELECT o.nombre INTO choque FROM inventario.catalogo_modalidades_prueba o
      JOIN inventario.catalogo_modalidades_prueba d ON d.familia_id = p_destino AND d.nombre_normal = o.nombre_normal
     WHERE o.familia_id = p_origen LIMIT 1;
    IF choque IS NOT NULL THEN RAISE EXCEPTION 'fusion: modalidad_repetida %', choque; END IF;
    UPDATE inventario.catalogo_roles SET familia_id = p_destino WHERE familia_id = p_origen;
    UPDATE inventario.catalogo_modalidades_prueba SET familia_id = p_destino WHERE familia_id = p_origen;
    RETURN QUERY UPDATE inventario.perfiles p SET familia_id = p_destino
                  WHERE p.familia_id = p_origen RETURNING p.id;
  END IF;

  EXECUTE format('UPDATE inventario.%I SET activo = false, fusionado_en_id = $2 WHERE id = $1', tabla)
    USING p_origen, p_destino;
END
$f$;

-- ─── foto previa de la importación (HU-087) ──────────────────────────────────────────────
${solo([...CLAVES_ESTADO_PREVIO, "pausado_en"])}

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
${solo(CLAVES_ESTADO_PREVIO)}
ALTER TABLE inventario.catalogo_motivos_pausa DROP CONSTRAINT catalogo_motivos_pausa_fusion,
  DROP COLUMN fusionado_en_id, DROP COLUMN descripcion;
DROP TRIGGER perfiles_pausado_en ON inventario.perfiles;
DROP FUNCTION inventario._pausado_en();
ALTER TABLE inventario.perfiles DROP CONSTRAINT perfiles_pausa_con_motivo, DROP COLUMN pausado_en, DROP COLUMN archivado_en;
RESET ROLE;
`,
    )
    .execute(db);
}
