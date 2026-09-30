// POST /api/v1/enlaces (HU-122): genera el enlace curado. 201 con el enlace `/e/#t=<token>` (el token
// solo viaja en esta respuesta); 422 con todos los motivos si no se emite; 403 sin permiso o sin CSRF.
import { z } from "zod";
import { cargarConfiguracion } from "@ps/infra/config";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { generarEnlace } from "@ps/infra/postgres/enlaces";
import { poolDe } from "@ps/infra/postgres/pool";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  cuenta: z.string().max(200),
  proyecto: z.string().max(200).optional(),
  razon: z.string().max(4000),
  codigos: z.array(z.string().max(20)).max(50),
  invitados: z.array(z.string().max(254)).max(50),
  vigenciaDias: z.number().int().optional(),
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const cuerpo = entrada.safeParse(await req.json().catch(() => null));
        if (!cuerpo.success) return respuestaJson(400, { motivo: "entrada_invalida" });
        const config = cargarConfiguracion("panel");
        const d = cuerpo.data;
        const r = await generarEnlace(
          poolDe("panel"),
          {
            auditoria: { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! },
            emailHmac: config.EMAIL_HMAC_KEY!,
          },
          { usuarioId: sesion.usuarioId, correo: sesion.correo },
          {
            cuenta: { nombre: d.cuenta },
            proyecto: d.proyecto ?? null,
            razon: d.razon,
            codigos: d.codigos,
            invitados: d.invitados,
            vigenciaDias: d.vigenciaDias,
          },
        );
        if (!r.ok) return respuestaJson(422, { errores: r.errores });
        return respuestaJson(201, {
          enlace: {
            codigo: r.enlace.codigo,
            url: `${config.PORTAL_ORIGEN}/e/#t=${r.enlace.token}`,
            vigenteHasta: r.enlace.vigenteHasta.toISOString(),
            invitados: r.enlace.invitados,
            codigos: r.enlace.codigos,
          },
        });
      }),
    ),
  ),
);
