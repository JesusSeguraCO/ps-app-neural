// Contrato HTTP de Catálogos y Léxico (EP-006 · sub-slice 1: HU-089, HU-143, HU-139) contra el
// servidor standalone real del panel, con `ps_panel` por PgBouncer, los perfiles ficticios y las
// consultas sin coincidencia sintéticas sembradas por el worker. La búsqueda del portal se comprueba
// leyendo con `ps_portal` (sin despliegue entre la escritura y la lectura).
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DobleGemini } from "@ps/infra/gemini/lexico";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { interpretarConsulta } from "@ps/infra/postgres/lexico";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { proponerLexico } from "./worker/src/proponer-lexico";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Catálogos y Léxico en el panel (HU-089, HU-143, HU-139)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;
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
    const enviar = (ruta: string, cuerpo: unknown, cookie = admin, metodo = "POST") =>
      srv.pedir(ruta, {
        method: metodo,
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          cookie: `__Host-csrf=${csrf}; ${cookie}`,
        },
      });
    const leer = (ruta: string, cookie = admin) => srv.pedir(ruta, { headers: { cookie } });
    const idDe = async (tabla: string, nombre: string) =>
      (await bd.instalacion.query(`SELECT id FROM inventario.${tabla} WHERE nombre = $1`, [nombre]))
        .rows[0]?.id as string;
    const version = async () =>
      Number(
        (await bd.instalacion.query(`SELECT version FROM inventario.inventario_version`)).rows[0]
          .version,
      );

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
      srv = await arrancarServidor("panel", entorno);
    }, 120_000);

    afterAll(async () => {
      await srv?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-089 crear sin duplicar", () => {
      it("happy: rol en una familia con modalidades → 201 sin advertencia, disponible para elegir", async () => {
        const familia = await idDe("catalogo_familias", "Calidad");
        const r = await enviar("/api/v1/catalogos/rol", {
          nombre: "Analista QA de accesibilidad",
          familiaId: familia,
        });
        expect(r.status).toBe(201);
        expect((await r.json()).valor).toMatchObject({ advertencia: null, familia: "Calidad" });
        const q = await (await leer("/api/v1/catalogos/rol?q=accesib")).json();
        expect(q.valores.map((v: { nombre: string }) => v.nombre)).toEqual([
          "Analista QA de accesibilidad",
        ]);
      });

      it("el rol exige familia: sin ella → 422", async () => {
        const r = await enviar("/api/v1/catalogos/rol", { nombre: "Rol sin familia" });
        expect(r.status).toBe(422);
        expect((await r.json()).motivo).toBe("familia_requerida");
      });

      it("edge: familia sin modalidades → el rol queda creado y la respuesta lo advierte", async () => {
        const f = await enviar("/api/v1/catalogos/familia", {
          nombre: "Seguridad de la información",
        });
        expect(f.status).toBe(201);
        const familiaId = (await f.json()).valor.id;
        const r = await enviar("/api/v1/catalogos/rol", {
          nombre: "Especialista en seguridad de aplicaciones",
          familiaId,
        });
        expect(r.status).toBe(201);
        expect((await r.json()).valor.advertencia).toBe("familia_sin_modalidades");
      });

      it("error: «figma» con «Figma» existente → 409 con el existente; «Fgima» → 409 parecido; confirmado → 201", async () => {
        expect(
          (
            await enviar("/api/v1/catalogos/tecnologia", {
              nombre: "Figma",
              grupo: "Diseño de producto",
            })
          ).status,
        ).toBe(201);
        const v0 = await version();
        const dup = await enviar("/api/v1/catalogos/tecnologia", { nombre: "figma" });
        expect(dup.status).toBe(409);
        expect(await dup.json()).toMatchObject({
          motivo: "duplicado",
          existente: { nombre: "Figma" },
        });
        const par = await enviar("/api/v1/catalogos/tecnologia", { nombre: "Fgima" });
        expect(par.status).toBe(409);
        const cuerpo = await par.json();
        expect(cuerpo.motivo).toBe("parecido");
        expect(cuerpo.parecidos.map((p: { nombre: string }) => p.nombre)).toContain("Figma");
        expect(await version()).toBe(v0);
        const ok = await enviar("/api/v1/catalogos/tecnologia", {
          nombre: "Fgima",
          confirmarDistinto: true,
        });
        expect(ok.status).toBe(201);
      });

      it("seleccionar en vez de escribir: «Fig» ofrece los valores que coinciden, solo activos", async () => {
        const r = await (await leer("/api/v1/catalogos/tecnologia?q=Fig")).json();
        expect(r.valores.map((v: { nombre: string }) => v.nombre)).toEqual(["Figma"]);
        const revision = await (
          await leer(`/api/v1/catalogos/tecnologia?revisar=${encodeURIComponent("FIGMA")}`)
        ).json();
        expect(revision.tipo).toBe("identico");
      });

      it("RF-8.16.8: la modalidad de prueba exige su texto de cara al cliente", async () => {
        const familiaId = await idDe("catalogo_familias", "Seguridad de la información");
        const sin = await enviar("/api/v1/catalogos/modalidad_prueba", {
          nombre: "Ejercicio de pentesting",
          familiaId,
        });
        expect((await sin.json()).motivo).toBe("texto_cliente_requerido");
        const con = await enviar("/api/v1/catalogos/modalidad_prueba", {
          nombre: "Ejercicio de pentesting",
          familiaId,
          textoCliente: "Encontró y explicó vulnerabilidades en una aplicación de prueba",
        });
        expect(con.status).toBe(201);
        const f = await (await leer("/api/v1/catalogos/familia")).json();
        expect(
          f.valores.find((x: { nombre: string }) => x.nombre === "Seguridad de la información")
            .modalidades,
        ).toBe(1);
      });
    });

    describe("HU-143 desactivar y fusionar", () => {
      it("desactivar informa las fichas que dependen, deja de ofrecerse y no existe borrar", async () => {
        const modalidad = await idDe(
          "catalogo_modalidades_prueba",
          "Suite de pruebas automatizadas",
        );
        await bd.instalacion.query(
          `UPDATE inventario.perfiles SET modalidad_prueba_id = $1 WHERE codigo IN ('PS-0201')`,
          [modalidad],
        );
        const dep = await (await leer(`/api/v1/catalogos/modalidad_prueba/${modalidad}`)).json();
        expect(dep.publicados.map((p: { codigo: string }) => p.codigo)).toEqual(["PS-0201"]);
        const r = await enviar(`/api/v1/catalogos/modalidad_prueba/${modalidad}/desactivar`, {});
        expect(await r.json()).toMatchObject({ activo: false, dependientes: 1 });
        const ofrecidas = await (await leer("/api/v1/catalogos/modalidad_prueba?q=suite")).json();
        expect(ofrecidas.valores).toEqual([]);
        const conserva = await bd.instalacion.query(
          `SELECT modalidad_prueba_id FROM inventario.perfiles WHERE codigo = 'PS-0201'`,
        );
        expect(conserva.rows[0].modalidad_prueba_id).toBe(modalidad);
        expect(
          (await enviar(`/api/v1/catalogos/modalidad_prueba/${modalidad}`, {}, admin, "DELETE"))
            .status,
        ).toBe(405);
        expect(
          (await enviar(`/api/v1/catalogos/modalidad_prueba/${modalidad}/reactivar`, {})).status,
        ).toBe(200);
      });

      it("impacto antes de confirmar: cuenta los perfiles y no cambia nada; cancelar deja todo igual", async () => {
        const figma = await idDe("catalogo_tecnologias", "Figma");
        const fgima = await idDe("catalogo_tecnologias", "Fgima");
        const perfil = (
          await bd.instalacion.query(`SELECT id FROM inventario.perfiles WHERE codigo = 'PS-0142'`)
        ).rows[0].id;
        await bd.instalacion.query(
          `INSERT INTO inventario.perfil_tecnologias (perfil_id, valor_id, orden) VALUES ($1, $2, 9)`,
          [perfil, fgima],
        );
        const v0 = await version();
        const r = await enviar(`/api/v1/catalogos/tecnologia/${fgima}/fusionar?previsualizar`, {
          destinoId: figma,
        });
        expect(r.status).toBe(200);
        const { impacto } = await r.json();
        expect(impacto.perfiles.map((p: { codigo: string }) => p.codigo)).toEqual(["PS-0142"]);
        expect(await version()).toBe(v0);
        const sigue = await bd.instalacion.query(
          `SELECT activo FROM inventario.catalogo_tecnologias WHERE id = $1`,
          [fgima],
        );
        expect(sigue.rows[0].activo).toBe(true);
      });

      it("error: mismo valor o catálogos distintos → 409 con motivo y nada cambia", async () => {
        const fgima = await idDe("catalogo_tecnologias", "Fgima");
        const banca = await idDe("catalogo_sectores", "Banca");
        const mismo = await enviar(`/api/v1/catalogos/tecnologia/${fgima}/fusionar`, {
          destinoId: fgima,
        });
        expect(mismo.status).toBe(409);
        expect((await mismo.json()).motivo).toBe("mismo_valor");
        const distinto = await enviar(`/api/v1/catalogos/tecnologia/${fgima}/fusionar`, {
          destinoId: banca,
        });
        expect(distinto.status).toBe(409);
        expect((await distinto.json()).motivo).toBe("distinto_catalogo");
      });

      it("confirmar: el perfil pasa a Figma y Fgima sale del catálogo", async () => {
        const figma = await idDe("catalogo_tecnologias", "Figma");
        const fgima = await idDe("catalogo_tecnologias", "Fgima");
        const r = await enviar(`/api/v1/catalogos/tecnologia/${fgima}/fusionar`, {
          destinoId: figma,
        });
        expect(await r.json()).toMatchObject({ reasignados: 1, destino: "Figma" });
        const t = await (await leer("/api/v1/catalogos/tecnologia")).json();
        expect(t.valores.find((v: { id: string }) => v.id === fgima)).toMatchObject({
          activo: false,
          fusionadoEn: figma,
        });
        const html = await (await leer("/catalogos?tipo=tecnologia")).text();
        expect(html).toContain("Figma");
        expect(html).not.toContain(">Fgima<");
      });
    });

    describe("HU-139 léxico", () => {
      it("error: equivalencia a un valor inexistente → 422 con lo más parecido y nada escrito", async () => {
        const r = await enviar("/api/v1/lexico", {
          termino: "pagos instantáneos",
          sinonimos: [],
          tipo: "tecnologia",
          valores: ["Kafka Streams"],
        });
        expect(r.status).toBe(422);
        const c = await r.json();
        expect(c).toMatchObject({ motivo: "valor_inexistente", valor: "Kafka Streams" });
        expect(c.sugerencias[0]).toBe("Kafka");
        expect(
          (await bd.instalacion.query(`SELECT count(*)::int n FROM inventario.lexico`)).rows[0].n,
        ).toBe(0);
      });

      it("happy: registro el término y la búsqueda siguiente del portal lo reconoce, sin despliegue", async () => {
        const portal = bd.como("ps_portal");
        expect(
          (await interpretarConsulta(portal, "especialista en core bancario")).reconocidos,
        ).toEqual([]);
        const r = await enviar("/api/v1/lexico", {
          termino: "core bancario",
          sinonimos: ["núcleo bancario"],
          tipo: "sector",
          valores: ["Banca"],
        });
        expect(r.status).toBe(201);
        const despues = await interpretarConsulta(portal, "especialista en núcleo bancario");
        expect(despues.reconocidos[0]!.valores).toEqual([{ tipo: "sector", nombre: "Banca" }]);
      });

      it("propuestas: aprobar tal cual y editada entran; rechazar no entra ni vuelve", async () => {
        const worker = bd.como("ps_worker");
        const doble = new DobleGemini();
        const corrida = await proponerLexico({
          bd: worker,
          proponedor: doble,
          registrar: () => {},
        });
        expect(corrida.propuestas).toBeGreaterThanOrEqual(2);
        expect(JSON.stringify(doble.recibidos).toLowerCase()).not.toMatch(
          /laura|m[eé]ndez|pasarelas/,
        );
        const pendientes = (
          await bd.instalacion.query(
            `SELECT id, termino FROM inventario.propuestas_lexico WHERE estado = 'pendiente' ORDER BY termino`,
          )
        ).rows as Array<{ id: string; termino: string }>;
        const [a, b] = pendientes;
        const tal = await enviar(`/api/v1/lexico/propuestas/${a!.id}/aprobar`, {});
        expect(tal.status).toBe(200);
        const editada = await enviar(`/api/v1/lexico/propuestas/${b!.id}/aprobar`, {
          edicion: {
            termino: "pagos en tiempo real",
            sinonimos: ["pagos inmediatos"],
            tipo: "tecnologia",
            valores: ["Kafka"],
          },
        });
        expect(editada.status).toBe(200);
        const portal = bd.como("ps_portal");
        expect(
          (await interpretarConsulta(portal, "pagos inmediatos")).reconocidos[0]!.valores,
        ).toEqual([{ tipo: "tecnologia", nombre: "Kafka" }]);
        const resto = pendientes.slice(2);
        for (const x of resto) {
          expect((await enviar(`/api/v1/lexico/propuestas/${x.id}/rechazar`, {})).status).toBe(200);
          expect((await enviar(`/api/v1/lexico/propuestas/${x.id}/aprobar`, {})).status).toBe(409);
        }
        const html = await (await leer("/lexico")).text();
        expect(html).toContain("Propuestas de Gemini por aprobar");
        expect(html).toContain("No hay propuestas pendientes");
      });

      it("candidatas: se ofrecen con lo no reconocido subrayado y van a reclutamiento o se descartan", async () => {
        const html = await (await leer("/lexico?vista=candidatas")).text();
        expect(html).toContain("Búsquedas sin resultados");
        expect(html).toMatch(/class="lx-norec">desarrollador COBOL</);
        const cobol = (
          await bd.instalacion.query(
            `SELECT id FROM inventario.candidatas_lexico WHERE consulta LIKE 'desarrollador COBOL%'`,
          )
        ).rows[0].id;
        const r = await enviar(`/api/v1/lexico/candidatas/${cobol}`, {
          destino: "agenda_reclutamiento",
        });
        expect(r.status).toBe(200);
        expect(
          (await enviar(`/api/v1/lexico/candidatas/${cobol}`, { destino: "descartada" })).status,
        ).toBe(409);
        const despues = await (await leer("/lexico?vista=candidatas")).text();
        expect(despues).toContain("En la agenda de reclutamiento");
      });
    });

    describe("observadora y CSRF (V2-3)", () => {
      it("la observadora ve las pantallas sin acciones y el servidor le responde 403 sin cambiar nada", async () => {
        const v0 = await version();
        const figma = await idDe("catalogo_tecnologias", "Figma");
        for (const [ruta, cuerpo] of [
          ["/api/v1/catalogos/tecnologia", { nombre: "Sketch" }],
          [`/api/v1/catalogos/tecnologia/${figma}/desactivar`, {}],
          [`/api/v1/catalogos/tecnologia/${figma}/fusionar`, { destinoId: figma }],
          ["/api/v1/lexico", { termino: "x", sinonimos: [], tipo: "sector", valores: ["Banca"] }],
        ] as const) {
          const r = await enviar(ruta, cuerpo, observador);
          expect(r.status, ruta).toBe(403);
        }
        expect(await version()).toBe(v0);
        const cat = await (await leer("/catalogos", observador)).text();
        expect(cat).toContain("Catálogos");
        expect(cat).not.toContain("Crear rol");
        expect(cat).not.toContain("Fusionar duplicados");
        const lex = await (await leer("/lexico", observador)).text();
        expect(lex).not.toContain("Guardar en el léxico");
      });

      it("sin la cabecera CSRF → 403", async () => {
        const r = await srv.pedir("/api/v1/catalogos/sector", {
          method: "POST",
          body: JSON.stringify({ nombre: "Minería" }),
          headers: { "content-type": "application/json", origin: srv.url, cookie: admin },
        });
        expect(r.status).toBe(403);
      });

      it("la cadena de auditoría sigue íntegra tras todo el recorrido", async () => {
        expect(await verificarCadena(bd.instalacion, entorno.AUDIT_HMAC_KEY!)).toMatchObject({
          ok: true,
        });
        const actores = await bd.instalacion.query(
          `SELECT DISTINCT actor FROM auditoria.auditoria WHERE entidad IN ('catalogo_roles', 'catalogo_tecnologias', 'lexico', 'propuestas_lexico', 'candidatas_lexico')`,
        );
        expect(actores.rows.map((r) => r.actor)).toEqual(["karen@trycore.com"]);
      });
    });
  },
);
