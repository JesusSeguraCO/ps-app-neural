// GET /api/v1/importacion/plantilla?formato=csv|json (HU-088): la plantilla de muestra con los tres
// casos (actualizar, crear, archivar) y encabezados autoexplicativos. 403 observador · 400 formato.
import { conAutorizacion, conBorde, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { plantillaDeMuestra } from "../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(
    conAutorizacion(permisos.GET, async (req) => {
      const f = new URL(req.url).searchParams.get("formato");
      if (f !== "csv" && f !== "json") return respuestaJson(400, { motivo: "formato_desconocido" });
      return plantillaDeMuestra(f);
    }),
  ),
);
