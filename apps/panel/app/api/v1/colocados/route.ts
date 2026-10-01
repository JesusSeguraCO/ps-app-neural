// /api/v1/colocados (HU-137; D8: el panel es la fuente): POST registra un perfil publicado como colocado
// con el cliente, la fecha de inicio (hoy si falta) y la de liberación, que pasa a ser su disponibilidad:
// 200 con el perfil · 422 `sin_liberacion` | `sin_cuenta` | `fecha_invalida` | `liberacion_pasada` |
// `liberacion_antes_de_inicio` (nada se escribe) · 409 `no_es_publicado` | `ya_colocado` · 404 · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { registrarColocado } from "@ps/infra/postgres/colocados";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  autorDe,
  clavesAuditoria,
  cuerpoDe,
  responderRechazos,
} from "../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

// Las fechas llegan como las da el campo de fecha (AAAA-MM-DD o vacío); el dominio decide si valen.
const fecha = z.string().max(10).nullish();
const entrada = z.strictObject({
  codigo: z.string().regex(/^PS-\d{4}$/),
  cuenta: z.string().max(200),
  inicio: fecha,
  liberacion: fecha,
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(200, {
            perfil: await registrarColocado(
              poolDe("panel"),
              clavesAuditoria(),
              autorDe(sesion),
              d.codigo,
              { cuenta: d.cuenta, inicio: d.inicio ?? null, liberacion: d.liberacion ?? null },
            ),
          }),
        );
      }),
    ),
  ),
);
