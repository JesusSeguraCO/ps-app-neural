// /api/v1/accesos (HU-151): POST inscribe un correo @trycore.com con su rol (o reactiva uno dado de baja):
// 201 · 422 `correo_externo` | `correo_invalido` (la lista queda igual) · 409 `ya_inscrito` · 403.
import { z } from "zod";
import { cargarConfiguracion } from "@ps/infra/config";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { inscribirCorreo } from "@ps/infra/postgres/accesos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  responderRechazos,
} from "../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  correo: z.string().max(254),
  rol: z.enum(["administrador", "observador"]),
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(201, {
            inscrito: await inscribirCorreo(
              poolDe("panel"),
              clavesAuditoria(),
              cargarConfiguracion("panel").EMAIL_HMAC_KEY!,
              autorDe(sesion),
              d,
            ),
          }),
        );
      }),
    ),
  ),
);
