// Peticiones de invitación en el panel (HU-145, design §6): aprobar añade el correo a la lista de
// invitados del enlace con origen «invitacion_aprobada» sin duplicar; rechazar exige motivo. Ambas
// decisiones van a la auditoría encadenada (ADR-0003) con quién, enlace, correo y motivo. No se
// aprueba sobre un enlace vencido o revocado.
import "server-only";
import type pg from "pg";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { dominioDistinto, situacionPeticion, type MarcaPeticion } from "@ps/dominio/enlaces/invitaciones";
import { conAuditoria, type CambioAuditado, type ClavesAuditoria } from "./auditoria";

export interface PeticionPanel {
  id: string;
  correo: string;
  nombre: string | null;
  paraQue: string | null;
  pideCorreo: string;
  enlace: { codigo: string; cuenta: string; proyecto: string | null; estado: "vigente" | "vencido" | "revocado"; desde: Date | null };
  pedidaEn: Date;
  dominioDistinto: boolean;
  marca: MarcaPeticion;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
}

export interface DecisionReciente {
  estado: "aprobada" | "rechazada";
  correo: string;
  enlace: string;
  motivo: string | null;
  resueltaEn: Date;
}

export async function listarPeticiones(bd: pg.Pool, ahora: Date = new Date()): Promise<{ pendientes: PeticionPanel[]; resueltas: number; recientes: DecisionReciente[] }> {
  const r = await bd.query(
    `SELECT s.id, s.correo_propuesto, s.nombre_propuesto, s.para_que, s.creado_en, p.correo AS pide,
            e.codigo, e.cuenta_nombre, e.proyecto, e.estado, e.vigente_hasta, e.revocado_en,
            EXISTS (SELECT 1 FROM identidad.enlace_invitados i WHERE i.enlace_id = s.enlace_id AND i.correo_hmac = s.correo_hmac AND i.activo) AS ya
       FROM identidad.invitaciones_solicitadas s
       JOIN identidad.enlaces e ON e.id = s.enlace_id
       JOIN identidad.enlace_invitados p ON p.id = s.solicitado_por
      WHERE s.estado = 'pendiente' ORDER BY s.creado_en DESC`,
  );
  const pendientes = r.rows.map((f): PeticionPanel => {
    const estado = f.estado === "revocado" ? "revocado" : f.vigente_hasta <= ahora ? "vencido" : "vigente";
    const s = situacionPeticion({ estadoEnlace: estado, yaInvitado: f.ya });
    return {
      id: f.id,
      correo: f.correo_propuesto,
      nombre: f.nombre_propuesto,
      paraQue: f.para_que,
      pideCorreo: f.pide,
      enlace: {
        codigo: f.codigo,
        cuenta: f.cuenta_nombre,
        proyecto: f.proyecto,
        estado,
        desde: estado === "revocado" ? f.revocado_en : estado === "vencido" ? f.vigente_hasta : null,
      },
      pedidaEn: f.creado_en,
      dominioDistinto: dominioDistinto(f.pide, f.correo_propuesto),
      ...s,
    };
  });
  const n = await bd.query(`SELECT count(*)::int n FROM identidad.invitaciones_solicitadas WHERE estado <> 'pendiente'`);
  const u = await bd.query(
    `SELECT s.estado, s.correo_propuesto, s.motivo, s.resuelto_en, e.cuenta_nombre, e.proyecto
       FROM identidad.invitaciones_solicitadas s JOIN identidad.enlaces e ON e.id = s.enlace_id
      WHERE s.estado <> 'pendiente' ORDER BY s.resuelto_en DESC LIMIT 5`,
  );
  return {
    pendientes,
    resueltas: n.rows[0].n,
    recientes: u.rows.map((f) => ({
      estado: f.estado,
      correo: f.correo_propuesto,
      enlace: f.proyecto ? `${f.cuenta_nombre} · ${f.proyecto}` : f.cuenta_nombre,
      motivo: f.motivo,
      resueltaEn: f.resuelto_en,
    })),
  };
}

