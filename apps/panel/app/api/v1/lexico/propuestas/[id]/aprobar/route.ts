// POST /api/v1/lexico/propuestas/{id}/aprobar (HU-139, RF-8.12.1): sin cuerpo aprueba tal cual; con
// `edicion` entra exactamente lo que quedó. 200 · 404 · 409 ya decidida · 422 valor inexistente.
import { z } from "zod";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { aprobarPropuesta } from "@ps/infra/postgres/lexico";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, cuerpoDe, entradaTermino, responderRechazos, uuidDe } from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, z.strictObject({ edicion: entradaTermino.optional() }));
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, await aprobarPropuesta(poolDe("panel"), clavesAuditoria(), autorDe(sesion), id, d.edicion)),
        );
      }),
    ),
  ),
);
