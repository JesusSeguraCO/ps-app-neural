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
const CONFLICTO = new Set(["duplicado", "parecido", "ya_decidida", "mismo_valor", "distinto_catalogo", "distinta_familia", "modalidad_repetida", "version_distinta", "editar_publicado", "sin_consentimiento", "archivado", "nombre_repetido", "lote_no_calculado", "lote_no_aplicado", "no_es_la_ultima", "no_publicable", "transicion_invalida", "no_es_publicado", "borrador_resuelto", "modalidad_cambio", "no_aplica", "incoherencia"]);

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
  descripcion: z.string().max(200).nullish(),
  confirmarDistinto: z.boolean().optional(),
});

// Término del léxico con su equivalencia en un tipo (una o varias tecnologías, por ejemplo) (HU-139).
export const entradaTermino = z.strictObject({
  termino: z.string().max(120),
  sinonimos: z.array(z.string().max(120)).max(20),
  tipo: z.enum(["rol", "tecnologia", "sector"]),
  valores: z.array(z.string().max(200)).max(20),
});

// Perfil del editor (HU-125): identificadores del catálogo, nunca nombres escritos; todo opcional
// (un borrador se guarda incompleto). Sin ningún campo de la lista negra B.4: un campo de más → 400.
const corto = (n: number) => z.string().max(n).nullish();
const fechaCivil = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const entradaPerfil = z.strictObject({
  nombre: corto(80),
  primerApellido: corto(80),
  rolId: z.uuid().nullish(),
  tecnologiaIds: z.array(z.uuid()).max(8).optional(),
  sectorIds: z.array(z.uuid()).max(8).optional(),
  seniorityId: z.uuid().nullish(),
  aniosExperiencia: z.number().int().min(0).max(60).nullish(),
  ciudadId: z.uuid().nullish(),
  modalidadTrabajoId: z.uuid().nullish(),
  disponibilidad: z
    .union([
      z.strictObject({ opcion: z.enum(["ahora", "una_semana", "dos_semanas", "un_mes"]) }),
      z.strictObject({ fecha: fechaCivil }),
    ])
    .nullish(),
  modalidadPruebaId: z.uuid().nullish(),
  capacidad: corto(120),
  anclaje: corto(120),
  resumen: corto(1200),
  vinculo: z.enum(["vinculado", "banco_no_vinculado", "fabrica"]).nullish(),
  formacion: corto(160),
  idiomas: z.array(z.string().max(60)).max(8).optional(),
  selloPersonal: z.array(z.string().max(80)).max(3).optional(),
  aporte: corto(280),
  experiencias: z
    .array(
      z.strictObject({
        id: z.uuid().nullish(),
        cargo: z.string().trim().min(1).max(120),
        cliente: corto(120),
        desde: z.number().int().min(1970).max(2100).nullish(),
        hasta: z.number().int().min(1970).max(2100).nullish(),
        descripcion: z.string().trim().min(1).max(600),
      }),
    )
    .max(12)
    .optional(),
});

// Reporte de validación (HU-140, HU-130 edge): campos de la plantilla corregidos por la persona y lo
// que solo escribe ella (evaluador, fecha, resultado). Confirmar exige además «Revisé cada campo».
export const entradaReporte = z.strictObject({
  id: z.uuid(),
  enunciadoReto: z.string().max(2000),
  entregables: z.string().max(1000),
  criterios: z.array(z.string().max(200)).max(12),
  evaluador: corto(120),
  fecha: fechaCivil.nullish(),
  resultado: corto(200),
});
export const entradaConfirmarReporte = entradaReporte.extend({ revisado: z.boolean() });

// Disponibilidad desde el listado o la bandeja (HU-132, HU-136): una opción, una fecha o confirmar la
// que ya tiene sin cambiarla.
export const entradaDisponibilidad = z.union([
  z.strictObject({ opcion: z.enum(["ahora", "una_semana", "dos_semanas", "un_mes"]) }),
  z.strictObject({ fecha: fechaCivil }),
  z.strictObject({ confirmar: z.literal(true) }),
]);

// Alcance que el profesional autorizó (HU-127).
export const entradaConsentimiento = z.strictObject({
  nombreApellido: z.boolean(),
  trayectoria: z.boolean(),
  clientes: z.boolean(),
  fechaFirma: fechaCivil.nullish(),
});

export function codigoDe(req: Request): string | null {
  const c = segmento(req, 1);
  return c && /^PS-\d{4}$/.test(c) ? c : null;
}
