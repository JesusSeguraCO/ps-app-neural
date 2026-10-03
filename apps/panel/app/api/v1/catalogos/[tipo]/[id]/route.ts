// /api/v1/catalogos/{tipo}/{id}: GET las fichas que dependen del valor (antes de desactivarlo,
// HU-143); PATCH lo edita con las mismas reglas de duplicado y parecido que al crear (HU-089). Corregir
// el texto de cara al cliente (modalidad de prueba, alcance SARO; HU-177 edge) se hace en dos pasos:
// `?previsualizar` devuelve las fichas publicadas que mostrarán el texto nuevo sin escribir nada (422
// `no_aplica` en un catálogo sin ese texto) y el PATCH sin él confirma, auditado con el valor anterior y
// el nuevo. 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { dependientes, editarValor, impactoTextoCliente } from "@ps/infra/postgres/catalogos-panel";
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
        if (new URL(req.url).searchParams.has("previsualizar"))
          return responderRechazos(async () =>
            respuestaJson(200, { impacto: await impactoTextoCliente(poolDe("panel"), tipo, id) }),
          );
        return responderRechazos(async () =>
          respuestaJson(200, { valor: await editarValor(poolDe("panel"), clavesAuditoria(), autorDe(sesion), tipo, id, d) }),
        );
      }),
    ),
  ),
);
