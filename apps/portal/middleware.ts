// Perímetro (ADR-0010 §3.3): (1) cabecera de borde → 403; (2) nonce y CSP; (3) redirección optimista
// sin BD. Runtime Node (next ≥ 15.5, V8-2). La autoridad de la sesión es la guarda de página.
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";
import { decidirPerimetro } from "@ps/infra/perimetro";
import rutasPublicas from "./rutas-publicas.json";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const secretosBorde = [process.env.EDGE_SECRET, process.env.EDGE_SECRET_PREV].filter((s): s is string => Boolean(s));
  const decision = decidirPerimetro({
    host: "portal",
    metodo: req.method,
    ruta: req.nextUrl.pathname,
    cabeceras: req.headers,
    secretosBorde,
    rutasPublicas,
    hayCookieSesion: req.cookies.has(COOKIE_PORTAL),
  });
  if (decision.tipo === "rechazar") return new NextResponse(null, { status: 403 });
  if (decision.tipo === "redirigir") return NextResponse.redirect(new URL(decision.a, req.url), 307);

  // Next toma el nonce de la CSP de la petición y lo aplica a sus scripts.
  const cabeceras = new Headers(req.headers);
  cabeceras.set("x-nonce", decision.nonce);
  cabeceras.set("content-security-policy", decision.csp);
  const res = NextResponse.next({ request: { headers: cabeceras } });
  res.headers.set("content-security-policy", decision.csp);
  if (!req.nextUrl.pathname.startsWith("/api/")) res.headers.set("cache-control", "private, no-store");
  return res;
}
