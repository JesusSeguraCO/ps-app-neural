// Migración 0014 (EP-006 · sub-slice 2, tarea 2.1): columnas del perfil del Anexo B sin ninguna de la
// lista negra B.4, borrador sin identidad completa, trayectoria con el cliente separado, consentimiento
// nominal con su autor y la proyección de la trayectoria para el portal. V3-2 con roles reales; la
// regla V3-7 la cubre migracion-0013.test.ts para toda migración ≥ 0013.
import { darModalidadDePrueba } from "../pruebas/modalidad-prueba";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import {
  HAY_BD,
  PERMISO_DENEGADO,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";

const VIOLACION_CHECK = "23514";

describe.skipIf(!HAY_BD)("migración 0014: perfil del Anexo B y consentimiento nominal", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;

  const perfil = async (codigo: string) =>
    (
      await panel.query(
        `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido) VALUES ($1, 'Ana', 'Ruiz') RETURNING id`,
        [codigo],
      )
    ).rows[0].id as string;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("ninguna columna del perfil ni de la trayectoria es de la lista negra B.4", async () => {
    const r = await bd.instalacion.query(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'inventario' AND table_name IN ('perfiles', 'perfil_experiencias', 'consentimientos')`,
    );
    const columnas = r.rows.map((f) => `${f.table_name}.${f.column_name}`);
    expect(columnas).toContain("perfiles.capacidad");
    expect(columnas).toContain("perfiles.sello_personal");
    expect(columnas).toContain("perfil_experiencias.cliente_nombrado");
    for (const c of columnas)
      expect(c).not.toMatch(
        /foto|correo|telefono|contacto|hoja_de_vida|\bcv\b|motivacion|proyeccion|promedio|certific|disc/,
      );
  });

  it("catalogo_publicable no gana columnas con la migración (lista blanca de EP-001)", async () => {
    const r = await bd.instalacion.query(
      `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'operacion' AND table_name = 'catalogo_publicable' ORDER BY ordinal_position`,
    );
    expect(r.rows.map((f) => f.column_name)).toEqual([
      "codigo",
      "nombre",
      "primer_apellido",
      "familia",
      "roles",
      "seniority",
      "anios_experiencia",
      "tecnologias",
      "sectores",
      "modalidad",
      "pais",
      "ciudad",
      "disponibilidad_fecha",
      "disponibilidad_actualizada_en",
    ]);
  });

  it("un borrador se guarda sin nombre ni apellido; fuera de borrador la BD los exige", async () => {
    const r = await panel.query(
      `INSERT INTO inventario.perfiles (codigo, origen_creacion) VALUES ('PS-7001', 'panel') RETURNING id, estado`,
    );
    expect(r.rows[0].estado).toBe("borrador");
    await bd.instalacion.query(
      `INSERT INTO inventario.consentimientos (perfil_id, alcance) VALUES ($1, 'prueba')`,
      [r.rows[0].id],
    );
    // Con lo que exige el disparador de publicar (0017), solo queda el CHECK de identidad.
    await darModalidadDePrueba(bd.instalacion, r.rows[0].id);
    expect(
      await codigoDeError(
        panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE id = $1`, [
          r.rows[0].id,
        ]),
      ),
    ).toBe(VIOLACION_CHECK);
  });

  it("el consentimiento no nominal no se registra (HU-127, defensa en profundidad)", async () => {
    const id = await perfil("PS-7002");
    expect(
      await codigoDeError(
        panel.query(
          `INSERT INTO inventario.consentimientos (perfil_id, alcance, nominal) VALUES ($1, 'anonimizado', false)`,
          [id],
        ),
      ),
    ).toBe(VIOLACION_CHECK);
  });

  it("V3-2: el portal no lee la trayectoria cruda ni puede borrarla nadie", async () => {
    expect(await codigoDeError(portal.query(`SELECT * FROM inventario.perfil_experiencias`))).toBe(
      PERMISO_DENEGADO,
    );
    expect(await codigoDeError(panel.query(`DELETE FROM inventario.perfil_experiencias`))).toBe(
      PERMISO_DENEGADO,
    );
  });

  it("la proyección de la trayectoria oculta el cliente sin consentimiento de clientes y los borradores", async () => {
    const parcial = await perfil("PS-7003");
    const completo = await perfil("PS-7004");
    const borrador = await perfil("PS-7005");
    for (const [id, cliente] of [
      [parcial, "Bancolombia"],
      [completo, "Sura"],
      [borrador, "Davivienda"],
    ] as const)
      await panel.query(
        `INSERT INTO inventario.perfil_experiencias (perfil_id, orden, cargo, cliente_nombrado, desde, hasta, descripcion)
         VALUES ($1, 1, 'Backend senior', $2, 2021, 2026, 'Pagos inmediatos con Java')`,
        [id, cliente],
      );
    await panel.query(
      `INSERT INTO inventario.consentimientos (perfil_id, alcance, incluye_clientes) VALUES ($1, 'parcial', false), ($2, 'completo', true)`,
      [parcial, completo],
    );
    for (const id of [parcial, completo]) await darModalidadDePrueba(bd.instalacion, id);
    await panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE id = ANY($1)`, [
      [parcial, completo],
    ]);
    const r = await portal.query(
      `SELECT codigo, cliente, descripcion FROM operacion.experiencias_publicables WHERE codigo LIKE 'PS-700%' ORDER BY codigo`,
    );
    expect(r.rows).toEqual([
      { codigo: "PS-7003", cliente: null, descripcion: "Pagos inmediatos con Java" },
      { codigo: "PS-7004", cliente: "Sura", descripcion: "Pagos inmediatos con Java" },
    ]);
  });

  it("revocar deja la trayectoria fuera de la proyección", async () => {
    await panel.query(
      `UPDATE inventario.consentimientos SET vigente = false, revocado_en = now()
        WHERE perfil_id = (SELECT id FROM inventario.perfiles WHERE codigo = 'PS-7004')`,
    );
    const r = await portal.query(
      `SELECT 1 FROM operacion.experiencias_publicables WHERE codigo = 'PS-7004'`,
    );
    expect(r.rowCount).toBe(0);
  });

  it("una experiencia retirada exige su fecha (sin borrado)", async () => {
    const id = await perfil("PS-7006");
    expect(
      await codigoDeError(
        panel.query(
          `INSERT INTO inventario.perfil_experiencias (perfil_id, orden, cargo, descripcion, vigente) VALUES ($1, 1, 'QA', 'x', false)`,
          [id],
        ),
      ),
    ).toBe(VIOLACION_CHECK);
  });
});
