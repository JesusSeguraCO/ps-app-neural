// EP-003 · sub-slice 1 (HU-176, HU-177; diseño §1–§2; D60, D61, D62):
//  - `perfiles` gana el alcance de la verificación SARO (FK al catálogo cerrado de la 0027), su fecha y
//    la fecha de la evaluación DISC. CHECK de fecha no posterior a hoy en America/Bogota como defensa en
//    profundidad: la regla y su mensaje son del dominio (`validarFechaVerificacion`).
//  - Guarda de publicar en la BD (defensa en profundidad de `evaluarPublicacion`, como la 0017): al
//    ENTRAR en publicado exige además los tres datos, así que ninguna otra vía —importación, reversión,
//    SQL con `ps_panel`— publica sin ellos. Un publicado que ya lo estaba no se toca (D62: sigue visible
//    y el panel lo marca incompleto, HU-178). Un alcance desactivado asignado cuenta como registrado
//    (HU-177 edge): se pregunta si lo tiene, no si está activo.
//  - Fusión de alcances con la misma función que los demás catálogos (HU-143 reutilizada).
//  - `operacion.ficha_publicable` gana el texto de cara al cliente del alcance (también si está
//    desactivado), la fecha SARO y la DISC; `operacion.catalogo_publicable` gana el Sello Personal y
//    conserva el orden de carga de las tecnologías. Columnas al final (CREATE OR REPLACE VIEW).
//  - La foto previa de una importación admite los tres datos (la importación los escribe, HU-191).
// Solo DDL (V3-7).
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
  "pausado_en",
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

// Guarda de la 0017 con (o sin) las tres validaciones de entrada nuevas.
const guarda = (
  conSaroDisc: boolean,
) => `CREATE OR REPLACE FUNCTION inventario._publicar_exige_consentimiento() RETURNS trigger
LANGUAGE plpgsql SET search_path = inventario, pg_temp AS $f$
BEGIN
  IF NEW.estado = 'publicado' AND (TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM 'publicado') THEN
    IF NOT EXISTS (SELECT 1 FROM inventario.consentimientos c
                    WHERE c.perfil_id = NEW.id AND c.vigente AND c.nominal) THEN
      RAISE EXCEPTION 'el perfil % no tiene consentimiento vigente: no se puede publicar', NEW.codigo;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM inventario.catalogo_modalidades_prueba m
                    WHERE m.id = NEW.modalidad_prueba_id AND m.activo AND m.familia_id = NEW.familia_id) THEN
      RAISE EXCEPTION 'el perfil % no tiene modalidad de prueba activa de su familia: no se puede publicar', NEW.codigo;
    END IF;${
      conSaroDisc
        ? `
    IF NEW.saro_alcance_id IS NULL THEN
      RAISE EXCEPTION 'el perfil % no tiene el alcance de la verificación SARO: no se puede publicar', NEW.codigo;
    END IF;
    IF NEW.saro_fecha IS NULL THEN
      RAISE EXCEPTION 'el perfil % no tiene la fecha de la verificación SARO: no se puede publicar', NEW.codigo;
    END IF;
    IF NEW.disc_fecha IS NULL THEN
      RAISE EXCEPTION 'el perfil % no tiene la fecha de la evaluación DISC: no se puede publicar', NEW.codigo;
    END IF;`
        : ""
    }
  END IF;
  RETURN NEW;
END
$f$;`;

// Fusión de la 0019 con (o sin) el catálogo de alcances SARO.
const fusion = (
  conAlcance: boolean,
) => `CREATE OR REPLACE FUNCTION inventario.fusionar_valor(p_tipo text, p_origen uuid, p_destino uuid)
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
    WHEN 'familia' THEN 'catalogo_familias' WHEN 'motivo_pausa' THEN 'catalogo_motivos_pausa'${
      conAlcance ? ` WHEN 'alcance_saro' THEN 'catalogo_alcances_saro'` : ""
    } END;
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
                  WHERE p.motivo_pausa_id = p_origen RETURNING p.id;${
                    conAlcance
                      ? `
  ELSIF p_tipo = 'alcance_saro' THEN
    RETURN QUERY UPDATE inventario.perfiles p SET saro_alcance_id = p_destino
                  WHERE p.saro_alcance_id = p_origen RETURNING p.id;`
                      : ""
                  }
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
$f$;`;

