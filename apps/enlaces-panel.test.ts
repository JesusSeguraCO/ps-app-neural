// Contrato de POST /api/v1/enlaces (HU-122, tarea 4.3) contra el servidor standalone real del panel
// con `ps_panel` por PgBouncer y los perfiles ficticios sembrados por el worker.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { validarSesionPortal } from "@ps/dominio/acceso/sesion";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { buscarSesionPortal } from "@ps/infra/postgres/sesiones";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";

describe.skipIf(!HAY_BD || !hayBuild("panel"))("generar enlace desde el panel (HU-122)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let entorno: Record<string, string>;
  let sesionAdmin: string;
  let sesionObservador: string;
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

  const generar = (
    cuerpo: unknown,
    cookieSesion = sesionAdmin,
    extra: Record<string, string> = {},
  ) =>
    srv.pedir("/api/v1/enlaces", {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: srv.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}; ${cookieSesion}`,
        ...extra,
      },
    });

  const base = {
    cuenta: "Bancolombia",
    proyecto: "Conciliación de pagos",
    razon: "Automatizar la conciliación: backend, QA y DevOps con experiencia en banca",
    codigos: ["PS-0142", "PS-0201", "PS-0230"],
    invitados: ["juliana.restrepo@bancolombia.com.co"],
  };
  const cuantosEnlaces = async () =>
    (await bd.instalacion.query(`SELECT count(*)::int n FROM identidad.enlaces`)).rows[0]
      .n as number;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    await sembrarFicticios({
      bd: bd.como("ps_worker"),
      auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
      appEnv: "ci",
      registrar: () => {},
    });
    sesionAdmin = await sesion("karen@trycore.com", "administrador");
    sesionObservador = await sesion("mirar@trycore.com", "observador");
    srv = await arrancarServidor("panel", entorno);
  }, 90_000);

  afterAll(async () => {
    await srv?.cerrar();
    await bd?.cerrar();
  });

  let antes: number;
  beforeEach(async () => {
    antes = await cuantosEnlaces();
  });

  it("happy: selección heterogénea → 201, lista explícita de códigos, 30 días, token solo como hash y auditoría completa", async () => {
    const r = await generar(base);
    expect(r.status).toBe(201);
    const { enlace } = (await r.json()) as {
      enlace: {
        codigo: string;
        url: string;
        vigenteHasta: string;
        codigos: string[];
        invitados: string[];
      };
    };
    expect(enlace.codigo).toMatch(/^ENL-\d{4}$/);
    expect(enlace.codigos).toEqual(base.codigos);
    const token = enlace.url.match(/^http:\/\/127\.0\.0\.1:3100\/e\/#t=([A-Za-z0-9_-]{43})$/)?.[1];
    expect(token).toBeDefined();
    const dias = (Date.parse(enlace.vigenteHasta) - Date.now()) / 86_400_000;
    expect(dias).toBeGreaterThan(29.99);
    expect(dias).toBeLessThanOrEqual(30);

    const e = await bd.instalacion.query(
      `SELECT id, cuenta_nombre, proyecto, razon, codigos_perfil, cuenta_ref FROM identidad.enlaces WHERE codigo = $1`,
      [enlace.codigo],
    );
    expect(e.rows[0]).toMatchObject({
      cuenta_nombre: "Bancolombia",
      razon: base.razon,
      codigos_perfil: base.codigos,
      cuenta_ref: null,
    });
    const t = await bd.instalacion.query(
      `SELECT token_hash, invitado_id FROM identidad.enlace_tokens WHERE enlace_id = $1`,
      [e.rows[0].id],
    );
    expect(t.rows).toHaveLength(1);
    expect(
      Buffer.from(t.rows[0].token_hash).equals(createHash("sha256").update(token!).digest()),
    ).toBe(true);
    // Fuga de la BD: ninguna columna de enlaces ni tokens contiene el token.
    const volcado = JSON.stringify(
      (
        await bd.instalacion.query(
          `SELECT e.*, t.* FROM identidad.enlaces e JOIN identidad.enlace_tokens t ON t.enlace_id = e.id`,
        )
      ).rows,
    );
    expect(volcado).not.toContain(token!);

    const a = await bd.instalacion.query(
      `SELECT actor, campo, origen FROM auditoria.auditoria WHERE entidad = 'enlaces' AND entidad_id = $1 ORDER BY seq`,
      [e.rows[0].id],
    );
    expect(a.rows.map((f) => f.campo)).toEqual([
      "cuenta",
      "proyecto",
      "razon",
      "perfiles",
      "invitados",
      "vigente_hasta",
    ]);
    expect(new Set(a.rows.map((f) => f.actor))).toEqual(new Set(["karen@trycore.com"]));
    expect(new Set(a.rows.map((f) => f.origen))).toEqual(new Set(["panel"]));
    expect((await verificarCadena(bd.instalacion, entorno.AUDIT_HMAC_KEY!)).ok).toBe(true);
  });

  it("la vigencia es editable", async () => {
    const r = await generar({ ...base, vigenciaDias: 45 });
    const { enlace } = (await r.json()) as { enlace: { vigenteHasta: string } };
    expect(Math.round((Date.parse(enlace.vigenteHasta) - Date.now()) / 86_400_000)).toBe(45);
  });

  it("error: sin razón → 422 con la explicación y ningún enlace", async () => {
    const r = await generar({ ...base, razon: " " });
    expect(r.status).toBe(422);
    const { errores } = (await r.json()) as { errores: Array<{ tipo: string; mensaje: string }> };
    expect(errores).toEqual([expect.objectContaining({ tipo: "sin_razon" })]);
    expect(errores[0]!.mensaje).toContain("catálogo y no una curaduría");
    expect(await cuantosEnlaces()).toBe(antes);
  });

  it("error: un perfil en borrador → 422 dice cuál y no emite", async () => {
    const r = await generar({ ...base, codigos: ["PS-0142", "PS-0160"] });
    expect(r.status).toBe(422);
    const { errores } = (await r.json()) as {
      errores: Array<{ tipo: string; codigos?: string[] }>;
    };
    expect(errores).toEqual([
      expect.objectContaining({ tipo: "no_publicado", codigos: ["PS-0160"] }),
    ]);
    expect(await cuantosEnlaces()).toBe(antes);
  });

  it("edge: varios correos de la cuenta → ambos, una sola vez", async () => {
    const r = await generar({
      ...base,
      invitados: [
        "Juliana.Restrepo@bancolombia.com.co",
        "mauricio.cardenas@bancolombia.com.co",
        "juliana.restrepo@bancolombia.com.co",
      ],
    });
    expect(r.status).toBe(201);
    const { enlace } = (await r.json()) as { enlace: { codigo: string } };
    const i = await bd.instalacion.query(
      `SELECT i.correo FROM identidad.enlace_invitados i JOIN identidad.enlaces e ON e.id = i.enlace_id WHERE e.codigo = $1 ORDER BY i.correo`,
      [enlace.codigo],
    );
    expect(i.rows.map((f) => f.correo)).toEqual([
      "juliana.restrepo@bancolombia.com.co",
      "mauricio.cardenas@bancolombia.com.co",
    ]);
  });

  it("edge: ningún correo invitado → 422 y no emite", async () => {
    const r = await generar({ ...base, invitados: [] });
    expect(r.status).toBe(422);
    expect(
      ((await r.json()) as { errores: Array<{ tipo: string }> }).errores.map((e) => e.tipo),
    ).toEqual(["sin_invitados"]);
    expect(await cuantosEnlaces()).toBe(antes);
  });

  it("un observador no puede generar (V2-3) → 403 y ningún enlace", async () => {
    expect((await generar(base, sesionObservador)).status).toBe(403);
    expect(await cuantosEnlaces()).toBe(antes);
  });

  it("sin sesión → 401; sin CSRF → 403; campo extra → 400; nada se emite", async () => {
    expect((await generar(base, "")).status).toBe(401);
    expect((await generar(base, sesionAdmin, { "x-ps-csrf": "otro" })).status).toBe(403);
    expect((await generar({ ...base, cuentaRef: "hs-1" })).status).toBe(400);
    expect(await cuantosEnlaces()).toBe(antes);
  });

  describe("revocar un enlace (tarea 4.4)", () => {
    const revocar = (codigo: string, cookieSesion = sesionAdmin, cuerpo: unknown = {}) =>
      srv.pedir(`/api/v1/enlaces/${codigo}/revocar`, {
        method: "POST",
        body: JSON.stringify(cuerpo),
        headers: {
          "content-type": "application/json",
          origin: srv.url,
          "x-ps-csrf": csrf,
          cookie: `__Host-csrf=${csrf}; ${cookieSesion}`,
        },
      });

    it("revoca, corta la sesión del cliente en la siguiente petición y queda auditado", async () => {
      const { enlace } = (await (await generar(base)).json()) as { enlace: { codigo: string } };
      const e = (await bd.instalacion.query(`SELECT id FROM identidad.enlaces WHERE codigo = $1`, [enlace.codigo])).rows[0];
      const inv = (await bd.instalacion.query(`SELECT id FROM identidad.enlace_invitados WHERE enlace_id = $1`, [e.id])).rows[0];
      const idCookie = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '30 days')`,
        [createHash("sha256").update(idCookie).digest(), e.id, inv.id],
      );
      const portal = bd.como("ps_portal");
      expect(validarSesionPortal(await buscarSesionPortal(portal, idCookie), new Date()).ok).toBe(true);

      const r = await revocar(enlace.codigo, sesionAdmin, { motivo: "La cuenta pausó el proyecto" });
      expect(r.status).toBe(200);
      expect(await r.json()).toMatchObject({ enlace: { codigo: enlace.codigo, estado: "revocado" } });

      expect(validarSesionPortal(await buscarSesionPortal(portal, idCookie), new Date())).toEqual({ ok: false, motivo: "enlace_revocado" });
      const t = await bd.instalacion.query(`SELECT revocado_en FROM identidad.enlace_tokens WHERE enlace_id = $1`, [e.id]);
      expect(t.rows.every((f) => f.revocado_en !== null)).toBe(true);
      const a = await bd.instalacion.query(
        `SELECT actor, campo, origen FROM auditoria.auditoria WHERE entidad = 'enlaces' AND entidad_id = $1 AND campo = 'estado'`,
        [e.id],
      );
      expect(a.rows).toEqual([{ actor: "karen@trycore.com", campo: "estado", origen: "revocacion" }]);
      const m = await bd.instalacion.query(
        `SELECT count(*)::int n FROM auditoria.auditoria WHERE entidad_id = $1 AND campo = 'motivo_revocacion'`,
        [e.id],
      );
      expect(m.rows[0].n).toBe(1);
    });

    it("revocar dos veces no audita de nuevo (409)", async () => {
      const { enlace } = (await (await generar(base)).json()) as { enlace: { codigo: string } };
      expect((await revocar(enlace.codigo)).status).toBe(200);
      const n = async () => (await bd.instalacion.query(`SELECT count(*)::int n FROM auditoria.auditoria WHERE campo = 'estado'`)).rows[0].n;
      const antesAud = await n();
      expect((await revocar(enlace.codigo)).status).toBe(409);
      expect(await n()).toBe(antesAud);
    });

    it("un código inexistente → 404; un observador → 403 sin cambios", async () => {
      expect((await revocar("ENL-9999")).status).toBe(404);
      const { enlace } = (await (await generar(base)).json()) as { enlace: { codigo: string } };
      expect((await revocar(enlace.codigo, sesionObservador)).status).toBe(403);
      const e = await bd.instalacion.query(`SELECT estado FROM identidad.enlaces WHERE codigo = $1`, [enlace.codigo]);
      expect(e.rows[0].estado).toBe("activo");
    });
  });
});
