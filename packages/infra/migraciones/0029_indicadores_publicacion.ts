// EP-003 · sub-slice 2 (HU-178, D80; diseño §1 y §4): `operacion.indicadores_publicacion`, una fila por
// perfil PUBLICADO con solo booleanos y enteros —lo que la guarda de publicar pregunta—, sin código, sin
// identificador y sin ningún dato personal. La lee el portal (`ps_portal`) para contar los publicados
// incompletos con la misma `evaluarPublicacion` que marca «Incompleto» en el panel (adaptador
// `datosDeIndicadores` del dominio): la regla no se copia en SQL, la vista solo expone los hechos, con
// la misma lectura que `leerPerfil` (modalidad activa y de la familia del rol; el consentimiento vigente
// si lo hay, si no el último).
// EP-003 · sub-slice 3 (HU-191, D81): la fila de un lote de importación admite las tres claves nuevas del
// formato (`saroAlcance`, `saroFecha`, `discFecha`) en `solo_claves_de_formato`; la 0028 ya las admitía en
// el estado previo. Solo DDL (V3-7); `down` retira la vista y restaura la función de la 0015.
import { sql, type Kysely } from "kysely";
// Claves del formato de la 0015, copiadas a esta fecha (una migración no depende de otra).
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

const soloClavesDeFormato = (
  claves: readonly string[],
) => `CREATE OR REPLACE FUNCTION inventario.solo_claves_de_formato(d jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $f$
  SELECT jsonb_typeof(d) = 'object'
     AND NOT EXISTS (
       SELECT 1 FROM jsonb_object_keys(d) k
        WHERE k <> ALL (ARRAY[${claves.map((c) => `'${c}'`).join(", ")}]))
$f$;`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE VIEW operacion.indicadores_publicacion WITH (security_barrier = true) AS
SELECT
  btrim(coalesce(p.nombre, '')) <> '' AS tiene_nombre,
  btrim(coalesce(p.primer_apellido, '')) <> '' AS tiene_primer_apellido,
  EXISTS (SELECT 1 FROM inventario.perfil_roles r WHERE r.perfil_id = p.id) AS tiene_rol,
  (SELECT count(*)::int FROM inventario.perfil_tecnologias t WHERE t.perfil_id = p.id) AS tecnologias,
  p.seniority_id IS NOT NULL AS tiene_seniority,
  p.anios_experiencia IS NOT NULL AS tiene_anios_experiencia,
  p.ciudad_id IS NOT NULL AS tiene_ciudad,
  p.modalidad_id IS NOT NULL AS tiene_modalidad_trabajo,
  p.disponibilidad_fecha IS NOT NULL AS tiene_disponibilidad,
  (SELECT count(*)::int FROM inventario.perfil_experiencias e
    WHERE e.perfil_id = p.id AND e.vigente) AS experiencias,
  p.modalidad_prueba_id IS NOT NULL AS prueba_elegida,
  coalesce(mp.activo AND mp.familia_id = p.familia_id, false) AS prueba_activa,
  (p.familia_id IS NULL OR EXISTS (
     SELECT 1 FROM inventario.catalogo_modalidades_prueba m
      WHERE m.familia_id = p.familia_id AND m.activo)) AS familia_con_modalidades,
  c.vigente IS NOT NULL AS consentimiento_registrado,
  coalesce(c.vigente, false) AS consentimiento_vigente,
  coalesce(c.nominal, false) AS consentimiento_nominal,
  p.saro_alcance_id IS NOT NULL AS saro_alcance,
  p.saro_fecha IS NOT NULL AS saro_fecha,
  p.disc_fecha IS NOT NULL AS disc_fecha
FROM inventario.perfiles p
LEFT JOIN inventario.catalogo_modalidades_prueba mp ON mp.id = p.modalidad_prueba_id
LEFT JOIN LATERAL (
  SELECT x.vigente, x.nominal FROM inventario.consentimientos x
   WHERE x.perfil_id = p.id ORDER BY x.vigente DESC, x.otorgado_en DESC LIMIT 1) c ON true
WHERE p.estado = 'publicado';

GRANT SELECT ON operacion.indicadores_publicacion TO ps_portal, ps_panel;

${soloClavesDeFormato([...CLAVES_FORMATO, "saroAlcance", "saroFecha", "discFecha"])}

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
${soloClavesDeFormato(CLAVES_FORMATO)}
DROP VIEW operacion.indicadores_publicacion;
RESET ROLE;
`,
    )
    .execute(db);
}
