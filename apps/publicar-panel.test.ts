// Contrato HTTP de publicar (EP-006 · sub-slice 5: HU-128, HU-129, HU-130) contra el servidor
// standalone real del panel (`ps_panel`), por PgBouncer, con los perfiles ficticios: publicar uno
// con su versión, el bloqueo que dice qué falta, la publicación masiva que no aborta, permisos y CSRF,
// y que las pantallas traen «Publicar», «Vista previa» y la selección del inventario.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { entradaValidaciones } from "@ps/infra/pruebas/validaciones-entrada";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Publicar en el panel (HU-128, HU-129, HU-130)",
  () => {
    let bd: BdPrueba;
    let panel: ServidorPrueba;
    let entorno: Record<string, string>;
    let admin: string;
    let observador: string;
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
      opciones: { cookie?: string; cabeceras?: Record<string, string>; sinCsrf?: boolean } = {},
    ) =>
      panel.pedir(ruta, {
        method: "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: panel.url,
          ...(opciones.sinCsrf ? {} : { "x-ps-csrf": csrf }),
          cookie: `__Host-csrf=${csrf}; ${opciones.cookie ?? admin}`,
          ...opciones.cabeceras,
        },
      });
    const leer = (ruta: string, cookie = admin) => panel.pedir(ruta, { headers: { cookie } });
    const id = async (tabla: string, nombre: string) =>
      (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
        .rows[0]?.id as string;
    const completo = async (extra: Record<string, unknown> = {}) => ({
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
      // Validaciones de entrada SARO/DISC (EP-003, D61): publicar las exige.
      ...(await entradaValidaciones(bd.instalacion)),
      experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." }],
      ...extra,
    });
    const crear = async (extra: Record<string, unknown> = {}) =>
      (await (await enviar("/api/v1/perfiles", await completo(extra))).json()).perfil as {
        codigo: string;
        version: number;
      };
    const consentir = async (codigo: string) =>
      (
        await (
          await enviar(`/api/v1/perfiles/${codigo}/consentimiento`, {
            nombreApellido: true,
            trayectoria: true,
            clientes: true,
          })
        ).json()
      ).perfil as { codigo: string; version: number };
    const publicar = (codigo: string, version: number, cookie?: string) =>
      enviar(
        `/api/v1/perfiles/${codigo}/publicar`,
        {},
        { cookie, cabeceras: { "if-match": `"${version}"` } },
      );

    beforeAll(async () => {
      bd = await crearBdPrueba();
      entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      await sembrarFicticios({
        bd: bd.como("ps_panel"),
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarLexicoFicticio({ bd: bd.como("ps_panel"), candidatas: bd.como("ps_worker"), appEnv: "ci", registrar: () => {} });
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      panel = await arrancarServidor("panel", entorno);
    }, 120_000);

    afterAll(async () => {
      await panel?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-128 · el bloqueo actúa", () => {
      it("sin consentimiento: 409 `no_publicable` con lo que falta, y el perfil sigue en borrador", async () => {
        const p = await crear();
        const r = await publicar(p.codigo, p.version);
        expect(r.status).toBe(409);
        const d = await r.json();
        expect(d.motivo).toBe("no_publicable");
        expect(
          d.evaluacion.condiciones
            .filter((c: { cumple: boolean }) => !c.cumple)
            .map((c: { clave: string }) => c.clave),
        ).toEqual(["consentimiento"]);
        const leido = await (await leer(`/api/v1/perfiles/${p.codigo}`)).json();
        expect(leido.perfil.estado).toBe("borrador");
      });

      it("con consentimiento pero sin modalidad: 409 y dice que falta elegirla", async () => {
        const p = await consentir((await crear({ modalidadPruebaId: null })).codigo);
        const d = await (await publicar(p.codigo, p.version)).json();
        expect(
          d.evaluacion.condiciones.find((c: { clave: string }) => c.clave === "modalidad_prueba"),
        ).toMatchObject({
          cumple: false,
          detalle: "sin_elegir",
        });
      });

      it("completo: 200 publicado; sin If-Match 428; con versión vieja 409", async () => {
        const p = await consentir((await crear()).codigo);
        expect((await enviar(`/api/v1/perfiles/${p.codigo}/publicar`, {})).status).toBe(428);
        expect((await publicar(p.codigo, p.version - 1)).status).toBe(409);
        const r = await publicar(p.codigo, p.version);
        expect(r.status).toBe(200);
        expect((await r.json()).perfil.estado).toBe("publicado");
        const otra = await publicar(p.codigo, p.version + 1);
        expect(otra.status).toBe(409);
      });

      it("el observador no publica (403) y sin CSRF tampoco se publica", async () => {
        const p = await consentir((await crear()).codigo);
        expect((await publicar(p.codigo, p.version, observador)).status).toBe(403);
        expect(
          (
            await enviar(
              `/api/v1/perfiles/${p.codigo}/publicar`,
              {},
              {
                sinCsrf: true,
                cabeceras: { "if-match": `"${p.version}"` },
              },
            )
          ).status,
        ).toBe(403);
        expect(
          (
            await enviar(
              "/api/v1/perfiles/publicar",
              { codigos: [p.codigo] },
              { cookie: observador },
            )
          ).status,
        ).toBe(403);
      });
    });

    describe("HU-128 · publicación masiva", () => {
      it("publica los que cumplen y devuelve, por perfil, el motivo de los demás", async () => {
        const listo = await consentir((await crear()).codigo);
        const sinConsentimiento = await crear();
        const sinModalidad = await consentir((await crear({ modalidadPruebaId: null })).codigo);
        const r = await enviar("/api/v1/perfiles/publicar", {
          codigos: [listo.codigo, sinConsentimiento.codigo, sinModalidad.codigo, "PS-0142"],
        });
        expect(r.status).toBe(200);
        const d = await r.json();
        expect(d.publicados).toBe(1);
        expect(
          d.resultados.map((x: { codigo: string; ok: boolean; motivos?: string[] }) => [
            x.codigo,
            x.ok,
            x.motivos ?? null,
          ]),
        ).toEqual([
          [listo.codigo, true, null],
          [sinConsentimiento.codigo, false, ["consentimiento"]],
          [sinModalidad.codigo, false, ["modalidad_prueba"]],
          ["PS-0142", false, ["transicion_invalida"]],
        ]);
        expect(d.resultados[2]).toMatchObject({ familia: { nombre: "Desarrollo" } });
        expect(d.resultados[3]).toMatchObject({ estado: "publicado" });
      });

      it("entrada inválida 400; más de 200 perfiles 422", async () => {
        expect((await enviar("/api/v1/perfiles/publicar", { codigos: ["x"] })).status).toBe(400);
        const muchos = Array.from({ length: 201 }, (_, i) => `PS-${String(5000 + i)}`);
        const r = await enviar("/api/v1/perfiles/publicar", { codigos: muchos });
        expect(r.status).toBe(422);
        expect(await r.json()).toMatchObject({ motivo: "lote_demasiado_grande", tope: 200 });
      });
    });

    describe("pantallas", () => {
      it("el editor de un borrador trae «Vista previa» y «Publicar»; la observadora no ve «Publicar»", async () => {
        const p = await crear();
        const html = await (await leer(`/inventario/${p.codigo}`)).text();
        expect(html).toContain(">Vista previa<");
        expect(html).toContain(">Publicar<");
        const obs = await (await leer(`/inventario/${p.codigo}`, observador)).text();
        expect(obs).toContain(">Vista previa<");
        expect(obs).not.toContain(">Publicar<");
      });

      it("el inventario trae la casilla de selección por fila solo para la administradora", async () => {
        const html = await (await leer("/inventario")).text();
        expect(html).toContain('name="ip-sel"');
        expect(html).toContain("data-ip-todos");
        const obs = await (await leer("/inventario", observador)).text();
        expect(obs).not.toContain('name="ip-sel"');
      });
    });
  },
);
