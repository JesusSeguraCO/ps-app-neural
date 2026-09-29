// POST /api/v1/invitaciones/{id}/aprobar (HU-145): añade el correo a los invitados del enlace con origen
// «invitación aprobada» (sin duplicar) y lo audita. 200 · 404 · 409 ya resuelta o enlace no vigente.
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
        const config = cargarConfiguracion("panel");
        const r = await decidirPeticion(
          poolDe("panel"),
          { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! },
          { emailHmac: config.EMAIL_HMAC_KEY! },
          { usuarioId: sesion.usuarioId, correo: sesion.correo },
          id.data,
          { tipo: "aprobar" },
        );
        if (!r.ok) return respuestaJson(r.motivo === "no_existe" ? 404 : 409, { motivo: r.motivo });
        return respuestaJson(200, { estado: r.estado });
      }),
    ),
  ),
);
