// «Mi equipo» mínimo por invitado (CRN-12, tarea 6.3 de EP-001): uno por invitado y enlace, en el
// servidor, vacío al primer ingreso e invisible para los demás invitados. EP-001 solo lo crea y lo lee;
// sumar y quitar perfiles es de EP-004 (ps_portal no tiene INSERT en equipo_perfiles).
import "server-only";
import type pg from "pg";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";

export interface EquipoDelInvitado {
  id: string;
  perfiles: string[]; // códigos en su orden
}

export async function asegurarEquipo(bd: pg.Pool | pg.PoolClient, sesion: SesionPortalVerificada): Promise<EquipoDelInvitado> {
  await bd.query(
    `INSERT INTO identidad.equipos (enlace_id, invitado_id) VALUES ($1, $2) ON CONFLICT (invitado_id, enlace_id) DO NOTHING`,
    [sesion.enlaceId, sesion.invitadoId],
  );
  const r = await bd.query(
    `SELECT e.id, COALESCE(array_agg(p.codigo_perfil ORDER BY p.orden) FILTER (WHERE p.codigo_perfil IS NOT NULL), '{}') AS perfiles
       FROM identidad.equipos e LEFT JOIN identidad.equipo_perfiles p ON p.equipo_id = e.id
      WHERE e.invitado_id = $2 AND e.enlace_id = $1
      GROUP BY e.id`,
    [sesion.enlaceId, sesion.invitadoId],
  );
  return { id: r.rows[0].id, perfiles: r.rows[0].perfiles };
}
