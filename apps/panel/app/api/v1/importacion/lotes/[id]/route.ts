// PATCH /api/v1/importacion/lotes/{id} (HU-086): recalcula la vista previa de un lote `calculado` al
// desmarcar tarjetas o cambiar el modo (desmarcar una de dos filas repetidas lo desbloquea).
// 200 · 404 · 409 `lote_no_calculado` · 400 entrada · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { cuerpoDe, responderRechazos, uuidDe } from "../../../../../../src/inventario/api";
import { entradaRecalcular, recalcularLote } from "../../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const PATCH = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.PATCH, async (req) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaRecalcular);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => respuestaJson(200, await recalcularLote(id, d)));
      }),
    ),
  ),
);
