// Colocados (HU-137, HU-150; RF-8.13, RF-8.13.2; D8, D12, D15, D16; diseño §11). Un colocado no es un
// estado: el perfil sigue publicado, su disponibilidad es la fecha de liberación y la asignación vive en
// `colocaciones`, con de dónde salió el dato. Toda escritura pasa por la unidad de inventario (auditoría
// encadenada y versión del inventario).
import "server-only";
import type pg from "pg";
import { diaCivilDeColombia } from "@ps/dominio/inventario/vigencia";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import { conUnidadInventario } from "./unidad-inventario";

const ACTOR_MIGRACION = "worker:migrar_colocados";
const CUENTA_DESCONOCIDA = "Sin registrar";

// Trabajo `migrar_colocados` (sub-slice 9, antes de la migración contract 0021): cada perfil que aún está
// en estado `colocado` pasa a publicado con su colocación (cuenta «Sin registrar», liberación = la fecha que
// tenía; cerrada si ya pasó) y disponibilidad = liberación. Si no puede publicarse (sin consentimiento
// vigente, por ejemplo) queda en borrador con su colocación. Idempotente: sin colocados no hace nada.
export async function migrarColocados(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  ahora = new Date(),
): Promise<{ migrados: number; aBorrador: number }> {
  const hoy = diaCivilDeColombia(ahora);
  const codigos = (
    await bd.query(
      `SELECT codigo FROM inventario.perfiles WHERE estado = 'colocado' ORDER BY codigo`,
    )
  ).rows.map((f) => f.codigo as string);
  let aBorrador = 0;
  for (const codigo of codigos) {
    const borrador = await conUnidadInventario(bd, claves, async (tx) => {
      const f = (
        await tx.query(
          `SELECT id, estado, fecha_liberacion::text AS liberacion, disponibilidad_fecha::text AS disponibilidad
             FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`,
          [codigo],
        )
      ).rows[0] as
        | { id: string; estado: string; liberacion: string; disponibilidad: string | null }
        | undefined;
      if (!f || f.estado !== "colocado") return { resultado: false, cambios: [], visible: false };
      const vigente = f.liberacion > hoy;
      await tx.query(
        `INSERT INTO inventario.colocaciones (perfil_id, cuenta, liberacion, fuente, vigente, cerrada_en)
         VALUES ($1, $2, $3, 'migracion', $4, CASE WHEN $4 THEN NULL ELSE now() END)`,
        [f.id, CUENTA_DESCONOCIDA, f.liberacion, vigente],
      );
      const cambio = (
        campo: string,
        antes: string | null,
        despues: string | null,
      ): CambioAuditado => ({
        actor: ACTOR_MIGRACION,
        entidad: "perfiles",
        entidadId: f.id,
        campo,
        titular: codigo,
        antes,
        despues,
        origen: "migracion",
      });
      const cambios = [
        cambio("colocacion", null, `${CUENTA_DESCONOCIDA} · libera ${f.liberacion}`),
      ];
      if (f.disponibilidad !== f.liberacion)
        cambios.push(cambio("disponibilidad_fecha", f.disponibilidad, f.liberacion));
      // Publicar pasa por los disparadores de la BD (consentimiento vigente, modalidad de prueba): si no
      // se cumplen, el perfil queda en borrador en vez de perderse.
      await tx.query("SAVEPOINT publicar");
      let destino = "publicado";
      try {
        await tx.query(
          `UPDATE inventario.perfiles SET estado = 'publicado', fecha_liberacion = NULL, disponibilidad_fecha = $2
            WHERE id = $1`,
          [f.id, f.liberacion],
        );
      } catch {
        await tx.query("ROLLBACK TO SAVEPOINT publicar");
        destino = "borrador";
        await tx.query(
          `UPDATE inventario.perfiles SET estado = 'borrador', fecha_liberacion = NULL, disponibilidad_fecha = $2
            WHERE id = $1`,
          [f.id, f.liberacion],
        );
      }
      cambios.push(cambio("estado", "colocado", destino));
      return { resultado: destino === "borrador", cambios, visible: true };
    });
    if (borrador) aBorrador++;
  }
  return { migrados: codigos.length, aBorrador };
}

type Consultor = Pick<pg.PoolClient, "query">;

// Colocaciones vigentes por código, para el plan de importación (HU-137): la asignación no viaja en el
// archivo y un colocado no cambia de estado por importación.
export async function colocadosVigentes(
  bd: Consultor,
): Promise<Map<string, { cuenta: string; liberacion: string }>> {
  const r = await bd.query(
    `SELECT p.codigo, c.cuenta, c.liberacion::text AS liberacion
       FROM inventario.colocaciones c JOIN inventario.perfiles p ON p.id = c.perfil_id
      WHERE c.vigente AND c.liberacion > (now() AT TIME ZONE 'America/Bogota')::date`,
  );
  return new Map(r.rows.map((f) => [f.codigo, { cuenta: f.cuenta, liberacion: f.liberacion }]));
}
