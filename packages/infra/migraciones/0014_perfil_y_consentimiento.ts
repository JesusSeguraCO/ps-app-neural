// EP-006 · sub-slice 2 (HU-125, HU-127; diseño §1, §2):
//  - Columnas del perfil del Anexo B (B.1, B.2, B.7): capacidad, anclaje, resumen, vínculo, formación,
//    idiomas, Sello Personal (tres competencias) y el origen de la creación. Ninguna columna de la
//    lista negra B.4 (foto, contacto, hoja de vida, motivación, promedio, DISC detallado).
//  - Un borrador puede guardarse sin nombre ni apellido (HU-125 «campos obligatorios incompletos»):
//    la exigencia pasa a «todo lo que no es borrador».
//  - `perfil_experiencias` con el cliente nombrado separado del texto: el consentimiento parcial lo
//    oculta en la proyección del portal sin reescribir nada (HU-127 edge). Quitar una experiencia la
//    deja no vigente (sin DELETE, CON-11).
//  - `consentimientos` declara su alcance (nominal, clientes nombrados), quién lo registró y quién lo
//    revocó. El anonimizado no se registra: la BD rechaza un consentimiento no nominal.
//  - `operacion.experiencias_publicables`: trayectoria de los perfiles publicados con consentimiento
//    vigente; el cliente solo si el consentimiento lo incluye.
// Sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

-- ─── perfil: Anexo B ─────────────────────────────────────────────────────────────────────
ALTER TABLE inventario.perfiles
  ADD COLUMN capacidad       text CHECK (capacidad IS NULL OR length(btrim(capacidad)) BETWEEN 1 AND 120),
  ADD COLUMN anclaje         text CHECK (anclaje IS NULL OR length(btrim(anclaje)) BETWEEN 1 AND 120),
  ADD COLUMN resumen         text CHECK (resumen IS NULL OR length(btrim(resumen)) BETWEEN 1 AND 1200),
  ADD COLUMN vinculo         text CHECK (vinculo IN ('vinculado', 'banco_no_vinculado', 'fabrica')),
  ADD COLUMN formacion       text CHECK (formacion IS NULL OR length(btrim(formacion)) BETWEEN 1 AND 160),
  ADD COLUMN idiomas         text[] NOT NULL DEFAULT '{}' CHECK (cardinality(idiomas) <= 8),
  ADD COLUMN sello_personal  text[] NOT NULL DEFAULT '{}' CHECK (cardinality(sello_personal) <= 3),
  ADD COLUMN aporte          text CHECK (aporte IS NULL OR length(btrim(aporte)) BETWEEN 1 AND 280),
  ADD COLUMN origen_creacion text NOT NULL DEFAULT 'siembra'
                             CHECK (origen_creacion IN ('panel', 'importacion', 'siembra')),
  ADD COLUMN creado_por      uuid REFERENCES identidad_panel.usuarios_panel(id);

ALTER TABLE inventario.perfiles DROP CONSTRAINT perfiles_nombre_check;
ALTER TABLE inventario.perfiles DROP CONSTRAINT perfiles_primer_apellido_check;
ALTER TABLE inventario.perfiles ALTER COLUMN nombre DROP NOT NULL;
ALTER TABLE inventario.perfiles ALTER COLUMN primer_apellido DROP NOT NULL;
ALTER TABLE inventario.perfiles
  ADD CONSTRAINT perfiles_identidad_fuera_de_borrador CHECK (
    estado = 'borrador'
    OR (length(btrim(coalesce(nombre, ''))) > 0 AND length(btrim(coalesce(primer_apellido, ''))) > 0));

-- ─── trayectoria (Experiencia Clave, B.1) ────────────────────────────────────────────────
CREATE TABLE inventario.perfil_experiencias (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id        uuid NOT NULL REFERENCES inventario.perfiles(id),
  orden            integer NOT NULL CHECK (orden >= 1),
  cargo            text NOT NULL CHECK (length(btrim(cargo)) BETWEEN 1 AND 120),
  cliente_nombrado text CHECK (cliente_nombrado IS NULL OR length(btrim(cliente_nombrado)) BETWEEN 1 AND 120),
  desde            integer CHECK (desde BETWEEN 1970 AND 2100),
  hasta            integer CHECK (hasta BETWEEN 1970 AND 2100),
  descripcion      text NOT NULL CHECK (length(btrim(descripcion)) BETWEEN 1 AND 600),
  vigente          boolean NOT NULL DEFAULT true,
  retirada_en      timestamptz,
  CHECK (hasta IS NULL OR desde IS NULL OR hasta >= desde),
  CHECK (vigente = (retirada_en IS NULL))
);
CREATE INDEX perfil_experiencias_perfil ON inventario.perfil_experiencias (perfil_id) WHERE vigente;
CREATE TRIGGER experiencias_version AFTER INSERT OR UPDATE ON inventario.perfil_experiencias
  FOR EACH ROW EXECUTE FUNCTION inventario._hija_sube_version();

