// EP-003 · sub-slice 1 (HU-177; diseño §1; D61): catálogo cerrado de alcances de la verificación de
// seguridad bajo SARO, con la forma de los catálogos de EP-006 (0013):
//  - `nombre_normal` generado con `inventario.normalizar_nombre` e índice único: el idéntico salvo
//    mayúsculas o tildes no entra ni por carrera.
//  - `texto_cliente` obligatorio (1–280): lo que lee el cliente en la ficha; lo escribe Talento
//    Humano una vez para todos los perfiles verificados igual.
//  - `activo` y `fusionado_en_id`: se desactiva o se fusiona, nunca se borra (CON-11). Un desactivado
//    lo conservan los perfiles que ya lo tenían (HU-177 edge).
// Permisos: el panel administra (sin DELETE); el worker solo lee (importación y reversión leen el
// perfil completo; un catálogo cerrado no recibe valores de un archivo, a diferencia de rol, tecnología
// y sector: 0026); `ps_portal` sin acceso directo (V3-2): el texto le llega por la vista de la ficha
// (0028). La columna del perfil y la fusión van en la 0028. Solo DDL (V3-7).
import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;

CREATE TABLE inventario.catalogo_alcances_saro (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL CHECK (length(btrim(nombre)) > 0),
  nombre_normal   text GENERATED ALWAYS AS (inventario.normalizar_nombre(nombre)) STORED,
  texto_cliente   text NOT NULL CHECK (length(btrim(texto_cliente)) BETWEEN 1 AND 280),
  activo          boolean NOT NULL DEFAULT true,
  fusionado_en_id uuid REFERENCES inventario.catalogo_alcances_saro(id),
  CHECK (fusionado_en_id IS NULL OR NOT activo)
);
CREATE UNIQUE INDEX catalogo_alcances_saro_nombre_normal
  ON inventario.catalogo_alcances_saro (nombre_normal);

GRANT SELECT, INSERT, UPDATE ON inventario.catalogo_alcances_saro TO ps_panel;
GRANT SELECT ON inventario.catalogo_alcances_saro TO ps_worker;
REVOKE ALL ON inventario.catalogo_alcances_saro FROM ps_portal;

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
DROP TABLE IF EXISTS inventario.catalogo_alcances_saro;
RESET ROLE;
`,
    )
    .execute(db);
}
