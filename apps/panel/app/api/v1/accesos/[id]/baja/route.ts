// /api/v1/accesos/{id}/baja (HU-151): POST da de baja a un inscrito (baja lógica): su sesión se corta en
// la siguiente petición y deja de recibir código: 200 · 409 `ultimo_administrador` · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { darDeBaja } from "@ps/infra/postgres/accesos-panel";
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

const entrada = z.strictObject({});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 1);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        if (!(await cuerpoDe(req, entrada)))
          return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(
            200,
            await darDeBaja(poolDe("panel"), clavesAuditoria(), autorDe(sesion), id),
          ),
        );
      }),
    ),
  ),
);
