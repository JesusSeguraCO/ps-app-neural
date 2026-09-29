// Generación y revocación del enlace curado desde el panel (HU-122, HU-144/145; ADR-0002 H9, ADR-0003).
// Una sola transacción: enlace, invitados, token (solo su SHA-256) y auditoría (cuenta, razón,
// invitados, perfiles, autora y vigencia). El token en claro solo existe en la respuesta.
import "server-only";
import type pg from "pg";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import {
  crearEnlace,
  generarTokenEnlace,
  type EntradaEnlace,
  type ErrorEnlace,
  type EstadoPublico,
} from "@ps/dominio/enlaces/crear";
import { conAuditoria, type CambioAuditado, type ClavesAuditoria } from "./auditoria";

export interface Autora {
  usuarioId: string;
  correo: string;
}

export interface EnlaceGenerado {
  id: string;
  codigo: string;
  token: string;
  vigenteHasta: Date;
  invitados: string[];
  codigos: string[];
}

export type ResultadoGeneracion = { ok: true; enlace: EnlaceGenerado } | { ok: false; errores: ErrorEnlace[] };

export async function generarEnlace(
  bd: pg.Pool,
  secretos: { auditoria: ClavesAuditoria; emailHmac: string },
  autora: Autora,
  entrada: EntradaEnlace,
  ahora: Date = new Date(),
): Promise<ResultadoGeneracion> {
  const codigos = [...new Set(entrada.codigos.map((c) => c.trim()))];
  const r = await bd.query<{ codigo: string; estado: EstadoPublico }>(
    `SELECT codigo, estado FROM operacion.estado_enlace_perfil WHERE codigo = ANY($1)`,
    [codigos],
  );
  const plan = crearEnlace(entrada, new Map(r.rows.map((f) => [f.codigo, f.estado])), ahora);
  if (!plan.ok) return plan;
  const e = plan.enlace;
  const { token, hash } = generarTokenEnlace();

  const enlace = await conAuditoria(bd, secretos.auditoria, async (tx) => {
    const ins = await tx.query(
      `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta, generado_por)
       VALUES (NULL, $1, $2, $3, $4, $5, $6, $7) RETURNING id::text, codigo`,
      [e.cuentaNombre, e.proyecto, e.razon, e.codigos, ahora, e.vigenteHasta, autora.usuarioId],
    );
    const { id, codigo } = ins.rows[0] as { id: string; codigo: string };
    for (const correo of e.invitados) {
      await tx.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, $2, $3)`,
        [id, correo, hmacCorreo(correo, secretos.emailHmac)],
      );
    }
    await tx.query(`INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, $2)`, [id, hash]);
    const cambio = (campo: string, despues: string | null): CambioAuditado => ({
      actor: autora.correo,
      entidad: "enlaces",
      entidadId: id,
      campo,
      antes: null,
      despues,
      origen: "panel",
    });
    return {
      resultado: { id, codigo },
      cambios: [
        cambio("cuenta", e.cuentaNombre),
        cambio("proyecto", e.proyecto),
        cambio("razon", e.razon),
        cambio("perfiles", e.codigos.join(",")),
        cambio("invitados", e.invitados.join(",")),
        cambio("vigente_hasta", e.vigenteHasta.toISOString()),
      ],
    };
  });
  return {
    ok: true,
    enlace: { ...enlace, token, vigenteHasta: e.vigenteHasta, invitados: e.invitados, codigos: e.codigos },
  };
}

export type ResultadoRevocacion =
  | { ok: true; codigo: string; revocadoEn: Date }
  | { ok: false; motivo: "no_existe" | "ya_revocado" };

// Revoca el enlace y sus tokens (HU-144/145): la sesión del cliente se corta en la siguiente petición
// porque la guarda relee el estado del enlace en BD. Auditado con origen `revocacion`.
export async function revocarEnlace(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autora: Autora,
  codigo: string,
): Promise<ResultadoRevocacion> {
  return conAuditoria<ResultadoRevocacion>(bd, claves, async (tx) => {
    const r = await tx.query(
      `SELECT id::text, estado FROM identidad.enlaces WHERE codigo = $1 FOR UPDATE`,
      [codigo],
    );
    const e = r.rows[0] as { id: string; estado: string } | undefined;
    if (!e) return { resultado: { ok: false, motivo: "no_existe" }, cambios: [] };
    if (e.estado === "revocado") return { resultado: { ok: false, motivo: "ya_revocado" }, cambios: [] };
    const u = await tx.query(
      `UPDATE identidad.enlaces SET estado = 'revocado', revocado_por = $2, revocado_en = now()
        WHERE id = $1 RETURNING revocado_en`,
      [e.id, autora.usuarioId],
    );
    await tx.query(
      `UPDATE identidad.enlace_tokens SET revocado_en = now() WHERE enlace_id = $1 AND revocado_en IS NULL`,
      [e.id],
    );
    return {
      resultado: { ok: true, codigo, revocadoEn: u.rows[0].revocado_en as Date },
      cambios: [
        {
          actor: autora.correo,
          entidad: "enlaces",
          entidadId: e.id,
          campo: "estado",
          antes: "activo",
          despues: "revocado",
          origen: "revocacion",
        },
      ],
    };
  });
}
