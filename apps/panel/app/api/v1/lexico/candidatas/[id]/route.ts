// POST /api/v1/lexico/candidatas/{id} {destino} (HU-139, edge): manda una consulta sin coincidencia a
// la agenda de reclutamiento o la descarta (al léxico va guardando el término con `candidataId`).
// 200 · 404 · 409 ya decidida.
import { z } from "zod";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { decidirCandidata } from "@ps/infra/postgres/lexico";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, cuerpoDe, responderRechazos, uuidDe } from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, z.strictObject({ destino: z.enum(["agenda_reclutamiento", "descartada"]) }));
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => {
          await decidirCandidata(poolDe("panel"), clavesAuditoria(), autorDe(sesion), id, d.destino);
          return respuestaJson(200, { destino: d.destino });
        });
      }),
    ),
  ),
);
