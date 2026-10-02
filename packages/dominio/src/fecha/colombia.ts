// Fechas en hora de Colombia (America/Bogota, UTC-5 sin horario de verano) con el formato del prototipo.

const DIA_MS = 86_400_000;
const BOGOTA_MS = -5 * 3_600_000;

// Fecha civil de Bogotá (AAAA-MM-DD) de un instante: el «hoy» de todas las reglas por día.
export const diaCivilDeColombia = (d: Date) =>
  new Date(d.getTime() + BOGOTA_MS).toISOString().slice(0, 10);

// Días civiles de Bogotá entre dos instantes. Toda regla de «N días» (vigencia, banda, coherencia,
// «hace N días» en el panel) cuenta así, para que dos vistas nunca den números distintos.
export function diasCivilesDesde(desde: Date, ahora: Date): number {
  return Math.round(
    (Date.parse(`${diaCivilDeColombia(ahora)}T00:00:00Z`) -
      Date.parse(`${diaCivilDeColombia(desde)}T00:00:00Z`)) /
      DIA_MS,
  );
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// «27 sep 2026, 8:05 a. m.» en America/Bogota (UTC-5 todo el año, sin horario de verano).
export function horaDeColombia(fecha: Date): string {
  const d = new Date(fecha.getTime() - 5 * 3_600_000);
  const h = d.getUTCHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${h12}:${min} ${h < 12 ? "a. m." : "p. m."}`;
}

// «6:40 p. m.» en America/Bogota.
export function horaCortaDeColombia(fecha: Date): string {
  return horaDeColombia(fecha).split(", ")[1]!;
}

// «4:13 p. m.» para un desbloqueo (espera por intentos, próxima petición): redondea al minuto
// siguiente, porque a la hora que se muestra ya tiene que poderse (4:12:28 → 4:13).
export function horaDesbloqueoDeColombia(fecha: Date): string {
  return horaCortaDeColombia(new Date(Math.ceil(fecha.getTime() / 60_000) * 60_000));
}

// «24 oct 2026» (día civil en America/Bogota).
export function fechaDeColombia(fecha: Date): string {
  return horaDeColombia(fecha).split(", ")[0]!;
}

// «24 oct 2026» para una fecha civil AAAA-MM-DD (sin hora ni zona).
export function fechaCivil(aaaammdd: string): string {
  const [a, m, d] = aaaammdd.split("-").map(Number);
  return `${d} ${MESES[m! - 1]} ${a}`;
}

const bogota = (fecha: Date) => new Date(fecha.getTime() - 5 * 3_600_000);
const mismoDia = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();

// «26 sep» (día civil en America/Bogota, sin año).
export function diaCortoDeColombia(fecha: Date): string {
  const d = bogota(fecha);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
}

// Día relativo a `ahora`: «hoy», «26 sep» o, en otro año, «30 dic 2025».
function diaRelativo(fecha: Date, ahora: Date): string {
  const d = bogota(fecha);
  const a = bogota(ahora);
  if (mismoDia(d, a)) return "hoy";
  return d.getUTCFullYear() === a.getUTCFullYear() ? diaCortoDeColombia(fecha) : fechaDeColombia(fecha);
}

// «hoy, 9:14 a. m.» · «26 sep, 11:02 a. m.» · «30 dic 2025, 12:00 p. m.» (filas del panel).
export function momentoDeColombia(fecha: Date, ahora: Date = new Date()): string {
  return `${diaRelativo(fecha, ahora)}, ${horaCortaDeColombia(fecha)}`;
}

// «hoy 10:42» · «26 sep 16:05» (actividad del panel, 24 h).
export function momentoCortoDeColombia(fecha: Date, ahora: Date = new Date()): string {
  const d = bogota(fecha);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${diaRelativo(fecha, ahora)} ${hh}:${mm}`;
}

// «hoy, 8:02 a. m.» · «ayer, 4:15 p. m.» · «el 22 sep» (prototipo admin-accesos: cuándo entró alguien).
export function momentoCercanoDeColombia(fecha: Date, ahora: Date = new Date()): string {
  const d = bogota(fecha);
  const ayer = bogota(new Date(ahora.getTime() - 86_400_000));
  if (mismoDia(d, bogota(ahora))) return `hoy, ${horaCortaDeColombia(fecha)}`;
  if (mismoDia(d, ayer)) return `ayer, ${horaCortaDeColombia(fecha)}`;
  return `el ${diaRelativo(fecha, ahora)}`;
}
