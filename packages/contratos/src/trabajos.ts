// Esquemas de `payload` de la cola (ADR-0009 §3: el worker valida antes de ejecutar).
import { z } from "zod";

export const payloadEnviarCodigo = z.strictObject({
  ref: z.uuid().nullable(),
  ambito: z.enum(["cliente", "panel"]),
});
export type PayloadEnviarCodigo = z.infer<typeof payloadEnviarCodigo>;

// Renovación del enlace vencido (HU-092): solo la referencia a la petición; el worker lee el resto.
export const payloadRenovarEnlace = z.strictObject({ renovacion: z.uuid() });
export type PayloadRenovarEnlace = z.infer<typeof payloadRenovarEnlace>;

// Aviso a Talento Humano de una petición de invitación nueva (HU-095): solo la referencia.
export const payloadNotificar = z.strictObject({ motivo: z.literal("invitacion_solicitada"), ref: z.uuid() });
export type PayloadNotificar = z.infer<typeof payloadNotificar>;

// Aplicar un lote de importación confirmado (HU-141, contrato I-2): solo la referencia al lote.
export const payloadAplicarImportacion = z.strictObject({ lote: z.uuid() });
export type PayloadAplicarImportacion = z.infer<typeof payloadAplicarImportacion>;

// Revertir la última importación (HU-087): el lote y los perfiles cambiados después que se incluyen.
export const payloadRevertirImportacion = z.strictObject({
  lote: z.uuid(),
  incluir: z.array(z.string().regex(/^PS-\d{4}$/)).max(200),
});
export type PayloadRevertirImportacion = z.infer<typeof payloadRevertirImportacion>;

export const ESQUEMAS_PAYLOAD = {
  enviar_codigo: payloadEnviarCodigo,
  renovar_enlace: payloadRenovarEnlace,
  notificar: payloadNotificar,
  aplicar_importacion: payloadAplicarImportacion,
  revertir_importacion: payloadRevertirImportacion,
} as const;

export type TipoConManejador = keyof typeof ESQUEMAS_PAYLOAD;
