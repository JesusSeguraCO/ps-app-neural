// GET /api/v1/acceso/renovar/{solicitud} (HU-092): en qué quedó la petición, para elegir la pantalla
// «Revisa tu buzón» (automatica). Nunca dice si el correo estaba invitado: desde el 2026-09-29 toda
// petición resuelve igual («persona» solo queda en filas anteriores a la retirada de HubSpot).
import { z } from "zod";
import { conBorde, respuestaJson } from "@ps/infra/http/envoltorios";
import { estadoRenovacion } from "@ps/infra/postgres/renovacion-cliente";
import { servicios } from "../../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

export const GET = conBorde(async (_req: Request, ctx: { params: Promise<{ solicitud: string }> }) => {
  const id = z.uuid().safeParse((await ctx.params).solicitud);
  if (!id.success) return respuestaJson(404, { motivo: "no_existe" });
  const estado = await estadoRenovacion(servicios().bd, id.data);
  return estado ? respuestaJson(200, { estado }) : respuestaJson(404, { motivo: "no_existe" });
});
