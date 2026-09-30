// POST /api/v1/acceso/codigo (ADR-0002, HU-090): 202 con cuerpo fijo SIEMPRE, esté o no invitado el
// correo. Pública (sin sesión) pero con CSRF y borde. Con el worker caído, procesa su propia fila tras
// responder (modo degradado, H8), en ambas ramas.
import { after } from "next/server";
import { z } from "zod";
import { procesarCodigoPropio } from "@ps/infra/acceso/degradado";
import { conBorde, conCsrf, respuestaJson } from "@ps/infra/http/envoltorios";
import { solicitarCodigoCliente } from "@ps/infra/postgres/acceso-cliente";
import { workerCaido } from "@ps/infra/postgres/acceso-panel";
import { ipDe, servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ token: z.string().max(128), correo: z.string().trim().min(3).max(254) });
const NEUTRA = { estado: "si_tu_correo_esta_invitado_te_llego_un_codigo" };

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const cuerpo = entrada.safeParse(await req.json().catch(() => null));
    if (!cuerpo.success) return respuestaJson(400, { motivo: "entrada_invalida" });
    const { bd, correo, secretos } = servicios();
    const { trabajoId } = await solicitarCodigoCliente(bd, secretos, { ...cuerpo.data, ip: ipDe(req) });
    if (await workerCaido(bd)) {
      after(() =>
        procesarCodigoPropio({
          bd,
          trabajoId,
          ambito: "cliente",
          pepper: secretos.pepper,
          correo,
          registrar: (e) => console.log(JSON.stringify(e)),
        }),
      );
    }
    return respuestaJson(202, NEUTRA);
  }),
);
