// Contrato HTTP de las validaciones de entrada (EP-003 · sub-slice 1: HU-177, HU-176) contra el
// servidor standalone real del panel (`ps_panel` por PgBouncer), con los perfiles ficticios: el
// catálogo de alcances SARO (crear con su texto, duplicado salvo mayúsculas, corrección con impacto
// previo, desactivar sin borrar), el editor (alcance del catálogo, fechas, fecha futura → 422 sin
// escribir), el bloqueo de publicar con «Falta …» (individual y masiva), la corrección de un publicado
// en dos pasos, la vista previa con el texto del alcance y «mes de año», y la observadora → 403. Lo
// que ve el cliente se lee como `ps_portal` en la vista de la ficha.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { leerCambios } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";
import { sembrarLexicoFicticio } from "./worker/src/sembrar-lexico";

const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";
const TEXTO = "Verificamos antecedentes judiciales, disciplinarios y fiscales.";
// Fecha civil de Bogotá a `dias` de hoy (la regla de fecha no futura usa el reloj real del servidor).
const diaBogota = (dias: number) =>
  new Date(Date.now() - 5 * 3_600_000 + dias * 86_400_000).toISOString().slice(0, 10);

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Validaciones de entrada en el panel (HU-177, HU-176)",
  () => {
    let bd: BdPrueba;
    let srv: ServidorPrueba;
    let portal: pg.Pool;
    let entorno: Record<string, string>;
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
      experiencias: [{ cargo: "Backend senior", desde: 2021, descripcion: "Pagos inmediatos." }],
      ...extra,
    });
    type Perfil = {
      codigo: string;
      version: number;
      estado: string;
      saro: {
        alcance: { id: string; nombre: string; activo: boolean } | null;
        fecha: string | null;
      };
      disc: { fecha: string | null };
      id: string;
    };
    // Borrador con consentimiento nominal: lo que decide si se publica es lo de SARO/DISC.
    const borrador = async (extra: Record<string, unknown> = {}): Promise<Perfil> => {
      const p = (await (await enviar("/api/v1/perfiles", await completo(extra))).json()).perfil;
      return (
        await (
          await enviar(`/api/v1/perfiles/${p.codigo}/consentimiento`, {
            nombreApellido: true,
            trayectoria: true,
            clientes: true,
          })
        ).json()
      ).perfil;
    };
    const saroDisc = (extra: Record<string, unknown> = {}) => ({
      saroAlcanceId: alcance,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
      ...extra,
    });
    const publicar = (p: { codigo: string; version: number }, cookie?: string) =>
      enviar(`/api/v1/perfiles/${p.codigo}/publicar`, {}, { version: p.version, cookie });
    const publicado = async (extra: Record<string, unknown> = {}): Promise<Perfil> => {
      const p = await borrador(saroDisc(extra));
      return (await (await publicar(p)).json()).perfil;
    };
    const fichaPortal = async (codigo: string) =>
      (
        await portal.query(
          `SELECT saro_texto, saro_fecha::text AS saro_fecha, disc_fecha::text AS disc_fecha
             FROM operacion.ficha_publicable WHERE codigo = $1`,
          [codigo],
        )
      ).rows[0];

    beforeAll(async () => {
      bd = await crearBdPrueba();
      portal = bd.como("ps_portal");
      entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      await sembrarFicticios({
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
      // El catálogo arranca sin el alcance de la historia (HU-177 Dado): la siembra trae el suyo con
      // otro nombre para no chocar.
      await bd.instalacion.query(
        `UPDATE inventario.catalogo_alcances_saro SET nombre = 'Alcance ficticio sembrado' WHERE nombre = $1`,
        [ANTECEDENTES],
      );
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      srv = await arrancarServidor("panel", entorno);
    }, 120_000);

    afterAll(async () => {
      await srv?.cerrar();
      await bd?.cerrar();
    });

    describe("HU-177 · catálogo de alcances SARO", () => {
      it("happy: crear con su texto → 201; queda para elegir (sin texto libre) y el editor lo ofrece", async () => {
        const r = await enviar("/api/v1/catalogos/alcance_saro", {
          nombre: ANTECEDENTES,
          textoCliente: TEXTO,
        });
        expect(r.status).toBe(201);
        alcance = (await r.json()).valor.id;
        const q = await (await leer("/api/v1/catalogos/alcance_saro?q=judiciales")).json();
        expect(q.valores.map((v: { nombre: string }) => v.nombre)).toContain(ANTECEDENTES);
        const lista = await (await leer("/api/v1/catalogos/alcance_saro")).json();
        expect(lista.valores.find((v: { id: string }) => v.id === alcance)).toMatchObject({
          textoCliente: TEXTO,
        });
        const p = await borrador();
        const html = await (await leer(`/inventario/${p.codigo}`)).text();
        expect(html).toContain('id="pe-saro-alcance"');
        expect(html).toContain(ANTECEDENTES);
        const pagina = await (await leer("/catalogos?tipo=alcance_saro")).text();
        expect(pagina).toContain("Alcances SARO");
        expect(pagina).toContain(TEXTO);
      });

      it("el editor no admite escribir un alcance: texto → 400; id fuera del catálogo → 422", async () => {
        const p = await borrador();
        const texto = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          { saroAlcanceId: "Antecedentes inventados" },
          { metodo: "PATCH", version: p.version },
        );
        expect(texto.status).toBe(400);
        const fuera = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          { saroAlcanceId: "00000000-0000-4000-8000-000000000099" },
          { metodo: "PATCH", version: p.version },
        );
        expect(fuera.status).toBe(422);
        expect((await fuera.json()).motivo).toBe("valor_no_disponible");
      });

      it("sin texto de cara al cliente → 422 `texto_cliente_requerido`", async () => {
        const r = await enviar("/api/v1/catalogos/alcance_saro", {
          nombre: "Antecedentes laborales",
        });
        expect(r.status).toBe(422);
        expect((await r.json()).motivo).toBe("texto_cliente_requerido");
      });

      it("error: idéntico salvo mayúsculas → 409 `duplicado` con la forma registrada", async () => {
        const r = await enviar("/api/v1/catalogos/alcance_saro", {
          nombre: "antecedentes judiciales, disciplinarios y fiscales",
          textoCliente: "Otro",
        });
        expect(r.status).toBe(409);
        expect(await r.json()).toMatchObject({
          motivo: "duplicado",
          existente: { nombre: ANTECEDENTES },
        });
      });

      it("la observadora no administra el catálogo ni edita perfiles: 403", async () => {
        const c = await enviar(
          "/api/v1/catalogos/alcance_saro",
          { nombre: "Antecedentes de observadora", textoCliente: "x" },
          { cookie: observador },
        );
        expect(c.status).toBe(403);
        const e = await enviar(
          `/api/v1/catalogos/alcance_saro/${alcance}?previsualizar`,
          { nombre: ANTECEDENTES, textoCliente: "y" },
          { metodo: "PATCH", cookie: observador },
        );
        expect(e.status).toBe(403);
        const p = await borrador();
        const g = await enviar(`/api/v1/perfiles/${p.codigo}`, saroDisc(), {
          metodo: "PATCH",
          version: p.version,
          cookie: observador,
        });
        expect(g.status).toBe(403);
      });

      it("edge: corregir el texto de un alcance en 4 fichas publicadas → aviso previo de 4 sin escribir; confirmar → las 4 muestran el texto nuevo y el historial guarda quién, cuándo, antes y después", async () => {
        const r = await enviar("/api/v1/catalogos/alcance_saro", {
          nombre: "Antecedentes judiciales y disciplinarios",
          textoCliente: "Texto anterior.",
          confirmarDistinto: true,
        });
        const usado = (await r.json()).valor.id as string;
        const fichas = [];
        for (let k = 0; k < 4; k++) fichas.push(await publicado({ saroAlcanceId: usado }));
        const pre = await enviar(
          `/api/v1/catalogos/alcance_saro/${usado}?previsualizar`,
          { nombre: "Antecedentes judiciales y disciplinarios", textoCliente: "Texto nuevo." },
          { metodo: "PATCH" },
        );
        expect(pre.status).toBe(200);
        const impacto = (await pre.json()).impacto;
        expect(impacto.publicados.map((x: { codigo: string }) => x.codigo).sort()).toEqual(
          fichas.map((f) => f.codigo).sort(),
        );
        for (const f of fichas)
          expect((await fichaPortal(f.codigo)).saro_texto).toBe("Texto anterior.");
        const ok = await enviar(
          `/api/v1/catalogos/alcance_saro/${usado}`,
          { nombre: "Antecedentes judiciales y disciplinarios", textoCliente: "Texto nuevo." },
          { metodo: "PATCH" },
        );
        expect(ok.status).toBe(200);
        for (const f of fichas)
          expect((await fichaPortal(f.codigo)).saro_texto).toBe("Texto nuevo.");
        const cambios = await leerCambios(
          bd.instalacion,
          entorno.AUDIT_KEK!,
          "catalogo_alcances_saro",
          usado,
        );
        expect(cambios.at(-1)).toMatchObject({
          actor: "karen@trycore.com",
          campo: "texto_cliente",
          antes: "Texto anterior.",
          despues: "Texto nuevo.",
          origen: "panel",
        });
      });

      it("edge: desactivar un alcance en 2 publicados → 200 con 2 dependientes; deja de ofrecerse; los perfiles y sus fichas lo conservan; no hay borrado (DELETE no existe)", async () => {
        const r = await enviar("/api/v1/catalogos/alcance_saro", {
          nombre: "Antecedentes judiciales",
          textoCliente: "Verificamos antecedentes judiciales.",
          confirmarDistinto: true,
        });
        const retirado = (await r.json()).valor.id as string;
        const a = await publicado({ saroAlcanceId: retirado });
        const b = await publicado({ saroAlcanceId: retirado });
        const dep = await (await leer(`/api/v1/catalogos/alcance_saro/${retirado}`)).json();
        expect(dep.publicados).toHaveLength(2);
        const d = await enviar(`/api/v1/catalogos/alcance_saro/${retirado}/desactivar`, {});
        expect(d.status).toBe(200);
        expect(await d.json()).toMatchObject({ activo: false, dependientes: 2 });
        const q = await (await leer("/api/v1/catalogos/alcance_saro?q=judiciales")).json();
        expect(q.valores.map((v: { id: string }) => v.id)).not.toContain(retirado);
        for (const p of [a, b]) {
          const l = (await (await leer(`/api/v1/perfiles/${p.codigo}`)).json()).perfil;
          expect(l.saro.alcance).toMatchObject({ id: retirado, activo: false });
          expect((await fichaPortal(p.codigo)).saro_texto).toBe(
            "Verificamos antecedentes judiciales.",
          );
        }
        const borrar = await enviar(
          `/api/v1/catalogos/alcance_saro/${retirado}`,
          {},
          { metodo: "DELETE" },
        );
        expect(borrar.status).toBe(405);
        const nuevo = await borrador();
        const asignar = await enviar(
          `/api/v1/perfiles/${nuevo.codigo}`,
          { saroAlcanceId: retirado },
          { metodo: "PATCH", version: nuevo.version },
        );
        expect(asignar.status).toBe(422);
        const html = await (await leer(`/inventario/${nuevo.codigo}`)).text();
        expect(html).not.toContain("Antecedentes judiciales (desactivado)");
      });

      it("edge: editar el resumen de un publicado que conserva un alcance desactivado → impacto sin pregunta; confirmar lo deja publicado con el alcance; el editor lo muestra señalado", async () => {
        const r = await enviar("/api/v1/catalogos/alcance_saro", {
          nombre: "Antecedentes judiciales recientes",
          textoCliente: "Verificamos antecedentes judiciales recientes.",
          confirmarDistinto: true,
        });
        const retirado = (await r.json()).valor.id as string;
        const p = await publicado({ saroAlcanceId: retirado });
        await enviar(`/api/v1/catalogos/alcance_saro/${retirado}/desactivar`, {});
        const html = await (await leer(`/inventario/${p.codigo}`)).text();
        expect(html).toContain("Antecedentes judiciales recientes (desactivado)");
        expect(html).toContain("Desactivado en el catálogo");
        const cambio = { resumen: "Resumen corregido.", saroAlcanceId: retirado };
        const pre = await enviar(`/api/v1/perfiles/${p.codigo}?previsualizar`, cambio, {
          metodo: "PATCH",
          version: p.version,
        });
        expect(pre.status).toBe(200);
        const dp = await pre.json();
        expect(dp.motivo).toBeUndefined();
        expect(dp.impacto.cambios.map((c: { campo: string }) => c.campo)).toEqual(["resumen"]);
        const ok = await enviar(`/api/v1/perfiles/${p.codigo}`, cambio, {
          metodo: "PATCH",
          version: p.version,
        });
        expect(ok.status).toBe(200);
        const l = (await ok.json()).perfil;
        expect(l.estado).toBe("publicado");
        expect(l.saro.alcance).toMatchObject({ id: retirado, activo: false });
        expect(l.evaluacion.publicable).toBe(true);
        expect((await fichaPortal(p.codigo)).saro_texto).toBe(
          "Verificamos antecedentes judiciales recientes.",
        );
      });
    });

    describe("HU-176 · captura y bloqueo", () => {
      it("happy: guardar los tres datos → 200; la vista previa muestra el texto del alcance con «marzo de 2026» y la DISC con «abril de 2026»", async () => {
        const p = await borrador();
        expect(p.saro).toEqual({ alcance: null, fecha: null });
        const g = await enviar(`/api/v1/perfiles/${p.codigo}`, saroDisc(), {
          metodo: "PATCH",
          version: p.version,
        });
        expect(g.status).toBe(200);
        const l = (await g.json()).perfil as Perfil;
        expect(l.saro).toMatchObject({ alcance: { id: alcance }, fecha: "2026-03-15" });
        expect(l.disc).toEqual({ fecha: "2026-04-10" });
        const previa = await (await leer(`/inventario/${p.codigo}?vista=ficha`)).text();
        expect(previa).toContain("Verificación de seguridad SARO");
        expect(previa).toContain(`${TEXTO} · marzo de 2026`);
        expect(previa).toContain("Evaluación DISC");
        expect(previa).toContain("abril de 2026");
      });

      it("error: una fecha posterior a hoy → 422 con su campo y mensaje; el perfil conserva lo que tenía", async () => {
        const p = await borrador(saroDisc());
        const r = await enviar(
          `/api/v1/perfiles/${p.codigo}`,
          { saroFecha: diaBogota(44), resumen: "no debe guardarse" },
          { metodo: "PATCH", version: p.version },
        );
        expect(r.status).toBe(422);
        expect(await r.json()).toMatchObject({
          motivo: "fecha_verificacion_futura",
          campo: "saroFecha",
        });
        const l = (await (await leer(`/api/v1/perfiles/${p.codigo}`)).json()).perfil;
        expect(l.version).toBe(p.version);
        expect(l.saro.fecha).toBe("2026-03-15");
        expect(l.resumen).toBeNull();
      });

      it.each([
        ["el alcance de la verificación SARO", { saroAlcanceId: null }, "saro_alcance"],
        ["la fecha de la verificación SARO", { saroFecha: null }, "saro_fecha"],
        ["la fecha de la evaluación DISC", { discFecha: null }, "disc_fecha"],
      ])(
        "error: publicar sin %s → 409 con «Falta …» y su campo; sigue en borrador y fuera del portal",
        async (motivo, quitar, clave) => {
          const p = await borrador(saroDisc(quitar));
          const r = await publicar(p);
          expect(r.status).toBe(409);
          const d = await r.json();
          expect(d.motivo).toBe("no_publicable");
          const fallan = d.evaluacion.condiciones.filter((c: { cumple: boolean }) => !c.cumple);
          expect(fallan).toEqual([expect.objectContaining({ clave, motivo, campo: clave })]);
          const l = (await (await leer(`/api/v1/perfiles/${p.codigo}`)).json()).perfil;
          expect(l.estado).toBe("borrador");
          expect(await fichaPortal(p.codigo)).toBeUndefined();
        },
      );

      it("publicación masiva: el que no tiene DISC queda con su motivo y no aborta a los demás", async () => {
        const ok = await borrador(saroDisc());
        const sin = await borrador(saroDisc({ discFecha: null }));
        const r = await enviar("/api/v1/perfiles/publicar", { codigos: [ok.codigo, sin.codigo] });
        expect(r.status).toBe(200);
        const d = await r.json();
        expect(d.publicados).toBe(1);
        expect(d.resultados.find((x: { codigo: string }) => x.codigo === sin.codigo)).toMatchObject(
          {
            ok: false,
            motivos: ["disc_fecha"],
            condiciones: [
              expect.objectContaining({
                clave: "disc_fecha",
                motivo: "la fecha de la evaluación DISC",
              }),
            ],
          },
        );
      });

      it("edge: corregir la fecha SARO de un publicado → el impacto la declara al cliente; confirmar → la ficha muestra febrero y el historial guarda quién, cuándo, antes y después", async () => {
        const p = await publicado();
        const cambio = { saroFecha: "2026-02-20" };
        const pre = await enviar(`/api/v1/perfiles/${p.codigo}?previsualizar`, cambio, {
          metodo: "PATCH",
          version: p.version,
        });
        expect(pre.status).toBe(200);
        expect((await pre.json()).impacto.cambios).toEqual([
          {
            campo: "seguridad",
            etiqueta: "Verificación de seguridad SARO",
            antes: `${TEXTO} · marzo de 2026`,
            despues: `${TEXTO} · febrero de 2026`,
          },
        ]);
        expect((await fichaPortal(p.codigo)).saro_fecha).toBe("2026-03-15");
        const ok = await enviar(`/api/v1/perfiles/${p.codigo}`, cambio, {
          metodo: "PATCH",
          version: p.version,
        });
        expect(ok.status).toBe(200);
        expect((await fichaPortal(p.codigo)).saro_fecha).toBe("2026-02-20");
        const previa = await (await leer(`/inventario/${p.codigo}?vista=ficha`)).text();
        expect(previa).toContain("febrero de 2026");
        const historial = await (await leer(`/inventario/${p.codigo}/auditoria`)).text();
        expect(historial).toContain("Fecha de la verificación SARO");
        expect(historial).toContain("15 mar 2026");
        expect(historial).toContain("20 feb 2026");
        expect(historial).toContain("karen@trycore.com");
      });
    });
  },
);
