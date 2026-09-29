// POST /api/v1/enlaces/{codigo}/revocar (tarea 4.4): revoca el enlace; efecto en la siguiente petición
// del cliente. 200 · 404 si no existe · 409 si ya estaba revocado · 403 sin permiso o sin CSRF.
import { z } from "zod";
import { cargarConfiguracion } from "@ps/infra/config";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { revocarEnlace } from "@ps/infra/postgres/enlaces";
import { poolDe } from "@ps/infra/postgres/pool";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const CODIGO = /^ENL-\d{4,}$/;
const entrada = z.strictObject({ motivo: z.string().max(1000).optional() });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = decodeURIComponent(new URL(req.url).pathname.split("/").at(-2) ?? "");
        if (!CODIGO.test(codigo)) return respuestaJson(404, { motivo: "no_existe" });
        const cuerpo = entrada.safeParse(await req.json().catch(() => ({})));
        if (!cuerpo.success) return respuestaJson(400, { motivo: "entrada_invalida" });
        const config = cargarConfiguracion("panel");
        const r = await revocarEnlace(
          poolDe("panel"),
          { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! },
          { usuarioId: sesion.usuarioId, correo: sesion.correo },
          codigo,
          cuerpo.data.motivo ?? null,
        );
        if (!r.ok) return respuestaJson(r.motivo === "no_existe" ? 404 : 409, { motivo: r.motivo });
        return respuestaJson(200, {
          enlace: { codigo: r.codigo, estado: "revocado", revocadoEn: r.revocadoEn.toISOString() },
        });
      }),
    ),
  ),
);
