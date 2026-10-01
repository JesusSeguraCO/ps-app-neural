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
  type PayloadAplicarImportacion,
  type PayloadRevertirImportacion,
  type PayloadNotificar,
  type PayloadRenovarEnlace,
  type TipoConManejador,
} from "@ps/contratos/trabajos";
import { VIGENCIA_POR_OMISION_DIAS, generarTokenEnlace } from "@ps/dominio/enlaces/crear";
import { mensajeAvisoPeticion } from "@ps/dominio/enlaces/invitaciones";
import {
  decidirRenovacion,
  mensajeAvisoRenovacion,
  mensajeEnlaceRenovado,
} from "@ps/dominio/enlaces/renovacion";
import type { EnviadorCorreo } from "@ps/infra/mailgun/index";
import { abortarLote, aplicarLote, type OpcionesAplicar } from "@ps/infra/postgres/aplicar-importacion";
import { conAuditoria, type ClavesAuditoria } from "@ps/infra/postgres/auditoria";
import { liberarReversion, revertirLote } from "@ps/infra/postgres/revertir-importacion";

// Dependencias de la renovación del enlace vencido (HU-092, HU-146); sin ellas el worker no la reclama.
export interface ContextoRenovacion {
  portalOrigen: string; // PORTAL_ORIGEN
  correoTalentoHumano: string; // CORREO_TALENTO_HUMANO
  auditoria: ClavesAuditoria;
}

export interface ContextoDespacho {
  bd: pg.Pool;
  correo: EnviadorCorreo;
  peppers: { cliente: string; panel: string };
  reclamo: string;
  registrar: (evento: Record<string, unknown>) => void;
  renovacion?: ContextoRenovacion;
  // Aplicar importaciones (HU-141, I-2); sin ellas el worker no las reclama.
  importacion?: { auditoria: ClavesAuditoria; opciones?: Partial<OpcionesAplicar> };
}

interface Trabajo {
  id: string;
  tipo: string;
  origen: string;
  payload: unknown;
  intentos: number;
  caduca_en: Date | null;
}

const tiposDe = (ctx: ContextoDespacho): TipoConManejador[] => [
  "enviar_codigo",
  ...(ctx.renovacion ? (["renovar_enlace", "notificar"] as const) : []),
  ...(ctx.importacion ? (["aplicar_importacion", "revertir_importacion"] as const) : []),
];

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
    // El intento que se anotó al empezar no cuenta (candado de la importación tomado, I-2).
    devolverIntento?: boolean;
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
      cambio.sumarIntento ? 1 : cambio.devolverIntento ? -1 : 0,
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

