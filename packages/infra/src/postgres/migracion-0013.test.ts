// Migración 0013 (EP-006 · sub-slice 1, tarea 1.1): V8-10/V3-2 (roles reales por PgBouncer, sin
// DELETE sobre inventario, `ps_portal` solo por vistas), índice único de la forma normalizada, la
// fusión como única vía que retira filas hijas, y V3-7 (sin DML de nivel superior en migraciones de
// EP-006 salvo las excepciones marcadas).
import { readFileSync, readdirSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import {
  HAY_BD,
  PERMISO_DENEGADO,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";

const VIOLACION_UNICA = "23505";

describe("V3-7: migraciones de EP-006 sin DML de nivel superior", () => {
  it("fuera de los cuerpos de función no hay INSERT/UPDATE/DELETE salvo las excepciones marcadas", () => {
    const dir = new URL("../../migraciones/", import.meta.url);
    const ficheros = readdirSync(dir).filter((f) => /^\d{4}_.*\.ts$/.test(f) && f >= "0013");
    expect(ficheros.length).toBeGreaterThan(0);
    for (const f of ficheros) {
      const sinCuerpos = readFileSync(new URL(f, dir), "utf8").replace(/\$f\$[\s\S]*?\$f\$/g, "");
      for (const linea of sinCuerpos.split("\n"))
        if (/^\s*(INSERT|UPDATE|DELETE)\b/i.test(linea))
          expect(linea, `${f}: ${linea.trim()}`).toMatch(/-- V3-7: excepción enumerada/);
    }
  });
});

describe.skipIf(!HAY_BD)("migración 0013: catálogos, léxico y planificador", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let familia: string;
  let otraFamilia: string;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
    const i = bd.instalacion;
    familia = (
      await i.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Diseño de producto') RETURNING id`,
      )
    ).rows[0].id;
    otraFamilia = (
      await i.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Datos') RETURNING id`,
      )
    ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("forma normalizada única por catálogo (HU-089)", () => {
    it("«Figma» y «figma» no conviven; tampoco «Diseño» y «diseno »", async () => {
      await panel.query(`INSERT INTO inventario.catalogo_tecnologias (nombre) VALUES ('Figma')`);
      expect(
        await codigoDeError(
          panel.query(`INSERT INTO inventario.catalogo_tecnologias (nombre) VALUES ('figma')`),
        ),
      ).toBe(VIOLACION_UNICA);
      expect(
        await codigoDeError(
          panel.query(
            `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('  diseno de  PRODUCTO')`,
          ),
        ),
      ).toBe(VIOLACION_UNICA);
    });
    it("la forma de la BD coincide con normalizar() del dominio", async () => {
      const r = await panel.query(
        `SELECT inventario.normalizar_nombre('  ÁRBOL  Ñandú   Güera ') AS n`,
      );
      expect(r.rows[0].n).toBe("arbol nandu guera");
    });
  });

  describe("modalidades de prueba (RF-8.16.8)", () => {
    it("exigen familia y texto de cara al cliente", async () => {
      expect(
        await codigoDeError(
          panel.query(
            `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente) VALUES ($1, 'Reto', '  ')`,
            [familia],
          ),
        ),
      ).toBe("23514");
      await panel.query(
        `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente) VALUES ($1, 'Reto de diseño', 'Exige un caso')`,
        [familia],
      );
      // El mismo nombre en otra familia es otra modalidad.
      await panel.query(
        `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente) VALUES ($1, 'reto de diseno', 'Exige un caso')`,
        [otraFamilia],
      );
    });
  });

  describe("sin DELETE para ningún rol (CON-11) y el portal solo por vistas", () => {
    it.each([
      ["ps_panel", "DELETE FROM inventario.catalogo_tecnologias"],
      ["ps_panel", "DELETE FROM inventario.catalogo_modalidades_prueba"],
      ["ps_panel", "DELETE FROM inventario.lexico"],
      ["ps_panel", "DELETE FROM inventario.lexico_equivalencias"],
      ["ps_panel", "DELETE FROM inventario.perfil_tecnologias"],
      ["ps_panel", "DELETE FROM inventario.propuestas_lexico"],
      ["ps_worker", "DELETE FROM inventario.candidatas_lexico"],
      ["ps_worker", "UPDATE inventario.lexico SET termino = 'x'"],
      ["ps_worker", "INSERT INTO inventario.lexico (termino, origen) VALUES ('x', 'manual')"],
      [
        "ps_panel",
        "INSERT INTO inventario.propuestas_lexico (termino, equivalencias, ejemplo, busquedas, cuentas, consultas) VALUES ('x', '[1]', 'x', 1, 1, '{}')",
      ],
      ["ps_portal", "SELECT * FROM inventario.lexico"],
      ["ps_portal", "SELECT * FROM inventario.catalogo_modalidades_prueba"],
      ["ps_portal", "SELECT * FROM inventario.candidatas_lexico"],
      ["ps_portal", "SELECT * FROM inventario.inventario_version"],
      ["ps_portal", "SELECT * FROM operacion.tareas_programadas"],
      [
        "ps_portal",
        "SELECT inventario.fusionar_valor('tecnologia', gen_random_uuid(), gen_random_uuid())",
      ],
      [
        "ps_worker",
        "SELECT inventario.fusionar_valor('tecnologia', gen_random_uuid(), gen_random_uuid())",
      ],
    ] as const)("%s: %s → permiso denegado", async (rol, sentencia) => {
      const p = rol === "ps_portal" ? portal : rol === "ps_panel" ? panel : worker;
      expect(await codigoDeError(p.query(sentencia))).toBe(PERMISO_DENEGADO);
    });
    it("el portal lee el léxico aprobado y los valores buscables por sus vistas", async () => {
      await portal.query(`SELECT termino, sinonimos, tipo, valor FROM operacion.lexico_aprobado`);
      const v = await portal.query(`SELECT tipo, nombre FROM operacion.valores_busqueda`);
      expect(v.rows).toContainEqual({ tipo: "tecnologia", nombre: "Figma" });
    });
    it("inventario_version existe con una sola fila", async () => {
      const r = await panel.query(`SELECT id, version FROM inventario.inventario_version`);
      expect(r.rows).toEqual([{ id: 1, version: "0" }]);
    });
  });

  describe("fusionar_valor (HU-143)", () => {
    let fgima: string;
    let figma: string;
    let perfilA: string;
    let perfilB: string;

    beforeAll(async () => {
      const i = bd.instalacion;
      figma = (
        await i.query(`SELECT id FROM inventario.catalogo_tecnologias WHERE nombre = 'Figma'`)
      ).rows[0].id;
      fgima = (
        await i.query(
          `INSERT INTO inventario.catalogo_tecnologias (nombre) VALUES ('Fgima') RETURNING id`,
        )
      ).rows[0].id;
      const perfil = async (codigo: string) =>
        (
          await i.query(
            `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido) VALUES ($1, 'Ana', 'Ruiz') RETURNING id`,
            [codigo],
          )
        ).rows[0].id as string;
      perfilA = await perfil("PS-9001");
      perfilB = await perfil("PS-9002");
      // A tiene solo Fgima; B tiene ambas (la fusión no debe duplicar su PK).
      await i.query(
        `INSERT INTO inventario.perfil_tecnologias (perfil_id, valor_id, orden) VALUES ($1, $3, 1), ($2, $4, 1), ($2, $3, 2)`,
        [perfilA, perfilB, fgima, figma],
      );
    });

    it("rechaza mismo valor y valores de catálogos distintos sin cambiar nada", async () => {
      expect(
        await panel
          .query(`SELECT inventario.fusionar_valor('tecnologia', $1, $1)`, [fgima])
          .catch((e) => (e as Error).message),
      ).toMatch(/mismo_valor/);
      const sector = (
        await bd.instalacion.query(
          `INSERT INTO inventario.catalogo_sectores (nombre) VALUES ('Banca') RETURNING id`,
        )
      ).rows[0].id;
      expect(
        await panel
          .query(`SELECT inventario.fusionar_valor('tecnologia', $1, $2)`, [fgima, sector])
          .catch((e) => (e as Error).message),
      ).toMatch(/distinto_catalogo/);
      const n = await panel.query(
        `SELECT count(*)::int n FROM inventario.perfil_tecnologias WHERE valor_id = $1`,
        [fgima],
      );
      expect(n.rows[0].n).toBe(2);
    });

    it("reasigna sin duplicar, sube la versión de los perfiles y retira el origen", async () => {
      const antes = await panel.query(
        `SELECT id, version FROM inventario.perfiles WHERE id = ANY($1) ORDER BY codigo`,
        [[perfilA, perfilB]],
      );
      const r = await panel.query(
        `SELECT perfil_id FROM inventario.fusionar_valor('tecnologia', $1, $2)`,
        [fgima, figma],
      );
      expect(r.rows.map((x) => x.perfil_id).sort()).toEqual([perfilA, perfilB].sort());
      const hijas = await panel.query(
        `SELECT perfil_id, valor_id FROM inventario.perfil_tecnologias WHERE perfil_id = ANY($1) ORDER BY perfil_id`,
        [[perfilA, perfilB]],
      );
      expect(hijas.rows).toHaveLength(2);
      expect(hijas.rows.every((h) => h.valor_id === figma)).toBe(true);
      const despues = await panel.query(
        `SELECT id, version FROM inventario.perfiles WHERE id = ANY($1) ORDER BY codigo`,
        [[perfilA, perfilB]],
      );
      despues.rows.forEach((d, k) => expect(d.version).toBeGreaterThan(antes.rows[k].version));
      const origen = await panel.query(
        `SELECT activo, fusionado_en_id FROM inventario.catalogo_tecnologias WHERE id = $1`,
        [fgima],
      );
      expect(origen.rows[0]).toEqual({ activo: false, fusionado_en_id: figma });
      // Ya retirado, no se vuelve a fusionar.
      expect(
        await panel
          .query(`SELECT inventario.fusionar_valor('tecnologia', $1, $2)`, [fgima, figma])
          .catch((e) => (e as Error).message),
      ).toMatch(/distinto_catalogo/);
    });
  });
});
