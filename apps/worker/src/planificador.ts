// Planificador dentro del worker con reclamo por fila (ADR-0009, fila QA-14/CRN-3): el worker
// registra su catálogo de tareas al arrancar; en cada vuelta reclama las vencidas fijando solo el
// arrendamiento; al terminar, éxito → siguiente vencimiento; fallo → reintento en min(15 min,
// intervalo) y un fallo consecutivo más. `tareas_ejecucion` se escribe siempre.
import type pg from "pg";

export interface Tarea {
  nombre: string;
  intervalo: string; // intervalo de PostgreSQL, p. ej. '7 days'
  tope: string; // arrendamiento máximo de una corrida
  critica: boolean;
  ejecutar: () => Promise<{ fallo?: string; detalle?: Record<string, unknown> }>;
}

export async function registrarTareas(bd: pg.Pool, tareas: readonly Tarea[]): Promise<void> {
  for (const t of tareas)
    await bd.query(
      `INSERT INTO operacion.tareas_programadas (nombre, intervalo, critica, proxima_ejecucion)
       VALUES ($1, $2::interval, $3, now())
       ON CONFLICT (nombre) DO UPDATE SET intervalo = excluded.intervalo, critica = excluded.critica`,
      [t.nombre, t.intervalo, t.critica],
    );
}

export async function vueltaPlanificador(
  bd: pg.Pool,
  reclamo: string,
  tareas: readonly Tarea[],
  registrar: (e: Record<string, unknown>) => void,
): Promise<void> {
  for (const t of tareas) {
    const r = await bd.query(
      `UPDATE operacion.tareas_programadas SET lease_hasta = now() + $3::interval, lease_por = $2
        WHERE nombre = $1 AND proxima_ejecucion <= now() AND (lease_hasta IS NULL OR lease_hasta < now())
        RETURNING nombre`,
      [t.nombre, reclamo, t.tope],
    );
    if (!r.rowCount) continue;
    const inicio = new Date();
    let fallo: string | undefined;
    let detalle: Record<string, unknown> | undefined;
    try {
      ({ fallo, detalle } = await t.ejecutar());
    } catch (e) {
      fallo = (e as Error).message;
    }
    try {
      await bd.query(
        fallo
          ? `UPDATE operacion.tareas_programadas
                SET proxima_ejecucion = now() + LEAST(interval '15 minutes', intervalo),
                    fallos_consecutivos = fallos_consecutivos + 1, ultimo_error = $3,
                    lease_hasta = NULL, lease_por = NULL
              WHERE nombre = $1 AND lease_por = $2`
          : `UPDATE operacion.tareas_programadas
                SET proxima_ejecucion = now() + intervalo, ultimo_exito_en = now(), fallos_consecutivos = 0,
                    ultimo_error = NULL, lease_hasta = NULL, lease_por = NULL
              WHERE nombre = $1 AND lease_por = $2`,
        fallo ? [t.nombre, reclamo, fallo.slice(0, 500)] : [t.nombre, reclamo],
      );
    } finally {
      await bd.query(
        `INSERT INTO operacion.tareas_ejecucion (nombre, inicio, resultado, detalle) VALUES ($1, $2, $3, $4)`,
        [
          t.nombre,
          inicio,
          fallo ? "fallo" : "exito",
          JSON.stringify({ ...(detalle ?? {}), ...(fallo ? { error: fallo } : {}) }),
        ],
      );
      registrar({
        evento: "tarea_programada",
        tarea: t.nombre,
        resultado: fallo ? "fallo" : "exito",
      });
    }
  }
}
