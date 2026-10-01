// Fecha civil de hoy en Colombia (AAAA-MM-DD) para los límites de los campos de fecha del editor.
export const hoyEnColombia = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
