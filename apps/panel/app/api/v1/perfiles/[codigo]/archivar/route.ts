// /api/v1/perfiles/{codigo}/archivar (HU-135, desde la bandeja de HU-133): POST «elimina» sin borrar; repetirlo
// informa `yaArchivado` sin escribir nada: 200 · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { archivarPerfil } from "@ps/infra/postgres/estado-perfil";
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
          respuestaJson(
            200,
            await archivarPerfil(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo),
          ),
        );
      }),
    ),
  ),
);
