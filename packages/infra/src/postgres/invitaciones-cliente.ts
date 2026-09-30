// Pedir la invitación de un colega desde el portal (HU-095, design §6): la petición queda pendiente
// (una por enlace y correo) y se avisa a Talento Humano por `notificar`. El colega no gana acceso hasta
// que el panel la apruebe. Quien pidió ve sus peticiones con su estado y, si se rechazó, el motivo.
import "server-only";
import type pg from "pg";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import {
  topeDePeticiones,
  validarPeticion,
  VENTANA_TOPE_PETICIONES_MS,
  type ErrorPeticion,
} from "@ps/dominio/enlaces/invitaciones";
import { enTransaccion } from "./intentos";

export interface PeticionDelInvitado {
  id: string;
  correo: string;
  nombre: string | null;
  estado: "pendiente" | "aprobada" | "rechazada";
  motivo: string | null;
  pedidaEn: Date;
  resueltaEn: Date | null;
}

export async function pedirInvitacion(
  bd: pg.Pool,
  emailHmac: string,
  sesion: SesionPortalVerificada,
  entrada: { correo: string; nombre?: string; paraQue?: string },
): Promise<
  { ok: true; id: string } | { ok: false; error: ErrorPeticion } | { ok: false; error: "en_espera"; hasta: Date }
> {
  return enTransaccion(bd, async (tx) => {
    const yo = await tx.query(`SELECT correo FROM identidad.enlace_invitados WHERE id = $1`, [sesion.invitadoId]);
    const v = validarPeticion(entrada, yo.rows[0].correo);
    if (!v.ok) return v;
    const correoHmac = hmacCorreo(v.correo, emailHmac);
    const previa = await tx.query(
      `SELECT id FROM identidad.invitaciones_solicitadas WHERE enlace_id = $1 AND correo_hmac = $2 AND estado = 'pendiente'`,
      [sesion.enlaceId, correoHmac],
    );
    if (previa.rows[0]) return { ok: true, id: previa.rows[0].id };
    await tx.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [`peticiones:${sesion.invitadoId}`]);
    const p = await tx.query(
      `SELECT creado_en FROM identidad.invitaciones_solicitadas WHERE solicitado_por = $1 AND creado_en > $2`,
      [sesion.invitadoId, new Date(Date.now() - VENTANA_TOPE_PETICIONES_MS)],
    );
    const tope = topeDePeticiones(
      p.rows.map((f) => f.creado_en as Date),
      new Date(),
    );
    if (!tope.permitido) return { ok: false, error: "en_espera", hasta: tope.hasta };
    const r = await tx.query(
      `INSERT INTO identidad.invitaciones_solicitadas (enlace_id, solicitado_por, correo_propuesto, correo_hmac, nombre_propuesto, para_que)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [sesion.enlaceId, sesion.invitadoId, v.correo, correoHmac, v.nombre, v.paraQue],
    );
    const id = r.rows[0].id as string;
    await tx.query(`SELECT operacion.encolar_portal('notificar', $1::jsonb)`, [
      JSON.stringify({ motivo: "invitacion_solicitada", ref: id }),
    ]);
    return { ok: true, id };
  });
}

export async function peticionesDelInvitado(bd: pg.Pool, sesion: SesionPortalVerificada): Promise<PeticionDelInvitado[]> {
  const r = await bd.query(
    `SELECT id, correo_propuesto, nombre_propuesto, estado, motivo, creado_en, resuelto_en
       FROM identidad.invitaciones_solicitadas WHERE enlace_id = $1 AND solicitado_por = $2 ORDER BY creado_en DESC`,
    [sesion.enlaceId, sesion.invitadoId],
  );
  return r.rows.map((f) => ({
    id: f.id,
    correo: f.correo_propuesto,
    nombre: f.nombre_propuesto,
    estado: f.estado,
    motivo: f.motivo,
    pedidaEn: f.creado_en,
    resueltaEn: f.resuelto_en,
  }));
}
