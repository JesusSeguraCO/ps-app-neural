// /api/v1/importacion/lotes: GET es el historial de importaciones confirmadas (spec §7; también lo
// ve la observadora). POST (HU-086): con lo pegado, el modo y el emparejamiento final, calcula la
// vista previa (grupos, diff, duplicados, valores nuevos) y la registra como lote `calculado`.
// Nada se escribe en el banco. 201 · 422 lectura · 400 entrada · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { autorDe, cuerpoDe, responderRechazos } from "../../../../../src/inventario/api";
import { calcularLote, entradaLote, historial } from "../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async () => respuestaJson(200, { lotes: await historial() })),
);

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entradaLote);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => respuestaJson(201, await calcularLote(d, autorDe(sesion))));
      }),
    ),
  ),
);
