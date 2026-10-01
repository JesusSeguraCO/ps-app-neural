// /api/v1/accesos/{id}/rol (HU-151): POST cambia el rol de un inscrito activo; bajarlo a observador corta
// su sesión en la siguiente petición: 200 con el anterior y el nuevo · 409 `ultimo_administrador` |
// `dado_de_baja` · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { cambiarRol } from "@ps/infra/postgres/accesos-panel";
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

const entrada = z.strictObject({ rol: z.enum(["administrador", "observador"]) });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const id = uuidDe(req, 1);
        if (!id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(
            200,
            await cambiarRol(poolDe("panel"), clavesAuditoria(), autorDe(sesion), id, d.rol),
          ),
        );
      }),
    ),
  ),
);
