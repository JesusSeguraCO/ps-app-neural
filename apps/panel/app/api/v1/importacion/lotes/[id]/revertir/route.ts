// /api/v1/importacion/lotes/{id}/revertir (HU-087): GET dice lo que hay que saber antes de deshacer
// (importaciones aplicadas después y perfiles cambiados a mano después); POST confirma la reversión
// con los perfiles cambiados que se incluyen y la encola en el worker.
// GET 200 · 404. POST 202 (idempotente) · 404 · 409 `lote_no_aplicado` o `no_es_la_ultima` (con las
// posteriores) · 422 `incluir_invalido` · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { autorDe, cuerpoDe, responderRechazos, uuidDe } from "../../../../../../../src/inventario/api";
import { entradaRevertir, previoAReversion, revertir } from "../../../../../../../src/importacion/servicio";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const id = uuidDe(req, 2);
    if (!id) return respuestaJson(404, { motivo: "no_existe" });
    return responderRechazos(async () => respuestaJson(200, await previoAReversion(id)));
  }),
);

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaRevertir);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => respuestaJson(202, await revertir(id, autorDe(sesion), d)));
      }),
    ),
  ),
);
