// EP-001 · sub-slice 5 (RF-19.2, HU-144): estado real de cada perfil de una selección al abrir el
// enlace, con la etiqueta que ve el cliente (pausado, colocado con su fecha de liberación, archivado,
// no publicado). Datos mínimos (nombre, familia, roles, sectores, modalidad) solo de pausados y
// colocados con consentimiento vigente; archivados y no publicados, solo el código (Ley 1581). Nada
// de la lista negra B.4, sin ciudad ni fecha de disponibilidad (como `catalogo_publicable`).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
CREATE VIEW operacion.estado_seleccion_perfil WITH (security_barrier = true) AS
WITH base AS (
  SELECT p.*,
         EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = p.id AND c.vigente) AS con_consentimiento
    FROM inventario.perfiles p
), clasificado AS (
  SELECT b.*,
         CASE
           WHEN b.estado = 'publicado' AND b.con_consentimiento THEN 'disponible'
           WHEN b.estado IN ('pausado', 'colocado', 'archivado') THEN b.estado
           ELSE 'no_publicado'
         END AS estado_cliente,
         b.estado IN ('pausado', 'colocado') AND b.con_consentimiento AS con_datos
    FROM base b
)
SELECT k.codigo,
       k.estado_cliente AS estado,
       CASE WHEN k.estado = 'colocado' THEN k.fecha_liberacion END AS libera_en,
       CASE WHEN k.con_datos THEN k.nombre END AS nombre,
       CASE WHEN k.con_datos THEN k.primer_apellido END AS primer_apellido,
       CASE WHEN k.con_datos THEN f.nombre END AS familia,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(r.nombre ORDER BY pr.orden) FROM inventario.perfil_roles pr
                  JOIN inventario.catalogo_roles r ON r.id = pr.valor_id WHERE pr.perfil_id = k.id), '{}') END AS roles,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(x.nombre ORDER BY ps.orden) FROM inventario.perfil_sectores ps
                  JOIN inventario.catalogo_sectores x ON x.id = ps.valor_id WHERE ps.perfil_id = k.id), '{}') END AS sectores,
       CASE WHEN k.con_datos THEN m.texto_cliente END AS modalidad
  FROM clasificado k
  LEFT JOIN inventario.catalogo_familias f ON f.id = k.familia_id
  LEFT JOIN inventario.catalogo_modalidades m ON m.id = k.modalidad_id;

GRANT SELECT ON operacion.estado_seleccion_perfil TO ps_portal;
RESET ROLE;
`).execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
DROP VIEW IF EXISTS operacion.estado_seleccion_perfil;
RESET ROLE;
`).execute(db);
}
