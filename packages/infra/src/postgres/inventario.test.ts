// Modelo mínimo de perfil publicable (EP-001 · sub-slice 3, tarea 3.1): V8-10 y V3-2 de ADR-0003/0008
// con roles reales por PgBouncer. `ps_portal` no lee tablas base; `catalogo_publicable` solo devuelve
// perfiles publicados con consentimiento vigente y sin campos de la lista negra B.4.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import {
  EXCEPCION,
  HAY_BD,
  PERMISO_DENEGADO,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";

// Nombres de campo del Anexo B.4 (foto, contacto, CV, motivación, promedio, certificaciones, DISC).
const B4 = [
  "foto",
  "fotografia",
  "correo",
  "email",
  "telefono",
  "celular",
  "linkedin",
  "redes",
  "hoja_de_vida",
  "cv",
  "motivacion",
  "proyeccion",
  "promedio",
  "certificaciones",
  "disc",
  "segundo_nombre",
  "segundo_apellido",
  "tarifa",
];

const COLUMNAS_CATALOGO = [
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
];

describe.skipIf(!HAY_BD)("inventario mínimo y catálogo publicable (V8-10, V3-2)", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;

  const perfil = async (
    codigo: string,
    estado: string,
    opciones: { consentimiento?: "vigente" | "revocado" | null; liberaEn?: string } = {},
  ) => {
    const i = bd.instalacion;
    const f = await i.query(
      `SELECT id FROM inventario.catalogo_familias WHERE nombre = 'Desarrollo'`,
    );
    const p = await i.query(
      `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido, estado, familia_id, anios_experiencia,
         disponibilidad_fecha, disponibilidad_actualizada_en)
       VALUES ($1, 'Laura', 'Méndez', 'borrador', $2, 8, current_date, now()) RETURNING id`,
      [codigo, f.rows[0].id],
    );
    const id = p.rows[0].id as string;
    const rol = await i.query(
      `SELECT id FROM inventario.catalogo_roles WHERE nombre = 'Desarrollador backend'`,
    );
    await i.query(
      `INSERT INTO inventario.perfil_roles (perfil_id, valor_id, orden) VALUES ($1, $2, 1)`,
      [id, rol.rows[0].id],
    );
    const consentimiento =
      opciones.consentimiento === undefined ? "vigente" : opciones.consentimiento;
    if (consentimiento) {
      await i.query(
        `INSERT INTO inventario.consentimientos (perfil_id, alcance, vigente, revocado_en)
         VALUES ($1, 'nombre, trayectoria y clientes nombrados', $2, $3)`,
        [id, consentimiento === "vigente", consentimiento === "revocado" ? new Date() : null],
      );
    }
    if (estado !== "borrador") {
      await i.query(
        `UPDATE inventario.perfiles SET estado = $2, fecha_liberacion = $3 WHERE id = $1`,
        [id, estado, opciones.liberaEn ?? null],
      );
    }
    return id;
  };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    const i = bd.instalacion;
    const fam = await i.query(
      `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Desarrollo') RETURNING id`,
    );
    await i.query(
      `INSERT INTO inventario.catalogo_roles (nombre, familia_id) VALUES ('Desarrollador backend', $1)`,
      [fam.rows[0].id],
    );
    await perfil("PS-0001", "publicado");
    await perfil("PS-0002", "borrador");
    await perfil("PS-0003", "pausado");
    await perfil("PS-0004", "archivado");
    await perfil("PS-0005", "colocado", { liberaEn: "2026-12-01" });
    // Publicado y luego revocado el consentimiento: deja de ser publicable aunque su estado no cambie.
    const revocado = await perfil("PS-0006", "publicado");
    await i.query(
      `UPDATE inventario.consentimientos SET vigente = false, revocado_en = now() WHERE perfil_id = $1`,
      [revocado],
    );
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("ps_portal no alcanza las tablas base (V3-2)", () => {
    for (const tabla of [
      "inventario.perfiles",
      "inventario.perfil_roles",
      "inventario.perfil_tecnologias",
      "inventario.perfil_sectores",
      "inventario.consentimientos",
      "inventario.catalogo_roles",
    ]) {
      it(`SELECT en ${tabla} → permiso denegado`, async () => {
        expect(await codigoDeError(portal.query(`SELECT 1 FROM ${tabla} LIMIT 1`))).toBe(
          PERMISO_DENEGADO,
        );
      });
    }
    it("escribir inventario → permiso denegado", async () => {
      expect(
        await codigoDeError(
          portal.query(
            `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido, estado) VALUES ('PS-9999', 'x', 'y', 'borrador')`,
          ),
        ),
      ).toBe(PERMISO_DENEGADO);
    });
  });

  describe("catalogo_publicable", () => {
    it("solo devuelve perfiles publicados con consentimiento vigente", async () => {
      const r = await portal.query(
        `SELECT codigo FROM operacion.catalogo_publicable ORDER BY codigo`,
      );
      expect(r.rows.map((f) => f.codigo)).toEqual(["PS-0001"]);
    });

    it("expone exactamente la lista blanca de columnas, sin ningún nombre de B.4", async () => {
      const r = await portal.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'operacion' AND table_name = 'catalogo_publicable' ORDER BY ordinal_position`,
      );
      const columnas = r.rows.map((f) => f.column_name as string);
      expect(columnas).toEqual(COLUMNAS_CATALOGO);
      for (const c of columnas) for (const b of B4) expect(c, `${c} ~ ${b}`).not.toContain(b);
    });

    it("trae nombre y primer apellido, rol y familia del perfil publicado", async () => {
      const r = await portal.query(
        `SELECT * FROM operacion.catalogo_publicable WHERE codigo = 'PS-0001'`,
      );
      expect(r.rows[0]).toMatchObject({
        nombre: "Laura",
        primer_apellido: "Méndez",
        familia: "Desarrollo",
        roles: ["Desarrollador backend"],
        anios_experiencia: 8,
      });
    });

    it("es security_barrier y su dueño no puede iniciar sesión", async () => {
      const r = await bd.instalacion.query(
        `SELECT c.reloptions, r.rolcanlogin FROM pg_class c JOIN pg_roles r ON r.oid = c.relowner
          WHERE c.oid = 'operacion.catalogo_publicable'::regclass`,
      );
      expect(r.rows[0].reloptions).toContain("security_barrier=true");
      expect(r.rows[0].rolcanlogin).toBe(false);
    });
  });

  describe("estado_enlace_perfil (RF-19.2)", () => {
    it("da el estado público de cada código, sin omitir ninguno y sin datos del perfil", async () => {
      const r = await portal.query(
        `SELECT codigo, estado, libera_en::text FROM operacion.estado_enlace_perfil ORDER BY codigo`,
      );
      expect(r.rows).toEqual([
        { codigo: "PS-0001", estado: "disponible", libera_en: null },
        { codigo: "PS-0002", estado: "fuera_del_banco", libera_en: null },
        { codigo: "PS-0003", estado: "pausado", libera_en: null },
        { codigo: "PS-0004", estado: "fuera_del_banco", libera_en: null },
        { codigo: "PS-0005", estado: "colocado", libera_en: "2026-12-01" },
        { codigo: "PS-0006", estado: "fuera_del_banco", libera_en: null },
      ]);
      const cols = await portal.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'operacion' AND table_name = 'estado_enlace_perfil' ORDER BY ordinal_position`,
      );
      expect(cols.rows.map((f) => f.column_name)).toEqual(["codigo", "estado", "libera_en"]);
    });
  });

  describe("reglas del modelo en la BD", () => {
    it("un perfil no pasa a publicado sin consentimiento vigente (RF-8.4)", async () => {
      const id = await perfil("PS-0101", "borrador", { consentimiento: null });
      expect(
        await codigoDeError(
          bd.instalacion.query(
            `UPDATE inventario.perfiles SET estado = 'publicado' WHERE id = $1`,
            [id],
          ),
        ),
      ).toBe(EXCEPCION);
    });

    it("colocado exige fecha de liberación y solo colocado la lleva", async () => {
      const id = await perfil("PS-0102", "borrador");
      expect(
        await codigoDeError(
          bd.instalacion.query(`UPDATE inventario.perfiles SET estado = 'colocado' WHERE id = $1`, [
            id,
          ]),
        ),
      ).not.toBeNull();
      expect(
        await codigoDeError(
          bd.instalacion.query(
            `UPDATE inventario.perfiles SET fecha_liberacion = '2027-01-01' WHERE id = $1`,
            [id],
          ),
        ),
      ).not.toBeNull();
    });

    it("el código sigue el formato PS-NNNN", async () => {
      expect(
        await codigoDeError(
          bd.instalacion.query(
            `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido, estado) VALUES ('X-1', 'a', 'b', 'borrador')`,
          ),
        ),
      ).not.toBeNull();
    });

    it("sin borrado físico: ps_panel no puede hacer DELETE de perfiles ni consentimientos (CON-11)", async () => {
      expect(await codigoDeError(panel.query(`DELETE FROM inventario.perfiles`))).toBe(
        PERMISO_DENEGADO,
      );
      expect(await codigoDeError(panel.query(`DELETE FROM inventario.consentimientos`))).toBe(
        PERMISO_DENEGADO,
      );
    });

    it("toda escritura del perfil sube su version (CRN-15)", async () => {
      const id = await perfil("PS-0103", "borrador");
      const antes = (
        await bd.instalacion.query(`SELECT version FROM inventario.perfiles WHERE id = $1`, [id])
      ).rows[0].version;
      await panel.query(`UPDATE inventario.perfiles SET anios_experiencia = 9 WHERE id = $1`, [id]);
      const despues = (
        await bd.instalacion.query(`SELECT version FROM inventario.perfiles WHERE id = $1`, [id])
      ).rows[0].version;
      expect(despues).toBe(antes + 1);
    });
  });
});
