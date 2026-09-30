// MatrizPermisos (ADR-0002 H19): fuente única de la matriz rol × acción del panel. Cada Route Handler
// mutante del panel declara su acción (`export const permisos = { POST: "enlaces.generar" }`) y la
// envuelve con `conAutorizacion`. V2-3 la recorre sobre el manifiesto de rutas.
import type { RolPanel } from "./sesion";

export const MatrizPermisos = {
  "sesion.salir": ["administrador", "observador"],
  "enlaces.generar": ["administrador"],
  "enlaces.revocar": ["administrador"],
  "invitaciones.decidir": ["administrador"],
  "accesos.desbloquear": ["administrador"],
  // EP-006 (diseño §9): escribir el inventario es solo de la administradora.
  "catalogo.escribir": ["administrador"],
  "lexico.escribir": ["administrador"],
} as const satisfies Record<string, readonly RolPanel[]>;

export type AccionPanel = keyof typeof MatrizPermisos;

export function esAccion(accion: string): accion is AccionPanel {
  return Object.hasOwn(MatrizPermisos, accion);
}

export function puede(rol: RolPanel, accion: AccionPanel): boolean {
  return (MatrizPermisos[accion] as readonly RolPanel[]).includes(rol);
}
