// Lectura de sesiones por el hash del identificador de la cookie (ADR-0002, enmienda de plataforma):
// la cookie lleva el identificador; en BD solo existe su SHA-256.
import "server-only";
import { createHash } from "node:crypto";
import type pg from "pg";
import type { FilaSesionPanel, FilaSesionPortal } from "@ps/dominio/acceso/sesion";

export { COOKIE_PANEL, COOKIE_PORTAL } from "@ps/dominio/acceso/sesion";

export function hashIdSesion(id: string): Buffer {
  return createHash("sha256").update(id).digest();
}

export async function buscarSesionPortal(
  bd: pg.Pool,
  idCookie: string,
): Promise<FilaSesionPortal | null> {
  const r = await bd.query(
    `SELECT s.enlace_id, s.invitado_id, s.expira, e.estado, e.vigente_hasta, i.activo
       FROM identidad.sesiones_portal s
       JOIN identidad.enlaces e ON e.id = s.enlace_id
       JOIN identidad.enlace_invitados i ON i.id = s.invitado_id
      WHERE s.id_hash = $1`,
    [hashIdSesion(idCookie)],
  );
  const f = r.rows[0];
  if (!f) return null;
  return {
    enlaceId: f.enlace_id,
    invitadoId: f.invitado_id,
    expira: f.expira,
    enlaceEstado: f.estado,
    enlaceVigenteHasta: f.vigente_hasta,
    invitadoActivo: f.activo,
  };
}

export async function buscarSesionPanel(
  bd: pg.Pool,
  idCookie: string,
): Promise<FilaSesionPanel | null> {
  const r = await bd.query(
    `SELECT u.id, u.correo, u.rol, u.activo, s.creada, s.ultima_actividad, s.rol_al_abrir
       FROM identidad_panel.sesiones_panel s
       JOIN identidad_panel.usuarios_panel u ON u.id = s.usuario_id
      WHERE s.id_hash = $1`,
    [hashIdSesion(idCookie)],
  );
  const f = r.rows[0];
  if (!f) return null;
  return {
    usuarioId: f.id,
    correo: f.correo,
    rol: f.rol,
    activo: f.activo,
    creada: f.creada,
    ultimaActividad: f.ultima_actividad,
    rolAlAbrir: f.rol_al_abrir,
  };
}

// Corta la sesión del panel (HU-151): la fila se borra por la función de cierre, como al salir.
export async function cortarSesionPanel(bd: pg.Pool, idCookie: string): Promise<void> {
  await bd.query(`SELECT identidad_panel.cerrar_sesion($1)`, [hashIdSesion(idCookie)]);
}

export async function refrescarActividadPanel(bd: pg.Pool, idCookie: string): Promise<void> {
  await bd.query(
    `UPDATE identidad_panel.sesiones_panel SET ultima_actividad = now() WHERE id_hash = $1`,
    [hashIdSesion(idCookie)],
  );
}
