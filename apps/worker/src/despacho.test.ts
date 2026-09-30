// Despacho de la cola y `enviar_codigo` (ADR-0009 §3, ADR-0002 H22, V9-10) contra PostgreSQL real
// con `ps_worker` por PgBouncer y el doble declarado de Mailgun.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type pg from "pg";
import { hmacCodigo } from "@ps/dominio/acceso/codigo";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { vuelta, type ContextoDespacho } from "./despacho";

const PEPPER_CLIENTE = "c".repeat(40);
const PEPPER_PANEL = "p".repeat(40);

describe.skipIf(!HAY_BD)("despacho de la cola (ADR-0009)", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;
  let invitadoId: string;
  let usuarioId: string;
  let correo: DobleCorreo;
  let alertas: Array<Record<string, unknown>>;
  let ctx: ContextoDespacho;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    const i = bd.instalacion;
    usuarioId = (
      await i.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', '\\x01', 'administrador') RETURNING id`,
      )
    ).rows[0].id;
    const enlaceId = (
      await i.query(
        `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, vigente_hasta, generado_por)
         VALUES ('hs-1', 'Cuenta', 'razón', now() + interval '30 days', $1) RETURNING id`,
        [usuarioId],
      )
    ).rows[0].id;
    invitadoId = (
      await i.query(
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'lider@cliente.com', '\\x02') RETURNING id`,
        [enlaceId],
      )
    ).rows[0].id;
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  beforeEach(async () => {
    await bd.instalacion.query(`DELETE FROM operacion.trabajos`);
    correo = new DobleCorreo();
    alertas = [];
    ctx = {
      bd: bd.como("ps_worker"),
      correo,
      peppers: { cliente: PEPPER_CLIENTE, panel: PEPPER_PANEL },
      reclamo: "prueba",
      registrar: (e) => {
        if (e.evento === "alerta_seguridad") alertas.push(e);
      },
    };
  });

  async function encolarCliente(ref: string | null): Promise<string> {
    const r = await portal.query(
      `SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb) AS id`,
      [JSON.stringify({ ref, ambito: "cliente" })],
    );
    return String(r.rows[0].id);
  }

  async function estado(id: string) {
    return (
      await bd.instalacion.query(
        `SELECT estado, intentos, ultimo_error FROM operacion.trabajos WHERE id = $1`,
        [id],
      )
    ).rows[0];
  }

  async function codigos() {
    return (
      await bd.instalacion.query(
        `SELECT codigo_hmac, invalidado_por_sistema, resultado_envio FROM identidad.codigos_cliente WHERE invitado_id = $1 ORDER BY emitido_en`,
        [invitadoId],
      )
    ).rows;
  }

  it("envía el código al invitado, guarda solo su HMAC y cierra el trabajo", async () => {
    await bd.instalacion.query(`DELETE FROM identidad.codigos_cliente`);
    const id = await encolarCliente(invitadoId);
    expect(await vuelta(ctx)).toBe(1);

    expect(correo.enviados).toHaveLength(1);
    const m = correo.enviados[0]!;
    expect(m.para).toBe("lider@cliente.com");
    const codigo = m.texto.match(/\b(\d{3}) (\d{3})\b/)?.slice(1).join("");
    expect(codigo).toBeDefined();
    const [c] = await codigos();
    expect(Buffer.compare(c.codigo_hmac, hmacCodigo(codigo!, PEPPER_CLIENTE))).toBe(0);
    expect(c.resultado_envio).toBe("ok");
    expect(await estado(id)).toMatchObject({ estado: "hecho" });
    // El código no viaja en claro por la cola.
    const t = await bd.instalacion.query(
      `SELECT payload::text p FROM operacion.trabajos WHERE id = $1`,
      [id],
    );
    expect(t.rows[0].p).not.toContain(codigo!);
    // El código no va en el asunto (no se lee en la notificación).
    expect(m.asunto).not.toMatch(/\d{3}/);
    expect(m.html).toContain(codigo!.slice(0, 3));
  });

  it("con ref nulo no envía nada y registra codigo_descartado", async () => {
    const id = await encolarCliente(null);
    await vuelta(ctx);
    expect(correo.enviados).toHaveLength(0);
    expect(await estado(id)).toMatchObject({ estado: "hecho" });
    const log = await bd.instalacion.query(
      `SELECT count(*)::int n FROM identidad.accesos_log WHERE evento = 'codigo_descartado'`,
    );
    expect(log.rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it("envío ambiguo: reintenta con código nuevo, que invalida el anterior (T-31: un solo código vigente)", async () => {
    await bd.instalacion.query(`DELETE FROM identidad.codigos_cliente`);
    correo.programar("ambiguo");
    const id = await encolarCliente(invitadoId);
    await vuelta(ctx);
    expect(await estado(id)).toMatchObject({ estado: "pendiente", intentos: 1 });
    await bd.instalacion.query(
      `UPDATE operacion.trabajos SET proximo_intento = now() WHERE id = $1`,
      [id],
    );
    await vuelta(ctx);
    expect(correo.enviados).toHaveLength(2);
    const [primero, segundo] = await codigos();
    expect(primero.invalidado_por_sistema).toBe(true);
    expect(primero.resultado_envio).toBe("ambiguo");
    expect(segundo.resultado_envio).toBe("ok");
    expect(await estado(id)).toMatchObject({ estado: "hecho" });
  });

  it("envío definitivo: el código de ese intento queda invalidado y se reintenta con otro", async () => {
    await bd.instalacion.query(`DELETE FROM identidad.codigos_cliente`);
    correo.programar("definitivo");
    const id = await encolarCliente(invitadoId);
    await vuelta(ctx);
    const [primero] = await codigos();
    expect(primero.invalidado_por_sistema).toBe(true);
    expect(await estado(id)).toMatchObject({ estado: "pendiente", ultimo_error: "definitivo" });
  });

  it("tras agotar los reintentos el trabajo caduca sin reenviar", async () => {
    correo.programar("ambiguo", "ambiguo", "ambiguo", "ambiguo");
    const id = await encolarCliente(invitadoId);
    for (let i = 0; i < 4; i++) {
      await bd.instalacion.query(
        `UPDATE operacion.trabajos SET proximo_intento = now() WHERE id = $1`,
        [id],
      );
      await vuelta(ctx);
    }
    expect(correo.enviados).toHaveLength(4);
    expect(await estado(id)).toMatchObject({ estado: "caducado" });
    await bd.instalacion.query(
      `UPDATE operacion.trabajos SET proximo_intento = now() WHERE id = $1`,
      [id],
    );
    expect(await vuelta(ctx)).toBe(0);
  });

  it("un trabajo que supera sus 10 minutos caduca sin enviarse", async () => {
    const id = await encolarCliente(invitadoId);
    await bd.instalacion.query(
      `UPDATE operacion.trabajos SET caduca_en = now() - interval '1 second' WHERE id = $1`,
      [id],
    );
    await vuelta(ctx);
    expect(correo.enviados).toHaveLength(0);
    expect(await estado(id)).toMatchObject({ estado: "caducado" });
  });

  it("envía el código del panel con el pepper del panel", async () => {
    await panel.query(`SELECT operacion.encolar_panel('enviar_codigo', $1::jsonb)`, [
      JSON.stringify({ ref: usuarioId, ambito: "panel" }),
    ]);
    await vuelta(ctx);
    const codigo = correo.enviados[0]!.texto.match(/\b(\d{3}) (\d{3})\b/)!.slice(1).join("");
    const r = await bd.instalacion.query(
      `SELECT codigo_hmac FROM identidad_panel.codigos_panel WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(Buffer.compare(r.rows[0].codigo_hmac, hmacCodigo(codigo, PEPPER_PANEL))).toBe(0);
    expect(correo.enviados[0]!.para).toBe("ana@trycore.com");
  });

  it("una fila con origen fuera de la lista de su tipo no se ejecuta: Permanente y alerta (V9-10)", async () => {
    // Insertada como dueño para simular una escritura que saltó las funciones de encolado.
    const r = await bd.instalacion.query(
      `INSERT INTO operacion.trabajos (tipo, origen, payload) VALUES ('enviar_codigo', 'worker', $1) RETURNING id`,
      [JSON.stringify({ ref: invitadoId, ambito: "cliente" })],
    );
    await vuelta(ctx);
    expect(correo.enviados).toHaveLength(0);
    expect(await estado(String(r.rows[0].id))).toMatchObject({
      estado: "fallando",
      ultimo_error: "origen_no_permitido",
    });
    expect(alertas).toHaveLength(1);
  });

  it("un payload que no cumple su esquema es Permanente sin ejecutarse", async () => {
    const r = await bd.instalacion.query(
      `INSERT INTO operacion.trabajos (tipo, origen, payload) VALUES ('enviar_codigo', 'portal', '{"ref": 5}') RETURNING id`,
    );
    await vuelta(ctx);
    expect(correo.enviados).toHaveLength(0);
    expect(await estado(String(r.rows[0].id))).toMatchObject({
      estado: "fallando",
      ultimo_error: "payload_invalido",
    });
  });

  it("los tipos sin manejador se dejan pendientes sin sumar intentos (N/N-1)", async () => {
    const r = await portal.query(
      `SELECT operacion.encolar_portal('crear_negocio', '{"solicitud_id":"s-1"}') AS id`,
    );
    expect(await vuelta(ctx)).toBe(0);
    expect(await estado(String(r.rows[0].id))).toMatchObject({ estado: "pendiente", intentos: 0 });
  });

  it("cada vuelta escribe worker_ciclo", async () => {
    await vuelta(ctx);
    const r = await bd.instalacion.query(
      `SELECT ultima_vuelta > now() - interval '5 seconds' AS reciente FROM operacion.worker_ciclo`,
    );
    expect(r.rows[0].reciente).toBe(true);
  });
});
