// Acción de la matriz rol × acción por método (ADR-0002 H19; V2-3 lo lee junto a route.ts, porque
// Next no admite exportaciones propias en un Route Handler).
export const permisos = { POST: "sesion.salir" } as const;
