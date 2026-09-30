// /api/v1/catalogos/{tipo} (HU-089): GET lista el catálogo, ofrece coincidencias para elegir (`?q=`,
// solo activos: el editor no acepta texto libre) o revisa un nombre mientras se escribe (`?revisar=`);
// POST crea el valor: 201 · 409 duplicado (con el existente) o parecido sin confirmar (con los
// parecidos) · 422 familia requerida o inválida, texto de cara al cliente requerido · 403 observador.
import { z } from "zod";
import { coincidencias } from "@ps/dominio/catalogo/parecidos";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import { crearValor, listarCatalogo, revisarNombre, valoresActivos } from "@ps/infra/postgres/catalogos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { autorDe, clavesAuditoria, cuerpoDe, entradaValor, responderRechazos, tipoDe } from "../../../../../src/inventario/api";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";



export const GET = conBorde(
  conSesionPanel(async (req) => {
    const tipo = tipoDe(req);
    if (!tipo) return respuestaJson(404, { motivo: "no_existe" });
    const p = new URL(req.url).searchParams;
    const bd = poolDe("panel");
    const q = p.get("q");
    if (q !== null) {
      const familia = z.uuid().safeParse(p.get("familiaId"));
      const activos = await valoresActivos(bd, tipo, familia.success ? familia.data : undefined);
      return respuestaJson(200, { valores: coincidencias(q.slice(0, 200), activos) });
    }
    const revisar = p.get("revisar");
    if (revisar !== null) {
      const familia = z.uuid().safeParse(p.get("familiaId"));
      const excepto = z.uuid().safeParse(p.get("excepto"));
      const r = await revisarNombre(bd, tipo, revisar.slice(0, 200), {
        familiaId: familia.success ? familia.data : null,
        excepto: excepto.success ? excepto.data : undefined,
      });
      return respuestaJson(200, r);
    }
    return respuestaJson(200, { valores: await listarCatalogo(bd, tipo) });
  }),
);

export const POST = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.POST, async (req, sesion) => {
        const tipo = tipoDe(req);
        if (!tipo) return respuestaJson(404, { motivo: "no_existe" });
        const d = await cuerpoDe(req, entradaValor);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        return responderRechazos(async () =>
          respuestaJson(201, {
            valor: await crearValor(poolDe("panel"), clavesAuditoria(), autorDe(sesion), tipo, d),
          }),
        );
      }),
    ),
  ),
);
