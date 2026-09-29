// Banda de arranque (RF-3.13): la fecha de disponibilidad vive en el panel y el portal solo publica
// la banda, recalculada contra la fecha del día en Colombia (RF-3.13.2). Una fecha ya pasada que
// nadie toca hace más de 30 días no se afirma: «por confirmar» (RF-3.13.3, RF-8.14.4).
// Límites: 0 días → inmediato · 1-7 → 1 semana · 8-14 → 2 semanas · 15-30 → 1 mes · > 30 → más.

export const BANDAS = [
  "inmediato",
  "una_semana",
  "dos_semanas",
  "un_mes",
  "mas_de_un_mes",
  "por_confirmar",
] as const;
export type Banda = (typeof BANDAS)[number];

const DIA_MS = 86_400_000;
const BOGOTA_MS = -5 * 3_600_000;
export const DIAS_SIN_TOCAR = 30;

// Días entre hoy (en Bogotá) y `fecha` (AAAA-MM-DD, fecha civil sin hora).
function diasHasta(fecha: string, ahora: Date): number {
  const hoy = new Date(ahora.getTime() + BOGOTA_MS).toISOString().slice(0, 10);
  return Math.round((Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / DIA_MS);
}

export function bandaDeDisponibilidad(
  d: { fecha: string | null; actualizadaEn: Date | null },
  ahora: Date,
): Banda {
  if (!d.fecha || !d.actualizadaEn) return "por_confirmar";
  const dias = diasHasta(d.fecha, ahora);
  if (dias <= 0) {
    const sinTocar = (ahora.getTime() - d.actualizadaEn.getTime()) / DIA_MS;
    return dias < 0 && sinTocar > DIAS_SIN_TOCAR ? "por_confirmar" : "inmediato";
  }
  if (dias <= 7) return "una_semana";
  if (dias <= 14) return "dos_semanas";
  if (dias <= 30) return "un_mes";
  return "mas_de_un_mes";
}
