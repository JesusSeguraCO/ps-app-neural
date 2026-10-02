// POST /api/v1/lexico/propuestas/{id}/rechazar (HU-139): no entra al léxico y no vuelve a proponerse.
// 200 · 404 · 409 ya decidida.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { rechazarPropuesta } from "@ps/infra/postgres/lexico";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, responderRechazos, uuidDe } from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        return responderRechazos(async () => {
          await rechazarPropuesta(poolDe("panel"), clavesAuditoria(), autorDe(sesion), id);
          return respuestaJson(200, { estado: "rechazada" });
        });
      }),
    ),
  ),
);
