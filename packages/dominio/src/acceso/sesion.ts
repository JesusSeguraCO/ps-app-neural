// Revalidación de sesiones (ADR-0002 §2 y «Revisión adversarial» H5): única regla que comparten la
// guarda de página `exigirSesion` y el envoltorio `conSesion`. Pura, con reloj inyectado.
import { horaDeColombia } from "../fecha/colombia";

// Cookies por host (`__Host-`: Secure, sin Domain, Path=/). Llevan el identificador; en BD su SHA-256.
export const COOKIE_PORTAL = "__Host-ps";
export const COOKIE_PANEL = "__Host-pp";
// CSRF por doble envío: cookie legible por el propio origen y cabecera igual (ADR-0002 §2).
export const COOKIE_CSRF = "__Host-csrf";
export const CABECERA_CSRF = "x-ps-csrf";

export type MotivoSinSesion =
  "sin_sesion" | "enlace_revocado" | "enlace_vencido" | "sesion_expirada";

export interface FilaSesionPortal {
  enlaceId: string;
  invitadoId: string;
  expira: Date;
  enlaceEstado: "activo" | "revocado";
  enlaceVigenteHasta: Date;
  invitadoActivo: boolean;
}

export type ResultadoSesionPortal =
  { ok: true; enlaceId: string; invitadoId: string } | { ok: false; motivo: MotivoSinSesion };

export function validarSesionPortal(
  fila: FilaSesionPortal | null,
  ahora: Date,
): ResultadoSesionPortal {
  if (!fila) return { ok: false, motivo: "sin_sesion" };
  if (fila.enlaceEstado === "revocado" || !fila.invitadoActivo)
    return { ok: false, motivo: "enlace_revocado" };
  if (fila.enlaceVigenteHasta.getTime() <= ahora.getTime())
    return { ok: false, motivo: "enlace_vencido" };
  if (fila.expira.getTime() <= ahora.getTime()) return { ok: false, motivo: "sesion_expirada" };
  return { ok: true, enlaceId: fila.enlaceId, invitadoId: fila.invitadoId };
}

export type RolPanel = "administrador" | "observador";

export interface FilaSesionPanel {
  usuarioId: string;
  correo: string;
  rol: RolPanel;
  activo: boolean;
  creada: Date;
  ultimaActividad: Date;
}

export type ResultadoSesionPanel =
  | {
      ok: true;
      usuarioId: string;
      correo: string;
      rol: RolPanel;
      hasta: Date; // fin de la jornada (12 h desde que se abrió)
      refrescarActividad: boolean;
    }
  | { ok: false; motivo: MotivoSinSesion };

export const DURACION_PANEL_MS = 12 * 60 * 60_000;
export const INACTIVIDAD_PANEL_MS = 60 * 60_000;
const REFRESCO_ACTIVIDAD_MS = 60_000;

export function validarSesionPanel(
  fila: FilaSesionPanel | null,
  ahora: Date,
): ResultadoSesionPanel {
  if (!fila || !fila.activo) return { ok: false, motivo: "sin_sesion" };
  const t = ahora.getTime();
  if (t - fila.creada.getTime() >= DURACION_PANEL_MS)
    return { ok: false, motivo: "sesion_expirada" };
  if (t - fila.ultimaActividad.getTime() > INACTIVIDAD_PANEL_MS)
    return { ok: false, motivo: "sesion_expirada" };
  return {
    ok: true,
    usuarioId: fila.usuarioId,
    correo: fila.correo,
    rol: fila.rol,
    hasta: new Date(fila.creada.getTime() + DURACION_PANEL_MS),
    refrescarActividad: t - fila.ultimaActividad.getTime() >= REFRESCO_ACTIVIDAD_MS,
  };
}

// `motivo` es un enum cerrado; ninguna otra query se propaga (sin `?volver=`: redirector abierto).
export function destinoSinSesion(motivo: MotivoSinSesion): string {
  return motivo === "sin_sesion" ? "/acceso" : `/acceso?motivo=${motivo}`;
}

// Texto de la pantalla «Tu sesión terminó» (prototipo panel-acceso--sesion-caducada): la causa real
// si la fila de la sesión vencida aún existe; si no, los dos límites. Sin «vuelves a …»: no hay
// `?volver=` (redirector abierto, ver destinoSinSesion).
export function explicarFinDeSesion(
  fila: Pick<FilaSesionPanel, "creada" | "ultimaActividad"> | null,
  ahora: Date,
): string {
  const seguir = "Pide un código nuevo para seguir.";
  if (!fila) return `La sesión dura 12 horas y se cierra tras 60 minutos sin actividad. ${seguir}`;
  if (ahora.getTime() - fila.creada.getTime() < DURACION_PANEL_MS)
    return `La sesión se cerró tras 60 minutos sin actividad. ${seguir}`;
  const [dia, hora] = horaDeColombia(fila.creada).split(", ");
  const hoy = horaDeColombia(ahora).split(", ")[0];
  const cuando = dia === hoy ? `hoy a las ${hora}` : `el ${dia} a las ${hora}`;
  return `Entraste ${cuando} y la sesión dura 12 horas. ${seguir}`;
}

// Sesión del portal ya revalidada en BD (la construyen solo `exigirSesion` del portal y
// `conSesionPortal`). La proyección del catálogo la exige como argumento (ADR-0008 fila UC-4).
declare const marcaSesionPortal: unique symbol;
export type SesionPortalVerificada = {
  readonly enlaceId: string;
  readonly invitadoId: string;
  readonly [marcaSesionPortal]: true;
};
