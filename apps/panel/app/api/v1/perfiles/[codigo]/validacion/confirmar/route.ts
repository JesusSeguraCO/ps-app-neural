// /api/v1/perfiles/{codigo}/validacion/confirmar (HU-140, HU-130 edge): POST confirma el borrador con
// «Revisé cada campo» y lo que escribe la persona (evaluador, fecha, resultado). La ficha del portal se
// enriquece sin republicar y queda auditado: 200 con el perfil · 422 `reporte_incompleto` con lo que
// falta · 409 `borrador_resuelto` · 409 `modalidad_cambio` (el perfil ya no tiene esa modalidad).
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { poolDe } from "@ps/infra/postgres/pool";
import { confirmarBorrador } from "@ps/infra/postgres/validaciones";
import { hoyEnColombia } from "../../../../../../inventario/hoy";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  entradaConfirmarReporte,
  responderRechazos,
} from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaConfirmarReporte);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        const { id, ...campos } = d;
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await confirmarBorrador(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              codigo,
              id,
              campos,
              hoyEnColombia(),
            ),
          }),
        );
      }),
    ),
  ),
);
