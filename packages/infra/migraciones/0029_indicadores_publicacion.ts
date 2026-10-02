// EP-003 · sub-slice 2 (HU-178, D80; diseño §1 y §4): `operacion.indicadores_publicacion`, una fila por
// perfil PUBLICADO con solo booleanos y enteros —lo que la guarda de publicar pregunta—, sin código, sin
// identificador y sin ningún dato personal. La lee el portal (`ps_portal`) para contar los publicados
// incompletos con la misma `evaluarPublicacion` que marca «Incompleto» en el panel (adaptador
// `datosDeIndicadores` del dominio): la regla no se copia en SQL, la vista solo expone los hechos, con
// la misma lectura que `leerPerfil` (modalidad activa y de la familia del rol; el consentimiento vigente
// si lo hay, si no el último). Solo DDL (V3-7); `down` la retira.
import { sql, type Kysely } from "kysely";

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
DROP VIEW operacion.indicadores_publicacion;
RESET ROLE;
`,
    )
    .execute(db);
}
