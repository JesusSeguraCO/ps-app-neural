// HU-092 y HU-146 de punta a punta: el portal standalone real recibe la petición y encola
// `renovar_enlace`; el worker (en proceso, `ps_worker` real) emite el enlace nuevo solo para un correo
// invitado y avisa SIEMPRE a Talento Humano, por el doble de Mailgun. Sin HubSpot (sponsor, 2026-09-29).
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { generarTokenEnlace, hashTokenEnlace } from "@ps/dominio/enlaces/crear";
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

const PORTAL = "https://people.trycore.com";
const TALENTO = "people.service@trycore.com";

describe.skipIf(!HAY_BD || !hayBuild("portal"))("renovación del enlace vencido (HU-092, HU-146)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let entorno: Record<string, string>;
  let correo: DobleCorreo;
  let ctx: ContextoDespacho;
  const csrf = randomBytes(16).toString("hex");
  const workerEnv = entornoDev("worker");

  const post = (ruta: string, cuerpo: unknown) =>
    srv.pedir(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: srv.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}`,
      },
    });

  async function enlaceVencido(cuenta: string, invitados: string[]) {
    const e = await bd.instalacion.query(
      `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES (NULL, $1, 'Modernización de pagos', 'La razón', '{PS-0142}', now() - interval '40 days', now() - interval '3 days', gen_random_uuid())
       RETURNING id, codigo`,
      [cuenta],
    );
    for (const c of invitados)
      await bd.instalacion.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3)`,
        [e.rows[0].id, c, hmacCorreo(c, entorno.EMAIL_HMAC_KEY!)],
      );
    const { token, hash } = generarTokenEnlace();
    await bd.instalacion.query(
      `INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`,
      [e.rows[0].id, hash],
    );
    return { token, enlaceId: e.rows[0].id as string, codigo: e.rows[0].codigo as string };
  }

  async function renovacion(solicitud: string) {
    const r = await bd.instalacion.query(
      `SELECT correo, resultado, entrega, avisado_en IS NOT NULL AS avisado, enlace_nuevo IS NOT NULL AS con_nuevo
         FROM identidad.renovaciones WHERE id = $1`,
      [solicitud],
    );
    return r.rows[0];
  }

  async function estadoPublico(solicitud: string) {
    const r = await srv.pedir(`/api/v1/acceso/renovar/${solicitud}`);
    expect(r.status).toBe(200);
    return (await r.json()).estado as string;
  }

  beforeAll(async () => {
    bd = await crearBdPrueba();
    entorno = { ...entornoDev("portal"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_portal") };
    srv = await arrancarServidor("portal", entorno);
  }, 90_000);

  beforeEach(() => {
    correo = new DobleCorreo();
    ctx = {
      bd: bd.como("ps_worker"),
      correo,
      peppers: { cliente: workerEnv.OTP_PEPPER_CLIENTE!, panel: workerEnv.OTP_PEPPER_PANEL! },
      reclamo: `prueba-${randomBytes(4).toString("hex")}`,
      registrar: () => {},
      renovacion: {
        portalOrigen: PORTAL,
        correoTalentoHumano: TALENTO,
        auditoria: { hmac: workerEnv.AUDIT_HMAC_KEY!, kek: workerEnv.AUDIT_KEK! },
      },
    };
  });

  afterAll(async () => {
    await srv?.cerrar();
    await bd?.cerrar();
  });

  it("HU-092 happy path + HU-146: invitado → mensaje neutro; el enlace nuevo llega solo a su buzón y Talento Humano recibe el aviso", async () => {
    const { token, codigo } = await enlaceVencido("Activa", ["mariana@activa.com"]);
    const r = await post("/api/v1/acceso/renovar", { token, correo: "Mariana@Activa.com" });
    expect(r.status).toBe(202);
    const cuerpo = await r.json();
    expect(Object.keys(cuerpo).sort()).toEqual(["estado", "solicitud"]);
    expect(cuerpo.estado).toBe("pedida");
    expect(JSON.stringify(cuerpo)).not.toMatch(/#t=|\/e\//);
    expect(await estadoPublico(cuerpo.solicitud)).toBe("pendiente");

    expect(await vuelta(ctx)).toBe(1);
    expect(correo.enviados.map((x) => x.para)).toEqual(["mariana@activa.com", TALENTO]);
    const m = correo.enviados[0]!;
    const aviso = correo.enviados[1]!;
    expect(aviso.asunto).toBe("Enlace nuevo pedido: Activa · Modernización de pagos");
    expect(aviso.texto).toContain("mariana@activa.com");
    expect(aviso.texto).toContain(codigo);
    expect(aviso.texto).toMatch(/Se le envió el enlace nuevo ENL-\d{4} a su buzón\./);
    expect(aviso.texto).not.toMatch(/#t=/);
    const nuevo = m.texto.match(/https:\/\/people\.trycore\.com\/e\/#t=([A-Za-z0-9_-]{43})/)?.[1];
    expect(nuevo).toBeTruthy();
    expect(await estadoPublico(cuerpo.solicitud)).toBe("automatica");
    expect(await renovacion(cuerpo.solicitud)).toEqual({
      correo: "mariana@activa.com",
      resultado: "enlace_enviado",
      entrega: "enviado",
      avisado: true,
      con_nuevo: true,
    });

    // El enlace nuevo abre (vigente), con la misma selección y solo con el invitado que lo pidió.
    const abrir = await post("/api/v1/acceso/enlace", { token: nuevo });
    expect(await abrir.json()).toEqual({ estado_enlace: "activo", con_sesion: false });
    const e = await bd.instalacion.query(
      `SELECT e.cuenta_nombre, e.proyecto, e.razon, e.codigos_perfil, e.vigente_hasta > now() + interval '29 days' AS vigente, t.invitado_id IS NOT NULL AS personal,
              (SELECT array_agg(correo) FROM identidad.enlace_invitados WHERE enlace_id = e.id) AS invitados
         FROM identidad.enlace_tokens t JOIN identidad.enlaces e ON e.id = t.enlace_id WHERE t.token_hash = $1`,
      [hashTokenEnlace(nuevo!)],
    );
    expect(e.rows[0]).toEqual({
      cuenta_nombre: "Activa",
      proyecto: "Modernización de pagos",
      razon: "La razón",
      codigos_perfil: ["PS-0142"],
      vigente: true,
      personal: true,
      invitados: ["mariana@activa.com"],
    });
    // Auditado en la cadena, que sigue íntegra.
    const a = await bd.instalacion.query(
      `SELECT campo, origen FROM auditoria.auditoria WHERE entidad = 'enlaces' AND actor = 'worker' ORDER BY seq`,
    );
    expect(a.rows.map((f) => f.campo)).toEqual(["renovado_de", "invitados", "vigente_hasta"]);
    expect(a.rows.every((f) => f.origen === "worker")).toBe(true);
    expect((await verificarCadena(bd.instalacion, workerEnv.AUDIT_HMAC_KEY!)).ok).toBe(true);
    // El enlace viejo sigue vencido.
    expect((await post("/api/v1/acceso/enlace", { token })).status).toBe(410);
    expect(codigo).toMatch(/^ENL-/);
  });

  it("HU-092 error: pido otra vez en la ventana de espera → no se genera un segundo enlace y va en camino", async () => {
    const { token } = await enlaceVencido("Activa", ["repite@activa.com"]);
    const primera = await (
      await post("/api/v1/acceso/renovar", { token, correo: "repite@activa.com" })
    ).json();
    const segunda = await post("/api/v1/acceso/renovar", { token, correo: "repite@activa.com" });
    expect(segunda.status).toBe(200);
    const s = await segunda.json();
    expect(s.estado).toBe("en_camino");
    expect(s.solicitud).toBe(primera.solicitud);
    expect(new Date(s.puedes_desde).getTime()).toBeGreaterThan(Date.now() + 10 * 60_000);
    expect(await vuelta(ctx)).toBe(1);
    // HU-146 edge: una sola petición y un solo aviso a Talento Humano.
    expect(correo.enviados.map((x) => x.para)).toEqual(["repite@activa.com", TALENTO]);
    const n = await bd.instalacion.query(`SELECT count(*)::int n FROM identidad.renovaciones WHERE id = $1 OR correo = 'repite@activa.com'`, [primera.solicitud]);
    expect(n.rows[0].n).toBe(1);
  });

  it("HU-092 error + HU-146: quien pide no estaba invitado → la MISMA respuesta; no se le envía nada y Talento Humano se entera", async () => {
    const { token, enlaceId } = await enlaceVencido("Activa", ["si@activa.com"]);
    const invitado = await post("/api/v1/acceso/renovar", { token, correo: "si@activa.com" });
    const noInvitado = await post("/api/v1/acceso/renovar", {
      token,
      correo: "reenviado@activa.com",
    });
    expect(noInvitado.status).toBe(invitado.status);
    const [a, b] = [await invitado.json(), await noInvitado.json()];
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
    expect(b.estado).toBe(a.estado);
    expect(await vuelta(ctx)).toBe(2);
    expect(correo.enviados.map((m) => m.para)).toEqual(["si@activa.com", TALENTO, TALENTO]);
    const aviso = correo.enviados[2]!;
    expect(aviso.asunto).toBe("Enlace nuevo pedido por alguien no invitado: Activa · Modernización de pagos");
    expect(aviso.texto).toContain("reenviado@activa.com no estaba invitado");
    expect(aviso.texto).toContain("No se le envió ningún enlace.");
    expect(await estadoPublico(b.solicitud)).toBe(await estadoPublico(a.solicitud));
    const enlaces = await bd.instalacion.query(
      `SELECT count(*)::int n FROM identidad.enlaces WHERE cuenta_nombre = 'Activa' AND vigente_hasta > now() AND id <> $1`,
      [enlaceId],
    );
    expect(enlaces.rows[0].n).toBeGreaterThanOrEqual(1);
    expect(await renovacion(b.solicitud)).toEqual({
      correo: "reenviado@activa.com",
      resultado: "no_invitado",
      entrega: null,
      avisado: true,
      con_nuevo: false,
    });
  });

  it("HU-146 error: el enlace nuevo no se pudo entregar → la petición queda marcada y Talento Humano avisado", async () => {
    const { token } = await enlaceVencido("Activa", ["rebota@activa.com"]);
    const r = await (await post("/api/v1/acceso/renovar", { token, correo: "rebota@activa.com" })).json();
    correo.programar("definitivo");
    expect(await vuelta(ctx)).toBe(1);
    expect(correo.enviados.map((m) => m.para)).toEqual(["rebota@activa.com", TALENTO]);
    expect(await renovacion(r.solicitud)).toMatchObject({ resultado: "enlace_enviado", entrega: "fallido", avisado: true });
    // Lo que ve quien pide no cambia.
    expect(await estadoPublico(r.solicitud)).toBe("automatica");
  });

  it("HU-092 happy path: abrir un enlace vencido dice que venció (410 con la fecha), sin error técnico", async () => {
    const { token } = await enlaceVencido("Activa", ["x@activa.com"]);
    const r = await post("/api/v1/acceso/enlace", { token });
    expect(r.status).toBe(410);
    expect((await r.json()).motivo).toBe("enlace_vencido");
  });

  it("no se renueva un enlace revocado ni uno vigente", async () => {
    const vencido = await enlaceVencido("Activa", ["y@activa.com"]);
    await bd.instalacion.query(`UPDATE identidad.enlaces SET estado = 'revocado' WHERE id = $1`, [
      vencido.enlaceId,
    ]);
    const r1 = await post("/api/v1/acceso/renovar", {
      token: vencido.token,
      correo: "y@activa.com",
    });
    expect(r1.status).toBe(410);
    expect(await r1.json()).toEqual({ motivo: "enlace_revocado" });
    const vigente = await enlaceVencido("Activa", ["z@activa.com"]);
    await bd.instalacion.query(
      `UPDATE identidad.enlaces SET vigente_hasta = now() + interval '5 days' WHERE id = $1`,
      [vigente.enlaceId],
    );
    const r2 = await post("/api/v1/acceso/renovar", {
      token: vigente.token,
      correo: "z@activa.com",
    });
    expect(r2.status).toBe(409);
    expect(await vuelta(ctx)).toBe(0);
  });

  it("con la sesión de un enlace vencido (sin token en la barra) también se puede pedir", async () => {
    const { enlaceId } = await enlaceVencido("Activa", ["ses@activa.com"]);
    const inv = await bd.instalacion.query(
      `SELECT id FROM identidad.enlace_invitados WHERE enlace_id = $1`,
      [enlaceId],
    );
    const id = randomBytes(32).toString("base64url");
    const { createHash } = await import("node:crypto");
    await bd.instalacion.query(
      `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '1 day')`,
      [createHash("sha256").update(id).digest(), enlaceId, inv.rows[0].id],
    );
    const r = await srv.pedir("/api/v1/acceso/renovar", {
      method: "POST",
      body: JSON.stringify({ correo: "ses@activa.com" }),
      headers: {
        "content-type": "application/json",
        origin: srv.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}; __Host-ps=${id}`,
      },
    });
    expect(r.status).toBe(202);
    expect(await vuelta(ctx)).toBe(1);
    expect(correo.enviados.map((m) => m.para)).toEqual(["ses@activa.com", TALENTO]);
  });

  it("si Talento Humano revoca el enlace antes de que el worker procese la petición, no se emite nada", async () => {
    const { token, enlaceId } = await enlaceVencido("Activa", ["tarde@activa.com"]);
    const r = await (await post("/api/v1/acceso/renovar", { token, correo: "tarde@activa.com" })).json();
    await bd.instalacion.query(`UPDATE identidad.enlaces SET estado = 'revocado' WHERE id = $1`, [enlaceId]);
    expect(await vuelta(ctx)).toBe(1);
    expect(correo.enviados).toHaveLength(0);
    expect(await renovacion(r.solicitud)).toMatchObject({ resultado: "sin_efecto", entrega: null, avisado: false });
  });

  it("como ps_worker no se puede insertar un enlace ni un token directamente (V2-6)", async () => {
    const w = bd.como("ps_worker");
    await expect(
      w.query(
        `INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES (gen_random_uuid(), '\\x00')`,
      ),
    ).rejects.toThrow();
    await expect(
      w.query(
        `INSERT INTO identidad.enlaces (cuenta_nombre, razon, vigente_hasta, generado_por) VALUES ('x', 'y', now() + interval '1 day', gen_random_uuid())`,
      ),
    ).rejects.toThrow();
  });
});
