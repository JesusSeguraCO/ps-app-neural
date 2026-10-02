// EP-006 · sub-slice 5 (HU-128, HU-130; diseño §2; RF-8.4, RF-8.10 con D10, RF-8.16.4): defensa en
// profundidad de la guarda de publicar. La guarda de verdad la evalúa `evaluarPublicacion` en
// ServicioPerfiles (y dice qué falta); este disparador garantiza que ninguna otra vía —importación,
// reversión, SQL con `ps_panel`— deja un perfil en publicado sin:
//  - consentimiento nominal vigente (ya lo exigía la 0005), y
//  - modalidad de prueba elegida, activa y de la familia de su rol (D10). Una familia sin modalidades
//    no tiene ninguna que elegir, así que también queda cubierta (RF-8.16.4).
// Actúa al ENTRAR en publicado (alta o cambio de estado), igual que la 0005: editar un publicado es de
// HU-126 (sub-slice 6), que pregunta antes de dejarlo incompleto. La importación sobre un publicado
// tampoco pasa por aquí: el plan manda a error la fila que lo dejaría incompleto (D44).
// Además, `operacion.ficha_publicable`: lo que la ficha del portal añade al catálogo (HU-129, HU-130).
// Sin DML de nivel superior (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE OR REPLACE FUNCTION inventario._publicar_exige_consentimiento() RETURNS trigger
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
    END IF;
  END IF;
  RETURN NEW;
END
$f$;

-- ─── ficha para el portal (HU-129, HU-130; RF-3.2) ────────────────────────────────────────
-- Lo que la ficha muestra además de \`catalogo_publicable\` y \`experiencias_publicables\`: el resumen,
-- el Sello Personal, la formación, los idiomas, el enunciado de Nivel 0 de la modalidad de prueba
-- elegida y si el consentimiento incluye a los clientes. Mismo filtro que el catálogo: publicado y
-- con consentimiento vigente. Nada de la lista negra B.4 (ni \`aporte\`, que es motivación: D20).
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
DROP VIEW IF EXISTS operacion.ficha_publicable;
CREATE OR REPLACE FUNCTION inventario._publicar_exige_consentimiento() RETURNS trigger
LANGUAGE plpgsql SET search_path = inventario, pg_temp AS $f$
BEGIN
  IF NEW.estado = 'publicado' AND (TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM 'publicado')
     AND NOT EXISTS (SELECT 1 FROM inventario.consentimientos c WHERE c.perfil_id = NEW.id AND c.vigente) THEN
    RAISE EXCEPTION 'el perfil % no tiene consentimiento vigente: no se puede publicar', NEW.codigo;
  END IF;
  RETURN NEW;
END
$f$;
RESET ROLE;
`,
    )
    .execute(db);
}
