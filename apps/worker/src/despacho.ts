// Bucle de despacho de la cola (ADR-0009 §3): reclamo con FOR UPDATE SKIP LOCKED y arrendamiento de
// 10 min, comprobación de origen y payload antes de ejecutar (V9-10), cierre con `AND locked_by`.
// Ninguna transacción retiene la conexión durante la llamada a Mailgun (ADR-0008).
import type pg from "pg";
import {
  generarCodigo,
  hmacCodigo,
  planDeEnvioCodigo,
  type ResultadoEnvio,
} from "@ps/dominio/acceso/codigo";
import { mensajeCodigo } from "@ps/dominio/acceso/mensajes";
import {
  ESQUEMAS_PAYLOAD,
  type PayloadEnviarCodigo,
  type TipoConManejador,
} from "@ps/contratos/trabajos";
import type { EnviadorCorreo } from "@ps/infra/mailgun/index";

export interface ContextoDespacho {
  bd: pg.Pool;
  correo: EnviadorCorreo;
  peppers: { cliente: string; panel: string };
  reclamo: string;
  registrar: (evento: Record<string, unknown>) => void;
}

interface Trabajo {
  id: string;
  tipo: string;
  origen: string;
  payload: unknown;
  intentos: number;
  caduca_en: Date | null;
}

const TIPOS: TipoConManejador[] = ["enviar_codigo"];

const SQL_RECLAMAR = `
UPDATE operacion.trabajos SET estado = 'en_curso', locked_by = $1, locked_until = now() + interval '10 minutes',
       actualizado_en = now()
 WHERE id = (
   SELECT id FROM operacion.trabajos
    WHERE ((estado IN ('pendiente', 'fallando') AND proximo_intento <= now())
           OR (estado = 'en_curso' AND locked_until < now()))
      AND tipo = ANY($2)
    ORDER BY prioridad DESC, proximo_intento
    LIMIT 1 FOR UPDATE SKIP LOCKED)
RETURNING id::text, tipo, origen, payload, intentos, caduca_en`;

async function cerrar(
  ctx: ContextoDespacho,
  id: string,
  cambio: {
    estado: string;
    error?: string | null;
    enSegundos?: number;
    sumarIntento?: boolean;
    nunca?: boolean;
  },
): Promise<void> {
  await ctx.bd.query(
    `UPDATE operacion.trabajos
        SET estado = $3, ultimo_error = $4, intentos = intentos + $5,
            proximo_intento = CASE WHEN $7 THEN 'infinity'::timestamptz
                                   WHEN $6::int IS NULL THEN proximo_intento
                                   ELSE now() + make_interval(secs => $6::int) END,
            locked_by = NULL, locked_until = NULL, actualizado_en = now()
      WHERE id = $1 AND locked_by = $2`,
    [
      id,
      ctx.reclamo,
      cambio.estado,
      cambio.error ?? null,
      cambio.sumarIntento ? 1 : 0,
      cambio.enSegundos ?? null,
      cambio.nunca ?? false,
    ],
  );
}

async function enviarCodigo(
  ctx: ContextoDespacho,
  t: Trabajo,
  p: PayloadEnviarCodigo,
): Promise<void> {
  const host = t.origen === "panel" ? "panel" : "portal";
  if (p.ref === null) {
    // Rama del no invitado: mismo trabajo, sin efecto, con su fila de descarte (ADR-0002 respuesta neutra).
    await ctx.bd.query(
      `INSERT INTO identidad.accesos_log (host, ambito, evento) VALUES ($1, $2, 'codigo_descartado')`,
      [host, p.ambito],
    );
    await cerrar(ctx, t.id, { estado: "hecho" });
    return;
  }

  const sujeto =
    p.ambito === "cliente"
      ? await ctx.bd.query(`SELECT correo, activo FROM identidad.enlace_invitados WHERE id = $1`, [
          p.ref,
        ])
      : await ctx.bd.query(
          `SELECT correo, activo FROM identidad_panel.usuarios_panel WHERE id = $1`,
          [p.ref],
        );
  const fila = sujeto.rows[0] as { correo: string; activo: boolean } | undefined;
  if (!fila?.activo) {
    await ctx.bd.query(
      `INSERT INTO identidad.accesos_log (host, ambito, evento) VALUES ($1, $2, 'codigo_descartado')`,
      [host, p.ambito],
    );
    await cerrar(ctx, t.id, { estado: "hecho" });
    return;
  }

  const codigo = generarCodigo();
  const pepper = p.ambito === "cliente" ? ctx.peppers.cliente : ctx.peppers.panel;
  const esquema =
    p.ambito === "cliente"
      ? "identidad.guardar_codigo_cliente"
      : "identidad_panel.guardar_codigo_panel";
  const g = await ctx.bd.query(`SELECT ${esquema}($1, $2, $3) AS id`, [
    t.id,
    ctx.reclamo,
    hmacCodigo(codigo, pepper),
  ]);
  const codigoId = g.rows[0].id as string;

  const m = mensajeCodigo(p.ambito, codigo);
  const { resultado } = await ctx.correo.enviar({ para: fila.correo, asunto: m.asunto, texto: m.texto, html: m.html });

  const marcar =
    p.ambito === "cliente"
      ? "identidad.marcar_envio_codigo"
      : "identidad_panel.marcar_envio_codigo";
  await ctx.bd.query(`SELECT ${marcar}($1, $2)`, [codigoId, resultado]);
  await cerrarSegunResultado(ctx, t, resultado);
}

