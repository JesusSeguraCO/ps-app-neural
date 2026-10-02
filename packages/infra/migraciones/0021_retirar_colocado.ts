// EP-006 · sub-slice 9, contract (HU-137; RF-8.3, RF-8.13.2, RF-19.2; diseño §1): `colocado` deja de ser
// un estado del perfil. Requiere que el trabajo `migrar_colocados` del worker haya pasado los colocados a
// publicado con su colocación (0020); si queda alguno, la migración no se aplica y lo dice.
//  - CHECK de `perfiles.estado` con los cuatro estados de RF-8.3; fuera `fecha_liberacion` y su acople.
//  - `estado_enlace_perfil` y `estado_seleccion_perfil` derivan «colocado» de la colocación vigente de un
//    perfil publicado (vigente y con la liberación después de hoy en Bogotá), con la misma salida que antes:
//    el enlace curado sigue mostrando «colocado hasta tal fecha» (RF-19.2).
//  - `catalogo_publicable` y `ficha_publicable` no cambian: ya filtran `estado = 'publicado'`, así que el
//    colocado aparece en el portal con su banda (HU-137 edge).
// Sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

const COLOCACION_VIGENTE = (perfil: string) => `(SELECT c.liberacion FROM inventario.colocaciones c
   WHERE c.perfil_id = ${perfil} AND c.vigente AND c.liberacion > (now() AT TIME ZONE 'America/Bogota')::date)`;

const VISTAS = `
CREATE OR REPLACE VIEW operacion.estado_enlace_perfil WITH (security_barrier = true) AS
WITH base AS (
  SELECT p.codigo, p.estado,
         EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = p.id AND c.vigente) AS con_consentimiento,
         ${COLOCACION_VIGENTE("p.id")} AS libera
    FROM inventario.perfiles p
)
SELECT b.codigo,
       CASE
         WHEN b.estado = 'publicado' AND b.libera IS NOT NULL THEN 'colocado'
         WHEN b.estado = 'publicado' AND b.con_consentimiento THEN 'disponible'
         WHEN b.estado = 'pausado' THEN 'pausado'
         ELSE 'fuera_del_banco'
       END AS estado,
       CASE WHEN b.estado = 'publicado' THEN b.libera END AS libera_en
  FROM base b;

CREATE OR REPLACE VIEW operacion.estado_seleccion_perfil WITH (security_barrier = true) AS
WITH base AS (
  SELECT p.id, p.codigo, p.estado, p.nombre, p.primer_apellido, p.familia_id, p.modalidad_id,
         EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = p.id AND c.vigente) AS con_consentimiento,
         ${COLOCACION_VIGENTE("p.id")} AS libera
    FROM inventario.perfiles p
), clasificado AS (
  SELECT b.*,
         CASE
           WHEN b.estado = 'publicado' AND b.libera IS NOT NULL THEN 'colocado'
           WHEN b.estado = 'publicado' AND b.con_consentimiento THEN 'disponible'
           WHEN b.estado IN ('pausado', 'archivado') THEN b.estado
           ELSE 'no_publicado'
         END AS estado_cliente
    FROM base b
), con_datos AS (
  SELECT k.*, k.estado_cliente IN ('pausado', 'colocado') AND k.con_consentimiento AS con_datos FROM clasificado k
)
SELECT k.codigo,
       k.estado_cliente AS estado,
       CASE WHEN k.estado_cliente = 'colocado' THEN k.libera END AS libera_en,
       CASE WHEN k.con_datos THEN k.nombre END AS nombre,
       CASE WHEN k.con_datos THEN k.primer_apellido END AS primer_apellido,
       f.nombre AS familia,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(r.nombre ORDER BY pr.orden) FROM inventario.perfil_roles pr
                  JOIN inventario.catalogo_roles r ON r.id = pr.valor_id WHERE pr.perfil_id = k.id), '{}') END AS roles,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(x.nombre ORDER BY ps.orden) FROM inventario.perfil_sectores ps
                  JOIN inventario.catalogo_sectores x ON x.id = ps.valor_id WHERE ps.perfil_id = k.id), '{}') END AS sectores,
       CASE WHEN k.con_datos THEN m.texto_cliente END AS modalidad
  FROM con_datos k
  LEFT JOIN inventario.catalogo_familias f ON f.id = k.familia_id
  LEFT JOIN inventario.catalogo_modalidades m ON m.id = k.modalidad_id;
`;

// Las vistas tal como las dejaron la 0005 y la 0010 (para `down`).
const VISTAS_ANTERIORES = `
CREATE OR REPLACE VIEW operacion.estado_enlace_perfil WITH (security_barrier = true) AS
SELECT p.codigo,
       CASE
         WHEN p.estado = 'publicado'
              AND EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = p.id AND c.vigente)
           THEN 'disponible'
         WHEN p.estado = 'colocado' THEN 'colocado'
         WHEN p.estado = 'pausado' THEN 'pausado'
         ELSE 'fuera_del_banco'
       END AS estado,
       CASE WHEN p.estado = 'colocado' THEN p.fecha_liberacion END AS libera_en
  FROM inventario.perfiles p;

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
       f.nombre AS familia,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(r.nombre ORDER BY pr.orden) FROM inventario.perfil_roles pr
                  JOIN inventario.catalogo_roles r ON r.id = pr.valor_id WHERE pr.perfil_id = k.id), '{}') END AS roles,
       CASE WHEN k.con_datos THEN COALESCE((SELECT array_agg(x.nombre ORDER BY ps.orden) FROM inventario.perfil_sectores ps
                  JOIN inventario.catalogo_sectores x ON x.id = ps.valor_id WHERE ps.perfil_id = k.id), '{}') END AS sectores,
       CASE WHEN k.con_datos THEN m.texto_cliente END AS modalidad
  FROM clasificado k
  LEFT JOIN inventario.catalogo_familias f ON f.id = k.familia_id
  LEFT JOIN inventario.catalogo_modalidades m ON m.id = k.modalidad_id;
`;

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
DO $f$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM inventario.perfiles WHERE estado = 'colocado';
  IF n > 0 THEN
    RAISE EXCEPTION 'quedan % perfiles en estado colocado: aplica primero hasta la 0020 (MIGRAR_HASTA=0020_colocaciones node dist/migrar.js), corre el trabajo migrar_colocados del worker (node dist/worker.js --migrar-colocados) y vuelve a migrar', n;
  END IF;
END
$f$;

SET LOCAL ROLE ps_duenio;
${VISTAS}
ALTER TABLE inventario.perfiles DROP CONSTRAINT perfiles_check, DROP CONSTRAINT perfiles_estado_check;
ALTER TABLE inventario.perfiles
  ADD CONSTRAINT perfiles_estado_check CHECK (estado IN ('borrador', 'publicado', 'pausado', 'archivado'));
ALTER TABLE inventario.perfiles DROP COLUMN fecha_liberacion;
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
ALTER TABLE inventario.perfiles ADD COLUMN fecha_liberacion date;
ALTER TABLE inventario.perfiles DROP CONSTRAINT perfiles_estado_check;
ALTER TABLE inventario.perfiles
  ADD CONSTRAINT perfiles_estado_check
    CHECK (estado IN ('borrador', 'publicado', 'pausado', 'archivado', 'colocado')),
  ADD CONSTRAINT perfiles_check CHECK ((estado = 'colocado') = (fecha_liberacion IS NOT NULL));
${VISTAS_ANTERIORES}
RESET ROLE;
`,
    )
    .execute(db);
}
