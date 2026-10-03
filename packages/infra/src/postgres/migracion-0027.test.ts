// Migración 0027 (EP-003 · sub-slice 1, tarea 1.1; HU-177): catálogo cerrado de alcances SARO con la
// forma de los catálogos de EP-006. La forma normalizada impide el idéntico salvo mayúsculas o tildes
// (también por carrera), el texto de cara al cliente es obligatorio (1–280), nadie borra (CON-11) y
// `ps_portal` no lee la tabla (V3-2): el texto le llega solo por la vista de la ficha. V3-7 (sin DML de
// nivel superior) la cubre migracion-0013.test.ts para toda migración ≥ 0013.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import {
  HAY_BD,
  PERMISO_DENEGADO,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";
import { MIGRACIONES } from "../../migraciones/indice";

const VIOLACION_UNICA = "23505";
const VIOLACION_CHECK = "23514";
const VIOLACION_NOT_NULL = "23502";

describe("índice: la 0027 está registrada", () => {
  it("0027_catalogo_alcances_saro en el proveedor estático", () => {
    expect(Object.keys(MIGRACIONES)).toContain("0027_catalogo_alcances_saro");
  });
});

describe.skipIf(!HAY_BD)("migración 0027: catálogo de alcances SARO", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;
  let worker: pg.Pool;

  const crear = (nombre: string, texto: string | null = "Verificamos sus antecedentes.") =>
    panel.query(
      `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente) VALUES ($1, $2) RETURNING id`,
      [nombre, texto],
    );

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("el panel crea un alcance con su texto de cara al cliente; nace activo y sin fusionar", async () => {
    const r = await crear("Antecedentes judiciales, disciplinarios y fiscales");
    const fila = (
      await panel.query(
        `SELECT nombre, nombre_normal, texto_cliente, activo, fusionado_en_id FROM inventario.catalogo_alcances_saro WHERE id = $1`,
        [r.rows[0].id],
      )
    ).rows[0];
    expect(fila).toMatchObject({
      nombre: "Antecedentes judiciales, disciplinarios y fiscales",
      nombre_normal: "antecedentes judiciales, disciplinarios y fiscales",
      activo: true,
      fusionado_en_id: null,
    });
  });

  it("idéntico salvo mayúsculas o tildes → violación del índice único (ni por carrera entra)", async () => {
    expect(await codigoDeError(crear("antecedentes judiciales, disciplinarios y fiscales"))).toBe(
      VIOLACION_UNICA,
    );
    expect(await codigoDeError(crear("ANTECEDENTES JUDICIALES, DISCIPLINARIOS Y FÍSCALES"))).toBe(
      VIOLACION_UNICA,
    );
  });

  it("el texto de cara al cliente es obligatorio y de 1 a 280 caracteres", async () => {
    expect(await codigoDeError(crear("Sin texto", null))).toBe(VIOLACION_NOT_NULL);
    expect(await codigoDeError(crear("Texto vacío", "   "))).toBe(VIOLACION_CHECK);
    expect(await codigoDeError(crear("Texto largo", "x".repeat(281)))).toBe(VIOLACION_CHECK);
    expect((await crear("Texto justo", "x".repeat(280))).rowCount).toBe(1);
  });

  it("un fusionado queda inactivo (CHECK fusionado ⇒ no activo)", async () => {
    const a = (await crear("Antecedentes judiciales")).rows[0].id;
    const b = (await crear("Antecedentes fiscales")).rows[0].id;
    expect(
      await codigoDeError(
        panel.query(
          `UPDATE inventario.catalogo_alcances_saro SET fusionado_en_id = $2 WHERE id = $1`,
          [a, b],
        ),
      ),
    ).toBe(VIOLACION_CHECK);
  });

  it("nadie borra un alcance: panel y worker sin DELETE (CON-11)", async () => {
    expect(await codigoDeError(panel.query(`DELETE FROM inventario.catalogo_alcances_saro`))).toBe(
      PERMISO_DENEGADO,
    );
    expect(await codigoDeError(worker.query(`DELETE FROM inventario.catalogo_alcances_saro`))).toBe(
      PERMISO_DENEGADO,
    );
  });

  it("el portal no lee la tabla (V3-2); el worker la lee (importación, reversión) pero no la escribe (catálogo cerrado)", async () => {
    expect(
      await codigoDeError(
        worker.query(
          `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente) VALUES ('Desde un archivo', 'x')`,
        ),
      ),
    ).toBe(PERMISO_DENEGADO);
    expect(
      await codigoDeError(portal.query(`SELECT 1 FROM inventario.catalogo_alcances_saro`)),
    ).toBe(PERMISO_DENEGADO);
    expect(
      (await worker.query(`SELECT count(*)::int AS n FROM inventario.catalogo_alcances_saro`))
        .rows[0].n,
    ).toBeGreaterThan(0);
  });

  it("batería de permisos: ninguna tabla de inventario tiene DELETE para un rol de conexión ni SELECT para el portal", async () => {
    const r = await bd.instalacion.query(
      `SELECT c.relname, rol, has_table_privilege(rol, c.oid, 'DELETE') AS borra,
              has_table_privilege(rol, c.oid, 'SELECT') AS lee
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        CROSS JOIN unnest(ARRAY['ps_portal', 'ps_panel', 'ps_worker']) AS rol
        WHERE n.nspname = 'inventario' AND c.relkind = 'r'`,
    );
    const borran = r.rows.filter((f) => f.borra).map((f) => `${f.rol}:${f.relname}`);
    expect(borran).toEqual([]);
    const portalLee = r.rows.filter((f) => f.rol === "ps_portal" && f.lee).map((f) => f.relname);
    expect(portalLee).toEqual([]);
    expect(r.rows.map((f) => f.relname)).toContain("catalogo_alcances_saro");
  });
});
