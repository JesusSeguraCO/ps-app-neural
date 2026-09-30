// Piezas comunes de los endpoints de inventario del panel (EP-006): claves de auditoría, autor de la
// sesión, segmentos de la ruta y traducción de los rechazos del dominio a respuestas HTTP.
import "server-only";
import { z } from "zod";
import { esTipoCatalogo, type TipoCatalogo } from "@ps/dominio/catalogo/tipos";
import { cargarConfiguracion } from "@ps/infra/config";
import { respuestaJson, type ContextoPanel } from "@ps/infra/http/envoltorios";
import type { ClavesAuditoria } from "@ps/infra/postgres/auditoria";
import { RechazoInventario } from "@ps/infra/postgres/unidad-inventario";

export function clavesAuditoria(): ClavesAuditoria {
  const config = cargarConfiguracion("panel");
  return { hmac: config.AUDIT_HMAC_KEY!, kek: config.AUDIT_KEK! };
}

export const autorDe = (s: ContextoPanel) => ({ usuarioId: s.usuarioId, correo: s.correo });

// Segmento de la ruta contando desde /api/v1/: `segmento(req, 1)` en /api/v1/catalogos/rol → "rol".
export function segmento(req: Request, indice: number): string | undefined {
  return new URL(req.url).pathname.split("/").filter(Boolean).slice(2)[indice];
}

export function tipoDe(req: Request): TipoCatalogo | null {
  const t = segmento(req, 1);
  return t && esTipoCatalogo(t) ? t : null;
}

export function uuidDe(req: Request, indice: number): string | null {
  const r = z.uuid().safeParse(segmento(req, indice));
  return r.success ? r.data : null;
}

export async function cuerpoDe<T>(req: Request, esquema: z.ZodType<T>): Promise<T | null> {
  const r = esquema.safeParse(await req.json().catch(() => null));
  return r.success ? r.data : null;
}

// 404 si no existe; 409 si choca con el estado (duplicado, parecido, ya decidida); 422 si la entrada
// es válida en forma pero no en el dominio (valor inexistente, familia requerida…).
const CONFLICTO = new Set(["duplicado", "parecido", "ya_decidida", "mismo_valor", "distinto_catalogo", "distinta_familia", "modalidad_repetida"]);

export async function responderRechazos(acto: () => Promise<Response>): Promise<Response> {
  try {
    return await acto();
  } catch (e) {
    if (!(e instanceof RechazoInventario)) throw e;
    const status = e.motivo === "no_existe" ? 404 : CONFLICTO.has(e.motivo) ? 409 : 422;
    return respuestaJson(status, { motivo: e.motivo, ...e.detalle });
  }
}

// Cuerpo de alta y edición de un valor de catálogo (HU-089; RF-8.16.8 para la modalidad de prueba).
const texto = z.string().max(4000).nullish();
export const entradaValor = z.strictObject({
  nombre: z.string().max(200),
  familiaId: z.uuid().nullish(),
  grupo: z.string().max(80).nullish(),
  textoCliente: texto,
  enunciadoReto: texto,
  entregables: texto,
  criterios: texto,
  confirmarDistinto: z.boolean().optional(),
});

// Término del léxico con su equivalencia en un tipo (una o varias tecnologías, por ejemplo) (HU-139).
export const entradaTermino = z.strictObject({
  termino: z.string().max(120),
  sinonimos: z.array(z.string().max(120)).max(20),
  tipo: z.enum(["rol", "tecnologia", "sector"]),
  valores: z.array(z.string().max(200)).max(20),
});