// Renovación del enlace vencido (HU-092, HU-146, design §2). Sin HubSpot desde el 2026-09-29 (sponsor):
// un correo invitado recibe el enlace nuevo solo en su buzón; a quien no estaba invitado no se le envía
// nada. En ambos casos Talento Humano recibe el aviso y la petición queda en la bandeja del panel. Lo
// que ve quien pide (`publico`) es siempre «automatica»: nunca revela si el correo estaba invitado.
async function renovarEnlace(ctx: ContextoDespacho, t: Trabajo, p: PayloadRenovarEnlace): Promise<void> {
  const deps = ctx.renovacion!;
  const r = await ctx.bd.query(
    `SELECT r.enlace_id, r.correo_hmac, r.correo, r.pedida_en, r.resultado, e.cuenta_nombre, e.proyecto, e.codigo,
            e.estado, e.vigente_hasta
       FROM identidad.renovaciones r JOIN identidad.enlaces e ON e.id = r.enlace_id WHERE r.id = $1`,
    [p.renovacion],
  );
  const f = r.rows[0];
  if (!f || f.resultado) {
    await cerrar(ctx, t.id, { estado: "hecho" });
    return;
  }
  const marcar = (entrega: "enviado" | "fallido" | null, avisado: boolean) =>
    ctx.bd.query(`SELECT identidad.marcar_entrega_renovacion($1, $2, $3, $4, $5)`, [
      t.id,
      ctx.reclamo,
      p.renovacion,
      entrega,
      avisado,
    ]);
  const vencido = f.estado === "activo" && (f.vigente_hasta as Date).getTime() <= Date.now();
  if (!vencido) {
    // Revocado (o renovado por otra vía) antes de procesarse: Talento Humano ya actuó sobre el enlace.
    await ctx.bd.query(`SELECT identidad.resolver_renovacion($1, $2, $3, 'sin_efecto', 'automatica')`, [
      t.id,
      ctx.reclamo,
      p.renovacion,
    ]);
    await cerrar(ctx, t.id, { estado: "hecho" });
    return;
  }
  const i = await ctx.bd.query(
    `SELECT id, correo, activo FROM identidad.enlace_invitados WHERE enlace_id = $1 AND correo_hmac = $2`,
    [f.enlace_id, f.correo_hmac],
  );
  const inv = i.rows[0] as { id: string; correo: string; activo: boolean } | undefined;
  const decision = decidirRenovacion(Boolean(inv?.activo));
  const correoPide = (f.correo as string | null) ?? inv?.correo ?? "(correo no registrado)";

  let codigoNuevo: string | null = null;
  let entrega: "enviado" | "fallido" | null = null;
  if (decision.emitir) {
    const { token, hash } = generarTokenEnlace();
    const vigenteHasta = new Date(Date.now() + VIGENCIA_POR_OMISION_DIAS * 86_400_000);
    const nuevo = await conAuditoria(ctx.bd, deps.auditoria, async (tx) => {
      const e = await tx.query(`SELECT identidad.emitir_renovacion($1, $2, $3, $4, $5, $6) AS id`, [
        t.id,
        ctx.reclamo,
        p.renovacion,
        inv!.id,
        hash,
        vigenteHasta,
      ]);
      const id = e.rows[0].id as string;
      const cambio = (campo: string, despues: string) => ({
        actor: "worker",
        entidad: "enlaces",
        entidadId: id,
        campo,
        antes: null,
        despues,
        origen: "worker" as const,
      });
      return {
        resultado: id,
        cambios: [
          cambio("renovado_de", f.codigo),
          cambio("invitados", inv!.correo),
          cambio("vigente_hasta", vigenteHasta.toISOString()),
        ],
      };
    });
    const c = await ctx.bd.query(`SELECT codigo FROM identidad.enlaces WHERE id = $1`, [nuevo]);
    codigoNuevo = c.rows[0].codigo as string;
    const m = mensajeEnlaceRenovado({
      url: `${deps.portalOrigen}/e/#t=${token}`,
      cuenta: f.cuenta_nombre,
      proyecto: f.proyecto,
      correo: inv!.correo,
      venceEl: vigenteHasta,
    });
    const { resultado } = await ctx.correo.enviar({ para: inv!.correo, asunto: m.asunto, texto: m.texto, html: m.html });
    entrega = resultado === "ok" ? "enviado" : "fallido";
    if (resultado !== "ok") ctx.registrar({ evento: "alerta_renovacion", motivo: `envio_${resultado}`, enlace: nuevo });
  } else {
    await ctx.bd.query(`SELECT identidad.resolver_renovacion($1, $2, $3, 'no_invitado', 'automatica')`, [
      t.id,
      ctx.reclamo,
      p.renovacion,
    ]);
  }

  const aviso = mensajeAvisoRenovacion({
    resultado: decision.resultado,
    cuenta: f.cuenta_nombre,
    proyecto: f.proyecto,
    codigoEnlace: f.codigo,
    codigoNuevo,
    correo: correoPide,
    pedidaEn: f.pedida_en,
  });
  const a = await ctx.correo.enviar({ para: deps.correoTalentoHumano, asunto: aviso.asunto, texto: aviso.texto, html: aviso.html });
  if (a.resultado !== "ok") ctx.registrar({ evento: "alerta_renovacion", motivo: `aviso_${a.resultado}`, renovacion: p.renovacion });
  await marcar(entrega, a.resultado === "ok");
  await cerrar(ctx, t.id, { estado: "hecho", sumarIntento: true });
}

// Aviso a Talento Humano de una petición de invitación nueva (HU-095, `notificar` de ADR-0006/0009).
async function notificar(ctx: ContextoDespacho, t: Trabajo, p: PayloadNotificar): Promise<void> {
  const deps = ctx.renovacion!;
  const r = await ctx.bd.query(
    `SELECT s.correo_propuesto, s.nombre_propuesto, s.para_que, s.estado, i.correo AS pide, e.codigo, e.cuenta_nombre, e.proyecto
       FROM identidad.invitaciones_solicitadas s
       JOIN identidad.enlace_invitados i ON i.id = s.solicitado_por
       JOIN identidad.enlaces e ON e.id = s.enlace_id
      WHERE s.id = $1`,
    [p.ref],
  );
  const f = r.rows[0];
  if (!f || f.estado !== "pendiente") {
    await cerrar(ctx, t.id, { estado: "hecho" });
    return;
  }
  const m = mensajeAvisoPeticion({
    pide: f.pide,
    correo: f.correo_propuesto,
    nombre: f.nombre_propuesto,
    paraQue: f.para_que,
    enlace: [f.codigo, f.cuenta_nombre, f.proyecto].filter(Boolean).join(" · "),
  });
  const { resultado } = await ctx.correo.enviar({ para: deps.correoTalentoHumano, asunto: m.asunto, texto: m.texto, html: m.html });
  await cerrarSegunResultado(ctx, t, resultado);
}

