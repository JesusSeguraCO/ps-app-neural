// EP-001 · sub-slice 6a (HU-091, HU-093, HU-094; CRN-12 de ADR-0003):
//  - «Mi equipo» mínimo por invitado en el servidor: `equipos` (único por invitado y enlace) y
//    `equipo_perfiles`. En EP-001 el portal solo lo crea vacío y lo lee; sumar y quitar es de EP-004.
//  - `operacion.taxonomia_banco`: categorías (familias) y roles activos del catálogo, para el encuadre
//    («¿Qué necesita tu proyecto?»), incluidos los que hoy no tienen perfiles publicados.
//  - `estado_seleccion_perfil` expone la categoría de todo perfil que dejó de estar publicado (no es un
//    dato personal): con ella se arma el contexto de «explorar el banco» cuando ninguno sigue publicado.
import { sql, type Kysely } from "kysely";

const VISTA = (familiaSiempre: boolean) => `
CREATE OR REPLACE VIEW operacion.estado_seleccion_perfil WITH (security_barrier = true) AS
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
       ${familiaSiempre ? "f.nombre" : "CASE WHEN k.con_datos THEN f.nombre END"} AS familia,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(r.nombre ORDER BY pr.orden) FROM inventario.perfil_roles pr
                  JOIN inventario.catalogo_roles r ON r.id = pr.valor_id WHERE pr.perfil_id = k.id), '{}') END AS roles,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(x.nombre ORDER BY ps.orden) FROM inventario.perfil_sectores ps
                  JOIN inventario.catalogo_sectores x ON x.id = ps.valor_id WHERE ps.perfil_id = k.id), '{}') END AS sectores,
       CASE WHEN k.con_datos THEN m.texto_cliente END AS modalidad
  FROM clasificado k
  LEFT JOIN inventario.catalogo_familias f ON f.id = k.familia_id
  LEFT JOIN inventario.catalogo_modalidades m ON m.id = k.modalidad_id;`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;

CREATE TABLE identidad.equipos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enlace_id       uuid NOT NULL REFERENCES identidad.enlaces(id),
  invitado_id     uuid NOT NULL REFERENCES identidad.enlace_invitados(id),
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitado_id, enlace_id)
);
CREATE TABLE identidad.equipo_perfiles (
  equipo_id      uuid NOT NULL REFERENCES identidad.equipos(id),
  codigo_perfil  text NOT NULL CHECK (codigo_perfil ~ '^PS-[0-9]{4}$'),
  orden          integer NOT NULL CHECK (orden >= 1),
  agregado_en    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, codigo_perfil)
);
-- EP-001: el portal crea el equipo vacío y lo lee; escribir perfiles es de EP-004 (sin INSERT aquí).
GRANT SELECT, INSERT ON identidad.equipos TO ps_portal;
GRANT SELECT ON identidad.equipo_perfiles TO ps_portal;

CREATE VIEW operacion.taxonomia_banco WITH (security_barrier = true) AS
SELECT f.nombre AS categoria, r.nombre AS rol
  FROM inventario.catalogo_familias f
  LEFT JOIN inventario.catalogo_roles r ON r.familia_id = f.id AND r.activo AND r.fusionado_en_id IS NULL
 WHERE f.activo AND f.fusionado_en_id IS NULL;
GRANT SELECT ON operacion.taxonomia_banco TO ps_portal;
${VISTA(true)}
RESET ROLE;
`).execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql.raw(`
SET LOCAL ROLE ps_duenio;
${VISTA(false)}
DROP VIEW IF EXISTS operacion.taxonomia_banco;
DROP TABLE IF EXISTS identidad.equipo_perfiles, identidad.equipos;
RESET ROLE;
`).execute(db);
}
