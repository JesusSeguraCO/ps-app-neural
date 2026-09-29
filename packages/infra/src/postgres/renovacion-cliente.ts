// Petición de enlace nuevo desde el portal (HU-092, design §2). En la petición NO se mira si el correo
// estaba invitado: se registra la renovación y se encola `renovar_enlace`; lo decide el worker. Así la
// respuesta es la misma, en tiempo y forma, para invitados y no invitados. La ventana de espera es por
// enlace + correo y tampoco depende de la invitación.
import "server-only";
import type pg from "pg";
import { hmacCorreo, normalizarCorreo } from "@ps/dominio/acceso/codigo";
import { estadoAlAbrir, tokenConForma } from "@ps/dominio/acceso/enlace";
import { enVentanaDeEspera } from "@ps/dominio/enlaces/renovacion";
import { hashTokenEnlace } from "@ps/dominio/enlaces/crear";
import { enTransaccion } from "./intentos";
import { hashIdSesion } from "./sesiones";

export type ResultadoPeticionRenovacion =
  | { tipo: "pedida"; solicitud: string }
  | { tipo: "en_camino"; solicitud: string; desde: Date }
  | { tipo: "activo" }
  | { tipo: "revocado" };

async function enlaceDe(
  tx: pg.PoolClient,
  entrada: { token?: string; idCookie?: string },
): Promise<{ id: string; estado: "activo" | "revocado"; tokenRevocado: boolean; vigenteHasta: Date } | null> {
  if (entrada.token && tokenConForma(entrada.token)) {
    const r = await tx.query(
      `SELECT e.id, e.estado, e.vigente_hasta, t.revocado_en IS NOT NULL AS token_revocado
         FROM identidad.enlace_tokens t JOIN identidad.enlaces e ON e.id = t.enlace_id WHERE t.token_hash = $1`,
      [hashTokenEnlace(entrada.token)],
    );
    const f = r.rows[0];
    return f ? { id: f.id, estado: f.estado, tokenRevocado: f.token_revocado, vigenteHasta: f.vigente_hasta } : null;
  }
  if (entrada.idCookie) {
    // La sesión de un enlace vencido sigue identificando el enlace (pantalla de renovación sin token).
    const r = await tx.query(
      `SELECT e.id, e.estado, e.vigente_hasta FROM identidad.sesiones_portal s
         JOIN identidad.enlaces e ON e.id = s.enlace_id WHERE s.id_hash = $1`,
      [hashIdSesion(entrada.idCookie)],
    );
    const f = r.rows[0];
    return f ? { id: f.id, estado: f.estado, tokenRevocado: false, vigenteHasta: f.vigente_hasta } : null;
  }
  return null;
}

export async function pedirRenovacion(
  bd: pg.Pool,
  emailHmac: string,
  entrada: { token?: string; idCookie?: string; correo: string },
): Promise<ResultadoPeticionRenovacion> {
  const correoHmac = hmacCorreo(normalizarCorreo(entrada.correo), emailHmac);
  return enTransaccion(bd, async (tx) => {
    const ahora = new Date();
    const e = await enlaceDe(tx, entrada);
    const estado = estadoAlAbrir(
      e ? { tokenRevocado: e.tokenRevocado, enlaceEstado: e.estado, vigenteHasta: e.vigenteHasta } : null,
      ahora,
    );
    if (estado.estado === "revocado") return { tipo: "revocado" };
    if (estado.estado === "activo") return { tipo: "activo" };
    // Serializa peticiones simultáneas del mismo enlace + correo (una sola renovación por ventana).
    await tx.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [
      `renovacion:${e!.id}:${correoHmac.toString("hex")}`,
    ]);
    const u = await tx.query(
      `SELECT id, pedida_en FROM identidad.renovaciones WHERE enlace_id = $1 AND correo_hmac = $2
        ORDER BY pedida_en DESC LIMIT 1`,
      [e!.id, correoHmac],
    );
    const ultima = u.rows[0] as { id: string; pedida_en: Date } | undefined;
    const v = enVentanaDeEspera(ultima?.pedida_en ?? null, ahora);
    if (v.enEspera) return { tipo: "en_camino", solicitud: ultima!.id, desde: v.desde };
    const r = await tx.query(
      `INSERT INTO identidad.renovaciones (enlace_id, correo_hmac) VALUES ($1, $2) RETURNING id`,
      [e!.id, correoHmac],
    );
    const solicitud = r.rows[0].id as string;
    await tx.query(`SELECT operacion.encolar_portal('renovar_enlace', $1::jsonb)`, [
      JSON.stringify({ renovacion: solicitud }),
    ]);
    return { tipo: "pedida", solicitud };
  });
}

// Lo único que el portal cuenta de una renovación: si fue automática o pasó a una persona (depende
// solo del estado de la cuenta del enlace, nunca de la invitación).
export async function estadoRenovacion(
  bd: pg.Pool,
  solicitud: string,
): Promise<"pendiente" | "automatica" | "persona" | null> {
  const r = await bd.query(`SELECT publico FROM identidad.renovaciones WHERE id = $1`, [solicitud]);
  if (!r.rows[0]) return null;
  return r.rows[0].publico ?? "pendiente";
}
