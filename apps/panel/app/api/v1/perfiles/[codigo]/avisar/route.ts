// /api/v1/perfiles/{codigo}/avisar (HU-124 edge): POST avisa a Talento Humano de un dato desactualizado
// del perfil, con el código y una nota opcional; encola `notificar`: 202 · 404 · 403.
import { z } from "zod";
import { TOPE_NOTA_AVISO } from "@ps/dominio/inventario/observador";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { avisarDatoDesactualizado } from "@ps/infra/postgres/observador";
import { poolDe } from "@ps/infra/postgres/pool";
import { codigoDe, cuerpoDe, responderRechazos } from "../../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({ nota: z.string().max(TOPE_NOTA_AVISO).nullish() });

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => {
          await avisarDatoDesactualizado(poolDe("panel"), {
            usuarioId: sesion.usuarioId,
            codigo,
            nota: d.nota ?? null,
          });
          return respuestaJson(202, { avisado: true });
        });
      }),
    ),
  ),
);
