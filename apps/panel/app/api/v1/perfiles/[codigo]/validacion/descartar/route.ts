// /api/v1/perfiles/{codigo}/validacion/descartar (HU-140 edge): POST descarta el borrador; la ficha no
// recibe ningún campo suyo y la auditoría no registra nada: 200 · 409 `borrador_resuelto` · 404.
import { z } from "zod";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { poolDe } from "@ps/infra/postgres/pool";
import { descartarBorrador } from "@ps/infra/postgres/validaciones";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  responderRechazos,
} from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ id: z.uuid() });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => {
          await descartarBorrador(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo, d.id);
          return respuestaJson(200, { descartado: true });
        });
      }),
    ),
  ),
);
