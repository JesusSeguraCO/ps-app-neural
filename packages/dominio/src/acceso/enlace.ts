// Acceso del cliente al abrir `/e/#t=` (ADR-0002 §3 y H5/H9; HU-090, HU-092, HU-144). Pura, con reloj
// inyectado: el Route Handler solo lee la fila y traduce el estado a 200/410.

export interface FilaTokenEnlace {
  tokenRevocado: boolean;
  enlaceEstado: "activo" | "revocado";
  vigenteHasta: Date;
}

export type EstadoAlAbrir =
  { estado: "activo" } | { estado: "revocado" } | { estado: "vencido"; vencio: Date };

// Token inexistente (dirección alterada) = el mismo estado que revocado: no se distingue por fuera.
// La revocación prevalece sobre el vencimiento (la pantalla de renovación no aplica a un revocado).
export function estadoAlAbrir(fila: FilaTokenEnlace | null, ahora: Date): EstadoAlAbrir {
  if (!fila || fila.tokenRevocado || fila.enlaceEstado === "revocado")
    return { estado: "revocado" };
  if (fila.vigenteHasta.getTime() <= ahora.getTime())
    return { estado: "vencido", vencio: fila.vigenteHasta };
  return { estado: "activo" };
}

// Sesión por dispositivo de 30 días, siempre acotada a la vigencia del enlace (CRN-16).
export const DURACION_PORTAL_MS = 30 * 86_400_000;

export function expiraSesionPortal(ahora: Date, vigenteHasta: Date): Date {
  return new Date(Math.min(ahora.getTime() + DURACION_PORTAL_MS, vigenteHasta.getTime()));
}

// 32 bytes aleatorios en base64url sin relleno = 43 caracteres (generarTokenEnlace).
export function tokenConForma(token: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(token);
}
