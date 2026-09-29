// Esqueleto andante de EP-001 · sub-slice 1 contra los servidores standalone reales (`next build`):
// perímetro (ADR-0010), cabeceras y CSP, salud, arranque sin configuración (V8-9), guardas de página
// por manifiesto (V2-1) y lista positiva de rutas (V8-1).
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OPCIONALES, VARIABLES } from "@ps/infra/config";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  RAIZ,
  arrancarServidor,
  codigoDeSalidaAlArrancar,
  entornoDev,
  hayBuild,
  type App,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";

const APPS: App[] = ["portal", "panel"];

function manifiestoRutas(app: App): string[] {
  const m = JSON.parse(
    readFileSync(`${RAIZ}apps/${app}/.next/app-path-routes-manifest.json`, "utf8"),
  );
  return [...new Set(Object.values(m) as string[])].sort();
}

function rutasPublicas(app: App): string[] {
  return JSON.parse(readFileSync(`${RAIZ}apps/${app}/rutas-publicas.json`, "utf8"));
}

const esPagina = (app: App, ruta: string) =>
  !ruta.startsWith("/api/") && ruta !== "/_not-found" && !rutasPublicas(app).includes(ruta);

describe.skipIf(!HAY_BD || !APPS.every(hayBuild)).each(APPS)("esqueleto de %s", (app) => {
  let bd: BdPrueba;
  let srv: ServidorPrueba;
  let entorno: Record<string, string>;
  const cookie = app === "portal" ? "__Host-ps" : "__Host-pp";
  const sesiones: Record<string, string> = {};

  beforeAll(async () => {
    bd = await crearBdPrueba();
    entorno = {
      ...entornoDev(app),
      APP_ENV: "ci",
      DATABASE_URL: bd.urlDe(app === "portal" ? "ps_portal" : "ps_panel"),
    };
    srv = await arrancarServidor(app, entorno);

    const i = bd.instalacion;
    const u = await i.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', '\\x01', 'administrador'), ('baja@trycore.com', '\\x02', 'observador') RETURNING id, correo`,
    );
    const [ana, baja] = u.rows;
    await i.query(`UPDATE identidad_panel.usuarios_panel SET activo = false WHERE id = $1`, [
      baja.id,
    ]);
    const e = await i.query(
      `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, vigente_desde, vigente_hasta, generado_por, estado)
       VALUES ('hs', 'Cuenta', 'razón', now() - interval '2 days', now() + interval '1 day', $1, 'revocado'),
              ('hs', 'Cuenta', 'razón', now() - interval '2 days', now() - interval '1 hour', $1, 'activo')
       RETURNING id`,
      [ana.id],
    );
    const [revocado, vencido] = e.rows;
    for (const [nombre, enlace] of [
      ["revocado", revocado.id],
      ["vencido", vencido.id],
    ] as const) {
      const inv = await i.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'x@cliente.com', $2) RETURNING id`,
        [enlace, randomBytes(8)],
      );
      const id = `s-${nombre}-${randomBytes(8).toString("hex")}`;
      sesiones[`portal_${nombre}`] = id;
      await i.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ($1, $2, $3, now() + interval '1 day')`,
        [createHash("sha256").update(id).digest(), enlace, inv.rows[0].id],
      );
    }
    for (const [nombre, usuario, inactivoMin] of [
      ["desactivado", baja.id, 1],
      ["inactiva61", ana.id, 61],
    ] as const) {
      const id = `p-${nombre}-${randomBytes(8).toString("hex")}`;
      sesiones[`panel_${nombre}`] = id;
      await i.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, creada, ultima_actividad, expira)
         VALUES ($1, $2, now() - interval '2 hours', now() - make_interval(mins => $3), now() + interval '10 hours')`,
        [createHash("sha256").update(id).digest(), usuario, inactivoMin],
      );
    }
  }, 90_000);

  afterAll(async () => {
    await srv?.cerrar();
    await bd?.cerrar();
  });

  describe("perímetro (cabecera de borde, ADR-0010 CON-22)", () => {
    it("sin cabecera de borde → 403", async () => {
      expect((await srv.pedir("/acceso", { sinBorde: true })).status).toBe(403);
    });
    it("con cabecera de borde equivocada → 403", async () => {
      expect(
        (await srv.pedir("/acceso", { sinBorde: true, headers: { "x-ps-edge": "otra" } })).status,
      ).toBe(403);
    });
    it("x-middleware-subrequest desde fuera → 403", async () => {
      const r = await srv.pedir("/", {
        headers: { "x-middleware-subrequest": "middleware:middleware:middleware" },
      });
      expect(r.status).toBe(403);
    });
    it("GET /api/v1/salud/vivo sin borde → 200 sin cuerpo", async () => {
      const r = await srv.pedir("/api/v1/salud/vivo", { sinBorde: true });
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("");
    });
    it("POST /api/v1/salud/vivo sin borde → 403", async () => {
      expect(
        (await srv.pedir("/api/v1/salud/vivo", { method: "POST", sinBorde: true })).status,
      ).toBe(403);
    });
  });

  describe("cabeceras de seguridad y CSP con nonce", () => {
    it("cada HTML lleva una CSP con un nonce distinto, y los scripts de Next lo usan", async () => {
      const a = await srv.pedir("/acceso");
      const b = await srv.pedir("/acceso");
      const csp = a.headers.get("content-security-policy") ?? "";
      const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
      expect(nonce).toBeTruthy();
      expect(b.headers.get("content-security-policy")).not.toBe(csp);
      const html = await a.text();
      const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
      expect(scripts.length).toBeGreaterThan(0);
      for (const s of scripts) expect(s).toContain(`nonce="${nonce}"`);
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("'strict-dynamic'");
    });
    it("cabeceras globales", async () => {
      const r = await srv.pedir("/acceso");
      expect(r.headers.get("strict-transport-security")).toBe("max-age=31536000");
      expect(r.headers.get("x-frame-options")).toBe("DENY");
      expect(r.headers.get("x-content-type-options")).toBe("nosniff");
      expect(r.headers.get("x-robots-tag")).toBe("noindex, nofollow");
      expect(r.headers.get("referrer-policy")).toBe(
        app === "portal" ? "no-referrer" : "strict-origin",
      );
      expect(r.headers.get("cache-control")).toContain("no-store");
      expect(r.headers.get("x-powered-by")).toBeNull();
    });
  });

  describe("salud", () => {
    it("salud/lista → 200 con la BD y el esquema al día", async () => {
      expect((await srv.pedir("/api/v1/salud/lista", { sinBorde: true })).status).toBe(200);
    });
    it("salud/lista → 503 y salud/vivo → 200 cuando la BD no responde", async () => {
      const caido = await arrancarServidor(app, {
        ...entorno,
        DATABASE_URL: "postgres://ps_x:dev@127.0.0.1:1/ps",
      });
      try {
        expect((await caido.pedir("/api/v1/salud/lista", { sinBorde: true })).status).toBe(503);
        expect((await caido.pedir("/api/v1/salud/vivo", { sinBorde: true })).status).toBe(200);
      } finally {
        await caido.cerrar();
      }
    }, 30_000);
  });

  describe("guardas de página por manifiesto (V2-1)", () => {
    const casos = () => {
      const lista: Array<[string, string | undefined, string]> = [
        ["sin cookie", undefined, "/acceso"],
      ];
      if (app === "portal") {
        lista.push(["enlace revocado", sesiones.portal_revocado, "/acceso?motivo=enlace_revocado"]);
        lista.push(["enlace vencido", sesiones.portal_vencido, "/acceso?motivo=enlace_vencido"]);
      } else {
        lista.push(["usuario desactivado", sesiones.panel_desactivado, "/acceso"]);
        lista.push([
          "61 min sin actividad",
          sesiones.panel_inactiva61,
          "/acceso?motivo=sesion_expirada",
        ]);
      }
      lista.push(["cookie inexistente", "no-existe", "/acceso"]);
      return lista;
    };

    it("toda página protegida del manifiesto redirige (307) con el motivo correcto, con y sin RSC", async () => {
      const paginas = manifiestoRutas(app).filter((r) => esPagina(app, r));
      expect(paginas.length).toBeGreaterThan(0);
      for (const pagina of paginas) {
        for (const [caso, id, destino] of casos()) {
          for (const rsc of [false, true]) {
            const headers: Record<string, string> = {};
            if (id) headers.cookie = `${cookie}=${id}`;
            if (rsc) headers.RSC = "1";
            const r = await srv.pedir(pagina, { headers });
            const donde = `${app} ${pagina} · ${caso} · RSC=${rsc}`;
            const cuerpo = await r.text();
            if (!rsc) {
              expect(r.status, donde).toBe(307);
              const destinoReal = new URL(r.headers.get("location")!, srv.url);
              expect(destinoReal.pathname + destinoReal.search, donde).toBe(destino);
            } else {
              // Next 15 responde a una navegación RSC con el payload del marco y la orden de
              // redirección (307) que ejecuta el cliente, no con un 307 HTTP. Se exige la orden
              // exacta hacia el destino correcto y ningún dato protegido (discrepancia con el texto
              // de V2-1 registrada para arquitectura).
              expect([200, 307], donde).toContain(r.status);
              if (r.status === 200) {
                expect(r.headers.get("content-type"), donde).toContain("text/x-component");
                expect(cuerpo, donde).toContain(`"digest":"NEXT_REDIRECT;replace;${destino};307;"`);
              } else {
                const destinoReal = new URL(r.headers.get("location")!, srv.url);
                expect(destinoReal.pathname + destinoReal.search, donde).toBe(destino);
              }
            }
            expect(cuerpo, donde).not.toContain("Tu selección de perfiles");
            expect(cuerpo, donde).not.toContain("ana@trycore.com");
          }
        }
      }
    }, 60_000);

    it("cada page.tsx protegida llama a exigirSesion antes de cualquier otro await", () => {
      const carpeta = `${RAIZ}apps/${app}/app`;
      const paginas: string[] = [];
      const recorrer = (dir: string) => {
        for (const f of readdirSync(dir)) {
          const p = path.join(dir, f);
          if (statSync(p).isDirectory()) recorrer(p);
          else if (f === "page.tsx") paginas.push(p);
        }
      };
      recorrer(carpeta);
      const protegidas = paginas.filter((p) => {
        const ruta =
          "/" +
          path
            .relative(carpeta, path.dirname(p))
            .split(path.sep)
            .filter((s) => !s.startsWith("("))
            .join("/");
        return !rutasPublicas(app).includes(ruta === "/" ? "/" : ruta.replace(/\/$/, ""));
      });
      expect(protegidas.length).toBeGreaterThan(0);
      for (const p of protegidas) {
        const fuente = readFileSync(p, "utf8");
        const primerAwait = fuente.match(/await\s+([A-Za-z_$][\w$]*)/);
        expect(primerAwait?.[1], p).toBe("exigirSesion");
      }
    });
  });

  it("sin cada variable obligatoria el servidor no llega a servir (V8-9)", async () => {
    for (const variable of VARIABLES[app].filter((v) => !OPCIONALES.has(v))) {
      const sin = { ...entorno };
      delete sin.DOBLES;
      for (const v of VARIABLES[app]) if (!OPCIONALES.has(v)) sin[v] ??= "x".repeat(40);
      sin.MAILGUN_DOMAIN = "mg.people.trycore.com";
      sin.SPACES_BUCKET = "ps-evidencias";
      delete sin[variable];
      const codigo = await codigoDeSalidaAlArrancar(app, sin);
      expect(codigo, `${app} sin ${variable}`).not.toBe(0);
      expect(codigo, `${app} sin ${variable}`).not.toBeNull();
    }
  }, 240_000);
});

describe.skipIf(!hayBuild("portal"))("lista positiva de rutas del portal (V8-1)", () => {
  it("toda ruta de la build está en rutas-permitidas.json", () => {
    const permitidas = new Set(
      JSON.parse(readFileSync(`${RAIZ}apps/portal/rutas-permitidas.json`, "utf8")).rutas,
    );
    const fuera = manifiestoRutas("portal").filter((r) => !permitidas.has(r));
    expect(fuera).toEqual([]);
  });
});
