// Tope deslizante: como mucho `tope` sucesos en la ventana; si se alcanza, `hasta` es cuándo sale de la
// ventana el suceso que la llena. Puro y determinista (topes de renovación y de peticiones de invitación).
export function topeEnVentana(
  sucesos: readonly Date[],
  ahora: Date,
  tope: number,
  ventanaMs: number,
): { permitido: true } | { permitido: false; hasta: Date } {
  const recientes = sucesos
    .filter((s) => ahora.getTime() - s.getTime() < ventanaMs)
    .sort((a, b) => a.getTime() - b.getTime());
  if (recientes.length < tope) return { permitido: true };
  const liberaEn = recientes[recientes.length - tope]!;
  return { permitido: false, hasta: new Date(liberaEn.getTime() + ventanaMs) };
}