-- ─── consentimiento nominal y explícito (RF-8.4, HU-127) ─────────────────────────────────
ALTER TABLE inventario.consentimientos
  ADD COLUMN nominal          boolean NOT NULL DEFAULT true CHECK (nominal),
  ADD COLUMN incluye_clientes boolean NOT NULL DEFAULT false,
  ADD COLUMN ante_quien       text NOT NULL DEFAULT 'Cuentas cliente de Trycore',
  ADD COLUMN vigencia         text NOT NULL DEFAULT 'continua' CHECK (vigencia = 'continua'),
  ADD COLUMN firmado_en        date,
  ADD COLUMN registrado_por   uuid REFERENCES identidad_panel.usuarios_panel(id),
  ADD COLUMN revocado_por     uuid REFERENCES identidad_panel.usuarios_panel(id),
  ADD CONSTRAINT consentimientos_revocado_por CHECK (revocado_por IS NULL OR NOT vigente);

-- ─── proyección de la trayectoria para el portal ─────────────────────────────────────────
CREATE VIEW operacion.experiencias_publicables WITH (security_barrier = true) AS
SELECT p.codigo,
       e.orden,
       e.cargo,
       CASE WHEN c.incluye_clientes THEN e.cliente_nombrado END AS cliente,
       e.desde,
       e.hasta,
       e.descripcion
  FROM inventario.perfiles p
  JOIN inventario.consentimientos c ON c.perfil_id = p.id AND c.vigente
  JOIN inventario.perfil_experiencias e ON e.perfil_id = p.id AND e.vigente
 WHERE p.estado = 'publicado';

-- ─── reemplazo de las hijas de catálogo (rol, tecnologías, sector) ───────────────────────
-- Cambiar las tecnologías de un perfil quita filas hijas; ningún rol de conexión tiene DELETE (CON-11),
-- así que la reescritura corre como dueño y solo sobre las tres tablas hijas, para un perfil a la vez.
CREATE FUNCTION inventario.reemplazar_hijas(p_tabla text, p_perfil uuid, p_valores uuid[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = inventario, pg_temp AS $f$
BEGIN
  IF p_tabla NOT IN ('perfil_roles', 'perfil_tecnologias', 'perfil_sectores') THEN
    RAISE EXCEPTION 'reemplazar_hijas: tabla no admitida %', p_tabla;
  END IF;
  EXECUTE format('DELETE FROM inventario.%I WHERE perfil_id = $1', p_tabla) USING p_perfil;
  EXECUTE format('INSERT INTO inventario.%I (perfil_id, valor_id, orden)
                  SELECT $1, v, o::int FROM unnest($2::uuid[]) WITH ORDINALITY AS u(v, o)', p_tabla)
    USING p_perfil, p_valores;
END
$f$;
REVOKE EXECUTE ON FUNCTION inventario.reemplazar_hijas(text, uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION inventario.reemplazar_hijas(text, uuid, uuid[]) TO ps_panel, ps_worker;

-- ─── permisos (sin DELETE para nadie: CON-11) ────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON inventario.perfil_experiencias TO ps_panel, ps_worker;
REVOKE ALL ON ALL TABLES IN SCHEMA inventario FROM ps_portal;
GRANT SELECT ON operacion.experiencias_publicables TO ps_portal, ps_panel, ps_worker;

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
DROP VIEW IF EXISTS operacion.experiencias_publicables;
DROP FUNCTION IF EXISTS inventario.reemplazar_hijas(text, uuid, uuid[]);
ALTER TABLE inventario.consentimientos
  DROP CONSTRAINT IF EXISTS consentimientos_revocado_por,
  DROP COLUMN IF EXISTS revocado_por, DROP COLUMN IF EXISTS registrado_por,
  DROP COLUMN IF EXISTS vigencia, DROP COLUMN IF EXISTS firmado_en, DROP COLUMN IF EXISTS ante_quien,
  DROP COLUMN IF EXISTS incluye_clientes, DROP COLUMN IF EXISTS nominal;
DROP TABLE IF EXISTS inventario.perfil_experiencias;
ALTER TABLE inventario.perfiles DROP CONSTRAINT IF EXISTS perfiles_identidad_fuera_de_borrador;
ALTER TABLE inventario.perfiles ALTER COLUMN nombre SET NOT NULL;
ALTER TABLE inventario.perfiles ALTER COLUMN primer_apellido SET NOT NULL;
ALTER TABLE inventario.perfiles
  ADD CONSTRAINT perfiles_nombre_check CHECK (length(btrim(nombre)) > 0),
  ADD CONSTRAINT perfiles_primer_apellido_check CHECK (length(btrim(primer_apellido)) > 0),
  DROP COLUMN IF EXISTS creado_por, DROP COLUMN IF EXISTS origen_creacion, DROP COLUMN IF EXISTS aporte,
  DROP COLUMN IF EXISTS sello_personal, DROP COLUMN IF EXISTS idiomas, DROP COLUMN IF EXISTS formacion,
  DROP COLUMN IF EXISTS vinculo, DROP COLUMN IF EXISTS resumen, DROP COLUMN IF EXISTS anclaje,
  DROP COLUMN IF EXISTS capacidad;
RESET ROLE;
`,
    )
    .execute(db);
}
