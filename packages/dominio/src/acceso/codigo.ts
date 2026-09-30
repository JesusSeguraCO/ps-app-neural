// Códigos de un uso y correos en HMAC (ADR-0002 §2 y «Revisión adversarial» H22, H40; ADR-0009).
// Cálculo puro: sin BD ni red.
import { createHmac, randomInt } from "node:crypto";

export type ResultadoEnvio = "ok" | "ambiguo" | "definitivo";

export const VIGENCIA_CODIGO_MS = 10 * 60_000;

export function generarCodigo(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hmacCodigo(codigo: string, pepper: string): Buffer {
  return createHmac("sha256", pepper).update(codigo).digest();
}

// Minúsculas y recorte; el alias `+etiqueta` se conserva literal (ADR-0002 §3).
export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

export function hmacCorreo(correo: string, clave: string): Buffer {
  return createHmac("sha256", clave).update(normalizarCorreo(correo)).digest();
}

// Reintentos del envío con código nuevo en cada uno: 5, 15 y 30 s (ADR-0009).
const REINTENTOS_S = [5, 15, 30] as const;

export type PlanEnvio = { tipo: "reintentar"; enSegundos: number } | { tipo: "abandonar" };

export function planDeEnvioCodigo(intentosFallidos: number): PlanEnvio {
  const s = REINTENTOS_S[intentosFallidos];
  return s === undefined ? { tipo: "abandonar" } : { tipo: "reintentar", enSegundos: s };
}

// Definitivo: 4xx salvo 429 (dirección inválida o suprimida). Ambiguo: timeout, red, 429 y 5xx.
export function clasificarEnvio(r: { status?: number; error?: "timeout" | "red" }): ResultadoEnvio {
  if (r.error || r.status === undefined) return "ambiguo";
  if (r.status >= 200 && r.status < 300) return "ok";
  if (r.status === 429 || r.status >= 500) return "ambiguo";
  return "definitivo";
}
