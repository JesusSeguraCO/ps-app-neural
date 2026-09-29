// Perímetro de ambas apps (ADR-0010 §2 CON-22 y QA-5, §3.3 «Middleware»; ADR-0008 fila QA-3/CON-22).
// Lo usa `middleware.ts` en runtime `nodejs`: sin BD y sin `server-only` (el middleware no corre con
// la condición react-server). Decisión pura y testeable; el middleware solo la aplica.
import { randomBytes, timingSafeEqual } from "node:crypto";

export type Host = "portal" | "panel";

export interface EntradaPerimetro {
  host: Host;
  metodo: string;
  ruta: string;
  cabeceras: Headers;
  secretosBorde: string[];
  rutasPublicas: string[];
  hayCookieSesion: boolean;
}

export type DecisionPerimetro =
  | { tipo: "rechazar"; status: 403 }
  | { tipo: "redirigir"; a: string }
  | { tipo: "seguir"; nonce: string; csp: string };

export const CABECERA_BORDE = "x-ps-edge";

// Única excepción a la cabecera de borde: salud por ruta exacta y método GET (ADR-0010 §2).
const SALUD_EXENTA = new Set(["/api/v1/salud/vivo", "/api/v1/salud/lista"]);

export function bordeValido(valor: string | null, secretos: readonly string[]): boolean {
  if (!valor) return false;
  const recibido = Buffer.from(valor);
  let ok = false;
  for (const s of secretos) {
    const esperado = Buffer.from(s);
    // Recorre todos los secretos sin cortar antes, y compara en tiempo constante.
    if (esperado.length === recibido.length && timingSafeEqual(esperado, recibido)) ok = true;
  }
  return ok;
}

export function politicaCsp(
  nonce: string,
  opciones: { host: Host; origenSpaces?: string },
): string {
  const conectar = ["'self'"];
  if (opciones.host === "panel" && opciones.origenSpaces) conectar.push(opciones.origenSpaces);
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${conectar.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

function esPublica(ruta: string, publicas: readonly string[]): boolean {
  return publicas.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}

export function decidirPerimetro(
  e: EntradaPerimetro,
  opciones: { origenSpaces?: string } = {},
): DecisionPerimetro {
  // La cabecera interna de Next nunca se acepta desde fuera, tampoco en salud (CVE-2025-29927).
  if (e.cabeceras.has("x-middleware-subrequest")) return { tipo: "rechazar", status: 403 };
  const saludExenta = e.metodo === "GET" && SALUD_EXENTA.has(e.ruta);
  if (!saludExenta) {
    // Sin secreto configurado no hay borde que comprobar (Cloudflare fuera de criterio, 2026-09-28).
    if (e.secretosBorde.length > 0 && !bordeValido(e.cabeceras.get(CABECERA_BORDE), e.secretosBorde))
      return { tipo: "rechazar", status: 403 };
  }
  // Redirección optimista sin BD: la autoridad sigue siendo la guarda de página (ADR-0002 H5).
  if (
    !e.hayCookieSesion &&
    !e.ruta.startsWith("/api/") &&
    !e.ruta.startsWith("/_next/") &&
    !esPublica(e.ruta, e.rutasPublicas)
  ) {
    return { tipo: "redirigir", a: "/acceso" };
  }
  const nonce = randomBytes(16).toString("base64");
  return {
    tipo: "seguir",
    nonce,
    csp: politicaCsp(nonce, { host: e.host, origenSpaces: opciones.origenSpaces }),
  };
}
