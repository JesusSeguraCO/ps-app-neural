// Contrato HTTP de «Incompleto» y del aviso de lenguaje de inventario (EP-003 · sub-slice 2: HU-178,
// HU-194) contra el servidor standalone real del panel (`ps_panel` por PgBouncer), con el banco
// ficticio y sus cuatro heredados incompletos (PS-0245 sin SARO, PS-0246 sin SARO ni DISC, PS-0247 sin
// DISC, PS-0248 sin modalidad). El listado (API y página) marca y filtra sin tocar estado ni portal;
// editar un incompleto sin completarlo pregunta con el motivo; completarlo lo publica y lo desmarca; el
// Sello Personal no marca. El guardado devuelve `avisos[]` aparte del rechazo (también con 422 de fecha),
// en el alta, el borrador y el publicado, sin bloquear publicar. Lo que ve el cliente se lee como
// `ps_portal`.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios, sembrarHeredadosIncompletos } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

const diaBogota = (dias: number) =>
  new Date(Date.now() - 5 * 3_600_000 + dias * 86_400_000).toISOString().slice(0, 10);
const SARO = "la verificación SARO (alcance y fecha)";

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "«Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;
    let portal: pg.Pool;
    let admin: string;
    let observador: string;
    let alcance: string;
    const csrf = randomBytes(16).toString("hex");

    const sesion = async (correo: string, rol: "administrador" | "observador") => {
      const u = await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
        [correo, randomBytes(32), rol],
      );
      const id = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
        [createHash("sha256").update(id).digest(), u.rows[0].id],
      );
      return `__Host-pp=${id}`;
    };
    const enviar = (
      ruta: string,
      cuerpo: unknown,
      o: { metodo?: string; cookie?: string; version?: number } = {},
    ) =>
      srv.pedir(ruta, {
        method: o.metodo ?? "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          cookie: `__Host-csrf=${csrf}; ${o.cookie ?? admin}`,
          ...(o.version ? { "if-match": `"${o.version}"` } : {}),
        },
      });
    const leer = (ruta: string, cookie = admin) => srv.pedir(ruta, { headers: { cookie } });
    const perfil = async (codigo: string) =>
      (await (await leer(`/api/v1/perfiles/${codigo}`)).json()).perfil as {
        codigo: string;
        version: number;
        estado: string;
        resumen: string | null;
        experiencias: Array<{ descripcion: string }>;
      };
    const marcas = async (cookie = admin) =>
      Object.fromEntries(
        (
          (await (await leer("/api/v1/perfiles", cookie)).json()).perfiles as Array<{
            codigo: string;
            incompleto: string | null;
          }>
        )
          .filter((f) => f.incompleto)
          .map((f) => [f.codigo, f.incompleto]),
      );
    const enPortal = async (codigo: string) =>
      (
        await portal.query(
          `SELECT resumen, disc_fecha::text AS disc FROM operacion.ficha_publicable WHERE codigo = $1`,
          [codigo],
        )
      ).rows[0];
    const id = async (tabla: string, nombre: string) =>
      (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
        .rows[0]?.id as string;
    // Borrador completo con consentimiento y SARO/DISC: lo único que decide es la trayectoria.
    const borrador = async (descripcion: string) => {
      const r = await enviar("/api/v1/perfiles", {
        nombre: "Lorena",
        primerApellido: "Salcedo",
        rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
        tecnologiaIds: [await id("catalogo_tecnologias", "Kafka")],
        seniorityId: await id("catalogo_seniorities", "Senior"),
        aniosExperiencia: 8,
        ciudadId: await id("catalogo_ciudades", "Medellín"),
        modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
        disponibilidad: { opcion: "ahora" },
        modalidadPruebaId: await id(
          "catalogo_modalidades_prueba",
          "Prueba práctica revisada por un arquitecto",
        ),
        saroAlcanceId: alcance,
        saroFecha: "2026-03-15",
        discFecha: "2026-04-10",
        experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion }],
      });
      expect(r.status).toBe(201);
      const creado = await r.json();
      const c = await enviar(`/api/v1/perfiles/${creado.perfil.codigo}/consentimiento`, {
        nombreApellido: true,
        trayectoria: true,
        clientes: true,
      });
      return {
        alta: creado,
        perfil: (await c.json()).perfil as { codigo: string; version: number },
      };
    };
    const trayectoria = (descripcion: string, extra: Record<string, unknown> = {}) => ({
      experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion }],
      ...extra,
    });

    beforeAll(async () => {
      bd = await crearBdPrueba();
      portal = bd.como("ps_portal");
      const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      await sembrarFicticios({
        bd: bd.como("ps_panel"),
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarHeredadosIncompletos({
        bd: bd.como("ps_panel"),
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarLexicoFicticio({
        bd: bd.como("ps_panel"),
        candidatas: bd.como("ps_worker"),
        appEnv: "ci",
        registrar: () => {},
      });
      alcance = (
        await bd.instalacion.query(
          `SELECT id FROM inventario.catalogo_alcances_saro WHERE activo LIMIT 1`,
        )
      ).rows[0].id;
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      srv = await arrancarServidor("panel", entorno);
    }, 120_000);

    afterAll(async () => {
      await srv?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-178 · marca y filtro «Incompleto»", () => {
      it("happy: la API del listado marca los tres ejemplos (SARO, DISC, modalidad) y los deja publicados y en el portal", async () => {
        expect(await marcas()).toEqual({
          "PS-0245": `Incompleto: falta ${SARO}`,
          "PS-0246": `Incompleto: falta ${SARO} y la fecha de la evaluación DISC`,
          "PS-0247": "Incompleto: falta la fecha de la evaluación DISC",
          "PS-0248": "Incompleto: falta la modalidad de prueba",
        });
        for (const c of ["PS-0245", "PS-0246", "PS-0247", "PS-0248"]) {
          expect((await perfil(c)).estado).toBe("publicado");
          expect(await enPortal(c)).toBeDefined();
        }
        // La observadora ve las mismas marcas (el listado es de ambos roles).
        expect(Object.keys(await marcas(observador))).toHaveLength(4);
      });

      it("happy: la página filtra por «incompleto» con la marca de cada uno y su pestaña con el conteo", async () => {
        const todos = await (await leer("/inventario")).text();
        expect(todos).toContain(`Incompleto: falta ${SARO}`);
        expect(todos).toMatch(
          /Incompletos\s*(<!-- -->)?\s*<span class="pp-pestana__conteo">4<\/span>/,
        );
        const r = await leer("/inventario?estado=incompleto");
        expect(r.status).toBe(200);
        const html = await r.text();
        for (const c of ["PS-0245", "PS-0246", "PS-0247", "PS-0248"]) expect(html).toContain(c);
        for (const c of ["PS-0142", "PS-0201", "PS-0160"]) expect(html).not.toContain(c);
        expect(html).toContain("Incompleto: falta la modalidad de prueba");
      });

      it("la marca no cruza al portal: ninguna vista que lee ps_portal la tiene", async () => {
        const cols = await bd.instalacion.query(
          `SELECT table_name, column_name FROM information_schema.column_privileges
            WHERE grantee = 'ps_portal' AND column_name ILIKE '%incomplet%'`,
        );
        expect(cols.rows).toEqual([]);
      });

      it("error: editar el resumen sin registrar SARO → la pregunta con el motivo (200 al previsualizar, 409 al confirmar); el portal conserva la versión vigente", async () => {
        const p = await perfil("PS-0245");
        const antes = await enPortal("PS-0245");
        const pregunta = `Este cambio no se puede publicar mientras falte ${SARO}: ¿descarto el cambio o paso el perfil a borrador?`;
        for (const [consulta, status] of [
          ["?previsualizar", 200],
          ["", 409],
        ] as const) {
          const r = await enviar(
            `/api/v1/perfiles/PS-0245${consulta}`,
            { resumen: "Resumen nuevo sin SARO." },
            { metodo: "PATCH", version: p.version },
          );
          expect(r.status).toBe(status);
          const d = await r.json();
          expect(d.motivo).toBe("deja_incompleto");
          expect(d.pregunta).toBe(pregunta);
          expect(d.faltaPara).toBe(SARO);
        }
        expect(await enPortal("PS-0245")).toEqual(antes);
        expect((await perfil("PS-0245")).version).toBe(p.version);
      });

      it("edge: registrar la fecha DISC → impacto sin pregunta; confirmar lo muestra en el portal y deja de marcarse", async () => {
        const p = await perfil("PS-0247");
        const pre = await enviar(
          "/api/v1/perfiles/PS-0247?previsualizar",
          { discFecha: "2026-05-04" },
          { metodo: "PATCH", version: p.version },
        );
        expect(pre.status).toBe(200);
        expect((await pre.json()).motivo).toBeUndefined();
        const r = await enviar(
          "/api/v1/perfiles/PS-0247",
          { discFecha: "2026-05-04" },
          { metodo: "PATCH", version: p.version },
        );
        expect(r.status).toBe(200);
        expect((await enPortal("PS-0247")).disc).toBe("2026-05-04");
        expect((await marcas())["PS-0247"]).toBeUndefined();
        expect((await perfil("PS-0247")).estado).toBe("publicado");
      });

      it("edge: un publicado completo sin Sello Personal no se marca; se edita y publica sin registrarlo", async () => {
        const sello = await bd.instalacion.query(
          `SELECT cardinality(sello_personal) n FROM inventario.perfiles WHERE codigo = 'PS-0201'`,
        );
        expect(sello.rows[0].n).toBe(0);
        expect((await marcas())["PS-0201"]).toBeUndefined();
        const p = await perfil("PS-0201");
        const r = await enviar(
          "/api/v1/perfiles/PS-0201",
          { resumen: "Arquitecta de integraciones." },
          { metodo: "PATCH", version: p.version },
        );
        expect(r.status).toBe(200);
        expect((await enPortal("PS-0201")).resumen).toBe("Arquitecta de integraciones.");
      });
    });

    describe("HU-194 · aviso de lenguaje de inventario", () => {
      it("happy: «disponible para asignación» → guardado con el aviso; publicar no lo impide", async () => {
        const { perfil: p } = await borrador("Desarrollo de pagos.");
        const r = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          trayectoria("perfil disponible para asignación inmediata en proyectos de banca"),
          { metodo: "PATCH", version: p.version },
        );
        expect(r.status).toBe(200);
        const d = await r.json();
        expect(d.avisos).toEqual([
          { tipo: "lenguaje_inventario", expresion: "disponible para asignación" },
        ]);
        expect(d.perfil.experiencias[0].descripcion).toBe(
          "perfil disponible para asignación inmediata en proyectos de banca",
        );
        const pub = await enviar(
          `/api/v1/perfiles/${p.codigo}/publicar`,
          {},
          { version: d.perfil.version },
        );
        expect(pub.status).toBe(200);
        expect((await pub.json()).perfil.estado).toBe("publicado");
      });

      it("error: fecha SARO futura y «stock» → 422 por la fecha, con el aviso aparte y nada guardado", async () => {
        const { perfil: p } = await borrador("Desarrollo de pagos.");
        const r = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          trayectoria("stock de consultores para banca", { saroFecha: diaBogota(30) }),
          { metodo: "PATCH", version: p.version },
        );
        expect(r.status).toBe(422);
        const d = await r.json();
        expect(d.motivo).toBe("fecha_verificacion_futura");
        expect(d.campo).toBe("saroFecha");
        expect(d.avisos).toEqual([{ tipo: "lenguaje_inventario", expresion: "stock" }]);
        expect((await perfil(p.codigo)).experiencias[0]!.descripcion).toBe("Desarrollo de pagos.");
      });

      it.each([
        [
          "Lideró la migración de un ITEM crítico del core bancario",
          [{ tipo: "lenguaje_inventario", expresion: "ITEM" }],
        ],
        ["Trabajó dos años en Stockholm para un banco nórdico", []],
      ])("edge: «%s» → %j", async (texto, avisos) => {
        const { perfil: p } = await borrador("Desarrollo de pagos.");
        const r = await enviar(`/api/v1/perfiles/${p.codigo}`, trayectoria(texto), {
          metodo: "PATCH",
          version: p.version,
        });
        expect(r.status).toBe(200);
        expect((await r.json()).avisos).toEqual(avisos);
      });

      it("edge: corregir la trayectoria retira el aviso y guarda la nueva", async () => {
        const { perfil: p } = await borrador("Desarrollo de pagos.");
        const r1 = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          trayectoria("Lideró la unidad de pagos"),
          {
            metodo: "PATCH",
            version: p.version,
          },
        );
        const d1 = await r1.json();
        expect(d1.avisos).toEqual([{ tipo: "lenguaje_inventario", expresion: "unidad" }]);
        const r2 = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          trayectoria("Lideró el área de pagos"),
          { metodo: "PATCH", version: d1.perfil.version },
        );
        expect(r2.status).toBe(200);
        const d2 = await r2.json();
        expect(d2.avisos).toEqual([]);
        expect(d2.perfil.experiencias[0].descripcion).toBe("Lideró el área de pagos");
      });

      it("gemelas: el alta y la edición de un publicado (previsualizar y confirmar) llevan el mismo aviso; el resumen también cuenta", async () => {
        const { alta } = await borrador("stock de consultores");
        expect(alta.avisos).toEqual([{ tipo: "lenguaje_inventario", expresion: "stock" }]);
        for (const consulta of ["?previsualizar", ""]) {
          const v = (await perfil("PS-0142")).version;
          const r = await enviar(
            `/api/v1/perfiles/PS-0142${consulta}`,
            { resumen: "Cada unidad de negocio." },
            { metodo: "PATCH", version: v },
          );
          expect(r.status, consulta).toBe(200);
          expect((await r.json()).avisos, consulta).toEqual([
            { tipo: "lenguaje_inventario", expresion: "unidad" },
          ]);
        }
        // Se restaura el ficticio fijado por los e2e.
        const v = (await perfil("PS-0142")).version;
        await enviar("/api/v1/perfiles/PS-0142", { resumen: null }, { metodo: "PATCH", version: v });
      });

      it("la observadora no guarda: 403 sin escribir", async () => {
        const p = await perfil("PS-0142");
        const r = await enviar(
          "/api/v1/perfiles/PS-0142",
          { resumen: "stock" },
          { metodo: "PATCH", version: p.version, cookie: observador },
        );
        expect(r.status).toBe(403);
      });
    });
  },
);