async function cerrarSegunResultado(
  ctx: ContextoDespacho,
  t: Trabajo,
  resultado: ResultadoEnvio,
): Promise<void> {
  if (resultado === "ok") {
    await cerrar(ctx, t.id, { estado: "hecho", sumarIntento: true });
    return;
  }
  const plan = planDeEnvioCodigo(t.intentos);
  if (plan.tipo === "abandonar") {
    await cerrar(ctx, t.id, { estado: "caducado", error: resultado, sumarIntento: true });
    return;
  }
  await cerrar(ctx, t.id, {
    estado: "pendiente",
    error: resultado,
    sumarIntento: true,
    enSegundos: plan.enSegundos,
  });
}

async function ejecutar(ctx: ContextoDespacho, t: Trabajo): Promise<void> {
  const permitido = await ctx.bd.query(`SELECT operacion.origen_permitido($1, $2) AS ok`, [
    t.tipo,
    t.origen,
  ]);
  if (!permitido.rows[0].ok) {
    ctx.registrar({
      evento: "alerta_seguridad",
      motivo: "origen_no_permitido",
      trabajo: t.id,
      tipo: t.tipo,
      origen: t.origen,
    });
    await cerrar(ctx, t.id, { estado: "fallando", error: "origen_no_permitido", nunca: true });
    return;
  }
  const esquema = ESQUEMAS_PAYLOAD[t.tipo as TipoConManejador];
  const payload = esquema.safeParse(t.payload);
  if (!payload.success) {
    ctx.registrar({
      evento: "trabajo_permanente",
      motivo: "payload_invalido",
      trabajo: t.id,
      tipo: t.tipo,
    });
    await cerrar(ctx, t.id, { estado: "fallando", error: "payload_invalido", nunca: true });
    return;
  }
  if (t.caduca_en && t.caduca_en.getTime() <= Date.now()) {
    await cerrar(ctx, t.id, { estado: "caducado", error: "vencido_en_cola" });
    return;
  }
  await enviarCodigo(ctx, t, payload.data);
}

// Una vuelta del bucle: reclama y ejecuta mientras haya trabajo; devuelve cuántos ejecutó.
export async function vuelta(ctx: ContextoDespacho, maximo = 50): Promise<number> {
  await ctx.bd.query(
    `INSERT INTO operacion.worker_ciclo (id, ultima_vuelta) VALUES (1, now())
     ON CONFLICT (id) DO UPDATE SET ultima_vuelta = excluded.ultima_vuelta`,
  );
  let hechos = 0;
  while (hechos < maximo) {
    const r = await ctx.bd.query(SQL_RECLAMAR, [ctx.reclamo, TIPOS]);
    const t = r.rows[0] as Trabajo | undefined;
    if (!t) break;
    try {
      await ejecutar(ctx, t);
    } catch (e) {
      ctx.registrar({
        evento: "trabajo_error",
        trabajo: t.id,
        tipo: t.tipo,
        error: (e as Error).message,
      });
      await cerrar(ctx, t.id, {
        estado: "pendiente",
        error: "transitorio",
        sumarIntento: true,
        enSegundos: 5,
      });
    }
    hechos++;
  }
  return hechos;
}
