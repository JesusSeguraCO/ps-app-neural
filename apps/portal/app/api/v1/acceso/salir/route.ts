// POST /api/v1/acceso/salir (ADR-0002 §3): borra la sesión de este dispositivo y la cookie.
import { COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";
import { conBorde, conCsrf, leerCookie } from "@ps/infra/http/envoltorios";
import { cerrarSesionPortal } from "@ps/infra/postgres/acceso-cliente";
import { servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const id = leerCookie(req, COOKIE_PORTAL);
    if (id) await cerrarSesionPortal(servicios().bd, id);
    const res = new Response(null, { status: 204, headers: { "cache-control": "private, no-store" } });
    res.headers.append("set-cookie", `${COOKIE_PORTAL}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);
    return res;
  }),
);
