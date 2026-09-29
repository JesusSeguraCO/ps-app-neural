// POST /api/v1/acceso/verificar (ADR-0002, HU-090): 204 + cookie de sesión acotada al enlace, o el mismo
// 403 {motivo: "codigo_invalido"} ante cualquier fallo (erróneo, vencido, usado, no invitado). Con los
// intentos agotados, 429 {motivo: "en_espera", hasta}: igual para invitados y no invitados.
import { z } from "zod";
import { COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";
import { conBorde, conCsrf, leerCookie, respuestaJson } from "@ps/infra/http/envoltorios";
import { cerrarSesionPortal, verificarCodigoCliente } from "@ps/infra/postgres/acceso-cliente";
import { ipDe, servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  token: z.string().max(128),
  correo: z.string().trim().min(3).max(254),
  codigo: z.string().trim().max(12),
});

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const cuerpo = entrada.safeParse(await req.json().catch(() => null));
    if (!cuerpo.success) return respuestaJson(403, { motivo: "codigo_invalido" });
    const { bd, secretos } = servicios();
    const r = await verificarCodigoCliente(bd, secretos, {
      ...cuerpo.data,
      codigo: cuerpo.data.codigo.replace(/\s/g, ""),
      ip: ipDe(req),
    });
    if (!r.ok && r.motivo === "en_espera") return respuestaJson(429, { motivo: "en_espera", hasta: r.hasta.toISOString() });
    if (!r.ok) return respuestaJson(403, { motivo: "codigo_invalido" });
    // La sesión anterior de este dispositivo (otro enlace) se borra al verificar: prevalece el token (H5).
    const anterior = leerCookie(req, COOKIE_PORTAL);
    if (anterior) await cerrarSesionPortal(bd, anterior);
    const maxAge = Math.max(0, Math.floor((r.expira.getTime() - Date.now()) / 1000));
    const res = new Response(null, { status: 204, headers: { "cache-control": "private, no-store" } });
    res.headers.append("set-cookie", `${COOKIE_PORTAL}=${r.idSesion}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
    return res;
  }),
);
