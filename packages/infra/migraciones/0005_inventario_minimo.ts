// EP-001 · sub-slice 3 (tarea 3.1): modelo mínimo de perfil publicable (ADR-0003 «Modelo»), con el
// nombre y primer apellido que cruzan tras revertirse D-1 (PRD RF-3.1, Anexo B.1). Sin columnas de la
// lista negra B.4: no se guardan. `ps_portal` no tiene USAGE sobre `inventario`: solo lee las vistas
// de `operacion`, de dueño NOLOGIN y `security_barrier` (ADR-0003 fila «ps_portal lee solo vistas»).
// El resto del inventario (evidencia, importación, bandejas) lo construye EP-006 sobre estas tablas.
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

-- ─── catálogos (sin borrado físico: activo + fusionado_en_id) ────────────────────────────
CREATE TABLE inventario.catalogo_familias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL UNIQUE CHECK (length(btrim(nombre)) > 0),
  activo          boolean NOT NULL DEFAULT true,
  fusionado_en_id uuid REFERENCES inventario.catalogo_familias(id)
);
CREATE TABLE inventario.catalogo_roles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL UNIQUE CHECK (length(btrim(nombre)) > 0),
  familia_id      uuid NOT NULL REFERENCES inventario.catalogo_familias(id),
  activo          boolean NOT NULL DEFAULT true,
  fusionado_en_id uuid REFERENCES inventario.catalogo_roles(id)
);
CREATE TABLE inventario.catalogo_seniorities (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  orden  integer NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true
);
CREATE TABLE inventario.catalogo_modalidades (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        text NOT NULL UNIQUE CHECK (nombre IN ('remoto', 'hibrido', 'presencial')),
  texto_cliente text NOT NULL,
  activo        boolean NOT NULL DEFAULT true
);
CREATE TABLE inventario.catalogo_tecnologias (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL UNIQUE CHECK (length(btrim(nombre)) > 0),
  activo          boolean NOT NULL DEFAULT true,
  fusionado_en_id uuid REFERENCES inventario.catalogo_tecnologias(id)
);
CREATE TABLE inventario.catalogo_sectores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL UNIQUE CHECK (length(btrim(nombre)) > 0),
  activo          boolean NOT NULL DEFAULT true,
  fusionado_en_id uuid REFERENCES inventario.catalogo_sectores(id)
);
CREATE TABLE inventario.catalogo_paises (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true
);
CREATE TABLE inventario.catalogo_ciudades (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre  text NOT NULL,
  pais_id uuid NOT NULL REFERENCES inventario.catalogo_paises(id),
  activo  boolean NOT NULL DEFAULT true,
  UNIQUE (pais_id, nombre)
);
CREATE TABLE inventario.catalogo_motivos_pausa (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true
);

-- ─── perfiles e hijas ────────────────────────────────────────────────────────────────────
CREATE TABLE inventario.perfiles (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo                        text NOT NULL UNIQUE CHECK (codigo ~ '^PS-[0-9]{4}$'),
  nombre                        text NOT NULL CHECK (length(btrim(nombre)) > 0),
  primer_apellido               text NOT NULL CHECK (length(btrim(primer_apellido)) > 0),
  estado                        text NOT NULL DEFAULT 'borrador'
                                CHECK (estado IN ('borrador', 'publicado', 'pausado', 'archivado', 'colocado')),
  fecha_liberacion              date,
  familia_id                    uuid REFERENCES inventario.catalogo_familias(id),
  seniority_id                  uuid REFERENCES inventario.catalogo_seniorities(id),
  anios_experiencia             integer CHECK (anios_experiencia BETWEEN 0 AND 60),
  modalidad_id                  uuid REFERENCES inventario.catalogo_modalidades(id),
  pais_id                       uuid REFERENCES inventario.catalogo_paises(id),
  ciudad_id                     uuid REFERENCES inventario.catalogo_ciudades(id),
  disponibilidad_fecha          date,
  disponibilidad_actualizada_en timestamptz,
  motivo_pausa_id               uuid REFERENCES inventario.catalogo_motivos_pausa(id),
  version                       integer NOT NULL DEFAULT 1,
  creado_en                     timestamptz NOT NULL DEFAULT now(),
  actualizado_en                timestamptz NOT NULL DEFAULT now(),
  -- Colocado lleva siempre su fecha de liberación, y solo colocado (RF-19.2).
  CHECK ((estado = 'colocado') = (fecha_liberacion IS NOT NULL))
);

CREATE TABLE inventario.perfil_roles (
  perfil_id uuid NOT NULL REFERENCES inventario.perfiles(id),
  valor_id  uuid NOT NULL REFERENCES inventario.catalogo_roles(id),
  orden     integer NOT NULL CHECK (orden >= 1),
  PRIMARY KEY (perfil_id, valor_id)
);
CREATE TABLE inventario.perfil_tecnologias (
  perfil_id uuid NOT NULL REFERENCES inventario.perfiles(id),
  valor_id  uuid NOT NULL REFERENCES inventario.catalogo_tecnologias(id),
  orden     integer NOT NULL CHECK (orden >= 1),
  PRIMARY KEY (perfil_id, valor_id)
);
CREATE TABLE inventario.perfil_sectores (
  perfil_id uuid NOT NULL REFERENCES inventario.perfiles(id),
  valor_id  uuid NOT NULL REFERENCES inventario.catalogo_sectores(id),
  orden     integer NOT NULL CHECK (orden >= 1),
  PRIMARY KEY (perfil_id, valor_id)
);

