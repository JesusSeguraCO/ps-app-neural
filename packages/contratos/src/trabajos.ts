// Esquemas de `payload` de la cola (ADR-0009 §3: el worker valida antes de ejecutar).
import { z } from "zod";

export const payloadEnviarCodigo = z.strictObject({
  ref: z.uuid().nullable(),
  ambito: z.enum(["cliente", "panel"]),
});
export type PayloadEnviarCodigo = z.infer<typeof payloadEnviarCodigo>;

export const ESQUEMAS_PAYLOAD = {
  enviar_codigo: payloadEnviarCodigo,
} as const;

export type TipoConManejador = keyof typeof ESQUEMAS_PAYLOAD;
