// Release Gate R0 (stack_arch, bloqueante 1): `ps_worker` con solo lo que ADR-0009 (fila CON-9/QA-5,
// «inventario, tipo por tipo») le da en el inventario. La 0005 le concedió escritura en todo el esquema;
// el worker solo escribe al aplicar y revertir importaciones: perfiles y sus hijas, lotes, la fila de
// versión y los valores nuevos de rol, tecnología y sector que trae un archivo (HU-086). Consentimientos,
// colocados, cargas de Operaciones y el resto de catálogos los escribe el panel (las candidatas del
// léxico siguen siendo del worker, 0013); la siembra
// ficticia pasa al rol de migración (`migrar.js --sembrar-ficticios`). La lectura no cambia.
// Solo DDL (V3-7).
import { sql, type Kysely } from "kysely";

const SIN_ESCRITURA = [
  "consentimientos",
  "colocaciones",
  "cargas_operaciones",
  "diferencias_operaciones",
  "catalogo_ciudades",
  "catalogo_familias",
  "catalogo_modalidades",
  "catalogo_modalidades_prueba",
  "catalogo_motivos_pausa",
  "catalogo_paises",
  "catalogo_seniorities",
].map((t) => `inventario.${t}`);
const SOLO_ALTA = ["catalogo_roles", "catalogo_tecnologias", "catalogo_sectores"].map(
  (t) => `inventario.${t}`,
);

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql
    .raw(
      `
SET LOCAL ROLE ps_duenio;
REVOKE INSERT, UPDATE ON ${SIN_ESCRITURA.join(", ")} FROM ps_worker;
REVOKE UPDATE ON ${SOLO_ALTA.join(", ")} FROM ps_worker;
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
GRANT INSERT, UPDATE ON ${SIN_ESCRITURA.filter((t) => t !== "inventario.catalogo_modalidades_prueba").join(", ")} TO ps_worker;
GRANT INSERT ON inventario.catalogo_modalidades_prueba TO ps_worker;
GRANT UPDATE ON ${SOLO_ALTA.join(", ")} TO ps_worker;
RESET ROLE;
`,
    )
    .execute(db);
}
