// Contacto de Trycore (EP-006 · sub-slice 10: HU-147) contra los servidores standalone reales (`ps_panel`,
// `ps_portal`): la administradora lo cambia y las pantallas de contacto del portal lo muestran en su
// siguiente carga, con la auditoría del cambio; un correo externo no se guarda; la observadora lo ve en
// lectura y no puede forzar un cambio; solo con correo, «People Service: correo».
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";

const EIDA = "Eida Tinjacá, Coordinación de Servicio: ";
// React separa el texto y el enlace con un comentario en el HTML del servidor.
const plano = (html: string) =>
  html
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');

describe.skipIf(!HAY_BD || !hayBuild("portal") || !hayBuild("panel"))(
  "Contacto de Trycore (HU-147)",
  () => {
    let bd: BdPrueba;
    let portal: ServidorPrueba;
    let panel: ServidorPrueba;
    let admin: string;
    let observadora: string;
    let invitado: string;
    const csrf = randomBytes(16).toString("hex");
    const panelEnv = entornoDev("panel");
    const portalEnv = entornoDev("portal");

    async function sesionPanel(correo: string, rol: "administrador" | "observador") {
      const u = await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
        [correo, hmacCorreo(correo, panelEnv.EMAIL_HMAC_KEY!), rol],
      );
      const s = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
         VALUES ($1, $2, now() + interval '12 hours', $3)`,
        [createHash("sha256").update(s).digest(), u.rows[0].id, rol],
      );
      return `__Host-pp=${s}`;
    }

    // Un invitado con sesión y una petición de colega rechazada: la pantalla «Invitar a un colega» muestra
    // el motivo y a quién escribir.
    async function invitadoConRechazo() {
      const e = await bd.instalacion.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
         VALUES ('Bancolombia', 'Pagos', 'La razón.', '{}', now() - interval '1 day', now() + interval '20 days', gen_random_uuid())
         RETURNING id`,
      );
      const correo = "mariana@bancolombia.com.co";
      const i = await bd.instalacion.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3) RETURNING id`,
        [e.rows[0].id, correo, hmacCorreo(correo, portalEnv.EMAIL_HMAC_KEY!)],
      );
      const colega = "sebastian@nexo.co";
      await bd.instalacion.query(
        `INSERT INTO identidad.invitaciones_solicitadas
           (enlace_id, solicitado_por, correo_propuesto, correo_hmac, nombre_propuesto, estado, motivo, resuelto_en)
         VALUES ($1, $2, $3, $4, 'Sebastián Mora', 'rechazada', 'Correo externo.', now())`,
        [e.rows[0].id, i.rows[0].id, colega, hmacCorreo(colega, portalEnv.EMAIL_HMAC_KEY!)],
      );
      const s = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira)
         VALUES ($1, $2, $3, now() + interval '10 days')`,
        [createHash("sha256").update(s).digest(), e.rows[0].id, i.rows[0].id],
      );
      return `__Host-ps=${s}`;
    }

    const guardar = (cuerpo: unknown, cookie = admin) =>
      panel.pedir("/api/v1/contacto", {
        method: "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: panel.url,
          "x-ps-csrf": csrf,
          cookie: `__Host-csrf=${csrf}; ${cookie}`,
        },
      });
    const texto = async (srv: ServidorPrueba, ruta: string, cookie?: string) =>
      (await srv.pedir(ruta, cookie ? { headers: { cookie } } : undefined)).text();
    // Las pantallas de contacto que el servidor dibuja enteras, y las que dibuja el navegador
    // (puerta: intentos agotados, «Recibimos tu petición»), que reciben el contacto en su carga.
    async function pantallas() {
      return {
        abreTuEnlace: plano(await texto(portal, "/acceso?motivo=sesion_expirada")),
        revocado: plano(await texto(portal, "/acceso?motivo=enlace_revocado")),
        invitar: plano(await texto(portal, "/invitar", invitado)),
        puerta: await texto(portal, "/e"),
      };
    }
    const auditadas = async () =>
      (
        await bd.instalacion.query(
          `SELECT count(*)::int AS n FROM auditoria.auditoria WHERE entidad = 'configuracion_contacto'`,
        )
      ).rows[0].n as number;

    beforeAll(async () => {
      bd = await crearBdPrueba();
      panel = await arrancarServidor("panel", {
        ...panelEnv,
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_panel"),
      });
      portal = await arrancarServidor("portal", {
        ...portalEnv,
        APP_ENV: "ci",
        DATABASE_URL: bd.urlDe("ps_portal"),
      });
      admin = await sesionPanel("karen.rodriguez@trycore.com", "administrador");
      observadora = await sesionPanel("mariana.velez@trycore.com", "observador");
      invitado = await invitadoConRechazo();
    }, 120_000);

    afterAll(async () => {
      await panel?.cerrar();
      await portal?.cerrar();
      await bd?.cerrar();
    });

    it("de partida, las pantallas de contacto nombran el buzón de People Service", async () => {
      const p = await pantallas();
      expect(p.abreTuEnlace).toContain("Escribe a People Service: people.service@trycore.com");
      expect(p.revocado).toContain("o escribe a People Service: people.service@trycore.com");
      expect(p.invitar).toContain(
        "Si tienes dudas, escribe a People Service: people.service@trycore.com",
      );
    });

    it("happy: la administradora guarda a Eida y el portal la muestra en su siguiente carga, auditado", async () => {
      const r = await guardar({
        nombre: "Eida Tinjacá",
        cargo: "Coordinación de Servicio",
        correo: "eida.tinjaca@trycore.com",
      });
      expect(r.status).toBe(200);
      expect(await r.json()).toEqual({ cambio: true });
      const p = await pantallas();
      expect(p.abreTuEnlace).toContain(`Escribe a ${EIDA}eida.tinjaca@trycore.com`);
      expect(p.revocado).toContain(`o escribe a ${EIDA}eida.tinjaca@trycore.com`);
      expect(p.revocado).toContain("Escribir a Eida Tinjacá");
      expect(p.invitar).toContain(`Si tienes dudas, escribe a ${EIDA}eida.tinjaca@trycore.com`);
      // La puerta (intentos agotados, «Recibimos tu petición») recibe el contacto vigente en su carga.
      expect(p.puerta).toContain("eida.tinjaca@trycore.com");
      expect(p.puerta).toContain("Coordinación de Servicio");
      expect(p.puerta).not.toContain("people.service@trycore.com");

      const aud = await bd.instalacion.query(
        `SELECT actor, campo, origen FROM auditoria.auditoria WHERE entidad = 'configuracion_contacto' ORDER BY seq`,
      );
      expect(aud.rows).toEqual([
        { actor: "karen.rodriguez@trycore.com", campo: "correo", origen: "panel" },
        { actor: "karen.rodriguez@trycore.com", campo: "nombre", origen: "panel" },
        { actor: "karen.rodriguez@trycore.com", campo: "cargo", origen: "panel" },
      ]);
      // El panel muestra el cambio con el anterior y el nuevo, descifrados.
      const pagina = plano(await texto(panel, "/administracion/contacto", admin));
      expect(pagina).toContain("karen.rodriguez@trycore.com cambió el contacto");
      expect(pagina).toContain("antes people.service@trycore.com sin nombre ni cargo");
      expect(pagina).toContain(
        "ahora Eida Tinjacá, Coordinación de Servicio · eida.tinjaca@trycore.com",
      );
      expect(pagina).toContain("Guardar contacto");
    });

    it("error: un correo que no es @trycore.com no se guarda y el portal sigue con el anterior", async () => {
      const antes = await auditadas();
      const r = await guardar({ nombre: "Eida Tinjacá", correo: "eida.tinjaca@gmail.com" });
      expect(r.status).toBe(422);
      expect(await r.json()).toEqual({ motivo: "correo_externo" });
      expect(await auditadas()).toBe(antes);
      expect((await pantallas()).abreTuEnlace).toContain(`${EIDA}eida.tinjaca@trycore.com`);
    });

    it("error: la observadora ve el contacto vigente en lectura, sin controles para editarlo", async () => {
      const html = await texto(panel, "/administracion/contacto", observadora);
      const p = plano(html);
      expect(p).toContain("Tu rol es de consulta.");
      expect(p).toContain("Contacto vigente");
      expect(p).toContain("Eida Tinjacá");
      expect(p).toContain("karen.rodriguez@trycore.com · hoy");
      expect(html).not.toContain("<input");
      expect(html).not.toContain("Guardar contacto");
      expect(html).not.toContain("Accesos al panel");
    });

    it("error: la observadora no puede forzar un cambio por petición directa", async () => {
      const antes = await auditadas();
      const r = await guardar({ correo: "otra@trycore.com" }, observadora);
      expect(r.status).toBe(403);
      expect(await auditadas()).toBe(antes);
      expect((await pantallas()).revocado).toContain(`${EIDA}eida.tinjaca@trycore.com`);
      const rechazo = await bd.instalacion.query(
        `SELECT accion FROM identidad.accesos_log WHERE evento = 'acceso_rechazado' ORDER BY id DESC LIMIT 1`,
      );
      expect(rechazo.rows[0]?.accion).toBe("contacto.escribir");
    });

    it("edge: solo un correo, sin nombre ni cargo → «People Service: correo», sin nombre vacío", async () => {
      const r = await guardar({ nombre: "", cargo: null, correo: "servicio.clientes@trycore.com" });
      expect(r.status).toBe(200);
      const p = await pantallas();
      for (const t of [p.abreTuEnlace, p.revocado, p.invitar]) {
        expect(t).toContain("escribe a People Service: servicio.clientes@trycore.com".slice(1));
        expect(t).not.toMatch(/, :|: :|Eida/);
      }
      expect(p.revocado).toContain("Escribir a People Service");
    });
  },
);
