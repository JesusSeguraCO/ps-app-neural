// /api/v1/perfiles/{codigo} (HU-125): GET el perfil para el editor con lo que le falta para publicar;
// PATCH guarda un borrador con la versión que se abrió (`If-Match`): 200 · 409 `version_distinta` con
// el perfil vigente (cambió desde que se abrió) o `editar_publicado` (un publicado se edita en dos
// pasos, HU-126) · 428 sin `If-Match` · 422 valor fuera del catálogo · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { guardarPerfil, leerPerfil } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  entradaPerfil,
  responderRechazos,
} from "../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const codigo = codigoDe(req);
    const p = codigo ? await leerPerfil(poolDe("panel"), codigo) : null;
    return p ? respuestaJson(200, { perfil: p }) : respuestaJson(404, { motivo: "no_existe" });
  }),
);

export const PATCH = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.PATCH, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const version = Number(req.headers.get("if-match")?.replace(/"/g, ""));
        if (!Number.isInteger(version) || version < 1) return respuestaJson(428, { motivo: "falta_version" });
        const d = await cuerpoDe(req, entradaPerfil);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await guardarPerfil(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo, version, d),
          }),
        );
      }),
    ),
  ),
);
