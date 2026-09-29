// Sub-slice 6b de EP-001: HU-095 (invitar a un colega desde el portal) y HU-145 (decidir la petición en el
// panel), de punta a punta con los dos servidores standalone reales sobre la misma BD y el worker en
// proceso para el aviso a Talento Humano (tarea 7.4: pedir → aprobar → entrar; pedir → rechazar → sin
// acceso). El código del colega llega por el modo degradado al doble de correo del portal.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { generarTokenEnlace } from "@ps/dominio/enlaces/crear";
import { DobleHubspot } from "@ps/infra/hubspot/index";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { vuelta, type ContextoDespacho } from "./worker/src/despacho";

const TALENTO = "people.service@trycore.com";

describe.skipIf(!HAY_BD || !hayBuild("portal") || !hayBuild("panel"))(
  "invitar a un colega (HU-095, HU-145)",
  () => {
    let bd: BdPrueba;
    let portal: ServidorPrueba;
    let panel: ServidorPrueba;
    let entorno: Record<string, string>;
    let cookiePanel: string;
    let cookieObservador: string;
    let correo: DobleCorreo;
    let ctx: ContextoDespacho;
    const csrf = randomBytes(16).toString("hex");
    const workerEnv = entornoDev("worker");
    const panelEnv = entornoDev("panel");
    let ip = 0;

    const post = (srv: ServidorPrueba, ruta: string, cuerpo: unknown, cookie = "") =>
      srv.pedir(ruta, {
        method: "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          "do-connecting-ip": `10.5.0.${++ip % 250}`,
          cookie: [`__Host-csrf=${csrf}`, cookie].filter(Boolean).join("; "),
        },
      });

    async function sesionPortal(enlaceId: string, invitadoId: string) {
      const id = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '10 days')`,
        [createHash("sha256").update(id).digest(), enlaceId, invitadoId],
      );
      return `__Host-ps=${id}`;
    }

    async function sembrar(o: { vigenteHasta?: string; estado?: string } = {}) {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por, estado, revocado_en)
       VALUES ('Bancolombia', 'Modernización de pagos', 'La razón.', '{}', now() - interval '40 days', $1, gen_random_uuid(), $2,
               CASE WHEN $2::text = 'revocado' THEN now() END) RETURNING id, codigo`,
        [
          o.vigenteHasta ?? new Date(Date.now() + 20 * 86_400_000).toISOString(),
          o.estado ?? "activo",
        ],
      );
      const correoInv = `mariana-${randomBytes(3).toString("hex")}@bancolombia.com.co`;
      const i = await bd.instalacion.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3) RETURNING id`,
        [e.rows[0].id, correoInv, hmacCorreo(correoInv, entorno.EMAIL_HMAC_KEY!)],
      );
      const { token, hash } = generarTokenEnlace();
      await bd.instalacion.query(
        `INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`,
        [e.rows[0].id, hash],
      );
      return {
        enlaceId: e.rows[0].id as string,
        codigo: e.rows[0].codigo as string,
        token,
        correoInv,
        cookie: await sesionPortal(e.rows[0].id, i.rows[0].id),
      };
    }


    async function panelSesion(rol: "administrador" | "observador") {
      const correoPanel = `${rol}-${randomBytes(2).toString("hex")}@trycore.com`;
      const u = await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
        [correoPanel, hmacCorreo(correoPanel, panelEnv.EMAIL_HMAC_KEY!), rol],
      );
      const id = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
        [createHash("sha256").update(id).digest(), u.rows[0].id],
      );
      return `__Host-pp=${id}`;
    }

    const pedir = async (cookie: string, cuerpo: Record<string, string>) => {
      const r = await post(portal, "/api/v1/invitaciones", cuerpo, cookie);
      return { status: r.status, cuerpo: await r.json() };
    };

    beforeAll(async () => {
      bd = await crearBdPrueba();
      entorno = { ...entornoDev("portal"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_portal") };
      portal = await arrancarServidor("portal", entorno);
      panel = await arrancarServidor("panel", {
        ...panelEnv,
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_panel"),
      });
      cookiePanel = await panelSesion("administrador");
      cookieObservador = await panelSesion("observador");
    }, 120_000);

    beforeEach(() => {
      correo = new DobleCorreo();
      ctx = {
        bd: bd.como("ps_worker"),
        correo,
        peppers: { cliente: workerEnv.OTP_PEPPER_CLIENTE!, panel: workerEnv.OTP_PEPPER_PANEL! },
        reclamo: `prueba-${randomBytes(3).toString("hex")}`,
        registrar: () => {},
        renovacion: {
          hubspot: new DobleHubspot(),
          portalOrigen: "https://people.trycore.com",
          correoTalentoHumano: TALENTO,
          auditoria: { hmac: workerEnv.AUDIT_HMAC_KEY!, kek: workerEnv.AUDIT_KEK! },
        },
      };
    });

    afterAll(async () => {
      await portal?.cerrar();
      await panel?.cerrar();
      await bd?.cerrar();
    });

    it("HU-095 pendiente: la petición queda registrada y visible, Talento Humano recibe el aviso y el colega sigue sin acceso", async () => {
      const e = await sembrar();
      const r = await pedir(e.cookie, {
        correo: "Natalia@Bancolombia.com.co",
        nombre: "Natalia Cárdenas",
        para_que: "Revisar backend",
      });
      expect(r.status).toBe(201);
      // Idempotente: una sola pendiente por enlace y correo.
      expect((await pedir(e.cookie, { correo: "natalia@bancolombia.com.co" })).cuerpo.id).toBe(
        r.cuerpo.id,
      );
      expect(await vuelta(ctx)).toBe(1);
      expect(correo.enviados.map((m) => m.para)).toEqual([TALENTO]);
      expect(correo.enviados[0]!.texto).toContain(e.correoInv);
      expect(correo.enviados[0]!.texto).toContain("natalia@bancolombia.com.co");
      expect(correo.enviados[0]!.texto).toContain(e.codigo);
      const pagina = await (
        await portal.pedir("/invitar", { headers: { cookie: e.cookie } })
      ).text();
      expect(pagina).toContain("natalia@bancolombia.com.co");
      expect(pagina).toContain("Pendiente");
      // Sin aprobar, el colega pide código y no le llega (respuesta neutra).
      const c = await post(portal, "/api/v1/acceso/codigo", {
        token: e.token,
        correo: "natalia@bancolombia.com.co",
      });
      expect(c.status).toBe(202);
      await new Promise((res) => setTimeout(res, 800));
      expect(portal.salida()).not.toMatch(/correo_doble[^\n]*natalia@bancolombia\.com\.co/);
    });

    it("no se puede pedir para uno mismo ni con un correo inválido", async () => {
      const e = await sembrar();
      expect((await pedir(e.cookie, { correo: e.correoInv.toUpperCase() })).cuerpo).toEqual({
        motivo: "es_tu_correo",
      });
      expect((await pedir(e.cookie, { correo: "no-es-correo" })).cuerpo).toEqual({
        motivo: "correo_invalido",
      });
      expect((await post(portal, "/api/v1/invitaciones", { correo: "x@y.com" })).status).toBe(401);
    });

    it("tarea 7.4 pedir → aprobar → entrar: el colega ve la misma selección con su propio Mi equipo vacío; auditado", async () => {
      const e = await sembrar();
      const { cuerpo } = await pedir(e.cookie, { correo: "andres@bancolombia.com.co" });
      const aprobar = await post(
        panel,
        `/api/v1/invitaciones/${cuerpo.id}/aprobar`,
        {},
        cookiePanel,
      );
      expect(aprobar.status).toBe(200);
      const inv = await bd.instalacion.query(
        `SELECT origen, count(*) OVER ()::int n FROM identidad.enlace_invitados WHERE enlace_id = $1 AND correo = 'andres@bancolombia.com.co'`,
        [e.enlaceId],
      );
      expect(inv.rows).toEqual([{ origen: "invitacion_aprobada", n: 1 }]);
      const aud = await bd.instalacion.query(
        `SELECT campo FROM auditoria.auditoria WHERE entidad = 'invitaciones_solicitadas' AND entidad_id = $1 ORDER BY seq`,
        [cuerpo.id],
      );
      expect(aud.rows.map((f) => f.campo)).toEqual(["estado", "enlace", "correo"]);
      expect((await verificarCadena(bd.instalacion, panelEnv.AUDIT_HMAC_KEY!)).ok).toBe(true);
      // Se resuelve una vez.
      expect(
        (await post(panel, `/api/v1/invitaciones/${cuerpo.id}/aprobar`, {}, cookiePanel)).status,
      ).toBe(409);
      // El colega entra con su correo y su código.
      expect(
        (
          await post(portal, "/api/v1/acceso/codigo", {
            token: e.token,
            correo: "andres@bancolombia.com.co",
          })
        ).status,
      ).toBe(202);
      // El worker está vivo (vuelta previa): entrega él el código, por el doble de correo del contexto.
      expect(await vuelta(ctx)).toBeGreaterThanOrEqual(1);
      const codigo = correo.enviados
        .filter((m) => m.para === "andres@bancolombia.com.co")
        .at(-1)!
        .texto.match(/(\d{3}) (\d{3})/)!
        .slice(1)
        .join("");
      const v = await post(portal, "/api/v1/acceso/verificar", {
        token: e.token,
        correo: "andres@bancolombia.com.co",
        codigo,
      });
      expect(v.status).toBe(204);
      const sesion = (v.headers.get("set-cookie") ?? "").split(";")[0]!;
      const inicio = await (await portal.pedir("/", { headers: { cookie: sesion } })).text();
      expect(inicio).toContain("Bancolombia · Modernización de pagos");
      expect(inicio).toMatch(/pp-equipo__conteo[^"]*" aria-hidden="true">0</);
      const pagina = await (
        await portal.pedir("/invitar", { headers: { cookie: e.cookie } })
      ).text();
      expect(pagina).toContain("Aprobada");
    }, 20_000);

    it("tarea 7.4 pedir → rechazar → sin acceso: motivo obligatorio, auditado, visible para quien pidió", async () => {
      const e = await sembrar();
      const { cuerpo } = await pedir(e.cookie, {
        correo: "sebastian@nexoconsultores.co",
        nombre: "Sebastián Mora",
      });
      expect(
        (
          await post(
            panel,
            `/api/v1/invitaciones/${cuerpo.id}/rechazar`,
            { motivo: " " },
            cookiePanel,
          )
        ).status,
      ).toBe(400);
      const r = await post(
        panel,
        `/api/v1/invitaciones/${cuerpo.id}/rechazar`,
        { motivo: "Correo de una empresa externa." },
        cookiePanel,
      );
      expect(r.status).toBe(200);
      const inv = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.enlace_invitados WHERE correo = 'sebastian@nexoconsultores.co'`,
      );
      expect(inv.rows[0].n).toBe(0);
      const aud = await bd.instalacion.query(
        `SELECT campo FROM auditoria.auditoria WHERE entidad = 'invitaciones_solicitadas' AND entidad_id = $1 ORDER BY seq`,
        [cuerpo.id],
      );
      expect(aud.rows.map((f) => f.campo)).toEqual(["estado", "enlace", "correo", "motivo"]);
      const pagina = await (
        await portal.pedir("/invitar", { headers: { cookie: e.cookie } })
      ).text();
      expect(pagina).toContain("Talento Humano no aprobó la invitación de Sebastián Mora.");
      expect(pagina).toContain("Correo de una empresa externa.");
      expect(pagina).toContain("people.service@trycore.com");
      await post(portal, "/api/v1/acceso/codigo", {
        token: e.token,
        correo: "sebastian@nexoconsultores.co",
      });
      await new Promise((res) => setTimeout(res, 800));
      expect(portal.salida()).not.toMatch(/correo_doble[^\n]*sebastian@nexoconsultores\.co/);
    });

    it("HU-145: en un enlace vencido o revocado la petición se marca y no se puede aprobar", async () => {
      for (const o of [
        { vigenteHasta: new Date(Date.now() - 86_400_000).toISOString() },
        { estado: "revocado" },
      ]) {
        const e = await sembrar();
        const { cuerpo } = await pedir(e.cookie, {
          correo: `colega-${randomBytes(2).toString("hex")}@b.com`,
        });
        await bd.instalacion.query(
          `UPDATE identidad.enlaces SET vigente_hasta = coalesce($2::timestamptz, vigente_hasta), estado = coalesce($3, estado),
                revocado_en = CASE WHEN $3 = 'revocado' THEN now() ELSE revocado_en END WHERE id = $1`,
          [e.enlaceId, o.vigenteHasta ?? null, o.estado ?? null],
        );
        const r = await post(panel, `/api/v1/invitaciones/${cuerpo.id}/aprobar`, {}, cookiePanel);
        expect(r.status).toBe(409);
        expect(await r.json()).toEqual({ motivo: "enlace_no_vigente" });
        const lista = await (
          await panel.pedir("/peticiones", { headers: { cookie: cookiePanel } })
        ).text();
        expect(lista).toMatch(o.estado ? /Enlace revocado el/ : /Enlace vencido el/);
        expect(lista).toContain("No se puede aprobar mientras el enlace no esté vigente.");
      }
    });

    it("HU-145: correo ya invitado → «ya tiene acceso», la lista lo conserva una sola vez", async () => {
      const e = await sembrar();
      const { cuerpo } = await pedir(e.cookie, { correo: "repetido@bancolombia.com.co" });
      await bd.instalacion.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'repetido@bancolombia.com.co', $2)`,
        [e.enlaceId, hmacCorreo("repetido@bancolombia.com.co", entorno.EMAIL_HMAC_KEY!)],
      );
      const lista = await (
        await panel.pedir("/peticiones", { headers: { cookie: cookiePanel } })
      ).text();
      expect(lista).toContain("Ya tiene acceso a este enlace");
      expect(
        (await post(panel, `/api/v1/invitaciones/${cuerpo.id}/aprobar`, {}, cookiePanel)).status,
      ).toBe(200);
      const n = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.enlace_invitados WHERE enlace_id = $1 AND correo = 'repetido@bancolombia.com.co'`,
        [e.enlaceId],
      );
      expect(n.rows[0].n).toBe(1);
    });

    it("V2-3: una observadora no decide peticiones (403, sin cambios)", async () => {
      const e = await sembrar();
      const { cuerpo } = await pedir(e.cookie, { correo: "obs@bancolombia.com.co" });
      expect(
        (await post(panel, `/api/v1/invitaciones/${cuerpo.id}/aprobar`, {}, cookieObservador))
          .status,
      ).toBe(403);
      expect(
        (
          await post(
            panel,
            `/api/v1/invitaciones/${cuerpo.id}/rechazar`,
            { motivo: "x" },
            cookieObservador,
          )
        ).status,
      ).toBe(403);
      const f = await bd.instalacion.query(
        `SELECT estado FROM identidad.invitaciones_solicitadas WHERE id = $1`,
        [cuerpo.id],
      );
      expect(f.rows[0].estado).toBe("pendiente");
    });
  },
);
