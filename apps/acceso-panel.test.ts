// HU-123 (entrar al panel con identidad corporativa) y V8-5 (CSRF) contra el servidor standalone del
// panel. Sin worker vivo, el propio Route Handler envía el código (modo degradado H8) al doble de correo,
// cuya salida se lee del proceso.
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { MatrizPermisos } from "@ps/dominio/acceso/permisos";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  RAIZ,
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";

describe.skipIf(!HAY_BD || !hayBuild("panel"))("acceso al panel (HU-123, V8-5, H8)", () => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let entorno: Record<string, string>;
  const csrf = randomBytes(16).toString("hex");
  const cookieCsrf = `__Host-csrf=${csrf}`;

  const post = (ruta: string, cuerpo: unknown, extra: Record<string, string> = {}) =>
    srv.pedir(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: srv.url,
        "x-ps-csrf": csrf,
        cookie: cookieCsrf,
        ...extra,
      },
    });

  async function codigoEnviadoA(correo: string, ms = 8_000): Promise<string> {
    const fin = Date.now() + ms;
    for (;;) {
      const lineas = srv
        .salida()
        .split("\n")
        .filter((l) => l.includes('"correo_doble"') && l.includes(correo));
      const m = lineas.at(-1)?.match(/(\d{3}) (\d{3})/);
      if (m) return m[1]! + m[2]!;
      if (Date.now() > fin) throw new Error(`no llegó código a ${correo}`);
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  beforeAll(async () => {
    bd = await crearBdPrueba();
    entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', $1, 'administrador')`,
      [hmacCorreo("ana@trycore.com", entorno.EMAIL_HMAC_KEY!)],
    );
    srv = await arrancarServidor("panel", entorno);
  }, 90_000);

  afterAll(async () => {
    await srv?.cerrar();
    await bd?.cerrar();
  });

  describe("CSRF (V8-5): 403 y ningún cambio", () => {
    const casos: Array<[string, Record<string, string>]> = [
      ["sin cabecera CSRF", { "x-ps-csrf": "" }],
      ["con token erróneo", { "x-ps-csrf": "otro" }],
      ["con Origin de otro subdominio de trycore.com", { origin: "https://people.trycore.com" }],
      ["sin Origin ni Referer", { origin: "" }],
    ];
    it.each(casos)("%s", async (_caso, extra) => {
      const antes = (await bd.instalacion.query(`SELECT count(*)::int n FROM operacion.trabajos`))
        .rows[0].n;
      const cabeceras: Record<string, string> = {};
      for (const [k, v] of Object.entries(extra)) if (v) cabeceras[k] = v;
      const r = await srv.pedir("/api/v1/acceso/codigo", {
        method: "POST",
        body: JSON.stringify({ correo: "ana@trycore.com" }),
        headers: {
          "content-type": "application/json",
          cookie: cookieCsrf,
          ...(extra.origin === "" ? {} : { origin: extra.origin ?? srv.url }),
          ...(extra["x-ps-csrf"] === "" ? {} : { "x-ps-csrf": extra["x-ps-csrf"] ?? csrf }),
        },
      });
      expect(r.status).toBe(403);
      expect(
        (await bd.instalacion.query(`SELECT count(*)::int n FROM operacion.trabajos`)).rows[0].n,
      ).toBe(antes);
    });
  });

  it("HU-123 happy path: correo inscrito + código de un uso → entra con su rol, sin contraseña, identificado por correo", async () => {
    const pedir = await post("/api/v1/acceso/codigo", { correo: "Ana@Trycore.com" });
    expect(pedir.status).toBe(202);
    const codigo = await codigoEnviadoA("ana@trycore.com");
    const r = await post("/api/v1/acceso/verificar", { correo: "ana@trycore.com", codigo });
    expect(r.status).toBe(204);
    const setCookie = r.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(
      /__Host-pp=[^;]+; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=43200/,
    );
    const sesion = setCookie.split(";")[0]!;
    const inicio = await srv.pedir("/", { headers: { cookie: sesion } });
    expect(inicio.status).toBe(200);
    expect(await inicio.text()).toContain("ana@trycore.com");
    // El código sirve una vez.
    expect(
      (await post("/api/v1/acceso/verificar", { correo: "ana@trycore.com", codigo })).status,
    ).toBe(403);
    // Salir cierra la sesión: la siguiente petición vuelve a la puerta.
    expect(
      (await post("/api/v1/acceso/salir", {}, { cookie: `${cookieCsrf}; ${sesion}` })).status,
    ).toBe(204);
    expect((await srv.pedir("/", { headers: { cookie: sesion } })).status).toBe(307);
  }, 30_000);

  it("HU-123 correo sin inscribir: misma respuesta que uno inscrito, sin código ni datos", async () => {
    const inscrito = await post("/api/v1/acceso/codigo", { correo: "ana@trycore.com" });
    const noInscrito = await post("/api/v1/acceso/codigo", { correo: "nadie@trycore.com" });
    expect(noInscrito.status).toBe(inscrito.status);
    expect(await noInscrito.text()).toBe(await inscrito.text());
    await new Promise((r) => setTimeout(r, 1_500));
    expect(srv.salida()).not.toMatch(/"correo_doble".*nadie@trycore\.com/);
    expect(
      (await post("/api/v1/acceso/verificar", { correo: "nadie@trycore.com", codigo: "123456" }))
        .status,
    ).toBe(403);
  }, 30_000);

  it("HU-123 buzón desactivado: el usuario inactivo no recibe código y no entra, sin baja manual en la auditoría", async () => {
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol, activo) VALUES ('salio@trycore.com', $1, 'observador', false)`,
      [hmacCorreo("salio@trycore.com", entorno.EMAIL_HMAC_KEY!)],
    );
    expect((await post("/api/v1/acceso/codigo", { correo: "salio@trycore.com" })).status).toBe(202);
    await new Promise((r) => setTimeout(r, 1_500));
    expect(srv.salida()).not.toMatch(/"correo_doble".*salio@trycore\.com/);
    const bajas = await bd.instalacion.query(
      `SELECT count(*)::int n FROM auditoria.auditoria WHERE entidad = 'usuarios_panel' AND campo = 'activo'`,
    );
    expect(bajas.rows[0].n).toBe(0);
  }, 30_000);

  it("HU-123 sesión de 12 h: al cumplirse, el panel pide un código nuevo", async () => {
    const id = randomBytes(16).toString("hex");
    const u = await bd.instalacion.query(
      `SELECT id FROM identidad_panel.usuarios_panel WHERE correo = 'ana@trycore.com'`,
    );
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, creada, ultima_actividad, expira)
       VALUES ($1, $2, now() - interval '12 hours', now() - interval '1 minute', now() + interval '1 hour')`,
      [createHash("sha256").update(id).digest(), u.rows[0].id],
    );
    const r = await srv.pedir("/", { headers: { cookie: `__Host-pp=${id}` } });
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toContain("/acceso?motivo=sesion_expirada");
  });

  it("HU-123 el panel no se alcanza desde el portal: nada del portal apunta al host del panel", () => {
    const dir = `${RAIZ}apps/portal/.next/standalone/apps/portal/.next`;
    const ficheros: string[] = [];
    const recorrer = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) recorrer(p);
        else if (/\.(js|html|json|rsc|txt)$/.test(f)) ficheros.push(p);
      }
    };
    recorrer(dir);
    expect(ficheros.length).toBeGreaterThan(0);
    for (const f of ficheros)
      expect(readFileSync(f, "utf8"), f).not.toMatch(/people-panel|panel\.trycore/);
  });

  it("V2-3: cada route.ts mutante del panel declara una acción de MatrizPermisos, salvo las públicas", () => {
    const publicas = new Set(
      JSON.parse(readFileSync(`${RAIZ}apps/panel/rutas-publicas.json`, "utf8")),
    );
    const base = `${RAIZ}apps/panel/app`;
    const rutas: string[] = [];
    const recorrer = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) recorrer(p);
        else if (f === "route.ts") rutas.push(p);
      }
    };
    recorrer(base);
    for (const r of rutas) {
      const url = "/" + path.relative(base, path.dirname(r)).split(path.sep).join("/");
      const fuente = readFileSync(r, "utf8");
      const mutantes = [...fuente.matchAll(/export const (POST|PUT|PATCH|DELETE)\b/g)].map(
        (m) => m[1]!,
      );
      if (!mutantes.length || publicas.has(url) || url.startsWith("/api/v1/salud")) continue;
      const permisos = readFileSync(path.join(path.dirname(r), "permisos.ts"), "utf8");
      for (const metodo of mutantes) {
        const accion = permisos.match(new RegExp(`${metodo}:\\s*"([^"]+)"`))?.[1];
        expect(accion && Object.hasOwn(MatrizPermisos, accion), `${url} ${metodo}`).toBe(true);
        expect(fuente, url).toMatch(/conAutorizacion\(/);
      }
    }
  });
});
