// /api/v1/perfiles/{codigo}/usar-liberacion (HU-134): POST pone como disponibilidad de un colocado su fecha
// de liberación (corrige «colocado con Disponible ahora», RF-8.13.2): 200 con el perfil · 409 `no_aplica`
// (no tiene fecha de liberación) · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { usarFechaLiberacion } from "@ps/infra/postgres/estado-perfil";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  responderRechazos,
} from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await usarFechaLiberacion(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              codigo,
            ),
          }),
        );
      }),
    ),
  ),
);
