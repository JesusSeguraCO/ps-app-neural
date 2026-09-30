// POST /api/v1/acceso/enlace (ADR-0002 §3, H5/H9): el navegador envía el token que leyó del fragmento
// `#t=`. 200 {estado_enlace, con_sesion} | 410 {motivo}. Token inexistente o mal formado = el mismo 410
// que revocado. Nunca devuelve inventario.
import { z } from "zod";
import { COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";
import { conBorde, conCsrf, leerCookie, respuestaJson } from "@ps/infra/http/envoltorios";
import { consultarEnlace } from "@ps/infra/postgres/acceso-cliente";
import { ipDe, servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ token: z.string().max(128) });

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const cuerpo = entrada.safeParse(await req.json().catch(() => null));
    const { bd } = servicios();
    const r = await consultarEnlace(bd, {
      token: cuerpo.success ? cuerpo.data.token : "",
      idCookie: leerCookie(req, COOKIE_PORTAL),
      ip: ipDe(req),
    });
    if (r.estado === "activo") return respuestaJson(200, { estado_enlace: "activo", con_sesion: r.conSesion });
    if (r.estado === "vencido") return respuestaJson(410, { motivo: "enlace_vencido", vencio: r.vencio.toISOString() });
    return respuestaJson(410, { motivo: "enlace_revocado" });
  }),
);
