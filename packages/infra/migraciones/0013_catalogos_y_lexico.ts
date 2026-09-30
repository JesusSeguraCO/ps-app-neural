// EP-006 · sub-slice 1 (HU-089, HU-143, HU-139; diseño §1, §6, §7):
//  - Forma normalizada `nombre_normal` (generada: minúsculas, sin diacríticos, un espacio) con índice
//    único por catálogo: el idéntico salvo mayúsculas o tildes no entra ni por carrera (HU-089).
//  - `catalogo_modalidades_prueba` por familia con su texto de cara al cliente (RF-8.16.8) y la
//    plantilla del reporte (HU-140); `perfiles.modalidad_prueba_id` para contar dependientes (HU-143).
//  - `inventario_version` (fila única) que sube con toda escritura visible al cliente (ADR-0003).
//  - `fusionar_valor(...)`: la fusión transaccional reasigna las hijas sin duplicar su PK compuesta; es
//    la única vía con borrado de filas hijas y corre como dueño (ningún rol de conexión tiene DELETE
//    sobre inventario, CON-11).
//  - Léxico con FK real por tipo, propuestas de Gemini y candidatas (consultas sin coincidencia por
//    período; sintéticas hasta EP-010). `ps_portal` lee solo el léxico aprobado y los valores
//    buscables por vistas.
//  - Planificador del worker (ADR-0009): `tareas_programadas` y `tareas_ejecucion`.
// Sin DML de nivel superior (V3-7) salvo la fila única de `inventario_version`, marcada.
import { sql, type Kysely } from "kysely";

const CATALOGOS_CON_NOMBRE = [
  "catalogo_familias",
  "catalogo_roles",
  "catalogo_tecnologias",
  "catalogo_sectores",
  "catalogo_motivos_pausa",
];

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

