// POST /api/v1/catalogos/{tipo}/{id}/fusionar {destinoId} (HU-143): con `?previsualizar` devuelve el
// impacto sin escribir nada; sin él, fusiona en una transacción. 409 mismo valor, catálogos
// distintos o familias distintas (con el motivo).
import { z } from "zod";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { fusionarValores, impactoFusion } from "@ps/infra/postgres/catalogos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, cuerpoDe, responderRechazos, tipoDe, uuidDe } from "../../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const tipo = tipoDe(req);
        const origen = uuidDe(req, 2);
        if (!tipo || !origen) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, z.strictObject({ destinoId: z.uuid() }));
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        const bd = poolDe("panel");
        return responderRechazos(async () =>
          new URL(req.url).searchParams.has("previsualizar")
            ? respuestaJson(200, { impacto: await impactoFusion(bd, tipo, origen, d.destinoId) })
            : respuestaJson(200, await fusionarValores(bd, clavesAuditoria(), autorDe(sesion), tipo, origen, d.destinoId)),
        );
      }),
    ),
  ),
);
