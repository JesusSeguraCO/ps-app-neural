// Unidad de trabajo del inventario (diseño §1–§2, ADR-0003): toda escritura del banco —panel,
// importación, reversión, fusión, colocados, revocación— pasa por aquí. En una transacción y en este
// orden: el acto (perfil → hijas), la subida de `inventario_version` si el cambio es visible al
// cliente y la auditoría encadenada con su actor. Ante interbloqueo o fallo de serialización
// (40P01/40001) se reintenta entera, hasta tres veces.
import "server-only";
import type pg from "pg";
import {
  registrarAuditoria,
  type CambioAuditado,
  type ClavesAuditoria,
  type ReferenciaAuditoria,
} from "./auditoria";

export interface ResultadoActo<T> {
  resultado: T;
  cambios: CambioAuditado[];
  // Cambia algo que el cliente puede ver (catálogo, léxico, perfil publicado): sube la versión global.
  visible: boolean;
  // El proceso que escribe (carga de Operaciones): su tramo de la auditoría queda enlazado (HU-138).
  referencia?: ReferenciaAuditoria;
}

const REINTENTABLES = new Set(["40P01", "40001"]);
const INTENTOS = 3;

export async function conUnidadInventario<T>(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  acto: (tx: pg.PoolClient) => Promise<ResultadoActo<T>>,
): Promise<T> {
  for (let intento = 1; ; intento++) {
    const tx = await bd.connect();
    try {
      await tx.query("BEGIN");
      const { resultado, cambios, visible, referencia } = await acto(tx);
      if (visible)
        await tx.query(
          `UPDATE inventario.inventario_version SET version = version + 1, actualizado_en = now() WHERE id = 1`,
        );
      if (cambios.length) await registrarAuditoria(tx, claves, cambios, referencia);
      await tx.query("COMMIT");
      return resultado;
    } catch (e) {
      await tx.query("ROLLBACK").catch(() => {});
      if (intento < INTENTOS && REINTENTABLES.has((e as { code?: string }).code ?? "")) continue;
      throw e;
    } finally {
      tx.release();
    }
  }
}

// Un acto que decide no escribir (validación de dominio) sale con este error y no deja rastro.
export class RechazoInventario<M extends string = string> extends Error {
  constructor(
    readonly motivo: M,
    readonly detalle: Record<string, unknown> = {},
  ) {
    super(`inventario: ${motivo}`);
    this.name = "RechazoInventario";
  }
}
