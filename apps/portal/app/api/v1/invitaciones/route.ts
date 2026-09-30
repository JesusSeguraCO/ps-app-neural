// POST /api/v1/invitaciones (HU-095, ADR-0002 §3): con sesión, pide la invitación de un colega.
// 201 {id} (idempotente: si ya hay una pendiente para ese correo devuelve la misma) · 400 correo
// inválido o el propio · 429 {motivo: "en_espera", hasta} con más de 5 peticiones del invitado en una hora. El colega no gana acceso hasta que Talento Humano la apruebe en el panel.
import { z } from "zod";
import { conBorde, conCsrf, conSesionPortal, respuestaJson } from "@ps/infra/http/envoltorios";
import { pedirInvitacion } from "@ps/infra/postgres/invitaciones-cliente";
import { servicios } from "../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  correo: z.string().max(254),
  nombre: z.string().max(200).optional(),
  para_que: z.string().max(1000).optional(),
});

export const POST = conBorde(
  conCsrf(
    conSesionPortal(async (req, sesion) => {
      const cuerpo = entrada.safeParse(await req.json().catch(() => null));
      if (!cuerpo.success) return respuestaJson(400, { motivo: "correo_invalido" });
      const { bd, secretos } = servicios();
      const r = await pedirInvitacion(bd, secretos.emailHmac, sesion, {
        correo: cuerpo.data.correo,
        nombre: cuerpo.data.nombre,
        paraQue: cuerpo.data.para_que,
      });
      if (r.ok) return respuestaJson(201, { id: r.id });
      if (r.error === "en_espera") return respuestaJson(429, { motivo: "en_espera", hasta: r.hasta.toISOString() });
      return respuestaJson(400, { motivo: r.error });
    }),
  ),
);
