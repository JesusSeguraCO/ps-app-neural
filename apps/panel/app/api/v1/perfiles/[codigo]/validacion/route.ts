// /api/v1/perfiles/{codigo}/validacion (HU-140, HU-130 edge): el borrador del reporte de validación.
// GET el pendiente (404 si no hay) · POST lo pide —el pendiente o uno nuevo precargado desde la
// modalidad de prueba, sin red ni modelo—: 200 · 422 `sin_modalidad_prueba` (el panel remite al
// selector) · PATCH lo guarda sin confirmar (nada llega a la ficha): 200 · 409 `borrador_resuelto`.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { poolDe } from "@ps/infra/postgres/pool";
import { guardarBorrador, leerBorrador, pedirBorrador } from "@ps/infra/postgres/validaciones";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  entradaReporte,
  responderRechazos,
} from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const codigo = codigoDe(req);
    const b = codigo ? await leerBorrador(poolDe("panel"), codigo) : null;
    return b ? respuestaJson(200, { borrador: b }) : respuestaJson(404, { motivo: "no_existe" });
  }),
);

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            borrador: await pedirBorrador(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo),
          }),
        );
      }),
    ),
  ),
);

export const PATCH = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.PATCH, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaReporte);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        const { id, ...campos } = d;
        return responderRechazos(async () =>
          respuestaJson(200, {
            borrador: await guardarBorrador(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo, id, campos),
          }),
        );
      }),
    ),
  ),
);
