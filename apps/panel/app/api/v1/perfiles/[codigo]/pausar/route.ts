// /api/v1/perfiles/{codigo}/pausar (HU-133): POST pausa un publicado con un motivo activo del catálogo; sale
// del portal y queda el motivo con su autor y desde cuándo: 200 con el perfil · 422 `motivo_no_disponible`
// · 409 `transicion_invalida` (no está a la vista) · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { pausarPerfil } from "@ps/infra/postgres/estado-perfil";
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

const entrada = z.strictObject({ motivoId: z.uuid() });

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
            perfil: await pausarPerfil(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              codigo,
              d.motivoId,
            ),
          }),
        );
      }),
    ),
  ),
);
