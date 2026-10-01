// /api/v1/colocados/cargas (HU-150; D12, D15, D16): POST carga el archivo de Operaciones (nombre y
// texto, leído en el navegador) de forma síncrona —decenas de filas—: 201 con la carga y su resumen ·
// 422 `formato_no_admitido` (no es JSON ni CSV) | `faltan_columnas` (con cuáles) | `sin_filas` |
// `demasiadas_filas`, sin escribir nada · 403.
import { z } from "zod";
import {
  conAutorizacion,
  conBorde,
  conCsrf,
  conSesionPanel,
  respuestaJson,
} from "@ps/infra/http/envoltorios";
import { cargarOperaciones, resumenCarga } from "@ps/infra/postgres/colocados";
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
  archivo: z.string().trim().min(1).max(200),
  contenido: z.string().max(1_000_000),
});

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entrada);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () => {
          const bd = poolDe("panel");
          const { cargaId } = await cargarOperaciones(bd, clavesAuditoria(), autorDe(sesion), {
            nombre: d.archivo,
            texto: d.contenido,
          });
          return respuestaJson(201, { carga: await resumenCarga(bd, cargaId) });
        });
      }),
    ),
  ),
);
