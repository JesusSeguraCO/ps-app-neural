// Migración 0015 (EP-006 · sub-slice 3, tarea 3.4 y 3.5): lotes de importación calculados, sus filas
// y las plantillas de emparejamiento. Nada se borra (CON-11), el portal no ve nada (V3-2) y las filas
// del lote no guardan columnas de la lista negra B.4. La regla V3-7 la cubre migracion-0013.test.ts.
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
const HASH = "a".repeat(64);

describe.skipIf(!HAY_BD)(
  "migración 0015: lotes de importación y plantillas de emparejamiento",
  () => {
    let bd: BdPrueba;
    let portal: pg.Pool;
    let panel: pg.Pool;
    let worker: pg.Pool;
    let admin: string;

    const lote = async (extra: Record<string, unknown> = {}) => {
      const v = { modo: "crear_y_actualizar", formato: "tsv", total_filas: 2, ...extra };
      return (
        await panel.query(
          `INSERT INTO inventario.lotes_importacion (modo, formato, archivo_hash, total_filas, conteos, emparejamiento, bloqueado, creado_por)
         VALUES ($1, $2, $3, $4, '{}', '[]', false, $5) RETURNING id, estado`,
          [v.modo, v.formato, HASH, v.total_filas, admin],
        )
      ).rows[0] as { id: string; estado: string };
    };

    beforeAll(async () => {
      bd = await crearBdPrueba();
      portal = bd.como("ps_portal");
      panel = bd.como("ps_panel");
      worker = bd.como("ps_worker");
      admin = (
        await bd.instalacion.query(
          `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol)
         VALUES ('importa@trycore.com', '\\x0101', 'administrador') RETURNING id`,
        )
      ).rows[0].id;
    }, 60_000);

    afterAll(async () => {
      await bd?.cerrar();
    });

    it("un lote nace calculado, con su modo y formato válidos", async () => {
      expect((await lote()).estado).toBe("calculado");
      expect(await codigoDeError(lote({ modo: "reemplazar" }))).toBe(VIOLACION_CHECK);
      expect(await codigoDeError(lote({ formato: "xlsx" }))).toBe(VIOLACION_CHECK);
      expect(await codigoDeError(lote({ total_filas: 201 }))).toBe(VIOLACION_CHECK);
    });

    it("las filas del lote guardan grupo y celdas emparejadas, con código bien formado", async () => {
      const { id } = await lote();
      await panel.query(
        `INSERT INTO inventario.lote_filas (lote_id, numero, codigo, grupo, datos)
       VALUES ($1, 2, 'PS-0142', 'actualizado', '{"disponibilidad":"2026-12-01"}'), ($1, 3, NULL, 'con_error', '{}')`,
        [id],
      );
      expect(
        await codigoDeError(
          panel.query(
            `INSERT INTO inventario.lote_filas (lote_id, numero, codigo, grupo, datos) VALUES ($1, 4, 'X', 'nuevo', '{}')`,
            [id],
          ),
        ),
      ).toBe(VIOLACION_CHECK);
      expect(
        await codigoDeError(
          panel.query(
            `INSERT INTO inventario.lote_filas (lote_id, numero, codigo, grupo, datos) VALUES ($1, 5, 'PS-0001', 'publicado', '{}')`,
            [id],
          ),
        ),
      ).toBe(VIOLACION_CHECK);
    });

    it("ninguna columna de los lotes ni de las plantillas es de la lista negra B.4", async () => {
      const r = await bd.instalacion.query(
        `SELECT table_name || '.' || column_name AS c FROM information_schema.columns
        WHERE table_schema = 'inventario'
          AND table_name IN ('lotes_importacion', 'lote_filas', 'plantillas_emparejamiento')`,
      );
      const columnas = r.rows.map((f) => f.c as string);
      expect(columnas).toContain("lote_filas.datos");
      expect(columnas).toContain("plantillas_emparejamiento.columnas");
      for (const c of columnas)
        expect(c).not.toMatch(
          /foto|correo|telefono|contacto|hoja_de_vida|\bcv\b|motivacion|promedio|disc/,
        );
    });

    it("la BD rechaza en datos una clave que no es un campo del formato", async () => {
      const { id } = await lote();
      expect(
        await codigoDeError(
          panel.query(
            `INSERT INTO inventario.lote_filas (lote_id, numero, codigo, grupo, datos) VALUES ($1, 2, 'PS-0142', 'nuevo', '{"telefono":"300"}')`,
            [id],
          ),
        ),
      ).toBe(VIOLACION_CHECK);
    });

    it("plantilla: nombre único sin distinguir mayúsculas ni acentos; columnas como arreglo", async () => {
      const insertar = (nombre: string, columnas = '[{"columna":"Cód.","clave":"codigo"}]') =>
        panel.query(
          `INSERT INTO inventario.plantillas_emparejamiento (nombre, columnas, creada_por, actualizada_por)
         VALUES ($1, $2::jsonb, $3, $3)`,
          [nombre, columnas, admin],
        );
      await insertar("Disponibilidad mensual");
      expect(await codigoDeError(insertar("disponibilidad  MENSUAL"))).toBe(VIOLACION_UNICA);
      expect(await codigoDeError(insertar("Otra", '{"a":1}'))).toBe(VIOLACION_CHECK);
      expect(await codigoDeError(insertar("   "))).toBe(VIOLACION_CHECK);
    });

    it("V3-2 y CON-11: el portal no lee nada; nadie borra; el worker lee y actualiza lotes", async () => {
      for (const t of ["lotes_importacion", "lote_filas", "plantillas_emparejamiento"]) {
        expect(await codigoDeError(portal.query(`SELECT 1 FROM inventario.${t}`)), t).toBe(
          PERMISO_DENEGADO,
        );
        expect(await codigoDeError(panel.query(`DELETE FROM inventario.${t}`)), t).toBe(
          PERMISO_DENEGADO,
        );
        expect(await codigoDeError(worker.query(`DELETE FROM inventario.${t}`)), t).toBe(
          PERMISO_DENEGADO,
        );
      }
      const { id } = await lote();
      const r = await worker.query(
        `UPDATE inventario.lotes_importacion SET estado = 'abortado', motivo_aborto = 'prueba' WHERE id = $1 RETURNING estado`,
        [id],
      );
      expect(r.rows[0].estado).toBe("abortado");
    });
  },
);
