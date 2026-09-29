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

export const ESQUEMAS_PAYLOAD = {
  enviar_codigo: payloadEnviarCodigo,
  renovar_enlace: payloadRenovarEnlace,
} as const;

export type TipoConManejador = keyof typeof ESQUEMAS_PAYLOAD;
