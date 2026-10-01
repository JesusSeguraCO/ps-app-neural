// Contrato HTTP de perfiles y consentimiento (EP-006 · sub-slice 2: HU-125, HU-127) contra los
// servidores standalone reales del panel (`ps_panel`) y del portal (`ps_portal`), por PgBouncer, con
// los perfiles ficticios. La revocación se comprueba abriendo un enlace curado en el portal: el perfil
// revocado aparece con su estado, no se omite (RF-19.2).
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel") || !hayBuild("portal"))(
  "Perfiles y consentimiento en el panel (HU-125, HU-127)",
  () => {
    let bd: BdPrueba;
    let panel: ServidorPrueba;
    let portal: ServidorPrueba;
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
      opciones: { cookie?: string; metodo?: string; cabeceras?: Record<string, string> } = {},
    ) =>
      panel.pedir(ruta, {
        method: opciones.metodo ?? "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: panel.url,
          "x-ps-csrf": csrf,
          cookie: `__Host-csrf=${csrf}; ${opciones.cookie ?? admin}`,
          ...opciones.cabeceras,
        },
      });
    const leer = (ruta: string, cookie = admin) => panel.pedir(ruta, { headers: { cookie } });
    const id = async (tabla: string, nombre: string) =>
      (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
        .rows[0]?.id as string;
    const completo = async () => ({
      nombre: "Lorena",
      primerApellido: "Salcedo",
      rolId: await id("catalogo_roles", "Desarrolladora backend Java"),
      tecnologiaIds: [await id("catalogo_tecnologias", "Kafka")],
      sectorId: await id("catalogo_sectores", "Banca"),
      seniorityId: await id("catalogo_seniorities", "Senior"),
      aniosExperiencia: 8,
      ciudadId: await id("catalogo_ciudades", "Medellín"),
      modalidadTrabajoId: await id("catalogo_modalidades", "hibrido"),
      disponibilidad: { opcion: "ahora" },
      modalidadPruebaId: await id(
        "catalogo_modalidades_prueba",
        "Prueba práctica revisada por un arquitecto",
      ),
      experiencias: [
        {
          cargo: "Backend senior",
          cliente: "Bancolombia",
          desde: 2021,
          descripcion: "Pagos inmediatos con Java y Kafka.",
        },
      ],
    });

    beforeAll(async () => {
      bd = await crearBdPrueba();
      entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      const worker = bd.como("ps_worker");
      await sembrarFicticios({
        bd: worker,
        auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
        appEnv: "ci",
        registrar: () => {},
      });
      await sembrarLexicoFicticio({ bd: worker, appEnv: "ci", registrar: () => {} });
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      panel = await arrancarServidor("panel", entorno);
      portal = await arrancarServidor("portal", {
        ...entornoDev("portal"),
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_portal"),
      });
    }, 120_000);

    afterAll(async () => {
      await panel?.cerrar();
      await portal?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-089 · seleccionar en vez de escribir (el campo de tecnologías del editor)", () => {
      it("lo tecleado solo ofrece valores del catálogo para elegir", async () => {
        const r = await leer("/api/v1/catalogos/tecnologia?q=kaf");
        expect(r.status).toBe(200);
        const { valores } = await r.json();
        expect(valores.map((v: { nombre: string }) => v.nombre)).toEqual(["Kafka"]);
      });
      it("el perfil no acepta texto libre: solo identificadores de valores activos del catálogo", async () => {
        expect((await enviar("/api/v1/perfiles", { tecnologias: ["Kafka"] })).status).toBe(400);
        const r = await enviar("/api/v1/perfiles", {
          tecnologiaIds: ["00000000-0000-4000-8000-000000000000"],
        });
        expect(r.status).toBe(422);
        expect((await r.json()).motivo).toBe("valor_no_disponible");
      });
      it("el editor muestra el campo de búsqueda del catálogo (sin texto libre)", async () => {
        const r = await leer("/inventario/nuevo");
        expect(r.status).toBe(200);
        const html = await r.text();
        expect(html).toMatch(/id="pe-tec"[^>]*role="combobox"|role="combobox"[^>]*id="pe-tec"/);
        expect(html).toContain("Solo valores del catálogo.");
      });
    });

    describe("HU-125 · crear en borrador", () => {
      let codigo: string;
      it("guardado con sus atributos queda en borrador con valores del catálogo y fuera del portal", async () => {
        const r = await enviar("/api/v1/perfiles", await completo());
        expect(r.status).toBe(201);
        const { perfil } = await r.json();
        codigo = perfil.codigo;
        expect(perfil.estado).toBe("borrador");
        expect(perfil.rol.nombre).toBe("Desarrolladora backend Java");
        expect(perfil.tecnologias).toEqual([{ id: expect.any(String), nombre: "Kafka" }]);
        expect(perfil.evaluacion.faltanDatos).toEqual([]);
        const enPortal = await bd
          .como("ps_portal")
          .query(`SELECT 1 FROM operacion.catalogo_publicable WHERE codigo = $1`, [codigo]);
        expect(enPortal.rowCount).toBe(0);
        const listado = await (await leer("/api/v1/perfiles")).json();
        expect(listado.perfiles.find((p: { codigo: string }) => p.codigo === codigo).estado).toBe(
          "borrador",
        );
      });
      it("incompleto se guarda igual como borrador y dice qué falta", async () => {
        const r = await enviar("/api/v1/perfiles", { nombre: "Mateo" });
        expect(r.status).toBe(201);
        const { perfil } = await r.json();
        expect(perfil.estado).toBe("borrador");
        expect(
          perfil.evaluacion.faltanDatos.map((f: { etiqueta: string }) => f.etiqueta),
        ).toContain("Primer apellido");
        const html = await (await leer(`/inventario/${perfil.codigo}`)).text();
        expect(html).toContain("Completar 10 datos obligatorios");
        expect(html).toContain("Falta el primer apellido.");
      });
      it("un campo de la lista negra B.4 se rechaza entero", async () => {
        expect((await enviar("/api/v1/perfiles", { nombre: "X", foto: "a.png" })).status).toBe(400);
        expect(
          (await enviar("/api/v1/perfiles", { nombre: "X", motivacion: "crecer" })).status,
        ).toBe(400);
      });
      it("guardar exige la versión abierta: sin If-Match 428, con una vieja 409", async () => {
        const { perfil } = await (await leer(`/api/v1/perfiles/${codigo}`)).json();
        expect(
          (await enviar(`/api/v1/perfiles/${codigo}`, { anclaje: "x" }, { metodo: "PATCH" }))
            .status,
        ).toBe(428);
        const viejo = await enviar(
          `/api/v1/perfiles/${codigo}`,
          { anclaje: "x" },
          { metodo: "PATCH", cabeceras: { "if-match": `"${perfil.version - 1}"` } },
        );
        expect(viejo.status).toBe(409);
        expect((await viejo.json()).motivo).toBe("version_distinta");
        const ok = await enviar(
          `/api/v1/perfiles/${codigo}`,
          { anclaje: "8 años en core bancario" },
          { metodo: "PATCH", cabeceras: { "if-match": `"${perfil.version}"` } },
        );
        expect(ok.status).toBe(200);
        expect((await ok.json()).perfil.anclaje).toBe("8 años en core bancario");
      });
      it("la familia sin modalidades se advierte en el editor al elegir el rol (datos del selector)", async () => {
        const f = await enviar("/api/v1/catalogos/familia", { nombre: "Infraestructura legada", confirmarDistinto: true });
        expect(f.status).toBe(201);
        const familiaId = (await f.json()).valor.id;
        const r = await enviar("/api/v1/catalogos/rol", { nombre: "Especialista en mainframe", familiaId, confirmarDistinto: true });
        expect(r.status).toBe(201);
        expect((await r.json()).valor.advertencia).toBe("familia_sin_modalidades");
        const html = await (await leer("/inventario/nuevo")).text();
        // El selector lleva el conteo de modalidades por rol para advertir en el momento de elegirlo.
        expect(html).toMatch(/Especialista en mainframe\\?",\\?"familiaId\\?":\\?"[0-9a-f-]+\\?",\\?"familia\\?":\\?"Infraestructura legada\\?",\\?"modalidades\\?":0/);
      });
      it("el observador no crea ni edita (403) y ve el listado", async () => {
        expect(
          (await enviar("/api/v1/perfiles", { nombre: "Y" }, { cookie: observador })).status,
        ).toBe(403);
        expect((await leer("/api/v1/perfiles", observador)).status).toBe(200);
      });
    });

    describe("HU-127 · consentimiento nominal", () => {
      let codigo: string;
      beforeAll(async () => {
        codigo = (await (await enviar("/api/v1/perfiles", await completo())).json()).perfil.codigo;
      });
      it("el de la publicación anonimizada se rechaza y nada se registra", async () => {
        const r = await enviar(`/api/v1/perfiles/${codigo}/consentimiento`, {
          nombreApellido: false,
          trayectoria: true,
          clientes: false,
          fechaFirma: "2025-03-14",
        });
        expect(r.status).toBe(422);
        expect((await r.json()).motivo).toBe("no_nominal");
        const { perfil } = await (await leer(`/api/v1/perfiles/${codigo}`)).json();
        expect(perfil.consentimiento).toBeNull();
      });
      it("el nominal habilita publicar y deja quién y cuándo", async () => {
        const r = await enviar(`/api/v1/perfiles/${codigo}/consentimiento`, {
          nombreApellido: true,
          trayectoria: true,
          clientes: true,
          fechaFirma: "2026-09-18",
        });
        expect(r.status).toBe(201);
        const { perfil } = await r.json();
        expect(perfil.consentimiento).toMatchObject({
          vigente: true,
          incluyeClientes: true,
          registradoPor: "karen@trycore.com",
          firmadoEn: "2026-09-18",
        });
        expect(perfil.evaluacion.publicable).toBe(true);
      });
      it("el observador no registra ni revoca (403)", async () => {
        expect(
          (
            await enviar(
              `/api/v1/perfiles/${codigo}/consentimiento`,
              { nombreApellido: true, trayectoria: true, clientes: true },
              { cookie: observador },
            )
          ).status,
        ).toBe(403);
        expect(
          (
            await enviar(
              `/api/v1/perfiles/${codigo}/consentimiento/revocar`,
              {},
              { cookie: observador },
            )
          ).status,
        ).toBe(403);
      });
      it("el parcial despersonaliza: el cliente nombrado no llega a ninguna respuesta del portal", async () => {
        await enviar(`/api/v1/perfiles/${codigo}/consentimiento`, {
          nombreApellido: true,
          trayectoria: true,
          clientes: false,
        });
        // Publicar es de HU-128 (sub-slice 5): se fija el estado como lo hará su guarda.
        await bd.instalacion.query(
          `UPDATE inventario.perfiles SET estado = 'publicado' WHERE codigo = $1`,
          [codigo],
        );
        const r = await bd
          .como("ps_portal")
          .query(`SELECT cliente FROM operacion.experiencias_publicables WHERE codigo = $1`, [
            codigo,
          ]);
        expect(r.rows).toEqual([{ cliente: null }]);
      });
      it("revocar un publicado lo saca de publicado de inmediato y el enlace curado lo muestra, no lo omite", async () => {
        const e = await bd.instalacion.query(
          `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
           VALUES (NULL, 'Bancolombia', 'Pagos', 'Pagos en banca.', $1, now() - interval '1 day', now() + interval '20 days', gen_random_uuid())
           RETURNING id`,
          [["PS-0187", "PS-0142"]],
        );
        const i = await bd.instalacion.query(
          `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'lider@bancolombia.com.co', $2) RETURNING id`,
          [e.rows[0].id, randomBytes(32)],
        );
        const sid = randomBytes(32).toString("base64url");
        await bd.instalacion.query(
          `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '20 days')`,
          [createHash("sha256").update(sid).digest(), e.rows[0].id, i.rows[0].id],
        );
        const abrir = async () =>
          (await portal.pedir("/", { headers: { cookie: `__Host-ps=${sid}` } })).text();
        const antes = await abrir();
        expect(antes).toContain("Laura Méndez");

        const r = await enviar("/api/v1/perfiles/PS-0142/consentimiento/revocar", {});
        expect(r.status).toBe(200);
        expect((await r.json()).perfil.estado).toBe("borrador");

        const despues = await abrir();
        const tarjetas = despues.split('<article class="pp-perfil').slice(1);
        expect(tarjetas.map((t) => t.match(/PS-\d{4}/)?.[0])).toEqual(["PS-0187", "PS-0142"]);
        expect(tarjetas[1]).toContain("No publicado");
        expect(tarjetas[1]).not.toContain("Laura");
        expect(despues).not.toContain("Laura Méndez");
      });
      it("toda escritura dejó su fila con autor y la cadena está íntegra", async () => {
        const r = await bd.instalacion.query(
          `SELECT DISTINCT actor, origen FROM auditoria.auditoria WHERE entidad = 'perfiles' AND actor = 'karen@trycore.com'`,
        );
        expect(r.rows.map((f) => f.origen).sort()).toEqual(["panel", "revocacion"]);
        expect((await verificarCadena(bd.instalacion, entorno.AUDIT_HMAC_KEY!)).ok).toBe(true);
      });
    });
  },
);
