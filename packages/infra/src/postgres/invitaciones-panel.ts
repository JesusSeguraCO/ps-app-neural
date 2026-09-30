// Peticiones de invitación en el panel (HU-145, design §6): aprobar añade el correo a la lista de
// invitados del enlace con origen «invitacion_aprobada» sin duplicar; rechazar exige motivo. Ambas
// decisiones van a la auditoría encadenada (ADR-0003) con quién, enlace, correo y motivo. No se
// aprueba sobre un enlace vencido o revocado.
import "server-only";
import type pg from "pg";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { dominioDistinto, situacionPeticion, type MarcaPeticion } from "@ps/dominio/enlaces/invitaciones";
import { conAuditoria, type CambioAuditado, type ClavesAuditoria } from "./auditoria";

export interface EnlacePeticion {
  codigo: string;
  cuenta: string;
  proyecto: string | null;
  estado: "vigente" | "vencido" | "revocado";
  desde: Date | null;
}

export interface InvitadoEnlace {
  correo: string;
  origen: "inicial" | "invitacion_aprobada";
  desde: Date;
}

export interface PeticionPanel {
  id: string;
  correo: string;
  nombre: string | null;
  paraQue: string | null;
  pideCorreo: string;
  enlace: EnlacePeticion;
  pedidaEn: Date;
  dominioDistinto: boolean;
  marca: MarcaPeticion;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
  // Solo si el correo ya está invitado: la lista del enlace para la hoja «ya tiene acceso».
  invitados: InvitadoEnlace[] | null;
}

export interface DecisionPanel {
  id: string;
  estado: "aprobada" | "rechazada";
  correo: string;
  nombre: string | null;
  paraQue: string | null;
  pideCorreo: string;
  enlace: { codigo: string; cuenta: string; proyecto: string | null };
  motivo: string | null;
  pedidaEn: Date;
  resueltaEn: Date;
  resueltaPor: { id: string; correo: string };
}

const estadoDe = (f: { estado: string; vigente_hasta: Date }, ahora: Date) =>
  f.estado === "revocado" ? "revocado" : f.vigente_hasta <= ahora ? "vencido" : "vigente";

export async function contarPeticionesPendientes(bd: pg.Pool): Promise<number> {
  const r = await bd.query(`SELECT count(*)::int n FROM identidad.invitaciones_solicitadas WHERE estado = 'pendiente'`);
  return r.rows[0].n;
}

export async function listarPeticiones(
  bd: pg.Pool,
  ahora: Date = new Date(),
): Promise<{ pendientes: PeticionPanel[]; resueltas: number; recientes: DecisionPanel[] }> {
  const r = await bd.query(
    `SELECT s.id, s.enlace_id, s.correo_propuesto, s.nombre_propuesto, s.para_que, s.creado_en, p.correo AS pide,
            e.codigo, e.cuenta_nombre, e.proyecto, e.estado, e.vigente_hasta, e.revocado_en,
            EXISTS (SELECT 1 FROM identidad.enlace_invitados i WHERE i.enlace_id = s.enlace_id AND i.correo_hmac = s.correo_hmac AND i.activo) AS ya
       FROM identidad.invitaciones_solicitadas s
       JOIN identidad.enlaces e ON e.id = s.enlace_id
       JOIN identidad.enlace_invitados p ON p.id = s.solicitado_por
      WHERE s.estado = 'pendiente' ORDER BY s.creado_en DESC`,
  );
  const conInvitados = r.rows.filter((f) => f.ya).map((f) => f.enlace_id);
  const inv = conInvitados.length
    ? await bd.query(
        `SELECT enlace_id, correo, origen, creado_en FROM identidad.enlace_invitados
          WHERE enlace_id = ANY($1::uuid[]) AND activo ORDER BY creado_en`,
        [conInvitados],
      )
    : { rows: [] };
  const pendientes = r.rows.map((f): PeticionPanel => {
    const estado = estadoDe(f, ahora);
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
      invitados: f.ya
        ? inv.rows
            .filter((i) => i.enlace_id === f.enlace_id)
            .map((i) => ({ correo: i.correo, origen: i.origen, desde: i.creado_en }))
        : null,
    };
  });
  const n = await bd.query(`SELECT count(*)::int n FROM identidad.invitaciones_solicitadas WHERE estado <> 'pendiente'`);
  return { pendientes, resueltas: n.rows[0].n, recientes: await listarDecisiones(bd, 3) };
}

// Peticiones resueltas, la más reciente primero, con quién decidió (pestaña «Resueltas»).
export async function listarDecisiones(bd: pg.Pool, limite = 200): Promise<DecisionPanel[]> {
  const u = await bd.query(
    `SELECT s.id, s.estado, s.correo_propuesto, s.nombre_propuesto, s.para_que, s.motivo, s.creado_en, s.resuelto_en,
            p.correo AS pide, e.codigo, e.cuenta_nombre, e.proyecto, s.resuelto_por, u.correo AS resolvio
       FROM identidad.invitaciones_solicitadas s
       JOIN identidad.enlaces e ON e.id = s.enlace_id
       JOIN identidad.enlace_invitados p ON p.id = s.solicitado_por
       JOIN identidad_panel.usuarios_panel u ON u.id = s.resuelto_por
      WHERE s.estado <> 'pendiente' ORDER BY s.resuelto_en DESC LIMIT $1`,
    [limite],
  );
  return u.rows.map((f) => ({
    id: f.id,
    estado: f.estado,
    correo: f.correo_propuesto,
    nombre: f.nombre_propuesto,
    paraQue: f.para_que,
    pideCorreo: f.pide,
    enlace: { codigo: f.codigo, cuenta: f.cuenta_nombre, proyecto: f.proyecto },
    motivo: f.motivo,
    pedidaEn: f.creado_en,
    resueltaEn: f.resuelto_en,
    resueltaPor: { id: f.resuelto_por, correo: f.resolvio },
  }));
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
    const estado = estadoDe(f, ahora);
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
