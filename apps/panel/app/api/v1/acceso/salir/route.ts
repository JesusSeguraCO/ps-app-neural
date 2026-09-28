// POST /api/v1/acceso/salir: cierra la sesión del panel (borra solo su fila por la función de BD).
import { COOKIE_PANEL } from "@ps/dominio/acceso/sesion";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel } from "@ps/infra/http/envoltorios";
import { cerrarSesionPanel } from "@ps/infra/postgres/acceso-panel";
import { servicios } from "../../../../../src/acceso/servicios";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (_req, sesion) => {
        await cerrarSesionPanel(servicios().bd, sesion.idCookie);
        const res = new Response(null, { status: 204, headers: { "cache-control": "private, no-store" } });
        res.headers.append("set-cookie", `${COOKIE_PANEL}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);
        return res;
      }),
    ),
  ),
);
