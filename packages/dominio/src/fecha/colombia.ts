// Fechas en hora de Colombia (America/Bogota, UTC-5 sin horario de verano) con el formato del prototipo.

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

// «24 oct 2026» (día civil en America/Bogota).
export function fechaDeColombia(fecha: Date): string {
  return horaDeColombia(fecha).split(", ")[0]!;
}

// «24 oct 2026» para una fecha civil AAAA-MM-DD (sin hora ni zona).
export function fechaCivil(aaaammdd: string): string {
  const [a, m, d] = aaaammdd.split("-").map(Number);
  return `${d} ${MESES[m! - 1]} ${a}`;
}
