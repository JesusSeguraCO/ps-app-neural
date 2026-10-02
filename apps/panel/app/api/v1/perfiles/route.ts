// /api/v1/perfiles (HU-125): GET el listado base del inventario (ambos roles); POST crea un perfil, que
// nace siempre en borrador con los valores elegidos del catálogo: 201 con lo que le falta para
// publicar · 422 valor que no es del catálogo, modalidad de otra familia o cliente nombrado en el
// texto de una experiencia · 400 campo fuera del modelo · 403 observador.
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { crearPerfil, listarInventario } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, cuerpoDe, entradaPerfil, responderRechazos } from "../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

export const GET = conBorde(
  conSesionPanel(async () => respuestaJson(200, { perfiles: await listarInventario(poolDe("panel")) })),
);

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const d = await cuerpoDe(req, entradaPerfil);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(201, { perfil: await crearPerfil(poolDe("panel"), clavesAuditoria(), autorDe(sesion), d) }),
        );
      }),
    ),
  ),
);
