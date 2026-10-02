// /api/v1/importacion/lotes/{id}: GET devuelve el lote con su fase (calculado · aplicando · aplicado ·
// abortado · revertido) y el resumen de filas con error, para seguir el resultado (HU-141, HU-142;
// también lo ve el observador, spec §8).
// PATCH (HU-086) recalcula la vista previa de un lote `calculado` al desmarcar tarjetas o cambiar el
// modo (desmarcar una de dos filas repetidas lo desbloquea).
// 200 · 404 · 409 `lote_no_calculado` · 400 entrada · 403 observador (PATCH).
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { cuerpoDe, responderRechazos, uuidDe } from "../../../../../../src/inventario/api";
import {
  entradaRecalcular,
  estadoDeLote,
  recalcularLote,
} from "../../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const id = uuidDe(req, 2);
    if (!id) return respuestaJson(404, { motivo: "no_existe" });
    return responderRechazos(async () => respuestaJson(200, await estadoDeLote(id)));
  }),
);

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
