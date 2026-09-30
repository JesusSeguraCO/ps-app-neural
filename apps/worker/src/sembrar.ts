// Tarea `sembrar_admin_inicial` (ADR-0002 enmienda, ADR-0009, ADR-0010 §3.3): al arrancar, el worker
// inscribe `PANEL_ADMIN_INICIAL` como administrador solo si el panel no tiene ningún usuario, en la
// misma transacción que su auditoría (`origen = migracion`). La función SQL (`SECURITY DEFINER`, solo
// `ps_worker`) lanza excepción si ya hay usuarios, así que no sirve para añadir administradores después.
import type pg from "pg";
import { hmacCorreo, normalizarCorreo } from "@ps/dominio/acceso/codigo";
import { conAuditoria, type ClavesAuditoria } from "@ps/infra/postgres/auditoria";

export interface ContextoSiembra {
  bd: pg.Pool;
  auditoria: ClavesAuditoria;
  emailHmac: string;
  registrar: (evento: Record<string, unknown>) => void;
}

export type ResultadoSiembra = "sembrado" | "ya_sembrado";

const EXCEPCION_PLPGSQL = "P0001";

export async function sembrarAdminInicial(
  ctx: ContextoSiembra,
  correoCrudo: string,
): Promise<ResultadoSiembra> {
  const correo = normalizarCorreo(correoCrudo);
  try {
    const id = await conAuditoria(ctx.bd, ctx.auditoria, async (tx) => {
      const r = await tx.query(`SELECT identidad_panel.sembrar_admin_inicial($1, $2)::text AS id`, [
        correo,
        hmacCorreo(correo, ctx.emailHmac),
      ]);
      const nuevo = r.rows[0].id as string;
      return {
        resultado: nuevo,
        cambios: [
          {
            actor: "sistema:sembrar_admin_inicial",
            entidad: "usuarios_panel",
            entidadId: nuevo,
            campo: "rol",
            antes: null,
            despues: "administrador",
            origen: "migracion",
          },
        ],
      };
    });
    ctx.registrar({ evento: "admin_inicial_sembrado", usuario: id });
    return "sembrado";
  } catch (e) {
    if ((e as { code?: string }).code !== EXCEPCION_PLPGSQL) throw e;
    ctx.registrar({ evento: "admin_inicial_omitido", motivo: "el panel ya tiene usuarios" });
    return "ya_sembrado";
  }
}
