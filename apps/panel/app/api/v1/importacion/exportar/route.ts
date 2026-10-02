// GET /api/v1/importacion/exportar?formato=csv|json (HU-088): el banco en el formato de importación,
// una fila por perfil, con los campos internos marcados y sin consentimiento. Solo la administradora
// (spec §8): 403 observador · 400 formato desconocido.
import { conAutorizacion, conBorde, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { exportarBanco } from "../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(
    conAutorizacion(permisos.GET, async (req) => {
      const f = new URL(req.url).searchParams.get("formato");
      if (f !== "csv" && f !== "json") return respuestaJson(400, { motivo: "formato_desconocido" });
      return exportarBanco(f);
    }),
  ),
);
