// /api/v1/perfiles/{codigo}/consentimiento (HU-127): POST registra el consentimiento nominal con su
// alcance (nombre y primer apellido con la trayectoria; clientes nombrados si se autorizan) y quién lo
// registró: 201 · 422 `no_nominal` (el de la publicación anonimizada no cubre este uso) · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { registrarConsentimiento } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  entradaConsentimiento,
  responderRechazos,
} from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaConsentimiento);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(201, {
            perfil: await registrarConsentimiento(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo, d),
          }),
        );
      }),
    ),
  ),
);
