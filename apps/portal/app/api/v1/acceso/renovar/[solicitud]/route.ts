// GET /api/v1/acceso/renovar/{solicitud} (HU-092): en qué quedó la petición, para elegir la pantalla
// «Revisa tu buzón» (automatica) o «Recibimos tu petición» (persona). Nunca dice si el correo estaba
// invitado: `automatica`/`persona` dependen solo de la cuenta del enlace.
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
