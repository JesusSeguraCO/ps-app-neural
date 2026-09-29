import { describe, expect, it } from "vitest";
import {
  bordeValido,
  decidirPerimetro,
  politicaCsp,
  urlDeRedireccion,
  type EntradaPerimetro,
} from "./perimetro";

const SECRETO = "b".repeat(48);
const ANTERIOR = "a".repeat(48);

function entrada(cambios: Partial<EntradaPerimetro> = {}): EntradaPerimetro {
  return {
    host: "portal",
    metodo: "GET",
    ruta: "/",
    cabeceras: new Headers({ "x-ps-edge": SECRETO }),
    secretosBorde: [SECRETO],
    rutasPublicas: ["/e", "/acceso"],
    hayCookieSesion: true,
    ...cambios,
  };
}

describe("cabecera de borde (ADR-0010 CON-22)", () => {
  it("acepta el secreto vigente y el anterior durante una rotación", () => {
    expect(bordeValido(SECRETO, [SECRETO, ANTERIOR])).toBe(true);
    expect(bordeValido(ANTERIOR, [SECRETO, ANTERIOR])).toBe(true);
  });
  it.each([null, "", "otro", SECRETO.slice(1), `${SECRETO}x`])("rechaza %s", (valor) => {
    expect(bordeValido(valor, [SECRETO])).toBe(false);
  });
  it("sin secretos configurados no acepta nada", () => {
    expect(bordeValido(SECRETO, [])).toBe(false);
  });
});

describe("decidirPerimetro", () => {
  it("sin secreto de borde configurado no se exige cabecera (Cloudflare fuera de criterio)", () => {
    expect(decidirPerimetro(entrada({ cabeceras: new Headers(), secretosBorde: [] })).tipo).toBe("seguir");
    const sub = new Headers({ "x-middleware-subrequest": "m" });
    expect(decidirPerimetro(entrada({ cabeceras: sub, secretosBorde: [] }))).toEqual({ tipo: "rechazar", status: 403 });
  });

  it("sin cabecera de borde → 403", () => {
    expect(decidirPerimetro(entrada({ cabeceras: new Headers() }))).toEqual({
      tipo: "rechazar",
      status: 403,
    });
  });

  it("x-middleware-subrequest → 403 también en las rutas de salud", () => {
    const cabeceras = new Headers({ "x-middleware-subrequest": "m" });
    expect(decidirPerimetro(entrada({ ruta: "/api/v1/salud/vivo", cabeceras }))).toEqual({ tipo: "rechazar", status: 403 });
  });

  it("con x-middleware-subrequest desde fuera → 403 aunque el borde sea válido", () => {
    const cabeceras = new Headers({
      "x-ps-edge": SECRETO,
      "x-middleware-subrequest": "middleware",
    });
    expect(decidirPerimetro(entrada({ cabeceras }))).toEqual({ tipo: "rechazar", status: 403 });
  });

  it.each(["/api/v1/salud/vivo", "/api/v1/salud/lista"])(
    "GET %s sin borde se deja pasar (salud)",
    (ruta) => {
      expect(decidirPerimetro(entrada({ ruta, cabeceras: new Headers() })).tipo).toBe("seguir");
    },
  );

  it.each([
    ["POST", "/api/v1/salud/vivo"],
    ["GET", "/api/v1/salud/vivo/"],
    ["GET", "/api/v1/salud"],
    ["GET", "/api/v1/salud/vivo/../../catalogo"],
    ["GET", "/API/v1/salud/vivo"],
  ])("%s %s sin borde → 403 (la exención es exacta)", (metodo, ruta) => {
    expect(decidirPerimetro(entrada({ metodo, ruta, cabeceras: new Headers() }))).toEqual({
      tipo: "rechazar",
      status: 403,
    });
  });

  it("sin cookie en una página no pública → redirección optimista a /acceso", () => {
    expect(decidirPerimetro(entrada({ hayCookieSesion: false }))).toMatchObject({
      tipo: "redirigir",
      a: "/acceso",
    });
  });

  it("sin cookie en una página pública → sigue", () => {
    expect(decidirPerimetro(entrada({ hayCookieSesion: false, ruta: "/e" })).tipo).toBe("seguir");
    expect(decidirPerimetro(entrada({ hayCookieSesion: false, ruta: "/acceso" })).tipo).toBe(
      "seguir",
    );
  });

  it("sin cookie en /api no redirige: lo resuelve el Route Handler con 401", () => {
    expect(
      decidirPerimetro(entrada({ hayCookieSesion: false, ruta: "/api/v1/catalogo" })).tipo,
    ).toBe("seguir");
  });

  it("genera un nonce distinto por petición y lo pone en la CSP", () => {
    const a = decidirPerimetro(entrada());
    const b = decidirPerimetro(entrada());
    if (a.tipo !== "seguir" || b.tipo !== "seguir") throw new Error("se esperaba seguir");
    expect(a.nonce).not.toBe(b.nonce);
    expect(a.csp).toContain(`'nonce-${a.nonce}'`);
    expect(a.nonce).toMatch(/^[A-Za-z0-9+/=]{22,}$/);
  });
});

describe("politicaCsp (ADR-0010 fila QA-5, UC-14)", () => {
  const csp = politicaCsp("NONCE", { host: "portal" });
  it.each([
    "default-src 'self'",
    "script-src 'self' 'nonce-NONCE' 'strict-dynamic'",
    "style-src 'self' 'nonce-NONCE'",
    "style-src-elem 'self' 'nonce-NONCE'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ])("incluye %s", (directiva) => {
    expect(csp.split("; ")).toContain(directiva);
  });
  it("no permite unsafe-inline ni unsafe-eval en scripts", () => {
    expect(csp).not.toMatch(/script-src[^;]*unsafe/);
  });
  it("el panel añade el origen de Spaces solo en connect-src", () => {
    const panel = politicaCsp("N", {
      host: "panel",
      origenSpaces: "https://ps-evidencias.nyc3.digitaloceanspaces.com",
    });
    expect(panel).toContain("connect-src 'self' https://ps-evidencias.nyc3.digitaloceanspaces.com");
    expect(politicaCsp("N", { host: "portal" })).not.toContain("digitaloceanspaces");
  });
});

describe("urlDeRedireccion (Location con el host público)", () => {
  const cab = (h: Record<string, string>) => new Headers(h);
  it("usa el Host de la petición y el protocolo de x-forwarded-proto, no el host de escucha", () => {
    expect(
      urlDeRedireccion(
        "/acceso",
        cab({ host: "panel.people.trycore.com", "x-forwarded-proto": "https" }),
        "http://localhost:8080/",
      ),
    ).toBe("https://panel.people.trycore.com/acceso");
  });
  it("sin x-forwarded-proto conserva el protocolo de la petición", () => {
    expect(urlDeRedireccion("/acceso", cab({ host: "127.0.0.1:3101" }), "http://localhost:3101/")).toBe(
      "http://127.0.0.1:3101/acceso",
    );
  });
  it("un Host o protocolo malformado no se usa: cae al de la petición", () => {
    expect(
      urlDeRedireccion(
        "/acceso",
        cab({ host: "evil.com/x@", "x-forwarded-proto": "javascript" }),
        "http://localhost:3101/",
      ),
    ).toBe("http://localhost:3101/acceso");
  });
  it("solo acepta rutas propias como destino", () => {
    expect(() => urlDeRedireccion("//evil.com", cab({ host: "a.b" }), "http://a.b/")).toThrow();
    expect(() => urlDeRedireccion("https://evil.com", cab({ host: "a.b" }), "http://a.b/")).toThrow();
  });
});
