// GET /api/v1/importacion/lotes/{id}/errores (HU-142): descarga solo las filas con error, con su
// motivo y en el formato en que llegaron (CSV, TSV o JSON). 200 adjunto · 404 · 403 observador.
import { conAutorizacion, conBorde, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { responderRechazos, uuidDe } from "../../../../../../../src/inventario/api";
import { archivoDeErrores } from "../../../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(
    conAutorizacion(permisos.GET, async (req) => {
      const id = uuidDe(req, 2);
      if (!id) return respuestaJson(404, { motivo: "no_existe" });
      return responderRechazos(() => archivoDeErrores(id));
    }),
  ),
);
