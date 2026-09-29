// Contadores de intentos por clave (ADR-0002 §3 y enmienda 2026-09-28): los mismos para el portal y el
// panel, cada uno en la tabla de su esquema (H0). La política vive en `@ps/dominio/acceso/intentos`.
import "server-only";
import type pg from "pg";
import { estadoInicial, type EstadoIntentos } from "@ps/dominio/acceso/intentos";

export type TablaIntentos = "identidad.intentos_cliente" | "identidad_panel.intentos_panel";
export type TipoIntentos = "par" | "ip" | "emision";
export type Tx = pg.PoolClient;

// Crea la fila si falta y la bloquea: dos peticiones simultáneas del mismo par no se pisan.
export async function leerIntentos(
  tx: Tx,
  tabla: TablaIntentos,
  clave: Buffer,
  tipo: TipoIntentos,
): Promise<EstadoIntentos> {
  await tx.query(
    `INSERT INTO ${tabla} (clave, tipo) VALUES ($1, $2) ON CONFLICT (clave) DO NOTHING`,
    [clave, tipo],
  );
  const r = await tx.query(
    `SELECT ventana_inicio, fallos_ventana, dia_inicio, fallos_dia, bloqueado_hasta
       FROM ${tabla} WHERE clave = $1 FOR UPDATE`,
    [clave],
  );
  const f = r.rows[0];
  return f.fallos_ventana === 0 && f.fallos_dia === 0 && !f.bloqueado_hasta
    ? estadoInicial(new Date())
    : {
        ventanaInicio: f.ventana_inicio,
        fallosVentana: f.fallos_ventana,
        diaInicio: f.dia_inicio,
        fallosDia: f.fallos_dia,
        bloqueadoHasta: f.bloqueado_hasta,
      };
}

export async function guardarIntentos(
  tx: Tx,
  tabla: TablaIntentos,
  clave: Buffer,
  e: EstadoIntentos,
): Promise<void> {
  await tx.query(
    `UPDATE ${tabla}
        SET ventana_inicio = $2, fallos_ventana = $3, dia_inicio = $4, fallos_dia = $5, bloqueado_hasta = $6
      WHERE clave = $1`,
    [clave, e.ventanaInicio, e.fallosVentana, e.diaInicio, e.fallosDia, e.bloqueadoHasta],
  );
}

export async function enTransaccion<T>(bd: pg.Pool, f: (tx: Tx) => Promise<T>): Promise<T> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const r = await f(tx);
    await tx.query("COMMIT");
    return r;
  } catch (e) {
    await tx.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    tx.release();
  }
}
