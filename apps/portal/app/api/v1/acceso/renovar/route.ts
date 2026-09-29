// POST /api/v1/acceso/renovar (HU-092, design §2): pide un enlace nuevo para un enlace vencido, con el
// token de la barra o con la sesión que ese enlace dejó. Respuesta neutra: 202 {estado: "pedida",
// solicitud} para invitados y no invitados; 200 {estado: "en_camino", …} dentro de la ventana de espera;
// 409 si el enlace sigue vigente; 410 si fue revocado o la dirección no existe.
import { z } from "zod";
import { COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";
import { conBorde, conCsrf, leerCookie, respuestaJson } from "@ps/infra/http/envoltorios";
import { pedirRenovacion } from "@ps/infra/postgres/renovacion-cliente";
import { servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ token: z.string().max(128).optional(), correo: z.string().trim().min(3).max(254) });

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const cuerpo = entrada.safeParse(await req.json().catch(() => null));
    if (!cuerpo.success) return respuestaJson(400, { motivo: "entrada_invalida" });
    const { bd, secretos } = servicios();
    const r = await pedirRenovacion(bd, secretos.emailHmac, {
      token: cuerpo.data.token,
      idCookie: cuerpo.data.token ? undefined : leerCookie(req, COOKIE_PORTAL),
      correo: cuerpo.data.correo,
    });
    switch (r.tipo) {
      case "pedida":
        return respuestaJson(202, { estado: "pedida", solicitud: r.solicitud });
      case "en_camino":
        return respuestaJson(200, { estado: "en_camino", solicitud: r.solicitud, puedes_desde: r.desde.toISOString() });
      case "activo":
        return respuestaJson(409, { motivo: "enlace_activo" });
      case "revocado":
        return respuestaJson(410, { motivo: "enlace_revocado" });
    }
  }),
);
