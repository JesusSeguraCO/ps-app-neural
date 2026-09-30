// POST /api/v1/acceso/codigo (ADR-0002): 202 con cuerpo fijo SIEMPRE, esté o no inscrito el correo.
// Pública (sin sesión) pero con CSRF y borde. Con el worker caído, procesa su propia fila tras
// responder (modo degradado, H8).
import { after } from "next/server";
import { z } from "zod";
import { procesarCodigoPropio } from "@ps/infra/acceso/degradado";
import { conBorde, conCsrf, respuestaJson } from "@ps/infra/http/envoltorios";
import { solicitarCodigoPanel, workerCaido } from "@ps/infra/postgres/acceso-panel";
import { ipDe, servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ correo: z.string().trim().min(3).max(254) });
const NEUTRA = { estado: "si_tiene_acceso_llega_un_codigo" };

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const cuerpo = entrada.safeParse(await req.json().catch(() => null));
    if (!cuerpo.success) return respuestaJson(400, { motivo: "entrada_invalida" });
    const { bd, correo, secretos } = servicios();
    const { trabajoId } = await solicitarCodigoPanel(bd, secretos, { correo: cuerpo.data.correo, ip: ipDe(req) });
    if (await workerCaido(bd)) {
      after(() => procesarCodigoPropio({ bd, trabajoId, ambito: "panel", pepper: secretos.pepper, correo }));
    }
    return respuestaJson(202, NEUTRA);
  }),
);
