// Lista de acceso del panel (EP-006 · sub-slice 10: HU-151) contra el servidor standalone real (`ps_panel`):
// inscribir un correo @trycore.com y que al pedir entrar se le encole su código; un correo externo no
// entra; bajar a observador a otra administradora corta su sesión en su siguiente petición; la baja corta
// la sesión y deja de encolar código; la única administradora no puede quitarse el rol; la observadora
// no administra.
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

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Accesos al panel (HU-151)", () => {
  let bd: BdPrueba;
  let panel: ServidorPrueba;
  let claveCorreo: string;
  let admin: { cookie: string; id: string };
  const csrf = randomBytes(16).toString("hex");

  async function usuario(correo: string, rol: "administrador" | "observador") {
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
      [correo, hmacCorreo(correo, claveCorreo), rol],
    );
    return u.rows[0].id as string;
  }
  async function sesionDe(id: string, rol: "administrador" | "observador") {
    const s = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira, rol_al_abrir)
       VALUES ($1, $2, now() + interval '12 hours', $3)`,
      [createHash("sha256").update(s).digest(), id, rol],
    );
    return `__Host-pp=${s}`;
  }
  const post = (ruta: string, cuerpo: unknown, cookie = admin.cookie) =>
    panel.pedir(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: panel.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}; ${cookie}`,
      },
    });
  const pagina = (ruta: string, cookie = admin.cookie) =>
    panel.pedir(ruta, { headers: { cookie } });
  const sesiones = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT count(*)::int AS n FROM identidad_panel.sesiones_panel WHERE usuario_id = $1`,
        [id],
      )
    ).rows[0].n as number;
  const auditoria = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT campo, actor FROM auditoria.auditoria WHERE entidad = 'usuarios_panel' AND entidad_id = $1 ORDER BY seq`,
        [id],
      )
    ).rows;
  const ultimoTrabajoCodigo = async () =>
    (
      await bd.instalacion.query(
        `SELECT id, payload FROM operacion.trabajos WHERE tipo = 'enviar_codigo' ORDER BY id DESC LIMIT 1`,
      )
    ).rows[0] as { id: string; payload: { ref: string | null } } | undefined;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    claveCorreo = entorno.EMAIL_HMAC_KEY!;
    const id = await usuario("karen.rodriguez@trycore.com", "administrador");
    admin = { id, cookie: await sesionDe(id, "administrador") };
    panel = await arrancarServidor("panel", entorno);
  }, 120_000);

  afterAll(async () => {
    await panel?.cerrar();
    await bd?.cerrar();
  });

  it("inscribir: 201, aparece con su rol, el alta queda auditada y al pedir entrar se le encola su código", async () => {
    const r = await post("/api/v1/accesos", {
      correo: "analista.mercadeo@trycore.com",
      rol: "observador",
    });
    expect(r.status).toBe(201);
    const { inscrito } = await r.json();
    const html = await (await pagina("/administracion/accesos")).text();
    expect(html).toContain("analista.mercadeo@trycore.com");
    expect(html).toContain("Observador · inscrito por karen.rodriguez@trycore.com");
    expect(await auditoria(inscrito.id)).toEqual([
      { campo: "alta", actor: "karen.rodriguez@trycore.com" },
    ]);
    const pedir = await post(
      "/api/v1/acceso/codigo",
      { correo: "analista.mercadeo@trycore.com" },
      "",
    );
    expect(pedir.status).toBe(202);
    expect((await ultimoTrabajoCodigo())?.payload.ref).toBe(inscrito.id);
  });

  it("un correo que no es @trycore.com: 422 y la lista queda igual", async () => {
    const n = (
      await bd.instalacion.query(`SELECT count(*)::int AS n FROM identidad_panel.usuarios_panel`)
    ).rows[0].n;
    const r = await post("/api/v1/accesos", {
      correo: "eida.tinjaca@gmail.com",
      rol: "observador",
    });
    expect(r.status).toBe(422);
    expect((await r.json()).motivo).toBe("correo_externo");
    expect(
      (await bd.instalacion.query(`SELECT count(*)::int AS n FROM identidad_panel.usuarios_panel`))
        .rows[0].n,
    ).toBe(n);
  });

  it("pasar a observador a otra administradora: su siguiente petición corta la sesión y vuelve a la puerta", async () => {
    const eida = await usuario("eida.tinjaca@trycore.com", "administrador");
    const suya = await sesionDe(eida, "administrador");
    expect((await pagina("/inventario", suya)).status).toBe(200);
    const r = await post(`/api/v1/accesos/${eida}/rol`, { rol: "observador" });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ rolAnterior: "administrador", rol: "observador" });
    const siguiente = await pagina("/inventario", suya);
    expect(siguiente.status).toBe(307);
    expect(siguiente.headers.get("location")).toMatch(/\/acceso\?motivo=rol_cambiado$/);
    expect(await sesiones(eida)).toBe(0);
    expect((await auditoria(eida)).map((a) => a.campo)).toEqual(["rol"]);
    const puerta = await (await pagina("/acceso?motivo=rol_cambiado", "")).text();
    expect(puerta).toContain("Cambió tu rol en el panel");
  });

  it("dar de baja: la sesión se corta, ya no se encola código y la respuesta es la de un correo no inscrito", async () => {
    const laura = await usuario("laura.pineda@trycore.com", "observador");
    const suya = await sesionDe(laura, "observador");
    expect((await post(`/api/v1/accesos/${laura}/baja`, {})).status).toBe(200);
    const api = await post(`/api/v1/perfiles/PS-0001/avisar`, {}, suya);
    expect(api.status).toBe(401);
    expect(await sesiones(laura)).toBe(0);
    const html = await (await pagina("/administracion/accesos")).text();
    expect(html).toContain("Dados de baja");
    expect(html).toMatch(/laura\.pineda@trycore\.com[\s\S]*Era observador · baja el/);
    const antes = await ultimoTrabajoCodigo();
    const baja = await post("/api/v1/acceso/codigo", { correo: "laura.pineda@trycore.com" }, "");
    const nunca = await post("/api/v1/acceso/codigo", { correo: "nunca.inscrita@trycore.com" }, "");
    expect(baja.status).toBe(nunca.status);
    expect(await baja.json()).toEqual(await nunca.json());
    const despues = (
      await bd.instalacion.query(
        `SELECT payload FROM operacion.trabajos WHERE tipo = 'enviar_codigo' AND id > $1`,
        [antes?.id ?? 0],
      )
    ).rows.map((x) => x.payload.ref);
    expect(despues.every((ref) => ref === null)).toBe(true);
  });

  it("la única administradora activa no puede quitarse el rol ni darse de baja: 409 y sigue igual", async () => {
    await bd.instalacion.query(
      `UPDATE identidad_panel.usuarios_panel SET activo = false, dado_de_baja_en = now()
        WHERE rol = 'administrador' AND id <> $1`,
      [admin.id],
    );
    for (const [ruta, cuerpo] of [
      [`/api/v1/accesos/${admin.id}/rol`, { rol: "observador" }],
      [`/api/v1/accesos/${admin.id}/baja`, {}],
    ] as const) {
      const r = await post(ruta, cuerpo);
      expect(r.status).toBe(409);
      expect((await r.json()).motivo).toBe("ultimo_administrador");
    }
    const f = (
      await bd.instalacion.query(
        `SELECT rol, activo FROM identidad_panel.usuarios_panel WHERE id = $1`,
        [admin.id],
      )
    ).rows[0];
    expect(f).toEqual({ rol: "administrador", activo: true });
    expect((await pagina("/inventario")).status).toBe(200);
  });

  it("la observadora no administra: 403 y la página la devuelve al contacto con el intento registrado", async () => {
    const mira = await usuario("mirar@trycore.com", "observador");
    const suya = await sesionDe(mira, "observador");
    expect(
      (await post("/api/v1/accesos", { correo: "x@trycore.com", rol: "administrador" }, suya))
        .status,
    ).toBe(403);
    const r = await pagina("/administracion/accesos", suya);
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toMatch(/\/administracion\/contacto\?rechazado=accesos$/);
    const log = (
      await bd.instalacion.query(
        `SELECT accion, recurso FROM identidad.accesos_log WHERE evento = 'acceso_rechazado' AND usuario_id = $1 ORDER BY id`,
        [mira],
      )
    ).rows;
    expect(log).toEqual([
      { accion: "accesos.administrar", recurso: "POST /api/v1/accesos" },
      { accion: "accesos.administrar", recurso: "GET /administracion/accesos" },
    ]);
  });

  it("el pie del menú lleva a Administración", async () => {
    expect(await (await pagina("/inventario")).text()).toMatch(/href="\/administracion"/);
  });
});
