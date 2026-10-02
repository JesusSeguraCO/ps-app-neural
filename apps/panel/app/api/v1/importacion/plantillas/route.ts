// /api/v1/importacion/plantillas (HU-148): GET los emparejamientos guardados; POST guarda uno con
// nombre (qué columna va a qué campo y cuáles quedaron en «no importar»). 201 · 409 `nombre_repetido`
// · 400 entrada · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { guardarPlantilla, listarPlantillas } from "@ps/infra/postgres/importacion";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, cuerpoDe, responderRechazos } from "../../../../../src/inventario/api";
import { entradaPlantilla } from "../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(
    conAutorizacion(permisos.GET, async () =>
      respuestaJson(200, { plantillas: await listarPlantillas(poolDe("panel")) }),
    ),
  ),
);

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entradaPlantilla);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(201, { plantilla: await guardarPlantilla(poolDe("panel"), autorDe(sesion), d) }),
        );
      }),
    ),
  ),
);
