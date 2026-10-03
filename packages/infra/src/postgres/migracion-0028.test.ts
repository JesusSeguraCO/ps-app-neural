// Migración 0028 (EP-003 · sub-slice 1, tareas 1.4 y 1.7; HU-176, HU-177): SARO y DISC en el perfil.
//  - `saro_alcance_id` (FK al catálogo cerrado), `saro_fecha` y `disc_fecha` con CHECK de fecha no
//    futura en America/Bogota (defensa en profundidad: la regla y su mensaje son del dominio).
//  - El disparador de publicar exige además los tres datos al ENTRAR en publicado: ninguna vía (SQL con
//    `ps_panel`, importación, reversión) publica sin ellos. Un publicado que ya estaba no se toca (D62).
//  - `ficha_publicable` gana el texto del alcance (también desactivado), la fecha SARO y la DISC;
//    `catalogo_publicable` gana el Sello Personal y conserva el orden de carga de las tecnologías.
//    Nada de la lista negra B.4 ni `vinculo`/`aporte` aparece en ninguna vista que lee el portal.
//  - La fusión de alcances reasigna los perfiles (misma función que los demás catálogos).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import {
  EXCEPCION,
  HAY_BD,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";
import { darModalidadDePrueba } from "../pruebas/modalidad-prueba";
import { MIGRACIONES } from "../../migraciones/indice";

const VIOLACION_CHECK = "23514";
const VIOLACION_FK = "23503";

// Fecha civil de Bogotá desplazada `dias` desde hoy.
const diaBogota = (dias: number) =>
  new Date(Date.now() - 5 * 3_600_000 + dias * 86_400_000).toISOString().slice(0, 10);

describe("índice: la 0028 está registrada", () => {
  it("0028_saro_disc_perfil en el proveedor estático", () => {
    expect(Object.keys(MIGRACIONES)).toContain("0028_saro_disc_perfil");
  });
});

