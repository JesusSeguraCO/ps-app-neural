// /api/v1/perfiles/{codigo}/publicar (HU-128, HU-130): POST pasa el perfil a publicado con la versión
// que se abrió (`If-Match`) si cumple las guardas: 200 con el perfil · 409 `no_publicable` con la
// evaluación (qué falta: consentimiento, modalidad de prueba, familia sin modalidades, datos) ·
// 409 `version_distinta` · 409 `transicion_invalida` (ya publicado, archivado…) · 428 · 403.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { publicarPerfil } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, codigoDe, responderRechazos } from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const version = Number(req.headers.get("if-match")?.replace(/"/g, ""));
        if (!Number.isInteger(version) || version < 1) return respuestaJson(428, { motivo: "falta_version" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await publicarPerfil(poolDe("panel"), clavesAuditoria(), autorDe(sesion), codigo, version),
          }),
        );
      }),
    ),
  ),
);