-- Consentimiento nominal (RF-8.4): alcance explícito; revocar lo deja no vigente con su fecha.
CREATE TABLE inventario.consentimientos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id    uuid NOT NULL REFERENCES inventario.perfiles(id),
  alcance      text NOT NULL CHECK (length(btrim(alcance)) > 0),
  evidencia_id uuid,
  vigente      boolean NOT NULL DEFAULT true,
  otorgado_en  timestamptz NOT NULL DEFAULT now(),
  revocado_en  timestamptz,
  CHECK (vigente = (revocado_en IS NULL))
);
CREATE UNIQUE INDEX consentimientos_un_vigente ON inventario.consentimientos (perfil_id) WHERE vigente;

-- ─── reglas en la BD ─────────────────────────────────────────────────────────────────────
-- CRN-15: toda escritura del perfil sube su version; las hijas y el consentimiento la suben también.
CREATE FUNCTION inventario._perfil_version() RETURNS trigger
LANGUAGE plpgsql SET search_path = inventario, pg_temp AS $f$
BEGIN
  NEW.version := OLD.version + 1;
  NEW.actualizado_en := now();
  RETURN NEW;
END
$f$;
CREATE TRIGGER perfil_version BEFORE UPDATE ON inventario.perfiles
  FOR EACH ROW EXECUTE FUNCTION inventario._perfil_version();

CREATE FUNCTION inventario._hija_sube_version() RETURNS trigger
LANGUAGE plpgsql SET search_path = inventario, pg_temp AS $f$
BEGIN
  UPDATE inventario.perfiles SET version = version WHERE id = COALESCE(NEW.perfil_id, OLD.perfil_id);
  RETURN NULL;
END
$f$;
CREATE TRIGGER roles_version AFTER INSERT OR UPDATE OR DELETE ON inventario.perfil_roles
  FOR EACH ROW EXECUTE FUNCTION inventario._hija_sube_version();
CREATE TRIGGER tecnologias_version AFTER INSERT OR UPDATE OR DELETE ON inventario.perfil_tecnologias
  FOR EACH ROW EXECUTE FUNCTION inventario._hija_sube_version();
CREATE TRIGGER sectores_version AFTER INSERT OR UPDATE OR DELETE ON inventario.perfil_sectores
  FOR EACH ROW EXECUTE FUNCTION inventario._hija_sube_version();
CREATE TRIGGER consentimientos_version AFTER INSERT OR UPDATE ON inventario.consentimientos
  FOR EACH ROW EXECUTE FUNCTION inventario._hija_sube_version();

-- RF-8.4: sin consentimiento vigente no se publica (la vista lo exige además en lectura).
CREATE FUNCTION inventario._publicar_exige_consentimiento() RETURNS trigger
LANGUAGE plpgsql SET search_path = inventario, pg_temp AS $f$
BEGIN
  IF NEW.estado = 'publicado' AND (TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM 'publicado')
     AND NOT EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = NEW.id AND c.vigente) THEN
    RAISE EXCEPTION 'el perfil % no tiene consentimiento vigente: no se puede publicar', NEW.codigo;
  END IF;
  RETURN NEW;
END
$f$;
CREATE TRIGGER publicar_exige_consentimiento BEFORE INSERT OR UPDATE OF estado ON inventario.perfiles
  FOR EACH ROW EXECUTE FUNCTION inventario._publicar_exige_consentimiento();

-- ─── vistas para el portal (dueño ps_duenio, NOLOGIN) ────────────────────────────────────
-- Lista blanca de columnas. La fecha y la ciudad no llegan al cliente: las recorta
-- ProyeccionCatalogo (zod) y el contrato de ciudades (ADR-0003).
CREATE VIEW operacion.catalogo_publicable WITH (security_barrier = true) AS
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
       p.disponibilidad_actualizada_en
  FROM inventario.perfiles p
  LEFT JOIN inventario.catalogo_familias f ON f.id = p.familia_id
  LEFT JOIN inventario.catalogo_seniorities s ON s.id = p.seniority_id
  LEFT JOIN inventario.catalogo_modalidades m ON m.id = p.modalidad_id
  LEFT JOIN inventario.catalogo_paises pa ON pa.id = p.pais_id
  LEFT JOIN inventario.catalogo_ciudades ci ON ci.id = p.ciudad_id
 WHERE p.estado = 'publicado'
   AND EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = p.id AND c.vigente);

-- Estado público por código (RF-19.2): solo código, estado y fecha de liberación del colocado.
CREATE VIEW operacion.estado_enlace_perfil WITH (security_barrier = true) AS
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

-- ─── permisos ────────────────────────────────────────────────────────────────────────────
-- Sin DELETE para nadie (CON-11): archivado es el final; los catálogos se desactivan o fusionan.
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA inventario TO ps_panel, ps_worker;
REVOKE ALL ON ALL TABLES IN SCHEMA inventario FROM ps_portal;
GRANT SELECT ON operacion.catalogo_publicable, operacion.estado_enlace_perfil TO ps_portal, ps_panel, ps_worker;

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
DROP VIEW IF EXISTS operacion.estado_enlace_perfil;
DROP VIEW IF EXISTS operacion.catalogo_publicable;
DROP TABLE IF EXISTS inventario.consentimientos, inventario.perfil_sectores, inventario.perfil_tecnologias,
  inventario.perfil_roles, inventario.perfiles, inventario.catalogo_motivos_pausa, inventario.catalogo_ciudades,
  inventario.catalogo_paises, inventario.catalogo_sectores, inventario.catalogo_tecnologias,
  inventario.catalogo_modalidades, inventario.catalogo_seniorities, inventario.catalogo_roles,
  inventario.catalogo_familias;
DROP FUNCTION IF EXISTS inventario._perfil_version(), inventario._hija_sube_version(),
  inventario._publicar_exige_consentimiento();
RESET ROLE;
`,
    )
    .execute(db);
}