// Vistas de la 0018 (ficha) y la 0005 (catálogo), con (o sin) las columnas nuevas al final.
const fichaPublicable = (
  nuevas: boolean,
) => `CREATE OR REPLACE VIEW operacion.ficha_publicable WITH (security_barrier = true) AS
SELECT p.codigo,
       p.resumen,
       p.sello_personal,
       p.formacion,
       p.idiomas,
       mp.texto_cliente AS enunciado_prueba,
       c.incluye_clientes,
       mp.nombre AS reporte_modalidad,
       v.resultado AS reporte_resultado,
       v.evaluador AS reporte_evaluador,
       v.fecha AS reporte_fecha,
       v.criterios AS reporte_criterios${
         nuevas
           ? `,
       sa.texto_cliente AS saro_texto,
       p.saro_fecha,
       p.disc_fecha`
           : ""
       }
  FROM inventario.perfiles p
  JOIN inventario.consentimientos c ON c.perfil_id = p.id AND c.vigente
  LEFT JOIN inventario.catalogo_modalidades_prueba mp ON mp.id = p.modalidad_prueba_id${
    nuevas ? `\n  LEFT JOIN inventario.catalogo_alcances_saro sa ON sa.id = p.saro_alcance_id` : ""
  }
  LEFT JOIN LATERAL (
    SELECT x.resultado, x.evaluador, x.fecha, x.criterios
      FROM inventario.validaciones x
     WHERE x.perfil_id = p.id AND x.estado = 'confirmada' AND x.modalidad_prueba_id = p.modalidad_prueba_id
     ORDER BY x.confirmada_en DESC
     LIMIT 1
  ) v ON true
 WHERE p.estado = 'publicado';`;

const catalogoPublicable = (
  nuevas: boolean,
) => `CREATE OR REPLACE VIEW operacion.catalogo_publicable WITH (security_barrier = true) AS
SELECT p.codigo,
       p.nombre,
       p.primer_apellido,
       f.nombre AS familia,
       COALESCE((SELECT array_agg(r.nombre ORDER BY pr.orden) FROM inventario.perfil_roles pr
                  JOIN inventario.catalogo_roles r ON r.id = pr.valor_id WHERE pr.perfil_id = p.id), '{}') AS roles,
       s.nombre AS seniority,
       p.anios_experiencia,
       COALESCE((SELECT array_agg(t.nombre ORDER BY pt.orden) FROM inventario.perfil_tecnologias pt
                  JOIN inventario.catalogo_tecnologias t ON t.id = pt.valor_id WHERE pt.perfil_id = p.id), '{}') AS tecnologias,
       COALESCE((SELECT array_agg(x.nombre ORDER BY ps.orden) FROM inventario.perfil_sectores ps
                  JOIN inventario.catalogo_sectores x ON x.id = ps.valor_id WHERE ps.perfil_id = p.id), '{}') AS sectores,
       m.texto_cliente AS modalidad,
       pa.nombre AS pais,
       ci.nombre AS ciudad,
       p.disponibilidad_fecha,
       p.disponibilidad_actualizada_en${nuevas ? `,\n       p.sello_personal` : ""}
  FROM inventario.perfiles p
  LEFT JOIN inventario.catalogo_familias f ON f.id = p.familia_id
  LEFT JOIN inventario.catalogo_seniorities s ON s.id = p.seniority_id
  LEFT JOIN inventario.catalogo_modalidades m ON m.id = p.modalidad_id
  LEFT JOIN inventario.catalogo_paises pa ON pa.id = p.pais_id
  LEFT JOIN inventario.catalogo_ciudades ci ON ci.id = p.ciudad_id
 WHERE p.estado = 'publicado'
   AND EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = p.id AND c.vigente);`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

ALTER TABLE inventario.perfiles
  ADD COLUMN saro_alcance_id uuid REFERENCES inventario.catalogo_alcances_saro(id),
  ADD COLUMN saro_fecha date,
  ADD COLUMN disc_fecha date,
  ADD CONSTRAINT perfiles_saro_fecha_no_futura
    CHECK (saro_fecha IS NULL OR saro_fecha <= (now() AT TIME ZONE 'America/Bogota')::date),
  ADD CONSTRAINT perfiles_disc_fecha_no_futura
    CHECK (disc_fecha IS NULL OR disc_fecha <= (now() AT TIME ZONE 'America/Bogota')::date);
CREATE INDEX perfiles_saro_alcance ON inventario.perfiles (saro_alcance_id) WHERE saro_alcance_id IS NOT NULL;

${guarda(true)}

${fusion(true)}

${fichaPublicable(true)}

${catalogoPublicable(true)}

${solo([...CLAVES_ESTADO_PREVIO, "saro_alcance_id", "saro_fecha", "disc_fecha"])}

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
DROP VIEW operacion.catalogo_publicable;
${catalogoPublicable(false)}
GRANT SELECT ON operacion.catalogo_publicable TO ps_portal, ps_panel, ps_worker;
DROP VIEW operacion.ficha_publicable;
${fichaPublicable(false)}
GRANT SELECT ON operacion.ficha_publicable TO ps_portal, ps_panel, ps_worker;
${fusion(false)}
${guarda(false)}
ALTER TABLE inventario.perfiles DROP COLUMN saro_alcance_id, DROP COLUMN saro_fecha, DROP COLUMN disc_fecha;
RESET ROLE;
`,
    )
    .execute(db);
}
