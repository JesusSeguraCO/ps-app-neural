// Colocados (HU-137; RF-8.13, RF-8.13.2; D8): reglas puras del registro en el panel y de la pestaña por
// vencimiento. Un colocado no es un estado: sigue publicado y su disponibilidad es la fecha de liberación,
// que por eso es obligatoria. Fechas civiles AAAA-MM-DD; «hoy» es el día civil de Bogotá (V3-4).
import type { Banda } from "../catalogo/banda";

export const DIAS_DESTACADO = 60;

const DIA_MS = 86_400_000;
const dia = (aaaammdd: string) => Date.parse(`${aaaammdd}T00:00:00Z`);
const sumarDias = (aaaammdd: string, dias: number) =>
  new Date(dia(aaaammdd) + dias * DIA_MS).toISOString().slice(0, 10);
export const diasEntre = (desde: string, hasta: string) =>
  Math.round((dia(hasta) - dia(desde)) / DIA_MS);

// AAAA-MM-DD que existe en el calendario (2026-02-30 no).
function esFecha(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(dia(s))) return false;
  return new Date(dia(s)).toISOString().slice(0, 10) === s;
}

export interface EntradaColocado {
  cuenta: string;
  inicio: string | null;
  liberacion: string | null;
}

export type MotivoColocado =
  | "sin_cuenta"
  | "sin_liberacion"
  | "fecha_invalida"
  | "liberacion_pasada"
  | "liberacion_antes_de_inicio";

export type ColocadoValido = { cuenta: string; inicio: string; liberacion: string };

export function validarColocado(
  e: EntradaColocado,
  hoy: string,
): { ok: true; valor: ColocadoValido } | { ok: false; motivo: MotivoColocado } {
  const cuenta = e.cuenta.trim();
  if (!cuenta) return { ok: false, motivo: "sin_cuenta" };
  if (!e.liberacion) return { ok: false, motivo: "sin_liberacion" };
  const inicio = e.inicio || hoy;
  if (!esFecha(inicio) || !esFecha(e.liberacion)) return { ok: false, motivo: "fecha_invalida" };
  if (e.liberacion <= hoy) return { ok: false, motivo: "liberacion_pasada" };
  if (e.liberacion <= inicio) return { ok: false, motivo: "liberacion_antes_de_inicio" };
  return { ok: true, valor: { cuenta, inicio, liberacion: e.liberacion } };
}

// La fecha de liberación por sí sola pasa la regla (existe, es posterior a hoy y al inicio): la hoja
// quita su error en cuanto se escribe una así, sin esperar al siguiente Guardar.
export function liberacionValida(
  e: { inicio: string | null; liberacion: string | null },
  hoy: string,
): boolean {
  return validarColocado({ cuenta: "-", ...e }, hoy).ok;
}

export interface ColocadoEnTabla {
  codigo: string;
  liberacion: string;
}

// Pestaña de colocados: por proximidad del vencimiento (a igual fecha, por código), con los que vencen
// dentro de 60 días (incluido el día 60) en su propio grupo, destacados.
export function tablaDeColocados<T extends ColocadoEnTabla>(
  filas: T[],
  hoy: string,
): {
  pronto: Array<T & { faltan: number }>;
  despues: Array<T & { faltan: number }>;
  limitePronto: string;
} {
  const ordenadas = filas
    .map((f) => ({ ...f, faltan: diasEntre(hoy, f.liberacion) }))
    .sort((a, b) =>
      a.liberacion === b.liberacion
        ? a.codigo.localeCompare(b.codigo)
        : a.liberacion.localeCompare(b.liberacion),
    );
  return {
    pronto: ordenadas.filter((f) => f.faltan <= DIAS_DESTACADO),
    despues: ordenadas.filter((f) => f.faltan > DIAS_DESTACADO),
    limitePronto: sumarDias(hoy, DIAS_DESTACADO),
  };
}

// Cuándo cambia la banda que ve el cliente y a cuál (los límites de RF-3.13: 30, 14, 7 y 0 días), para
// la hoja del colocado. Ya liberado no hay cambio por delante.
const LIMITES: Array<[number, Banda]> = [
  [30, "un_mes"],
  [14, "dos_semanas"],
  [7, "una_semana"],
  [0, "inmediato"],
];

export function proximoCambioDeBanda(
  liberacion: string,
  hoy: string,
): { desde: string; banda: Banda } | null {
  const faltan = diasEntre(hoy, liberacion);
  const siguiente = LIMITES.find(([limite]) => faltan > limite);
  return siguiente ? { desde: sumarDias(liberacion, -siguiente[0]), banda: siguiente[1] } : null;
}
