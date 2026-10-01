// POST /api/v1/importacion/emparejar (HU-086, HU-148): lee lo pegado (detecta JSON, celdas de hoja de
// cálculo o CSV; pregunta si es ambiguo) y propone el emparejamiento de cada columna, o aplica una
// plantilla guardada. No escribe nada. 200 · 422 `vacio`/`ambiguo`/`json_invalido`/`sin_filas`/
// `demasiadas_filas` · 404 plantilla inexistente · 400 entrada · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { cuerpoDe, responderRechazos } from "../../../../../src/inventario/api";
import { emparejar, entradaEmparejar } from "../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req) => {
        const d = await cuerpoDe(req, entradaEmparejar);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => respuestaJson(200, await emparejar(d)));
      }),
    ),
  ),
);
