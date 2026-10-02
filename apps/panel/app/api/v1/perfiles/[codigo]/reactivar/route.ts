// /api/v1/perfiles/{codigo}/reactivar (HU-133 edge, HU-136): POST vuelve un pausado a publicado con la
// disponibilidad que se elige al reactivar, si cumple las guardas de publicar: 200 con el perfil · 409
// `no_publicable` con lo que falta · 409 `transicion_invalida` (no está pausado) · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { reactivarPerfil } from "@ps/infra/postgres/estado-perfil";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  entradaDisponibilidad,
  responderRechazos,
} from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ disponibilidad: entradaDisponibilidad });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await reactivarPerfil(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              codigo,
              d.disponibilidad,
            ),
          }),
        );
      }),
    ),
  ),
);
