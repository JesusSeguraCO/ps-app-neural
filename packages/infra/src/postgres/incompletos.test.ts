// «Incompleto» en el panel y conteo del portal contra PostgreSQL real (EP-003 · SS2, tareas 2.2–2.4;
// HU-178, D62, D63, D80). Sobre el banco ficticio sembrado (con sus cuatro heredados incompletos): el
// listado marca cada publicado al que la guarda rechazaría hoy con lo que le falta, sin tocar su estado
// ni su visibilidad en el portal; el Sello Personal no marca; editar un incompleto sin completarlo
// devuelve la pregunta de D1 y el portal conserva la versión vigente; completarlo y confirmar lo
// publica y deja de marcarse. El conteo que lee `ps_portal` en la 0029 coincide con las marcas.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import { contarIncompletosPublicados } from "./indicadores";
import { editarPublicado, leerPerfil, listarInventario } from "./perfiles-panel";
import {
  sembrarFicticios,
  sembrarHeredadosIncompletos,
} from "../../../../apps/worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "../../../../apps/worker/src/sembrar-lexico";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const HOY = new Date("2026-10-02T15:00:00Z");

describe.skipIf(!HAY_BD)("«Incompleto» y su conteo (HU-178)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let autor: { usuarioId: string; correo: string };

  const marcas = async () =>
    Object.fromEntries(
      (await listarInventario(panel))
        .filter((f) => f.incompleto)
        .map((f) => [f.codigo, f.incompleto]),
    );
  const enPortal = async (codigo: string) =>
    (
      await portal.query(`SELECT resumen FROM operacion.ficha_publicable WHERE codigo = $1`, [
        codigo,
      ])
    ).rows[0] as { resumen: string | null } | undefined;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    await sembrarFicticios({ bd: panel, auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarHeredadosIncompletos({ bd: panel, auditoria: claves, appEnv: "ci", registrar: () => {} });
    await sembrarLexicoFicticio({
      bd: panel,
      candidatas: bd.como("ps_worker"),
      appEnv: "ci",
      registrar: () => {},
    });
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('karen@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    autor = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  describe("tarea 2.2 · marca en el listado", () => {
    it("happy: cada heredado se marca con lo que le falta, sigue publicado y visible en el portal", async () => {
      expect(await marcas()).toEqual({
        "PS-0105": "Incompleto: falta la verificación SARO (alcance y fecha)",
        "PS-0112":
          "Incompleto: falta la verificación SARO (alcance y fecha) y la fecha de la evaluación DISC",
        "PS-0118": "Incompleto: falta la fecha de la evaluación DISC",
        "PS-0124": "Incompleto: falta la modalidad de prueba",
      });
      const filas = await listarInventario(panel);
      for (const c of ["PS-0105", "PS-0112", "PS-0118", "PS-0124"]) {
        expect(filas.find((f) => f.codigo === c)?.estado).toBe("publicado");
        expect(await enPortal(c)).toBeDefined();
      }
    });

    it("la marca es de los publicados: borradores, pausados y archivados no se marcan", async () => {
      const filas = await listarInventario(panel);
      for (const f of filas.filter((x) => x.estado !== "publicado"))
        expect(f.incompleto).toBeNull();
    });

    it("edge: un publicado completo sin Sello Personal no se marca y se edita y publica sin registrarlo", async () => {
      const sinSello = (
        await panel.query(
          `SELECT codigo, version FROM inventario.perfiles
            WHERE codigo = 'PS-0201' AND cardinality(sello_personal) = 0`,
        )
      ).rows[0];
      expect(sinSello).toBeDefined();
      expect((await marcas())["PS-0201"]).toBeUndefined();
      const r = await editarPublicado(
        panel,
        claves,
        autor,
        "PS-0201",
        sinSello.version,
        { resumen: "Arquitecta de integraciones en banca." },
        {},
        HOY,
      );
      expect(r.resultado).toBe("aplicado");
      expect((await enPortal("PS-0201"))?.resumen).toBe("Arquitecta de integraciones en banca.");
    });
  });

  describe("tarea 2.3 · editar un publicado incompleto", () => {
    it("error: cambiar el resumen sin registrar SARO → la pregunta de D1 con lo que falta; nada se escribe", async () => {
      const p = (await leerPerfil(panel, "PS-0105"))!;
      const antes = await enPortal("PS-0105");
      for (const previsualizar of [true, false]) {
        const r = await editarPublicado(
          panel,
          claves,
          autor,
          "PS-0105",
          p.version,
          { resumen: "Resumen nuevo sin SARO." },
          { previsualizar },
          HOY,
        );
        expect(r.resultado).toBe("deja_incompleto");
      }
      expect(await enPortal("PS-0105")).toEqual(antes);
      expect((await leerPerfil(panel, "PS-0105"))!.version).toBe(p.version);
      expect((await marcas())["PS-0105"]).toBe(
        "Incompleto: falta la verificación SARO (alcance y fecha)",
      );
    });

    it("edge: registrar la fecha DISC y confirmar → el cambio se ve en el portal y deja de marcarse", async () => {
      const p = (await leerPerfil(panel, "PS-0118"))!;
      const pre = await editarPublicado(
        panel,
        claves,
        autor,
        "PS-0118",
        p.version,
        { discFecha: "2026-05-04" },
        { previsualizar: true },
        HOY,
      );
      expect(pre.resultado).toBe("impacto");
      const r = await editarPublicado(
        panel,
        claves,
        autor,
        "PS-0118",
        p.version,
        { discFecha: "2026-05-04" },
        {},
        HOY,
      );
      expect(r.resultado).toBe("aplicado");
      const disc = await portal.query(
        `SELECT disc_fecha::text AS d FROM operacion.ficha_publicable WHERE codigo = 'PS-0118'`,
      );
      expect(disc.rows[0].d).toBe("2026-05-04");
      expect((await marcas())["PS-0118"]).toBeUndefined();
    });
  });

  describe("tarea 2.4 · el conteo del portal es el de las marcas del panel", () => {
    it("ps_portal cuenta con la misma guarda los publicados que el panel marca", async () => {
      const n = Object.keys(await marcas()).length;
      expect(n).toBeGreaterThan(0);
      expect(await contarIncompletosPublicados(portal)).toBe(n);
    });

    it("completar los que faltan baja el conteo a 0 en las dos caras", async () => {
      const alcance = (
        await panel.query(`SELECT id FROM inventario.catalogo_alcances_saro WHERE activo LIMIT 1`)
      ).rows[0].id as string;
      const prueba = async (codigo: string) =>
        (
          await panel.query(
            `SELECT m.id FROM inventario.catalogo_modalidades_prueba m
               JOIN inventario.perfiles p ON p.familia_id = m.familia_id
              WHERE p.codigo = $1 AND m.activo LIMIT 1`,
            [codigo],
          )
        ).rows[0].id as string;
      const completar = {
        "PS-0105": { saroAlcanceId: alcance, saroFecha: "2026-03-01" },
        "PS-0112": { saroAlcanceId: alcance, saroFecha: "2026-03-01", discFecha: "2026-03-02" },
        "PS-0124": { modalidadPruebaId: await prueba("PS-0124") },
      } as const;
      for (const [codigo, e] of Object.entries(completar)) {
        const p = (await leerPerfil(panel, codigo))!;
        const r = await editarPublicado(panel, claves, autor, codigo, p.version, e, {}, HOY);
        expect(r.resultado, codigo).toBe("aplicado");
      }
      expect(await marcas()).toEqual({});
      expect(await contarIncompletosPublicados(portal)).toBe(0);
    });
  });
});