// Aplicar un lote confirmado (HU-141; contrato I-2 de ADR-0003). Un solo intento, sin reintento
// automático: el intento se anota antes de empezar, así un reclamo que lo retome tras un arrendamiento
// vencido sabe que el proceso anterior murió y no reaplica (si el lote ya quedó `aplicado`, cierra
// `hecho`; si no, lo deja `abortado`). Candado tomado → vuelve a la cola en 1 min sin gastar el intento.
// Abortado → el trabajo queda `fallando` sin próximo intento: reintentar es un acto de la persona.
async function aplicarImportacion(
  ctx: ContextoDespacho,
  t: Trabajo,
  p: PayloadAplicarImportacion,
): Promise<void> {
  const deps = ctx.importacion!;
  const anotado = await ctx.bd.query(
    `UPDATE operacion.trabajos SET intentos = intentos + 1 WHERE id = $1 AND locked_by = $2 RETURNING intentos`,
    [t.id, ctx.reclamo],
  );
  if (!anotado.rows[0]) return;
  if (anotado.rows[0].intentos > 1) {
    const l = await ctx.bd.query(`SELECT estado FROM inventario.lotes_importacion WHERE id = $1`, [p.lote]);
    if (l.rows[0]?.estado === "aplicado") {
      await cerrar(ctx, t.id, { estado: "hecho" });
      return;
    }
    await abortarLote(ctx.bd, p.lote, "interrumpido");
    ctx.registrar({ evento: "importacion_abortada", lote: p.lote, motivo: "interrumpido" });
    await cerrar(ctx, t.id, { estado: "fallando", error: "interrumpido", nunca: true });
    return;
  }
  const r = await aplicarLote(ctx.bd, deps.auditoria, p.lote, {
    hoy: new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10),
    ...deps.opciones,
  });
  if (r.tipo === "ocupado") {
    await cerrar(ctx, t.id, { estado: "pendiente", devolverIntento: true, enSegundos: 60 });
    return;
  }
  if (r.tipo === "abortado") {
    ctx.registrar({ evento: "importacion_abortada", lote: p.lote, motivo: r.motivo });
    await cerrar(ctx, t.id, { estado: "fallando", error: r.motivo, nunca: true });
    return;
  }
  ctx.registrar({ evento: "importacion_aplicada", lote: p.lote, ...r });
  await cerrar(ctx, t.id, { estado: "hecho" });
}

// Revertir la última importación (HU-087): mismo contrato I-2 que aplicar. Si no se pudo (otra
// importación después, una regla de la BD, el proceso murió), el lote sigue aplicado con el motivo y
// la persona puede volver a confirmarla.
async function revertirImportacion(
  ctx: ContextoDespacho,
  t: Trabajo,
  p: PayloadRevertirImportacion,
): Promise<void> {
  const deps = ctx.importacion!;
  const anotado = await ctx.bd.query(
    `UPDATE operacion.trabajos SET intentos = intentos + 1 WHERE id = $1 AND locked_by = $2 RETURNING intentos`,
    [t.id, ctx.reclamo],
  );
  if (!anotado.rows[0]) return;
  const fallar = async (motivo: string) => {
    await liberarReversion(ctx.bd, p.lote, motivo);
    ctx.registrar({ evento: "reversion_fallida", lote: p.lote, motivo });
    await cerrar(ctx, t.id, { estado: "fallando", error: motivo, nunca: true });
  };
  if (anotado.rows[0].intentos > 1) {
    const l = await ctx.bd.query(`SELECT estado FROM inventario.lotes_importacion WHERE id = $1`, [p.lote]);
    if (l.rows[0]?.estado === "revertido") await cerrar(ctx, t.id, { estado: "hecho" });
    else await fallar("interrumpido");
    return;
  }
  const r = await revertirLote(ctx.bd, deps.auditoria, p.lote, p.incluir);
  if (r.tipo === "ocupado") {
    await cerrar(ctx, t.id, { estado: "pendiente", devolverIntento: true, enSegundos: 60 });
    return;
  }
  if (r.tipo === "rechazado") {
    await fallar(r.motivo);
    return;
  }
  ctx.registrar({ evento: "importacion_revertida", lote: p.lote, ...r });
  await cerrar(ctx, t.id, { estado: "hecho" });
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
  if (t.tipo === "revertir_importacion")
    await revertirImportacion(ctx, t, payload.data as PayloadRevertirImportacion);
  else if (t.tipo === "aplicar_importacion")
    await aplicarImportacion(ctx, t, payload.data as PayloadAplicarImportacion);
  else if (t.tipo === "renovar_enlace") await renovarEnlace(ctx, t, payload.data as PayloadRenovarEnlace);
  else if (t.tipo === "notificar") await notificar(ctx, t, payload.data as PayloadNotificar);
  else await enviarCodigo(ctx, t, payload.data as PayloadEnviarCodigo);
}

// Una vuelta del bucle: reclama y ejecuta mientras haya trabajo; devuelve cuántos ejecutó.
export async function vuelta(ctx: ContextoDespacho, maximo = 50): Promise<number> {
  await ctx.bd.query(
    `INSERT INTO operacion.worker_ciclo (id, ultima_vuelta) VALUES (1, now())
     ON CONFLICT (id) DO UPDATE SET ultima_vuelta = excluded.ultima_vuelta`,
  );
  let hechos = 0;
  while (hechos < maximo) {
    const r = await ctx.bd.query(SQL_RECLAMAR, [ctx.reclamo, tiposDe(ctx)]);
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
