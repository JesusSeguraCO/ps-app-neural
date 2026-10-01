// POST /api/v1/importacion/lotes/{id}/aplicar (HU-141; contrato I-2): confirma el lote y encola su
// aplicación en el worker. 202 con el trabajo (confirmar dos veces devuelve el mismo) · 404 ·
// 409 `lote_no_calculado` · 422 `codigo_repetido` o `nada_que_aplicar` · 403 observador.
// El resultado se sigue con GET /api/v1/importacion/lotes/{id}.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { autorDe, responderRechazos, uuidDe } from "../../../../../../../src/inventario/api";
import { confirmar } from "../../../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        return responderRechazos(async () => respuestaJson(202, await confirmar(id, autorDe(sesion))));
      }),
    ),
  ),
);
