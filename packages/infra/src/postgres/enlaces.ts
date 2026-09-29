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
  motivo: string | null = null,
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
        ...(motivo?.trim()
          ? [
              {
                actor: autora.correo,
                entidad: "enlaces",
                entidadId: e.id,
                campo: "motivo_revocacion",
                antes: null,
                despues: motivo.trim(),
                origen: "revocacion" as const,
              },
            ]
          : []),
      ],
    };
  });
}

export type EstadoEnlace = "vigente" | "vencido" | "revocado";

export interface FilaEnlace {
  codigo: string;
  cuenta: string;
  proyecto: string | null;
  sinSeleccion: boolean;
  invitados: string[];
  generadoPor: string;
  generadoEn: Date;
  vigenteDesde: Date;
  vigenteHasta: Date;
  estado: EstadoEnlace;
  revocadoEn: Date | null;
  revocadoPor: string | null;
}

export interface PerfilDeEnlace {
  codigo: string;
  nombre: string | null;
  rol: string | null;
  estado: EstadoPublico | "desconocido";
}

export interface DetalleEnlace extends FilaEnlace {
  razon: string;
  perfiles: PerfilDeEnlace[];
}

const SELECT_ENLACE = `
  SELECT e.codigo, e.cuenta_nombre AS cuenta, e.proyecto, cardinality(e.codigos_perfil) = 0 AS sin_seleccion,
         COALESCE((SELECT array_agg(i.correo ORDER BY i.creado_en, i.correo) FROM identidad.enlace_invitados i
                    WHERE i.enlace_id = e.id AND i.activo), '{}') AS invitados,
         g.correo AS generado_por, e.creado_en AS generado_en, e.vigente_desde, e.vigente_hasta, e.revocado_en,
         r.correo AS revocado_por, e.razon, e.codigos_perfil,
         CASE WHEN e.estado = 'revocado' THEN 'revocado' WHEN e.vigente_hasta <= now() THEN 'vencido' ELSE 'vigente' END AS estado
    FROM identidad.enlaces e
    JOIN identidad_panel.usuarios_panel g ON g.id = e.generado_por
    LEFT JOIN identidad_panel.usuarios_panel r ON r.id = e.revocado_por`;

function aFila(f: Record<string, unknown>): FilaEnlace {
  return {
    codigo: f.codigo as string,
    cuenta: f.cuenta as string,
    proyecto: f.proyecto as string | null,
    sinSeleccion: f.sin_seleccion as boolean,
    invitados: f.invitados as string[],
    generadoPor: f.generado_por as string,
    generadoEn: f.generado_en as Date,
    vigenteDesde: f.vigente_desde as Date,
    vigenteHasta: f.vigente_hasta as Date,
    estado: f.estado as EstadoEnlace,
    revocadoEn: f.revocado_en as Date | null,
    revocadoPor: f.revocado_por as string | null,
  };
}

// Registro de enlaces del panel (prototipo enlaces-acceso), del más reciente al más antiguo.
export async function listarEnlaces(bd: pg.Pool): Promise<FilaEnlace[]> {
  const r = await bd.query(`${SELECT_ENLACE} ORDER BY e.creado_en DESC, e.codigo DESC`);
  return r.rows.map(aFila);
}

export async function detalleEnlace(bd: pg.Pool, codigo: string): Promise<DetalleEnlace | null> {
  const r = await bd.query(`${SELECT_ENLACE} WHERE e.codigo = $1`, [codigo]);
  const f = r.rows[0];
  if (!f) return null;
  const codigos = f.codigos_perfil as string[];
  const p = await bd.query(
    `SELECT c.codigo, pf.nombre || ' ' || pf.primer_apellido AS nombre,
            (SELECT cr.nombre FROM inventario.perfil_roles pr JOIN inventario.catalogo_roles cr ON cr.id = pr.valor_id
              WHERE pr.perfil_id = pf.id ORDER BY pr.orden LIMIT 1) AS rol,
            COALESCE(ee.estado, 'desconocido') AS estado
       FROM unnest($1::text[]) WITH ORDINALITY AS c(codigo, orden)
       LEFT JOIN inventario.perfiles pf ON pf.codigo = c.codigo
       LEFT JOIN operacion.estado_enlace_perfil ee ON ee.codigo = c.codigo
      ORDER BY c.orden`,
    [codigos],
  );
  return { ...aFila(f), razon: f.razon as string, perfiles: p.rows as PerfilDeEnlace[] };
}