export type ResultadoDecision =
  | { ok: true; estado: "aprobada" | "rechazada" }
  | { ok: false; motivo: "no_existe" | "ya_resuelta" | "enlace_no_vigente" | "motivo_obligatorio" | "ya_invitado" };

export async function decidirPeticion(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  secretos: { emailHmac: string },
  autora: { usuarioId: string; correo: string },
  id: string,
  decision: { tipo: "aprobar" } | { tipo: "rechazar"; motivo: string },
  ahora: Date = new Date(),
): Promise<ResultadoDecision> {
  if (decision.tipo === "rechazar" && !decision.motivo.trim()) return { ok: false, motivo: "motivo_obligatorio" };
  return conAuditoria<ResultadoDecision>(bd, claves, async (tx) => {
    const r = await tx.query(
      `SELECT s.id, s.enlace_id, s.correo_propuesto, s.estado AS peticion, e.codigo, e.estado, e.vigente_hasta
         FROM identidad.invitaciones_solicitadas s JOIN identidad.enlaces e ON e.id = s.enlace_id
        WHERE s.id = $1 FOR UPDATE OF s`,
      [id],
    );
    const f = r.rows[0];
    if (!f) return { resultado: { ok: false, motivo: "no_existe" }, cambios: [] };
    if (f.peticion !== "pendiente") return { resultado: { ok: false, motivo: "ya_resuelta" }, cambios: [] };
    const estado = f.estado === "revocado" ? "revocado" : f.vigente_hasta <= ahora ? "vencido" : "vigente";
    const correoHmac = hmacCorreo(f.correo_propuesto, secretos.emailHmac);
    const ya = await tx.query(
      `SELECT 1 FROM identidad.enlace_invitados WHERE enlace_id = $1 AND correo_hmac = $2 AND activo`,
      [f.enlace_id, correoHmac],
    );
    const s = situacionPeticion({ estadoEnlace: estado, yaInvitado: Boolean(ya.rows[0]) });
    if (decision.tipo === "aprobar" && !s.puedeAprobar) return { resultado: { ok: false, motivo: "enlace_no_vigente" }, cambios: [] };
    if (decision.tipo === "rechazar" && !s.puedeRechazar) return { resultado: { ok: false, motivo: "ya_invitado" }, cambios: [] };
    const estadoNuevo = decision.tipo === "aprobar" ? "aprobada" : "rechazada";
    if (decision.tipo === "aprobar") {
      // Sin duplicar (único por enlace y correo_hmac): si ya estaba, solo se cierra la petición.
      await tx.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac, origen) VALUES ($1, $2, $3, 'invitacion_aprobada')
         ON CONFLICT (enlace_id, correo_hmac) DO NOTHING`,
        [f.enlace_id, f.correo_propuesto, correoHmac],
      );
    }
    await tx.query(
      `UPDATE identidad.invitaciones_solicitadas SET estado = $2, motivo = $3, resuelto_por = $4, resuelto_en = now() WHERE id = $1`,
      [id, estadoNuevo, decision.tipo === "rechazar" ? decision.motivo.trim() : null, autora.usuarioId],
    );
    const cambio = (campo: string, antes: string | null, despues: string | null): CambioAuditado => ({
      actor: autora.correo,
      entidad: "invitaciones_solicitadas",
      entidadId: id,
      campo,
      antes,
      despues,
      origen: "panel",
    });
    const cambios = [cambio("estado", "pendiente", estadoNuevo), cambio("enlace", null, f.codigo), cambio("correo", null, f.correo_propuesto)];
    if (decision.tipo === "rechazar") cambios.push(cambio("motivo", null, decision.motivo.trim()));
    return { resultado: { ok: true, estado: estadoNuevo }, cambios };
  });
}
