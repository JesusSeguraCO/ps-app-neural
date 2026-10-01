// /api/v1/colocados/diferencias/{id} (HU-150 edge; D15: gana el panel): POST decide una diferencia con
// Operaciones —`aceptada` reemplaza el colocado del panel por la fila, `descartada` lo mantiene—: 200 ·
// 409 `ya_decidida` | `no_aplica` (el colocado del panel ya no está vigente) · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { decidirDiferencia } from "@ps/infra/postgres/colocados";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  responderRechazos,
  uuidDe,
} from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ decision: z.enum(["aceptada", "descartada"]) });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 2);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(
            200,
            await decidirDiferencia(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              id,
              d.decision,
            ),
          ),
        );
      }),
    ),
  ),
);
