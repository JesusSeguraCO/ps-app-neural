// Migración 0018 (EP-006 · sub-slice 6; HU-130 edge, HU-140): validaciones. El portal no lee la tabla
// (solo la vista de la ficha), nada se borra (CON-11), una confirmada exige lo que escribe la persona,
// hay un solo borrador pendiente por perfil y la vista solo muestra el reporte de la modalidad elegida
// hoy. La regla V3-7 la cubre migracion-0013.test.ts.
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
const VIOLACION_UNICA = "23505";

describe.skipIf(!HAY_BD)("migración 0018: validaciones", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;
  let admin: string;
  let perfil: string;
  let modalidad: string;
  let otraModalidad: string;

  const insertar = (extra: Record<string, unknown> = {}) => {
    const v = {
      estado: "borrador",
      evaluador: null,
      fecha: null,
      resultado: null,
      confirmada_por: null,
      confirmada_en: null,
      modalidad,
      ...extra,
    };
    return panel.query(
      `INSERT INTO inventario.validaciones
         (perfil_id, modalidad_prueba_id, estado, criterios, plantilla, origen, evaluador, fecha, resultado, creada_por, confirmada_por, confirmada_en)
       VALUES ($1, $2, $3, '{Diseño}', '{}', '{}', $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        perfil,
        v.modalidad,
        v.estado,
        v.evaluador,
        v.fecha,
        v.resultado,
        admin,
        v.confirmada_por,
        v.confirmada_en,
      ],
    );
  };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    const q = (s: string, p: unknown[] = []) => bd.instalacion.query(s, p);
    admin = (
      await q(`INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol)
               VALUES ('valida@trycore.com', '\\x0202', 'administrador') RETURNING id`)
    ).rows[0].id;
    const familia = (
      await q(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Desarrollo') RETURNING id`,
      )
    ).rows[0].id;
    modalidad = (
      await q(
        `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente) VALUES ($1, 'Reto', 'Validada con un reto.') RETURNING id`,
        [familia],
      )
    ).rows[0].id;
    otraModalidad = (
      await q(
        `INSERT INTO inventario.catalogo_modalidades_prueba (familia_id, nombre, texto_cliente) VALUES ($1, 'Caso', 'Validada con un caso.') RETURNING id`,
        [familia],
      )
    ).rows[0].id;
    perfil = (
      await q(
        `INSERT INTO inventario.perfiles (codigo, estado, nombre, primer_apellido, familia_id, modalidad_prueba_id)
               VALUES ('PS-0901', 'borrador', 'Ana', 'Ríos', $1, $2) RETURNING id`,
        [familia, modalidad],
      )
    ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("el portal no lee validaciones; el panel no las borra", async () => {
    expect(await codigoDeError(portal.query(`SELECT 1 FROM inventario.validaciones`))).toBe(
      PERMISO_DENEGADO,
    );
    expect(await codigoDeError(panel.query(`DELETE FROM inventario.validaciones`))).toBe(
      PERMISO_DENEGADO,
    );
  });

  it("un solo borrador pendiente por perfil", async () => {
    await insertar();
    expect(await codigoDeError(insertar())).toBe(VIOLACION_UNICA);
  });

  it("confirmada exige evaluador, fecha, resultado, criterios y autoría", async () => {
    expect(await codigoDeError(insertar({ estado: "confirmada" }))).toBe(VIOLACION_CHECK);
    const ok = await insertar({
      estado: "confirmada",
      evaluador: "Célula de arquitectura",
      fecha: "2026-09-28",
      resultado: "Aprobada",
      confirmada_por: admin,
      confirmada_en: new Date(),
    });
    expect(ok.rowCount).toBe(1);
  });

  it("la vista de la ficha solo trae el reporte de la modalidad elegida hoy", async () => {
    // La vista filtra publicados con consentimiento: se comprueba con el dueño de la instalación.
    const reporte = async () =>
      (
        await bd.instalacion.query(
          `SELECT v.resultado FROM inventario.perfiles p
             LEFT JOIN LATERAL (SELECT x.resultado FROM inventario.validaciones x
                                 WHERE x.perfil_id = p.id AND x.estado = 'confirmada'
                                   AND x.modalidad_prueba_id = p.modalidad_prueba_id
                                 ORDER BY x.confirmada_en DESC LIMIT 1) v ON true
            WHERE p.id = $1`,
          [perfil],
        )
      ).rows[0].resultado;
    expect(await reporte()).toBe("Aprobada");
    await bd.instalacion.query(
      `UPDATE inventario.perfiles SET modalidad_prueba_id = $2 WHERE id = $1`,
      [perfil, otraModalidad],
    );
    expect(await reporte()).toBeNull();
    const cols = (
      await bd.instalacion.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'operacion' AND table_name = 'ficha_publicable' ORDER BY ordinal_position`,
      )
    ).rows.map((r) => r.column_name);
    expect(cols).toEqual([
      "codigo",
      "resumen",
      "sello_personal",
      "formacion",
      "idiomas",
      "enunciado_prueba",
      "incluye_clientes",
      "reporte_modalidad",
      "reporte_resultado",
      "reporte_evaluador",
      "reporte_fecha",
      "reporte_criterios",
    ]);
  });
});