describe.skipIf(!HAY_BD)("migración 0028: SARO y DISC en el perfil", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;
  let alcance: string;
  let otroAlcance: string;
  let n = 0;

  // Un borrador con consentimiento nominal vigente y modalidad de prueba de su familia: lo único que le
  // falta para entrar en publicado es lo que cada test le dé de SARO/DISC.
  const borrador = async (
    saro: { alcance?: string | null; fecha?: string | null; disc?: string | null } = {},
  ) => {
    const i = bd.instalacion;
    const codigo = `PS-${String(9000 + ++n)}`;
    const id = (
      await i.query(
        `INSERT INTO inventario.perfiles (codigo, nombre, primer_apellido, saro_alcance_id, saro_fecha, disc_fecha)
         VALUES ($1, 'Ana', 'Ruiz', $2, $3, $4) RETURNING id`,
        [codigo, saro.alcance ?? null, saro.fecha ?? null, saro.disc ?? null],
      )
    ).rows[0].id as string;
    await i.query(
      `INSERT INTO inventario.consentimientos (perfil_id, alcance) VALUES ($1, 'nominal')`,
      [id],
    );
    await darModalidadDePrueba(i, id, { validacionesDeEntrada: false });
    return { id, codigo };
  };
  const publicarComoPanel = (id: string) =>
    panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE id = $1`, [id]);

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    alcance = (
      await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente)
         VALUES ('Antecedentes judiciales, disciplinarios y fiscales', 'Verificamos antecedentes judiciales, disciplinarios y fiscales.') RETURNING id`,
      )
    ).rows[0].id;
    otroAlcance = (
      await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente)
         VALUES ('Antecedentes judiciales', 'Verificamos antecedentes judiciales.') RETURNING id`,
      )
    ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("columnas y CHECK", () => {
    it("fecha SARO o DISC posterior a hoy (Bogotá) → CHECK; hoy y antes se aceptan", async () => {
      const { id } = await borrador();
      for (const col of ["saro_fecha", "disc_fecha"]) {
        expect(
          await codigoDeError(
            panel.query(`UPDATE inventario.perfiles SET ${col} = $2 WHERE id = $1`, [
              id,
              diaBogota(2),
            ]),
          ),
        ).toBe(VIOLACION_CHECK);
        expect(
          (
            await panel.query(`UPDATE inventario.perfiles SET ${col} = $2 WHERE id = $1`, [
              id,
              diaBogota(0),
            ])
          ).rowCount,
        ).toBe(1);
      }
    });

    it("el alcance es una FK al catálogo cerrado: un id que no existe → violación de FK", async () => {
      const { id } = await borrador();
      expect(
        await codigoDeError(
          panel.query(
            `UPDATE inventario.perfiles SET saro_alcance_id = gen_random_uuid() WHERE id = $1`,
            [id],
          ),
        ),
      ).toBe(VIOLACION_FK);
    });
  });

  describe("guarda de publicar en la BD (tarea 1.7: SQL como ps_panel)", () => {
    it.each([
      [
        "sin alcance SARO",
        { fecha: diaBogota(-10), disc: diaBogota(-5) },
        /alcance de la verificación SARO/,
      ],
      ["sin fecha SARO", { alcance: "A", disc: diaBogota(-5) }, /fecha de la verificación SARO/],
      ["sin fecha DISC", { alcance: "A", fecha: diaBogota(-10) }, /fecha de la evaluación DISC/],
    ])("%s → excepción y el perfil sigue en borrador", async (_, saro, mensaje) => {
      const { id } = await borrador({
        ...saro,
        alcance: (saro as { alcance?: string }).alcance ? alcance : null,
      });
      const e = await publicarComoPanel(id).catch((x: Error & { code?: string }) => x);
      expect((e as { code?: string }).code).toBe(EXCEPCION);
      expect((e as Error).message).toMatch(mensaje);
      const estado = (
        await bd.instalacion.query(`SELECT estado FROM inventario.perfiles WHERE id = $1`, [id])
      ).rows[0].estado;
      expect(estado).toBe("borrador");
    });

    it("con los tres datos entra en publicado", async () => {
      const { id } = await borrador({ alcance, fecha: diaBogota(-10), disc: diaBogota(-5) });
      expect((await publicarComoPanel(id)).rowCount).toBe(1);
    });

    it("un publicado que ya estaba no se toca al editar otra columna (D62: sigue visible)", async () => {
      const { id } = await borrador({ alcance, fecha: diaBogota(-10), disc: diaBogota(-5) });
      await publicarComoPanel(id);
      // Quitarle el dato a un publicado es otra regla (HU-178/HU-191): la BD no lo expulsa.
      expect(
        (
          await panel.query(
            `UPDATE inventario.perfiles SET disc_fecha = NULL, resumen = 'otro' WHERE id = $1`,
            [id],
          )
        ).rowCount,
      ).toBe(1);
    });

    it("un alcance desactivado asignado sigue contando como registrado (HU-177 edge)", async () => {
      const { id } = await borrador({
        alcance: otroAlcance,
        fecha: diaBogota(-10),
        disc: diaBogota(-5),
      });
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_alcances_saro SET activo = false WHERE id = $1`,
        [otroAlcance],
      );
      expect((await publicarComoPanel(id)).rowCount).toBe(1);
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_alcances_saro SET activo = true WHERE id = $1`,
        [otroAlcance],
      );
    });
  });

  describe("vistas del portal", () => {
    it("ficha_publicable trae el texto del alcance (también desactivado), la fecha SARO y la DISC; el portal la lee", async () => {
      const { id, codigo } = await borrador({
        alcance: otroAlcance,
        fecha: "2026-03-15",
        disc: "2026-04-10",
      });
      await publicarComoPanel(id);
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_alcances_saro SET activo = false WHERE id = $1`,
        [otroAlcance],
      );
      const f = (
        await portal.query(
          `SELECT saro_texto, saro_fecha::text AS saro_fecha, disc_fecha::text AS disc_fecha
             FROM operacion.ficha_publicable WHERE codigo = $1`,
          [codigo],
        )
      ).rows[0];
      expect(f).toEqual({
        saro_texto: "Verificamos antecedentes judiciales.",
        saro_fecha: "2026-03-15",
        disc_fecha: "2026-04-10",
      });
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_alcances_saro SET activo = true WHERE id = $1`,
        [otroAlcance],
      );
    });

    it("catalogo_publicable trae el Sello Personal y las tecnologías en orden de carga", async () => {
      const { id, codigo } = await borrador({
        alcance,
        fecha: diaBogota(-10),
        disc: diaBogota(-5),
      });
      const i = bd.instalacion;
      await i.query(
        `UPDATE inventario.perfiles SET sello_personal = '{Comunicación clara,Autonomía}' WHERE id = $1`,
        [id],
      );
      for (const [orden, nombre] of [
        [1, "Kotlin"],
        [2, "Angular"],
        [3, "AWS"],
      ] as const) {
        const t = (
          await i.query(
            `INSERT INTO inventario.catalogo_tecnologias (nombre) VALUES ($1)
             ON CONFLICT (nombre_normal) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id`,
            [nombre],
          )
        ).rows[0].id;
        await i.query(
          `INSERT INTO inventario.perfil_tecnologias (perfil_id, valor_id, orden) VALUES ($1, $2, $3)`,
          [id, t, orden],
        );
      }
      await publicarComoPanel(id);
      const c = (
        await portal.query(
          `SELECT sello_personal, tecnologias FROM operacion.catalogo_publicable WHERE codigo = $1`,
          [codigo],
        )
      ).rows[0];
      expect(c).toEqual({
        sello_personal: ["Comunicación clara", "Autonomía"],
        tecnologias: ["Kotlin", "Angular", "AWS"],
      });
    });

    it("ninguna vista que lee el portal expone la lista negra B.4, `vinculo` ni `aporte`", async () => {
      const r = await bd.instalacion.query(
        `SELECT table_name, column_name FROM information_schema.columns
          WHERE table_schema = 'operacion'
            AND table_name IN (SELECT table_name FROM information_schema.role_table_grants
                                WHERE grantee = 'ps_portal' AND table_schema = 'operacion')`,
      );
      const prohibidas =
        /^(vinculo|aporte|foto.*|correo.*|telefono.*|contacto.*|hoja_de_vida|cv.*|motivacion.*|proyeccion.*|disc_detalle.*|disc_detallado|promedio.*|certificacion.*)$/;
      const fugas = r.rows
        .filter((f) => prohibidas.test(f.column_name))
        .map((f) => `${f.table_name}.${f.column_name}`)
        // Las vistas de acceso del cliente (no de perfiles) llevan el correo del invitado: fuera de B.4.
        .filter((x) => !/^(invitados_portal|enlaces_portal|contacto_trycore)\./.test(x));
      expect(fugas).toEqual([]);
      const ficha = r.rows
        .filter((f) => f.table_name === "ficha_publicable")
        .map((f) => f.column_name);
      expect(ficha).toEqual(expect.arrayContaining(["saro_texto", "saro_fecha", "disc_fecha"]));
      expect(ficha).not.toContain("saro_alcance_id");
    });
  });

  describe("fusión de alcances (HU-143 reutilizada)", () => {
    it("fusionar_valor('alcance_saro') reasigna los perfiles y retira el origen", async () => {
      const origen = (
        await bd.instalacion.query(
          `INSERT INTO inventario.catalogo_alcances_saro (nombre, texto_cliente) VALUES ('Antecedentes disciplinarios', 'Verificamos antecedentes disciplinarios.') RETURNING id`,
        )
      ).rows[0].id;
      const { id } = await borrador({ alcance: origen });
      const r = await panel.query(
        `SELECT perfil_id FROM inventario.fusionar_valor('alcance_saro', $1, $2)`,
        [origen, alcance],
      );
      expect(r.rows.map((x) => x.perfil_id)).toEqual([id]);
      const p = (
        await bd.instalacion.query(
          `SELECT saro_alcance_id FROM inventario.perfiles WHERE id = $1`,
          [id],
        )
      ).rows[0];
      expect(p.saro_alcance_id).toBe(alcance);
      const o = (
        await bd.instalacion.query(
          `SELECT activo, fusionado_en_id FROM inventario.catalogo_alcances_saro WHERE id = $1`,
          [origen],
        )
      ).rows[0];
      expect(o).toEqual({ activo: false, fusionado_en_id: alcance });
    });
  });
});
