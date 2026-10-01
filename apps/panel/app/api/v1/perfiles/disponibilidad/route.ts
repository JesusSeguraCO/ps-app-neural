// /api/v1/perfiles/disponibilidad (HU-132, HU-136): POST cambia la disponibilidad de uno o varios perfiles
// sin abrir su ficha —una opción, una fecha o confirmar la que tienen— y responde por perfil: 200 con
// `resultados` (un pausado o un código inexistente no aborta a los demás) · 422 más de 200 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { actualizarDisponibilidad, TOPE_BLOQUE } from "@ps/infra/postgres/estado-perfil";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  entradaDisponibilidad,
  responderRechazos,
} from "../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  codigos: z
    .array(z.string().regex(/^PS-\d{4}$/))
    .min(1)
    .max(TOPE_BLOQUE),
  disponibilidad: entradaDisponibilidad,
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            resultados: await actualizarDisponibilidad(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              d.codigos,
              d.disponibilidad,
            ),
          }),
        );
      }),
    ),
  ),
);
