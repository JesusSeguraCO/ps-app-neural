// Release Gate R0 (stack_arch 1): `ps_worker` con solo lo que ADR-0009 le da en el inventario (fila
// CON-9/QA-5, «tipo por tipo»): escribir perfiles y sus hijas, lotes y la versión al aplicar y revertir
// importaciones, y dar de alta roles, tecnologías y sectores nuevos de un archivo (HU-086). Nada sobre
// consentimientos, colocados, cargas de Operaciones ni el resto de catálogos. Leer, todo.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";

describe.skipIf(!HAY_BD)("migración 0026: ps_worker mínimo en el inventario (ADR-0009)", () => {
  let bd: BdPrueba;
  const puede = async (tabla: string, privilegio: string) =>
    (
      await bd.instalacion.query(`SELECT has_table_privilege('ps_worker', $1, $2) AS si`, [
        `inventario.${tabla}`,
        privilegio,
      ])
    ).rows[0].si as boolean;

  beforeAll(async () => {
    bd = await crearBdPrueba();
  }, 60_000);
  afterAll(async () => {
    await bd?.cerrar();
  });

  it("escribe lo que la importación necesita", async () => {
    for (const t of ["perfiles", "perfil_roles", "perfil_tecnologias", "perfil_sectores", "perfil_experiencias"])
      for (const p of ["INSERT", "UPDATE"]) expect(await puede(t, p), `${t} ${p}`).toBe(true);
    for (const t of ["lotes_importacion", "lote_filas", "inventario_version"])
      expect(await puede(t, "UPDATE"), t).toBe(true);
    for (const t of ["catalogo_roles", "catalogo_tecnologias", "catalogo_sectores"]) {
      expect(await puede(t, "INSERT"), `${t} INSERT`).toBe(true);
      expect(await puede(t, "UPDATE"), `${t} UPDATE`).toBe(false);
    }
  });

  it("no escribe consentimientos, colocados, cargas de Operaciones ni el resto de catálogos", async () => {
    for (const t of [
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
    ])
      for (const p of ["INSERT", "UPDATE"]) expect(await puede(t, p), `${t} ${p}`).toBe(false);
  });

  it("sigue leyendo el inventario", async () => {
    for (const t of ["consentimientos", "catalogo_familias", "colocaciones", "perfiles"])
      expect(await puede(t, "SELECT"), t).toBe(true);
  });
});
