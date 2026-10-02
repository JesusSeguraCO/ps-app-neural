// /api/v1/perfiles/publicar (HU-128 edge): POST `{ codigos }` publica a la vez los que cumplen las
// guardas y señala a los demás con su motivo, sin abortar el lote: 200 con un resultado por perfil ·
// 400 entrada inválida · 422 `lote_demasiado_grande` (más de 200) · 403 observador.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { publicarVarios } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  responderRechazos,
} from "../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  codigos: z
    .array(z.string().regex(/^PS-\d{4}$/))
    .min(1)
    .max(1000),
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => {
          const resultados = await publicarVarios(
            poolDe("panel"),
            clavesAuditoria(),
            autorDe(sesion),
            d.codigos,
          );
          return respuestaJson(200, {
            publicados: resultados.filter((r) => r.ok).length,
            resultados: resultados.map((r) =>
              r.ok
                ? { codigo: r.codigo, ok: true, estado: r.perfil.estado }
                : {
                    codigo: r.codigo,
                    ok: false,
                    motivos: r.motivos,
                    ...(r.estado ? { estado: r.estado } : {}),
                    ...(r.contradiccion ? { contradiccion: r.contradiccion } : {}),
                    ...(r.evaluacion
                      ? {
                          condiciones: r.evaluacion.condiciones.filter((c) => !c.cumple),
                          faltanDatos: r.evaluacion.faltanDatos,
                          familia: r.familia ?? null,
                        }
                      : {}),
                  },
            ),
          });
        });
      }),
    ),
  ),
);
