// POST /api/v1/acceso/verificar (ADR-0002): 204 + cookie de sesión de una jornada, o el mismo
// 403 {motivo: "codigo_invalido"} ante cualquier fallo (erróneo, vencido, usado, no inscrito, bloqueo).
import { z } from "zod";
import { COOKIE_PANEL, DURACION_PANEL_MS } from "@ps/dominio/acceso/sesion";
import { conBorde, conCsrf, respuestaJson } from "@ps/infra/http/envoltorios";
import { verificarCodigoPanel } from "@ps/infra/postgres/acceso-panel";
import { ipDe, servicios } from "../../../../../src/acceso/servicios";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ correo: z.string().trim().min(3).max(254), codigo: z.string().trim().max(12) });

export const POST = conBorde(
  conCsrf(async (req: Request) => {
    const cuerpo = entrada.safeParse(await req.json().catch(() => null));
    if (!cuerpo.success) return respuestaJson(403, { motivo: "codigo_invalido" });
    const { bd, secretos } = servicios();
    const r = await verificarCodigoPanel(bd, secretos, {
      correo: cuerpo.data.correo,
      codigo: cuerpo.data.codigo.replace(/\s/g, ""),
      ip: ipDe(req),
    });
    if (!r.ok) return respuestaJson(403, { motivo: "codigo_invalido" });
    const res = new Response(null, { status: 204, headers: { "cache-control": "private, no-store" } });
    res.headers.append(
      "set-cookie",
      `${COOKIE_PANEL}=${r.idSesion}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${DURACION_PANEL_MS / 1000}`,
    );
    return res;
  }),
);
