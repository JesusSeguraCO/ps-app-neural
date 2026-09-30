// HU-146 (enterarme de cada enlace nuevo que piden los clientes) de punta a punta: el portal standalone
// real recibe la petición, el worker en proceso la resuelve y avisa a Talento Humano por el doble de
// correo, y el panel standalone real la muestra en la bandeja de renovaciones, desde donde se revoca.
import { randomBytes, createHash } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { generarTokenEnlace } from "@ps/dominio/enlaces/crear";
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
  "bandeja de renovaciones del panel (HU-146)",
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
          "do-connecting-ip": `10.6.0.${++ip % 250}`,
          cookie: [`__Host-csrf=${csrf}`, cookie].filter(Boolean).join("; "),
        },
      });

    async function enlaceVencido(cuenta: string, invitado: string) {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
         VALUES ($1, 'Core bancario', 'La razón.', '{}', now() - interval '40 days', now() - interval '2 days', gen_random_uuid())
         RETURNING id, codigo`,
        [cuenta],
      );
      await bd.instalacion.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3)`,
        [e.rows[0].id, invitado, hmacCorreo(invitado, entorno.EMAIL_HMAC_KEY!)],
      );
      const { token, hash } = generarTokenEnlace();
      await bd.instalacion.query(
        `INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`,
        [e.rows[0].id, hash],
      );
      return { token, codigo: e.rows[0].codigo as string };
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

    const bandeja = async (cookie = cookiePanel) => {
      const r = await panel.pedir("/peticiones/renovaciones", { headers: { cookie } });
      expect(r.status).toBe(200);
      return r.text();
    };

    // La fila de una petición en el HTML: desde su correo hasta el cierre de su <li>.
    const fila = (html: string, correoPide: string) => {
      const i = html.indexOf(`>${correoPide}</span>`);
      expect(i, `sin fila para ${correoPide}`).toBeGreaterThan(-1);
      return html.slice(i, html.indexOf("</li>", i));
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

    it("HU-146 happy path: la petición de un invitado aparece con cuenta, correo, enlace vencido y el enlace nuevo", async () => {
      const { token, codigo } = await enlaceVencido("APAP", "lider@apap.com.do");
      expect(
        (await post(portal, "/api/v1/acceso/renovar", { token, correo: "lider@apap.com.do" }))
          .status,
      ).toBe(202);
      expect(await vuelta(ctx)).toBe(1);
      expect(correo.enviados.map((m) => m.para)).toEqual(["lider@apap.com.do", TALENTO]);
      const nuevo = correo.enviados[1]!.texto.match(/enlace nuevo (ENL-\d{4})/)?.[1];
      expect(nuevo).toBeTruthy();
      const f = fila(await bandeja(), "lider@apap.com.do");
      expect(f).toContain("APAP · Core bancario");
      expect(f).toContain(`vencido ${codigo}`);
      expect(f).toContain("Enlace nuevo enviado");
      expect(f).toContain(nuevo!);
      expect(f).toMatch(/hoy, \d{1,2}:\d{2} [ap]\. m\./);
      expect(f).toContain("Revocar enlace nuevo");
    });

    it("HU-146 error: quien no estaba invitado aparece marcado, con el correo que escribió y sin enlace nuevo", async () => {
      const { token } = await enlaceVencido("APAP", "si@apap.com.do");
      await post(portal, "/api/v1/acceso/renovar", { token, correo: "Reenviado@Gmail.com" });
      expect(await vuelta(ctx)).toBe(1);
      expect(correo.enviados.map((m) => m.para)).toEqual([TALENTO]);
      const f = fila(await bandeja(), "reenviado@gmail.com");
      expect(f).toContain("No estaba invitado · no se envió enlace");
      expect(f).not.toContain("Revocar enlace nuevo");
      expect(await bandeja()).toMatch(/de alguien no invitado/);
    });

    it("HU-146 error: el enlace nuevo no se pudo entregar → la fila lo dice", async () => {
      const { token } = await enlaceVencido("APAP", "rebota@apap.com.do");
      await post(portal, "/api/v1/acceso/renovar", { token, correo: "rebota@apap.com.do" });
      correo.programar("definitivo");
      expect(await vuelta(ctx)).toBe(1);
      expect(fila(await bandeja(), "rebota@apap.com.do")).toContain(
        "No se pudo enviar el enlace nuevo",
      );
    });

    it("HU-146 edge: la misma persona pide otra vez en la ventana → una sola fila y un solo aviso", async () => {
      const { token } = await enlaceVencido("APAP", "repite@apap.com.do");
      await post(portal, "/api/v1/acceso/renovar", { token, correo: "repite@apap.com.do" });
      await post(portal, "/api/v1/acceso/renovar", { token, correo: "repite@apap.com.do" });
      expect(await vuelta(ctx)).toBe(1);
      expect(correo.enviados.filter((m) => m.para === TALENTO)).toHaveLength(1);
      const html = await bandeja();
      expect(html.split(">repite@apap.com.do</span>").length - 1).toBe(1);
    });

    it("HU-146 edge: revoco el enlace nuevo desde la bandeja → «Enlace revocado», el enlace deja de abrir y queda auditado", async () => {
      const { token } = await enlaceVencido("APAP", "corta@apap.com.do");
      await post(portal, "/api/v1/acceso/renovar", { token, correo: "corta@apap.com.do" });
      expect(await vuelta(ctx)).toBe(1);
      const url = correo.enviados[0]!.texto.match(
        /https:\/\/people\.trycore\.com\/e\/#t=([A-Za-z0-9_-]{43})/,
      )?.[1];
      const nuevo = correo.enviados[1]!.texto.match(/enlace nuevo (ENL-\d{4})/)![1]!;
      expect((await post(portal, "/api/v1/acceso/enlace", { token: url })).status).toBe(200);
      // La observadora ve la bandeja sin la acción, y el servidor le niega revocar (V2-3).
      expect(fila(await bandeja(cookieObservador), "corta@apap.com.do")).not.toContain(
        "Revocar enlace nuevo",
      );
      expect(
        (await post(panel, `/api/v1/enlaces/${nuevo}/revocar`, {}, cookieObservador)).status,
      ).toBe(403);

      const r = await post(
        panel,
        `/api/v1/enlaces/${nuevo}/revocar`,
        { motivo: "Ya no trabaja en la cuenta" },
        cookiePanel,
      );
      expect(r.status).toBe(200);
      const f = fila(await bandeja(), "corta@apap.com.do");
      expect(f).toContain("Enlace revocado");
      expect(f).not.toContain("Revocar enlace nuevo");
      expect((await post(portal, "/api/v1/acceso/enlace", { token: url })).status).toBe(410);
      const a = await bd.instalacion.query(
        `SELECT a.campo FROM auditoria.auditoria a JOIN identidad.enlaces e ON e.id::text = a.entidad_id
          WHERE a.entidad = 'enlaces' AND e.codigo = $1 AND a.actor LIKE 'administrador-%' ORDER BY a.seq`,
        [nuevo],
      );
      expect(a.rows.map((x) => x.campo)).toEqual(["estado", "motivo_revocacion"]);
      expect((await verificarCadena(bd.instalacion, workerEnv.AUDIT_HMAC_KEY!)).ok).toBe(true);
    });

    it("sin sesión la bandeja lleva a la puerta del panel", async () => {
      const r = await panel.pedir("/peticiones/renovaciones", { redirect: "manual" });
      expect(r.status).toBe(307);
      expect(r.headers.get("location")).toMatch(/\/acceso/);
    });
  },
);
