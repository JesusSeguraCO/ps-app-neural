// GET /api/v1/catalogo (ADR-0001/0003/0008, V8-4): el banco publicable para la sesión del invitado.
// 401 sin sesión; con sesión, solo los campos del esquema estricto, sin fecha ni ciudad.
import { conBorde, conSesionPortal, respuestaJson } from "@ps/infra/http/envoltorios";
import { poolDe } from "@ps/infra/postgres/pool";
import { proyeccionCatalogo } from "@ps/infra/postgres/catalogo";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPortal(async (_req, sesion) =>
    respuestaJson(200, { perfiles: await proyeccionCatalogo(poolDe("portal"), sesion) }),
  ),
);
