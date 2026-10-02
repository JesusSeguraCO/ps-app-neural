// /api/v1/contacto (HU-147): POST guarda el contacto de Trycore que ve el cliente (correo @trycore.com,
// nombre y cargo opcionales), auditado: 200 `{ cambio }` · 422 `correo_externo` | `correo_invalido` |
// `texto_largo` (el portal sigue con el anterior) · 403 a la observadora, sin cambio ni auditoría.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { guardarContacto } from "@ps/infra/postgres/contacto";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  responderRechazos,
} from "../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const entrada = z.strictObject({
  correo: z.string().max(254),
  nombre: z.string().max(200).nullish(),
  cargo: z.string().max(200).nullish(),
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(
            200,
            await guardarContacto(poolDe("panel"), clavesAuditoria(), autorDe(sesion), d),
          ),
        );
      }),
    ),
  ),
);
