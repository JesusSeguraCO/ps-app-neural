// POST /api/v1/invitaciones/{id}/rechazar (HU-145): rechaza con motivo obligatorio, sin añadir el correo, y lo
// audita. 200 · 400 sin motivo · 404 · 409 ya resuelta o ya invitado.
import { z } from "zod";
import { cargarConfiguracion } from "@ps/infra/config";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { decidirPeticion } from "@ps/infra/postgres/invitaciones-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = z.uuid().safeParse(new URL(req.url).pathname.split("/").at(-2));
        if (!id.success) return respuestaJson(404, { motivo: "no_existe" });
        const cuerpo = z.strictObject({ motivo: z.string().max(1000) }).safeParse(await req.json().catch(() => null));
        if (!cuerpo.success || !cuerpo.data.motivo.trim()) return respuestaJson(400, { motivo: "motivo_obligatorio" });
        const config = cargarConfiguracion("panel");
        const r = await decidirPeticion(
          poolDe("panel"),
          { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! },
          { emailHmac: config.EMAIL_HMAC_KEY! },
          { usuarioId: sesion.usuarioId, correo: sesion.correo },
          id.data,
          { tipo: "rechazar", motivo: cuerpo.data.motivo },
        );
        if (!r.ok) return respuestaJson(r.motivo === "no_existe" ? 404 : r.motivo === "motivo_obligatorio" ? 400 : 409, { motivo: r.motivo });
        return respuestaJson(200, { estado: r.estado });
      }),
    ),
  ),
);
