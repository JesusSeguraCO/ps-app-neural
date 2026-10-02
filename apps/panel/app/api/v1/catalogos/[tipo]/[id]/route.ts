// /api/v1/catalogos/{tipo}/{id}: GET las fichas que dependen del valor (antes de desactivarlo,
// HU-143); PATCH lo edita con las mismas reglas de duplicado y parecido que al crear (HU-089).
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { dependientes, editarValor } from "@ps/infra/postgres/catalogos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  entradaValor,
  responderRechazos,
  tipoDe,
  uuidDe,
} from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const tipo = tipoDe(req);
    const id = uuidDe(req, 2);
    const d = tipo && id ? await dependientes(poolDe("panel"), tipo, id) : null;
    return d ? respuestaJson(200, d) : respuestaJson(404, { motivo: "no_existe" });
  }),
);

export const PATCH = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.PATCH, async (req, sesion) => {
        const tipo = tipoDe(req);
        const id = uuidDe(req, 2);
        if (!tipo || !id) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaValor);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, { valor: await editarValor(poolDe("panel"), clavesAuditoria(), autorDe(sesion), tipo, id, d) }),
        );
      }),
    ),
  ),
);
