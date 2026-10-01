// Lista de acceso del panel (HU-151; RF-8.1, D17): solo correos @trycore.com, con su rol; el panel nunca
// queda sin administradora activa (la BD lo garantiza con bloqueo de fila; aquí, el texto que lo explica).
import type { RolPanel } from "./sesion";

export const ETIQUETA_ROL: Record<RolPanel, string> = {
  administrador: "Administradora de inventario",
  observador: "Observador",
};

export const AYUDA_ROL: Record<RolPanel, string> = {
  administrador: "Crea, edita, publica, importa y administra el panel.",
  observador: "Consulta inventario, enlaces y colocados sin cambiar nada.",
};

// Mismo patrón que el CHECK de `usuarios_panel.correo`.
const TRYCORE = /^[^@\s]+@trycore\.com$/;

export function validarCorreoPanel(
  correo: string,
): { ok: true; correo: string } | { ok: false; motivo: "correo_invalido" | "correo_externo" } {
  // Igual que `normalizarCorreo` de ./codigo, sin arrastrar node:crypto a los componentes del navegador.
  const c = correo.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)) return { ok: false, motivo: "correo_invalido" };
  if (!TRYCORE.test(c)) return { ok: false, motivo: "correo_externo" };
  return { ok: true, correo: c };
}
