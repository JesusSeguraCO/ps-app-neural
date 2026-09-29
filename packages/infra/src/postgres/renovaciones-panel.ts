// Bandeja de renovaciones del panel (HU-146): cada petición de enlace nuevo, la más reciente primero,
// con quién la pidió (el correo que escribió, esté o no invitado), de qué enlace, cuándo y en qué quedó.
// Solo lectura; revocar el enlace nuevo usa la revocación ya existente del panel (tarea 4.4).
import "server-only";
import type pg from "pg";

export type EstadoRenovacionPanel =
  | "pendiente" // el worker aún no la procesa
  | "enviado" // enlace nuevo entregado al buzón del invitado
  | "fallido" // enlace nuevo emitido pero el correo no se pudo entregar
  | "revocado" // enlace nuevo emitido y después revocado
  | "no_invitado" // no estaba invitado: no se envió nada
  | "sin_efecto" // el enlace se revocó antes de procesar la petición
  | "persona"; // filas anteriores al 2026-09-29: se avisó a una persona en vez de renovar

export interface RenovacionPanel {
  id: string;
  correo: string | null;
  pedidaEn: Date;
  cuenta: string;
  proyecto: string | null;
  enlaceVencido: string;
  enlaceNuevo: string | null;
  estado: EstadoRenovacionPanel;
}

export async function listarRenovaciones(bd: pg.Pool, limite = 200): Promise<RenovacionPanel[]> {
  const r = await bd.query(
    `SELECT r.id, r.correo, r.pedida_en, r.resultado, r.entrega, e.cuenta_nombre, e.proyecto, e.codigo,
            n.codigo AS codigo_nuevo, n.estado AS estado_nuevo
       FROM identidad.renovaciones r
       JOIN identidad.enlaces e ON e.id = r.enlace_id
       LEFT JOIN identidad.enlaces n ON n.id = r.enlace_nuevo
      ORDER BY r.pedida_en DESC LIMIT $1`,
    [limite],
  );
  return r.rows.map((f) => ({
    id: f.id,
    correo: f.correo,
    pedidaEn: f.pedida_en,
    cuenta: f.cuenta_nombre,
    proyecto: f.proyecto,
    enlaceVencido: f.codigo,
    enlaceNuevo: f.codigo_nuevo,
    estado: estadoDe(f),
  }));
}

function estadoDe(f: {
  resultado: string | null;
  entrega: string | null;
  estado_nuevo: string | null;
}): EstadoRenovacionPanel {
  switch (f.resultado) {
    case null:
      return "pendiente";
    case "enlace_enviado":
      if (f.estado_nuevo === "revocado") return "revocado";
      return f.entrega === "fallido" ? "fallido" : "enviado";
    case "no_invitado":
      return "no_invitado";
    case "sin_efecto":
      return "sin_efecto";
    default:
      return "persona";
  }
}
