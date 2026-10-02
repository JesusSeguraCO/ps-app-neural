// POST /api/v1/lexico (HU-139): guarda un término del cliente con su equivalencia (o lo actualiza por
// su forma normalizada, o por `id` al editar). Entra en la búsqueda siguiente sin despliegue.
// 201 · 422 valor inexistente (con lo más parecido del catálogo) o sin valor · 404 · 403 observador.
import { z } from "zod";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { guardarTermino } from "@ps/infra/postgres/lexico";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, cuerpoDe, entradaTermino, responderRechazos } from "../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = entradaTermino.extend({ id: z.uuid().optional(), candidataId: z.uuid().optional() });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(201, await guardarTermino(poolDe("panel"), clavesAuditoria(), autorDe(sesion), d)),
        );
      }),
    ),
  ),
);
