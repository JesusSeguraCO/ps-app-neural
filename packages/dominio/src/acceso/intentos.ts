// PoliticaIntentos (ADR-0002 §2 «Limitación en tres capas»): (1) ventana corta de 5 fallos en 15 min
// por par enlace+correo y por IP; (2) tope diario de 20 fallos por par → bloqueo de 24 h con alerta;
// (3) la regla de Cloudflare vive fuera. Regla pura con reloj inyectado.

export interface EstadoIntentos {
  ventanaInicio: Date;
  fallosVentana: number;
  diaInicio: Date;
  fallosDia: number;
  bloqueadoHasta: Date | null;
}

export const FALLOS_VENTANA = 5;
export const VENTANA_MS = 15 * 60_000;
export const FALLOS_DIA = 20;
export const DIA_MS = 24 * 3_600_000;
export const BLOQUEO_MS = 24 * 3_600_000;

export function estadoInicial(ahora: Date): EstadoIntentos {
  return {
    ventanaInicio: ahora,
    fallosVentana: 0,
    diaInicio: ahora,
    fallosDia: 0,
    bloqueadoHasta: null,
  };
}

export type Evaluacion = { permitido: true } | { permitido: false; hasta: Date };

export function evaluarIntentos(e: EstadoIntentos, ahora: Date): Evaluacion {
  if (e.bloqueadoHasta && e.bloqueadoHasta.getTime() > ahora.getTime())
    return { permitido: false, hasta: e.bloqueadoHasta };
  const finVentana = e.ventanaInicio.getTime() + VENTANA_MS;
  if (e.fallosVentana >= FALLOS_VENTANA && ahora.getTime() < finVentana) {
    return { permitido: false, hasta: new Date(finVentana) };
  }
  return { permitido: true };
}

export function registrarFallo(
  e: EstadoIntentos,
  ahora: Date,
): { estado: EstadoIntentos; alerta: boolean } {
  const t = ahora.getTime();
  const nuevaVentana = t >= e.ventanaInicio.getTime() + VENTANA_MS;
  const nuevoDia = t >= e.diaInicio.getTime() + DIA_MS;
  const estado: EstadoIntentos = {
    ventanaInicio: nuevaVentana ? ahora : e.ventanaInicio,
    fallosVentana: (nuevaVentana ? 0 : e.fallosVentana) + 1,
    diaInicio: nuevoDia ? ahora : e.diaInicio,
    fallosDia: (nuevoDia ? 0 : e.fallosDia) + 1,
    bloqueadoHasta: e.bloqueadoHasta,
  };
  const alerta = estado.fallosDia === FALLOS_DIA;
  if (alerta) estado.bloqueadoHasta = new Date(t + BLOQUEO_MS);
  return { estado, alerta };
}

export function registrarAcierto(e: EstadoIntentos): EstadoIntentos {
  return { ...e, fallosVentana: 0 };
}
