// /api/v1/perfiles/{codigo}/consentimiento/revocar (HU-127): POST registra la revocación; si el perfil
// estaba publicado sale de publicado en la misma operación: 200 · 409 `sin_consentimiento` · 403.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { revocarConsentimiento } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, codigoDe, responderRechazos } from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await revocarConsentimiento(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo),
          }),
        );
      }),
    ),
  ),
);
