// EP-006 · sub-slice 6 (HU-130 edge, HU-140; diseño §4 con D11, D29 y D30):
//  - `validaciones`: el reporte de validación técnica de un perfil. Nace como borrador precargado desde
//    la modalidad de prueba (plantilla determinista, `origen` por campo), la persona lo corrige, escribe
//    evaluador, fecha y resultado, y lo confirma o lo descarta. Un solo borrador pendiente por perfil.
//    Sin artefacto (D29: la subida de archivos pasa a una versión futura). Sin DELETE (CON-11).
//  - `operacion.ficha_publicable` gana el reporte vigente: la última validación confirmada de la
//    modalidad de prueba elegida hoy. Confirmarla enriquece la ficha sin tocar el estado del perfil;
//    si la modalidad cambia, la ficha vuelve a Nivel 0. `ps_portal` no lee la tabla, solo la vista.
// Sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE TABLE inventario.validaciones (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id           uuid NOT NULL REFERENCES inventario.perfiles(id),
  modalidad_prueba_id uuid NOT NULL REFERENCES inventario.catalogo_modalidades_prueba(id),
  estado              text NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'confirmada', 'descartada')),
  enunciado_reto      text NOT NULL DEFAULT '' CHECK (length(enunciado_reto) <= 2000),
  entregables         text NOT NULL DEFAULT '' CHECK (length(entregables) <= 1000),
  criterios           text[] NOT NULL DEFAULT '{}' CHECK (cardinality(criterios) <= 12),
  -- Lo que trajo la modalidad al pedir el borrador: contra esto se decide el origen de cada campo.
  plantilla           jsonb NOT NULL,
  origen              jsonb NOT NULL,
  evaluador           text CHECK (evaluador IS NULL OR length(btrim(evaluador)) BETWEEN 1 AND 120),
  fecha               date,
  resultado           text CHECK (resultado IS NULL OR length(btrim(resultado)) BETWEEN 1 AND 200),
  creada_por          uuid NOT NULL REFERENCES identidad_panel.usuarios_panel(id),
  creada_en           timestamptz NOT NULL DEFAULT now(),
  confirmada_por      uuid REFERENCES identidad_panel.usuarios_panel(id),
  confirmada_en       timestamptz,
  descartada_en       timestamptz,
  CHECK (estado <> 'confirmada' OR (
    evaluador IS NOT NULL AND fecha IS NOT NULL AND resultado IS NOT NULL
    AND cardinality(criterios) >= 1 AND confirmada_por IS NOT NULL AND confirmada_en IS NOT NULL)),
  CHECK ((estado = 'descartada') = (descartada_en IS NOT NULL))
);
CREATE UNIQUE INDEX validaciones_un_borrador ON inventario.validaciones (perfil_id) WHERE estado = 'borrador';
CREATE INDEX validaciones_confirmadas ON inventario.validaciones (perfil_id, confirmada_en DESC)
  WHERE estado = 'confirmada';
GRANT SELECT, INSERT, UPDATE ON inventario.validaciones TO ps_panel;
-- El worker lee el perfil completo al importar y revertir (\`leerPerfil\`); nunca escribe validaciones.
GRANT SELECT ON inventario.validaciones TO ps_worker;

-- ─── ficha para el portal con el reporte vigente (HU-130 edge) ───────────────────────────
CREATE OR REPLACE VIEW operacion.ficha_publicable WITH (security_barrier = true) AS
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
       v.criterios AS reporte_criterios
  FROM inventario.perfiles p
  JOIN inventario.consentimientos c ON c.perfil_id = p.id AND c.vigente
  LEFT JOIN inventario.catalogo_modalidades_prueba mp ON mp.id = p.modalidad_prueba_id
  LEFT JOIN LATERAL (
    SELECT x.resultado, x.evaluador, x.fecha, x.criterios
      FROM inventario.validaciones x
     WHERE x.perfil_id = p.id AND x.estado = 'confirmada' AND x.modalidad_prueba_id = p.modalidad_prueba_id
     ORDER BY x.confirmada_en DESC
     LIMIT 1
  ) v ON true
 WHERE p.estado = 'publicado';

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
DROP VIEW operacion.ficha_publicable;
CREATE VIEW operacion.ficha_publicable WITH (security_barrier = true) AS
SELECT p.codigo,
       p.resumen,
       p.sello_personal,
       p.formacion,
       p.idiomas,
       mp.texto_cliente AS enunciado_prueba,
       c.incluye_clientes
  FROM inventario.perfiles p
  JOIN inventario.consentimientos c ON c.perfil_id = p.id AND c.vigente
  LEFT JOIN inventario.catalogo_modalidades_prueba mp ON mp.id = p.modalidad_prueba_id
 WHERE p.estado = 'publicado';
GRANT SELECT ON operacion.ficha_publicable TO ps_portal, ps_panel, ps_worker;
DROP TABLE inventario.validaciones;
RESET ROLE;
`,
    )
    .execute(db);
}
