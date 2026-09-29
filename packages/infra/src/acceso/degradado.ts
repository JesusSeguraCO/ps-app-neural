// Modo degradado del envío de códigos (ADR-0002 H8, única definición): con el worker > 2 min sin
// ciclo, el Route Handler procesa SU PROPIA fila tras responder (con `after()`), en ambas ramas, por
// las funciones reclamar_propio / guardar_codigo_* / cerrar_propio. Libera la conexión antes de la
// llamada a Mailgun. Semáforo de 2 envíos degradados por instancia.
import "server-only";
import { randomUUID } from "node:crypto";
import type pg from "pg";
import { generarCodigo, hmacCodigo } from "@ps/dominio/acceso/codigo";
import { mensajeCodigo, type AmbitoCodigo } from "@ps/dominio/acceso/mensajes";
import type { EnviadorCorreo } from "../mailgun/index";

let enCurso = 0;
const MAXIMO = 2;

export async function procesarCodigoPropio(opciones: {
  bd: pg.Pool;
  trabajoId: string;
  ambito: AmbitoCodigo;
  pepper: string;
  correo: EnviadorCorreo;
  registrar?: (e: Record<string, unknown>) => void;
}): Promise<void> {
  const registrar = opciones.registrar ?? (() => {});
  if (enCurso >= MAXIMO) {
    registrar({ evento: "degradado_saturado", trabajo: opciones.trabajoId });
    return; // la fila queda pendiente para el worker o la siguiente petición
  }
  enCurso++;
  const reclamo = `degradado-${randomUUID()}`;
  try {
    const r = await opciones.bd.query(
      `SELECT id::text, payload FROM operacion.reclamar_propio($1, $2)`,
      [opciones.trabajoId, reclamo],
    );
    const fila = r.rows[0] as { id: string; payload: { ref: string | null } } | undefined;
    if (!fila) {
      registrar({ evento: "degradado_sin_fila", trabajo: opciones.trabajoId });
      return; // la tomó el worker o ya no está pendiente
    }
    if (fila.payload.ref === null) {
      registrar({ evento: "degradado_sin_efecto", trabajo: opciones.trabajoId });
      await opciones.bd.query(`SELECT operacion.cerrar_propio($1, $2, 'sin_efecto')`, [
        fila.id,
        reclamo,
      ]);
      return;
    }
    const destinatario =
      opciones.ambito === "panel"
        ? await opciones.bd.query(
            `SELECT correo FROM identidad_panel.usuarios_panel WHERE id = $1`,
            [fila.payload.ref],
          )
        : await opciones.bd.query(`SELECT correo FROM identidad.enlace_invitados WHERE id = $1`, [
            fila.payload.ref,
          ]);
    const para = destinatario.rows[0]?.correo as string | undefined;
    if (!para) {
      await opciones.bd.query(`SELECT operacion.cerrar_propio($1, $2, 'sin_efecto')`, [
        fila.id,
        reclamo,
      ]);
      return;
    }
    const codigo = generarCodigo();
    const guardar =
      opciones.ambito === "panel"
        ? "identidad_panel.guardar_codigo_panel"
        : "identidad.guardar_codigo_cliente";
    const g = await opciones.bd.query(`SELECT ${guardar}($1, $2, $3) AS id`, [
      fila.id,
      reclamo,
      hmacCodigo(codigo, opciones.pepper),
    ]);
    const m = mensajeCodigo(opciones.ambito, codigo);
    const { resultado } = await opciones.correo.enviar({
      para,
      asunto: m.asunto,
      texto: m.texto,
      html: m.html,
    });
    const marcar =
      opciones.ambito === "panel"
        ? "identidad_panel.marcar_envio_codigo"
        : "identidad.marcar_envio_codigo";
    await opciones.bd.query(`SELECT ${marcar}($1, $2)`, [g.rows[0].id, resultado]);
    await opciones.bd.query(`SELECT operacion.cerrar_propio($1, $2, $3)`, [
      fila.id,
      reclamo,
      resultado,
    ]);
    registrar({ evento: "codigo_degradado", resultado });
  } catch (e) {
    registrar({ evento: "degradado_error", error: (e as Error).message });
    await opciones.bd
      .query(`SELECT operacion.cerrar_propio($1, $2, 'reintentar')`, [opciones.trabajoId, reclamo])
      .catch(() => {});
  } finally {
    enCurso--;
  }
}
