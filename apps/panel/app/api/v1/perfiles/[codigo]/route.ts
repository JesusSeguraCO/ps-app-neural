// /api/v1/perfiles/{codigo} (HU-125, HU-126): GET el perfil para el editor con lo que le falta para
// publicar; PATCH guarda con la versión que se abrió (`If-Match`). Un borrador se guarda tal cual; un
// publicado se edita en dos pasos (D1, D3): `?previsualizar` devuelve qué cambia de cara al cliente
// sin escribir, y el PATCH sin él confirma. Si el cambio deja el perfil incompleto, 409
// `deja_incompleto` con la pregunta y nada escrito; se responde reenviando con
// `?resolucion=descartar` (nada se escribe ni se audita) o `?resolucion=a_borrador` (se guarda y sale
// del portal, auditado). 409 `version_distinta` con el perfil vigente · 428 sin `If-Match` · 422 valor
// fuera del catálogo · 403 observador.
import { armarFicha, cambiosDeCaraAlCliente } from "@ps/contratos/ficha";
import { conAutorizacion, conBorde, conCsrf, conSesionPanel, respuestaJson } from "@ps/infra/http/envoltorios";
import {
  editarPublicado,
  guardarPerfil,
  leerPerfil,
  type PerfilEditor,
} from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { RechazoInventario } from "@ps/infra/postgres/unidad-inventario";
import {
  autorDe,
  clavesAuditoria,
  codigoDe,
  cuerpoDe,
  entradaPerfil,
  responderRechazos,
} from "../../../../../src/inventario/api";
import { datosFichaDePerfil } from "../../../../../src/inventario/ficha";
import { permisos } from "./permisos";

export const dynamic = "force-dynamic";

const PREGUNTA_INCOMPLETO =
  "Este cambio deja el perfil incompleto: ¿descarto el cambio o paso el perfil a borrador?";

// Lo que verá el cliente, comparado sobre la ficha del portal; la ciudad cuenta (una necesidad
// presencial o híbrida la muestra).
function impacto(antes: PerfilEditor, propuesto: PerfilEditor, internos: string[]) {
  const ahora = new Date();
  const ficha = (p: PerfilEditor) => armarFicha(datosFichaDePerfil(p), { ahora, necesidad: "presencial" });
  return {
    cambios: cambiosDeCaraAlCliente(ficha(antes), ficha(propuesto)),
    internos,
    evaluacion: propuesto.evaluacion,
  };
}

export const GET = conBorde(
  conSesionPanel(async (req) => {
    const codigo = codigoDe(req);
    const p = codigo ? await leerPerfil(poolDe("panel"), codigo) : null;
    return p ? respuestaJson(200, { perfil: p }) : respuestaJson(404, { motivo: "no_existe" });
  }),
);

export const PATCH = conBorde(
  conCsrf(
    conSesionPanel(
      conAutorizacion(permisos.PATCH, async (req, sesion) => {
        const codigo = codigoDe(req);
        if (!codigo) return respuestaJson(404, { motivo: "no_existe" });
        const version = Number(req.headers.get("if-match")?.replace(/"/g, ""));
        if (!Number.isInteger(version) || version < 1) return respuestaJson(428, { motivo: "falta_version" });
        const q = new URL(req.url).searchParams;
        const resolucion = q.get("resolucion");
        if (resolucion !== null && resolucion !== "descartar" && resolucion !== "a_borrador")
          return respuestaJson(400, { motivo: "entrada_invalida" });
        const d = await cuerpoDe(req, entradaPerfil);
        if (!d) return respuestaJson(400, { motivo: "entrada_invalida" });
        const bd = poolDe("panel");
        const claves = clavesAuditoria();
        const autor = autorDe(sesion);
        const enDosPasos = async () => {
          const r = await editarPublicado(bd, claves, autor, codigo, version, d, {
            previsualizar: q.has("previsualizar"),
            ...(resolucion ? { resolucion } : {}),
          });
          switch (r.resultado) {
            case "impacto":
              return respuestaJson(200, { perfil: r.antes, impacto: impacto(r.antes, r.propuesto, r.internos) });
            case "deja_incompleto":
              return respuestaJson(409, {
                motivo: "deja_incompleto",
                pregunta: PREGUNTA_INCOMPLETO,
                perfil: r.antes,
                impacto: impacto(r.antes, r.propuesto, r.internos),
              });
            case "descartado":
              return respuestaJson(200, { perfil: r.perfil, descartado: true });
            default:
              return respuestaJson(200, { perfil: r.perfil });
          }
        };
        return responderRechazos(async () => {
          if (q.has("previsualizar") || resolucion) return enDosPasos();
          try {
            return respuestaJson(200, {
              perfil: await guardarPerfil(bd, claves, autor, codigo, version, d),
            });
          } catch (e) {
            // Un publicado: el PATCH sin `previsualizar` es la confirmación del segundo paso.
            if (e instanceof RechazoInventario && e.motivo === "editar_publicado") return enDosPasos();
            throw e;
          }
        });
      }),
    ),
  ),
);
