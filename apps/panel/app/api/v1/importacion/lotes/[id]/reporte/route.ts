// GET /api/v1/importacion/lotes/{id}/reporte (spec §6 paso 5): cada fila con lo que le pasó (creado,
// actualizado y qué campos, archivado, sin cambios, omitido o con error y por qué), en CSV. También la
// descarga la observadora (ve el historial, spec §8). 200 adjunto · 404.
import { conBorde, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { responderRechazos, uuidDe } from "../../../../../../../src/inventario/api";
import { reporteDeLote } from "../../../../../../../src/importacion/servicio";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const id = uuidDe(req, 2);
    if (!id) return respuestaJson(404, { motivo: "no_existe" });
    return responderRechazos(() => reporteDeLote(id));
  }),
);