-- La misma regla que normalizar() de @ps/dominio/catalogo/parecidos (sin depender de unaccent ni de
-- la colación: translate + lower + espacios).
CREATE FUNCTION inventario.normalizar_nombre(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $f$
  SELECT btrim(regexp_replace(lower(translate(t,
    'ÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÇÑáàäâéèëêíìïîóòöôúùüûçñ',
    'AAAAEEEEIIIIOOOOUUUUCNaaaaeeeeiiiioooouuuucn')), '\\s+', ' ', 'g'))
$f$;

${CATALOGOS_CON_NOMBRE.map(
  (t) => `ALTER TABLE inventario.${t}
  ADD COLUMN nombre_normal text GENERATED ALWAYS AS (inventario.normalizar_nombre(nombre)) STORED;
CREATE UNIQUE INDEX ${t}_nombre_normal ON inventario.${t} (nombre_normal);`,
).join("\n")}

-- Grupo de la tecnología (Lenguaje, Framework…): orienta, no filtra al cliente.
ALTER TABLE inventario.catalogo_tecnologias
  ADD COLUMN grupo text CHECK (grupo IS NULL OR length(btrim(grupo)) > 0);

-- ─── modalidades de prueba (RF-8.16.4, RF-8.16.8) ─────────────────────────────────────────
CREATE TABLE inventario.catalogo_modalidades_prueba (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id      uuid NOT NULL REFERENCES inventario.catalogo_familias(id),
  nombre          text NOT NULL CHECK (length(btrim(nombre)) > 0),
  nombre_normal   text GENERATED ALWAYS AS (inventario.normalizar_nombre(nombre)) STORED,
  texto_cliente   text NOT NULL CHECK (length(btrim(texto_cliente)) > 0),
  enunciado_reto  text,
  entregables     text,
  criterios       text,
  activo          boolean NOT NULL DEFAULT true,
  fusionado_en_id uuid REFERENCES inventario.catalogo_modalidades_prueba(id),
  UNIQUE (familia_id, nombre_normal),
  CHECK (fusionado_en_id IS NULL OR NOT activo)
);
ALTER TABLE inventario.perfiles
  ADD COLUMN modalidad_prueba_id uuid REFERENCES inventario.catalogo_modalidades_prueba(id);

-- ─── versión global del inventario (ADR-0003) ─────────────────────────────────────────────
CREATE TABLE inventario.inventario_version (
  id             smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version        bigint NOT NULL DEFAULT 0,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);
INSERT INTO inventario.inventario_version (id) VALUES (1); -- V3-7: excepción enumerada (fila única)

-- ─── fusión (HU-143): reasigna y retira el origen en una sola llamada ─────────────────────
-- Devuelve los perfiles cuyo dato cambió (para auditarlos). Rechaza mismo valor, valores de catálogos
-- distintos (el tipo fija la tabla), valores inexistentes o ya retirados.
CREATE FUNCTION inventario.fusionar_valor(p_tipo text, p_origen uuid, p_destino uuid)
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
    WHEN 'familia' THEN 'catalogo_familias' END;
  IF tabla IS NULL THEN RAISE EXCEPTION 'fusion: tipo no admitido %', p_tipo; END IF;
  IF p_origen = p_destino THEN RAISE EXCEPTION 'fusion: mismo_valor'; END IF;
  EXECUTE format('SELECT count(*) FROM (SELECT 1 FROM inventario.%I WHERE id = ANY($1) AND activo AND fusionado_en_id IS NULL FOR UPDATE) x', tabla)
    INTO vivos USING ARRAY[p_origen, p_destino];
  IF vivos <> 2 THEN RAISE EXCEPTION 'fusion: distinto_catalogo'; END IF;

  IF p_tipo IN ('rol', 'tecnologia', 'sector') THEN
    hija := CASE p_tipo WHEN 'rol' THEN 'perfil_roles' WHEN 'tecnologia' THEN 'perfil_tecnologias' ELSE 'perfil_sectores' END;
    RETURN QUERY EXECUTE format('SELECT perfil_id FROM inventario.%I WHERE valor_id = $1', hija) USING p_origen;
    -- Quien ya tenía el destino conserva su orden; los demás lo reciben en el lugar del origen.
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

-- ─── léxico de búsqueda (HU-139; RF-8.12, RF-8.12.1) ──────────────────────────────────────
CREATE TABLE inventario.lexico (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  termino        text NOT NULL CHECK (length(btrim(termino)) > 0),
  termino_normal text GENERATED ALWAYS AS (inventario.normalizar_nombre(termino)) STORED UNIQUE,
  sinonimos      text[] NOT NULL DEFAULT '{}',
  origen         text NOT NULL CHECK (origen IN ('manual', 'propuesta', 'candidata')),
  actualizado_por uuid REFERENCES identidad_panel.usuarios_panel(id),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);
-- Una equivalencia apunta a exactamente un valor de un catálogo, con FK real (nunca a un valor vacío).
-- Quitar una equivalencia la deja no vigente con su fecha (sin borrado).
CREATE TABLE inventario.lexico_equivalencias (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lexico_id     uuid NOT NULL REFERENCES inventario.lexico(id),
  rol_id        uuid REFERENCES inventario.catalogo_roles(id),
  tecnologia_id uuid REFERENCES inventario.catalogo_tecnologias(id),
  sector_id     uuid REFERENCES inventario.catalogo_sectores(id),
  vigente       boolean NOT NULL DEFAULT true,
  creada_en     timestamptz NOT NULL DEFAULT now(),
  retirada_en   timestamptz,
  CHECK (num_nonnulls(rol_id, tecnologia_id, sector_id) = 1),
  CHECK (vigente = (retirada_en IS NULL))
);
CREATE UNIQUE INDEX lexico_eq_rol ON inventario.lexico_equivalencias (lexico_id, rol_id) WHERE vigente AND rol_id IS NOT NULL;
CREATE UNIQUE INDEX lexico_eq_tec ON inventario.lexico_equivalencias (lexico_id, tecnologia_id) WHERE vigente AND tecnologia_id IS NOT NULL;
CREATE UNIQUE INDEX lexico_eq_sec ON inventario.lexico_equivalencias (lexico_id, sector_id) WHERE vigente AND sector_id IS NOT NULL;

-- Propuestas de Gemini: nada entra al léxico sin una persona; la rechazada no vuelve a proponerse.
CREATE TABLE inventario.propuestas_lexico (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  termino        text NOT NULL CHECK (length(btrim(termino)) > 0),
  termino_normal text GENERATED ALWAYS AS (inventario.normalizar_nombre(termino)) STORED,
  sinonimos      text[] NOT NULL DEFAULT '{}',
  equivalencias  jsonb NOT NULL CHECK (jsonb_typeof(equivalencias) = 'array' AND jsonb_array_length(equivalencias) > 0),
  ejemplo        text NOT NULL,
  busquedas      integer NOT NULL CHECK (busquedas >= 1),
  cuentas        integer NOT NULL CHECK (cuentas >= 1),
  consultas      uuid[] NOT NULL,
  propuesta_en   timestamptz NOT NULL DEFAULT now(),
  estado         text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  decidido_por   uuid REFERENCES identidad_panel.usuarios_panel(id),
  decidido_en    timestamptz,
  lexico_id      uuid REFERENCES inventario.lexico(id),
  CHECK ((estado = 'pendiente') = (decidido_en IS NULL)),
  CHECK ((estado = 'aprobada') = (lexico_id IS NOT NULL))
);
CREATE UNIQUE INDEX propuestas_lexico_una_viva ON inventario.propuestas_lexico (termino_normal)
  WHERE estado IN ('pendiente', 'rechazada');

-- Candidatas: consultas sin coincidencia agregadas por período (RF-2.6.3). Hasta EP-010 las siembra el
-- worker como sintéticas fuera de producción; \`modelo_permitido\` es falso por omisión (ADR-0004 H43).
CREATE TABLE inventario.candidatas_lexico (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta         text NOT NULL CHECK (length(btrim(consulta)) > 0),
  consulta_normal  text GENERATED ALWAYS AS (inventario.normalizar_nombre(consulta)) STORED,
  periodo          date NOT NULL CHECK (periodo = date_trunc('month', periodo)::date),
  veces            integer NOT NULL DEFAULT 1 CHECK (veces >= 1),
  cuentas          integer NOT NULL DEFAULT 1 CHECK (cuentas >= 1),
  ultima_en        timestamptz NOT NULL DEFAULT now(),
  modelo_permitido boolean NOT NULL DEFAULT false,
  sintetica        boolean NOT NULL DEFAULT false,
  destino          text CHECK (destino IN ('lexico', 'agenda_reclutamiento', 'descartada')),
  decidido_por     uuid REFERENCES identidad_panel.usuarios_panel(id),
  decidido_en      timestamptz,
  UNIQUE (consulta_normal, periodo),
  CHECK ((destino IS NULL) = (decidido_en IS NULL))
);

-- ─── vistas para el portal: léxico aprobado y valores buscables (sin despliegue) ──────────
CREATE VIEW operacion.lexico_aprobado WITH (security_barrier = true) AS
SELECT l.termino, l.sinonimos,
       CASE WHEN e.rol_id IS NOT NULL THEN 'rol' WHEN e.tecnologia_id IS NOT NULL THEN 'tecnologia' ELSE 'sector' END AS tipo,
       COALESCE(r.nombre, t.nombre, s.nombre) AS valor
  FROM inventario.lexico l
  JOIN inventario.lexico_equivalencias e ON e.lexico_id = l.id AND e.vigente
  LEFT JOIN inventario.catalogo_roles r ON r.id = e.rol_id AND r.activo
  LEFT JOIN inventario.catalogo_tecnologias t ON t.id = e.tecnologia_id AND t.activo
  LEFT JOIN inventario.catalogo_sectores s ON s.id = e.sector_id AND s.activo
 WHERE COALESCE(r.nombre, t.nombre, s.nombre) IS NOT NULL;

CREATE VIEW operacion.valores_busqueda WITH (security_barrier = true) AS
SELECT 'rol'::text AS tipo, nombre FROM inventario.catalogo_roles WHERE activo
UNION ALL SELECT 'tecnologia', nombre FROM inventario.catalogo_tecnologias WHERE activo
UNION ALL SELECT 'sector', nombre FROM inventario.catalogo_sectores WHERE activo
UNION ALL SELECT 'seniority', nombre FROM inventario.catalogo_seniorities WHERE activo;

-- ─── planificador del worker (ADR-0009) ──────────────────────────────────────────────────
-- El worker registra su catálogo de tareas al arrancar (sin DML aquí).
CREATE TABLE operacion.tareas_programadas (
  nombre              text PRIMARY KEY,
  intervalo           interval NOT NULL,
  critica             boolean NOT NULL DEFAULT false,
  proxima_ejecucion   timestamptz NOT NULL,
  lease_hasta         timestamptz,
  lease_por           text,
  ultimo_exito_en     timestamptz,
  fallos_consecutivos integer NOT NULL DEFAULT 0,
  ultimo_error        text
);
CREATE TABLE operacion.tareas_ejecucion (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     text NOT NULL REFERENCES operacion.tareas_programadas(nombre),
  inicio     timestamptz NOT NULL,
  fin        timestamptz NOT NULL DEFAULT now(),
  resultado  text NOT NULL CHECK (resultado IN ('exito', 'fallo')),
  detalle    jsonb
);

-- ─── permisos (sin DELETE para nadie: CON-11) ────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON inventario.catalogo_modalidades_prueba, inventario.lexico,
  inventario.lexico_equivalencias TO ps_panel;
GRANT SELECT, UPDATE ON inventario.inventario_version, inventario.propuestas_lexico,
  inventario.candidatas_lexico TO ps_panel;
GRANT EXECUTE ON FUNCTION inventario.fusionar_valor(text, uuid, uuid) TO ps_panel;
-- La columna generada se calcula con los privilegios de quien escribe.
GRANT EXECUTE ON FUNCTION inventario.normalizar_nombre(text) TO ps_panel, ps_worker;
GRANT SELECT ON inventario.catalogo_modalidades_prueba, inventario.lexico, inventario.lexico_equivalencias
  TO ps_worker;
GRANT SELECT, INSERT ON inventario.propuestas_lexico, inventario.candidatas_lexico TO ps_worker;
-- Solo para la siembra ficticia (local, CI y staging), como el resto de catálogos de la 0005.
GRANT INSERT ON inventario.catalogo_modalidades_prueba TO ps_worker;
GRANT SELECT, UPDATE ON inventario.inventario_version TO ps_worker;
REVOKE ALL ON ALL TABLES IN SCHEMA inventario FROM ps_portal;
REVOKE EXECUTE ON FUNCTION inventario.fusionar_valor(text, uuid, uuid) FROM PUBLIC;
GRANT SELECT ON operacion.lexico_aprobado, operacion.valores_busqueda TO ps_portal, ps_panel, ps_worker;
GRANT SELECT, INSERT, UPDATE ON operacion.tareas_programadas TO ps_worker;
GRANT INSERT, SELECT ON operacion.tareas_ejecucion TO ps_worker;
GRANT SELECT ON operacion.tareas_programadas, operacion.tareas_ejecucion TO ps_panel;

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
DROP TABLE IF EXISTS operacion.tareas_ejecucion, operacion.tareas_programadas;
DROP VIEW IF EXISTS operacion.valores_busqueda, operacion.lexico_aprobado;
DROP TABLE IF EXISTS inventario.candidatas_lexico, inventario.propuestas_lexico,
  inventario.lexico_equivalencias, inventario.lexico;
DROP FUNCTION IF EXISTS inventario.fusionar_valor(text, uuid, uuid);
DROP TABLE IF EXISTS inventario.inventario_version;
ALTER TABLE inventario.perfiles DROP COLUMN IF EXISTS modalidad_prueba_id;
DROP TABLE IF EXISTS inventario.catalogo_modalidades_prueba;
ALTER TABLE inventario.catalogo_tecnologias DROP COLUMN IF EXISTS grupo;
${CATALOGOS_CON_NOMBRE.map((t) => `ALTER TABLE inventario.${t} DROP COLUMN IF EXISTS nombre_normal;`).join("\n")}
DROP FUNCTION IF EXISTS inventario.normalizar_nombre(text);
RESET ROLE;
`,
    )
    .execute(db);
}
