// POST /api/v1/catalogos/{tipo}/{id}/desactivar (HU-143): deja de poder elegirse; las fichas que lo tienen lo conservan (sin borrar nunca). 200 con el conteo de fichas dependientes.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { cambiarActivo } from "@ps/infra/postgres/catalogos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, responderRechazos, tipoDe, uuidDe } from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const tipo = tipoDe(req);
        const id = uuidDe(req, 2);
        if (!tipo || !id) return respuestaJson(404, { motivo: "no_existe" });
        return responderRechazos(async () =>
          respuestaJson(200, await cambiarActivo(poolDe("panel"), clavesAuditoria(), autorDe(sesion), tipo, id, false)),
        );
      }),
    ),
  ),
);
