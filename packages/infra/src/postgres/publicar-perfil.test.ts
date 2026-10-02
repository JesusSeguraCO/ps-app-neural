// Publicar contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 5; HU-128, HU-130): la guarda
// de ServicioPerfiles dice exactamente qué falta (consentimiento, modalidad de prueba, familia sin
// modalidades, datos obligatorios) y no escribe nada; el disparador de la 0017 impide publicar por
// cualquier otra vía (SQL como `ps_panel`); la publicación masiva publica los que cumplen y señala a
// los demás con su motivo sin abortar. El portal se comprueba leyendo con `ps_portal`.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { EXCEPCION, HAY_BD, codigoDeError, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import {
  crearPerfil,
  leerPerfil,
  publicarPerfil,
  publicarVarios,
  registrarConsentimiento,
} from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";
import { sembrarFicticios } from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};


async function rechazo(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("sin_rechazo");
}

describe.skipIf(!HAY_BD)("publicar un perfil (HU-128, HU-130)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };
  const ids = {} as Record<
    "rol" | "java" | "senior" | "medellin" | "hibrido" | "prueba" | "rolSinModalidad",
    string
  >;

  const id = async (tabla: string, nombre: string) =>
    (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
      .rows[0].id as string;

  const completo = (extra: Record<string, unknown> = {}) => ({
    nombre: "Lorena",
    primerApellido: "Salcedo",
    rolId: ids.rol,
    tecnologiaIds: [ids.java],
    seniorityId: ids.senior,
    aniosExperiencia: 8,
    ciudadId: ids.medellin,
    modalidadTrabajoId: ids.hibrido,
    disponibilidad: { opcion: "ahora" as const },
    modalidadPruebaId: ids.prueba,
    experiencias: [
      { cargo: "Backend senior", desde: 2021, hasta: 2026, descripcion: "Pagos inmediatos." },
    ],
    ...extra,
  });
  const nominal = { nombreApellido: true, trayectoria: true, clientes: true };

  const enPortal = async (codigo: string) =>
    (await portal.query(`SELECT 1 FROM operacion.catalogo_publicable WHERE codigo = $1`, [codigo]))
      .rowCount;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    await sembrarFicticios({ bd: bd.como("ps_panel"), auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({ bd: bd.como("ps_panel"), candidatas: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
    ids.rol = await id("catalogo_roles", "Desarrolladora backend Java");
    ids.java = await id("catalogo_tecnologias", "Java");
    ids.senior = await id("catalogo_seniorities", "Senior");
    ids.medellin = await id("catalogo_ciudades", "Medellín");
    ids.hibrido = await id("catalogo_modalidades", "hibrido");
    ids.prueba = await id(
      "catalogo_modalidades_prueba",
      "Prueba práctica revisada por un arquitecto",
    );
    // Una familia sin ninguna modalidad de prueba registrada (RF-8.16.4).
    const familia = (
      await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_familias (nombre) VALUES ('Diseño') RETURNING id`,
      )
    ).rows[0].id;
    ids.rolSinModalidad = (
      await bd.instalacion.query(
        `INSERT INTO inventario.catalogo_roles (nombre, familia_id) VALUES ('Diseñadora UX', $1) RETURNING id`,
        [familia],
      )
    ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("HU-128 · el bloqueo actúa", () => {
    it("sin consentimiento nominal no publica, dice qué falta y no escribe nada", async () => {
      const p = await crearPerfil(panel, claves, autor, completo());
      const e = await rechazo(publicarPerfil(panel, claves, autor, p.codigo, p.version));
      expect(e.motivo).toBe("no_publicable");
      const ev = e.detalle.evaluacion as {
        condiciones: Array<{ clave: string; cumple: boolean; detalle?: string }>;
      };
      expect(ev.condiciones.filter((c) => !c.cumple)).toEqual([
        expect.objectContaining({ clave: "consentimiento", detalle: "sin_registrar" }),
      ]);
      const despues = (await leerPerfil(panel, p.codigo))!;
      expect(despues.estado).toBe("borrador");
      expect(despues.version).toBe(p.version);
      expect(await enPortal(p.codigo)).toBe(0);
    });

    it("con consentimiento pero sin modalidad de prueba elegida no publica y lo dice", async () => {
      const p = await crearPerfil(panel, claves, autor, completo({ modalidadPruebaId: null }));
      const c = await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      const e = await rechazo(publicarPerfil(panel, claves, autor, c.codigo, c.version));
      const ev = e.detalle.evaluacion as {
        condiciones: Array<{ clave: string; cumple: boolean; detalle?: string }>;
      };
      expect(ev.condiciones.filter((x) => !x.cumple)).toEqual([
        expect.objectContaining({ clave: "modalidad_prueba", detalle: "sin_elegir" }),
      ]);
      expect((await leerPerfil(panel, p.codigo))!.estado).toBe("borrador");
    });

    it("con todo lo exigido publica, audita el cambio de estado y el portal lo ve", async () => {
      const p = await crearPerfil(panel, claves, autor, completo());
      const c = await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      const vInv = (await bd.instalacion.query(`SELECT version::int AS version FROM inventario.inventario_version`))
        .rows[0].version;
      const publicado = await publicarPerfil(panel, claves, autor, c.codigo, c.version);
      expect(publicado.estado).toBe("publicado");
      expect(await enPortal(p.codigo)).toBe(1);
      const aud = await bd.instalacion.query(
        `SELECT origen, actor IS NOT NULL AS hay FROM auditoria.auditoria WHERE entidad_id = $1 AND campo = 'estado' ORDER BY seq`,
        [p.id],
      );
      // Alta (→ borrador) y publicación (→ publicado), con su autor.
      expect(aud.rows).toEqual([{ origen: "panel", hay: true }, { origen: "panel", hay: true }]);
      const vDespues = (
        await bd.instalacion.query(`SELECT version::int AS version FROM inventario.inventario_version`)
      ).rows[0].version;
      expect(vDespues).toBe(vInv + 1);
    });

    it("409 si el perfil cambió desde que se abrió; un publicado no se vuelve a publicar", async () => {
      const p = await crearPerfil(panel, claves, autor, completo());
      const c = await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      expect(
        (await rechazo(publicarPerfil(panel, claves, autor, c.codigo, p.version))).motivo,
      ).toBe("version_distinta");
      const pub = await publicarPerfil(panel, claves, autor, c.codigo, c.version);
      expect(
        (await rechazo(publicarPerfil(panel, claves, autor, pub.codigo, pub.version))).motivo,
      ).toBe("transicion_invalida");
    });

    it("le faltan datos obligatorios: los nombra y no publica", async () => {
      const p = await crearPerfil(
        panel,
        claves,
        autor,
        completo({ tecnologiaIds: [], disponibilidad: null }),
      );
      const c = await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      const e = await rechazo(publicarPerfil(panel, claves, autor, c.codigo, c.version));
      const ev = e.detalle.evaluacion as { faltanDatos: Array<{ campo: string }> };
      expect(ev.faltanDatos.map((f) => f.campo)).toEqual(["tecnologias", "disponibilidad"]);
    });
  });

  describe("HU-130 · familia sin modalidades de prueba", () => {
    it("no publica y lo atribuye a la familia, no al perfil", async () => {
      const p = await crearPerfil(
        panel,
        claves,
        autor,
        completo({ rolId: ids.rolSinModalidad, modalidadPruebaId: null }),
      );
      const c = await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      const e = await rechazo(publicarPerfil(panel, claves, autor, c.codigo, c.version));
      const ev = e.detalle.evaluacion as {
        condiciones: Array<{ clave: string; cumple: boolean; detalle?: string }>;
      };
      expect(ev.condiciones.filter((x) => !x.cumple)).toEqual([
        expect.objectContaining({ clave: "modalidad_prueba", detalle: "familia_sin_modalidades" }),
      ]);
    });
  });

  describe("defensa en profundidad (disparador de la 0017)", () => {
    it("ninguna vía publica sin modalidad de prueba: SQL como ps_panel se rechaza", async () => {
      const p = await crearPerfil(panel, claves, autor, completo({ modalidadPruebaId: null }));
      await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      expect(
        await codigoDeError(
          panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo = $1`, [
            p.codigo,
          ]),
        ),
      ).toBe(EXCEPCION);
    });

    it("ninguna vía publica sin consentimiento: SQL como ps_panel se rechaza", async () => {
      const p = await crearPerfil(panel, claves, autor, completo());
      expect(
        await codigoDeError(
          panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo = $1`, [
            p.codigo,
          ]),
        ),
      ).toBe(EXCEPCION);
    });

    it("una modalidad desactivada o de otra familia tampoco sirve para publicar por SQL", async () => {
      const p = await crearPerfil(panel, claves, autor, completo());
      await registrarConsentimiento(panel, claves, autor, p.codigo, nominal);
      const otra = await id("catalogo_modalidades_prueba", "Suite de pruebas automatizadas");
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET modalidad_prueba_id = $2 WHERE codigo = $1`,
        [p.codigo, otra],
      );
      expect(
        await codigoDeError(
          panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo = $1`, [
            p.codigo,
          ]),
        ),
      ).toBe(EXCEPCION);
      await bd.instalacion.query(
        `UPDATE inventario.perfiles SET modalidad_prueba_id = $2 WHERE codigo = $1`,
        [p.codigo, ids.prueba],
      );
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_modalidades_prueba SET activo = false WHERE id = $1`,
        [ids.prueba],
      );
      try {
        expect(
          await codigoDeError(
            panel.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo = $1`, [
              p.codigo,
            ]),
          ),
        ).toBe(EXCEPCION);
      } finally {
        await bd.instalacion.query(
          `UPDATE inventario.catalogo_modalidades_prueba SET activo = true WHERE id = $1`,
          [ids.prueba],
        );
      }
    });
  });

  describe("HU-128 · publicación masiva", () => {
    it("publica los que cumplen y señala a los demás con su motivo, sin abortar", async () => {
      const listo = await crearPerfil(panel, claves, autor, completo());
      await registrarConsentimiento(panel, claves, autor, listo.codigo, nominal);
      const sinConsentimiento = await crearPerfil(panel, claves, autor, completo());
      const sinModalidad = await crearPerfil(
        panel,
        claves,
        autor,
        completo({ modalidadPruebaId: null }),
      );
      await registrarConsentimiento(panel, claves, autor, sinModalidad.codigo, nominal);
      const otroListo = await crearPerfil(panel, claves, autor, completo());
      await registrarConsentimiento(panel, claves, autor, otroListo.codigo, nominal);

      const r = await publicarVarios(panel, claves, autor, [
        listo.codigo,
        sinConsentimiento.codigo,
        sinModalidad.codigo,
        otroListo.codigo,
        "PS-9999",
      ]);
      expect(r.map((x) => [x.codigo, x.ok, x.ok ? null : x.motivos])).toEqual([
        [listo.codigo, true, null],
        [sinConsentimiento.codigo, false, ["consentimiento"]],
        [sinModalidad.codigo, false, ["modalidad_prueba"]],
        [otroListo.codigo, true, null],
        ["PS-9999", false, ["no_existe"]],
      ]);
      expect(await enPortal(listo.codigo)).toBe(1);
      expect(await enPortal(otroListo.codigo)).toBe(1);
      expect(await enPortal(sinConsentimiento.codigo)).toBe(0);
      expect((await leerPerfil(panel, sinModalidad.codigo))!.estado).toBe("borrador");
    });

    it("el lote tiene tope: más de 200 códigos se rechaza sin publicar ninguno", async () => {
      const codigos = Array.from(
        { length: 201 },
        (_, i) => `PS-${String(9000 + i).padStart(4, "0")}`,
      );
      expect((await rechazo(publicarVarios(panel, claves, autor, codigos))).motivo).toBe(
        "lote_demasiado_grande",
      );
    });
  });
});
