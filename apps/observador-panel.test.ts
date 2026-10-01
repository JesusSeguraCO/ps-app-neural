// Rol observador (EP-006 · sub-slice 9: HU-124) contra el servidor standalone real del panel (`ps_panel`)
// y el worker: consulta el inventario, los enlaces y los colocados sin controles de escritura; llegar por
// una dirección de edición o pedir una acción reservada se rechaza explicando que su rol es de consulta y
// queda como `acceso_rechazado` en el registro de accesos (sin fila de cambio en el recurso); «Avisar»
// encola `notificar` y el worker le escribe a Talento Humano con el perfil identificado.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DobleCorreo } from "@ps/infra/mailgun/index";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import {
  arrancarServidor,
  entornoDev,
  hayBuild,
  type ServidorPrueba,
} from "@ps/infra/pruebas/servidor-next";
import { vuelta, type ContextoDespacho } from "./worker/src/despacho";
import { sembrarFicticios } from "./worker/src/sembrar-ficticios";

const TALENTO = "talento.humano@trycore.com";

describe.skipIf(!HAY_BD || !hayBuild("panel"))("Observador en el panel (HU-124)", () => {
  let bd: BdPrueba;
  let panel: ServidorPrueba;
  let admin: string;
  let observador: string;
  let observadorId: string;
  let codigo: string;
  let correo: DobleCorreo;
  let ctx: ContextoDespacho;
  const workerEnv = entornoDev("worker");
  const csrf = randomBytes(16).toString("hex");

  const sesion = async (correoU: string, rol: "administrador" | "observador") => {
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
      [correoU, randomBytes(32), rol],
    );
    const id = randomBytes(32).toString("base64url");
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
      [createHash("sha256").update(id).digest(), u.rows[0].id],
    );
    return { cookie: `__Host-pp=${id}`, id: u.rows[0].id as string };
  };
  const pedir = (ruta: string, cuerpo: unknown, cookie = observador) =>
    panel.pedir(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: {
        "content-type": "application/json",
        origin: panel.url,
        "x-ps-csrf": csrf,
        cookie: `__Host-csrf=${csrf}; ${cookie}`,
      },
    });
  const pagina = async (ruta: string, cookie = observador) =>
    (await panel.pedir(ruta, { headers: { cookie } })).text();
  const rechazos = async () =>
    (
      await bd.instalacion.query(
        `SELECT usuario_id, accion, recurso FROM identidad.accesos_log
          WHERE evento = 'acceso_rechazado' ORDER BY id`,
      )
    ).rows as Array<{ usuario_id: string; accion: string; recurso: string }>;
  const cambiosDe = async (c: string) =>
    (
      await bd.instalacion.query(
        `SELECT count(*)::int AS n FROM auditoria.auditoria WHERE titular = $1`,
        [c],
      )
    ).rows[0].n as number;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
    await sembrarFicticios({
      bd: bd.como("ps_worker"),
      auditoria: { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! },
      appEnv: "ci",
      registrar: () => {},
    });
    admin = (await sesion("karen@trycore.com", "administrador")).cookie;
    const o = await sesion("mirar@trycore.com", "observador");
    observador = o.cookie;
    observadorId = o.id;
    codigo = (
      await bd.instalacion.query(
        `SELECT codigo FROM inventario.perfiles WHERE estado = 'publicado' ORDER BY codigo LIMIT 1`,
      )
    ).rows[0].codigo;
    panel = await arrancarServidor("panel", entorno);
  }, 120_000);

  beforeEach(() => {
    correo = new DobleCorreo();
    ctx = {
      bd: bd.como("ps_worker"),
      correo,
      peppers: { cliente: workerEnv.OTP_PEPPER_CLIENTE!, panel: workerEnv.OTP_PEPPER_PANEL! },
      reclamo: `prueba-${randomBytes(3).toString("hex")}`,
      registrar: () => {},
      renovacion: {
        portalOrigen: "https://people.trycore.com",
        correoTalentoHumano: TALENTO,
        auditoria: { hmac: workerEnv.AUDIT_HMAC_KEY!, kek: workerEnv.AUDIT_KEK! },
      },
    };
  });

  afterAll(async () => {
    await panel?.cerrar();
    await bd?.cerrar();
  });

  it("consulta completa: inventario, enlaces y colocados sin controles de edición, publicación ni importación", async () => {
    const inventario = await pagina("/inventario");
    expect(inventario).toContain("¿Dato desactualizado?");
    expect(inventario).toContain(`Avisar a Talento Humano sobre el perfil de`);
    expect(inventario).toContain(`href="/inventario/${codigo}?vista=ficha"`);
    for (const control of [
      "Crear perfil",
      "Editar el perfil",
      "Más acciones para",
      "Seleccionar a ",
    ])
      expect(inventario, control).not.toContain(control);
    const enlaces = await pagina("/enlaces");
    expect(enlaces).toContain("Enlaces");
    expect(enlaces).not.toContain('href="/enlaces/nuevo"');
    const colocados = await pagina("/colocados");
    expect(colocados).toContain("Colocados");
    expect(colocados).not.toContain("Registrar colocado");
    expect(colocados).not.toContain("Cargar archivo de Operaciones");
    const importar = await pagina("/importar");
    expect(importar).not.toContain('type="file"');
    // Ninguna de estas consultas es un intento de escritura.
    expect(await rechazos()).toEqual([]);
  });

  it("por la dirección de edición: formulario inerte, «tu rol es de consulta», intento registrado y sin cambio en el perfil", async () => {
    const antes = await cambiosDe(codigo);
    const html = await pagina(`/inventario/${codigo}`);
    expect(html).toContain("Tu rol es de consulta.");
    expect(html).toContain("Llegaste por la dirección de edición de");
    expect(html).toContain("Avisar a Talento Humano");
    expect(html).toMatch(/<fieldset[^>]*disabled/);
    expect(await rechazos()).toEqual([
      { usuario_id: observadorId, accion: "perfil.escribir", recurso: `GET /inventario/${codigo}` },
    ]);
    expect(await cambiosDe(codigo)).toBe(antes);
    // La vista de la ficha es consulta: no se registra.
    const ficha = await pagina(`/inventario/${codigo}?vista=ficha`);
    expect(ficha).toContain("Ver los datos del perfil");
    expect(await rechazos()).toHaveLength(1);
    // La administradora no ve el aviso de consulta.
    expect(await pagina(`/inventario/${codigo}`, admin)).not.toContain("Tu rol es de consulta.");
    expect(await rechazos()).toHaveLength(1);
  });

  it("crear un perfil o generar un enlace por su dirección: rechazado, explicado y registrado", async () => {
    const r = await panel.pedir("/inventario/nuevo", {
      headers: { cookie: observador },
      redirect: "manual",
    });
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toMatch(/\/inventario\?rechazado=nuevo$/);
    expect(await pagina("/inventario?rechazado=nuevo")).toContain(
      "Llegaste por la dirección para crear un perfil",
    );
    expect(await pagina("/enlaces/nuevo")).toContain(
      "Llegaste por la dirección para generar un enlace",
    );
    expect((await rechazos()).slice(-2).map((x) => [x.accion, x.recurso])).toEqual([
      ["perfil.escribir", "GET /inventario/nuevo"],
      ["enlaces.generar", "GET /enlaces/nuevo"],
    ]);
  });

  it("una acción reservada por la API: 403 con «tu rol es de consulta» y queda registrada con la acción y el recurso", async () => {
    const r = await pedir("/api/v1/colocados", {
      codigo,
      cuenta: "X",
      inicio: null,
      liberacion: "2099-01-01",
    });
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({
      motivo: "sin_permiso",
      mensaje: "Tu rol es de consulta: no se cambió nada y el intento quedó en la auditoría.",
    });
    expect((await rechazos()).at(-1)).toEqual({
      usuario_id: observadorId,
      accion: "colocados.escribir",
      recurso: "POST /api/v1/colocados",
    });
  });

  it("«Avisar»: 202, encola `notificar` y el worker le escribe a Talento Humano con el perfil identificado", async () => {
    const r = await pedir(`/api/v1/perfiles/${codigo}/avisar`, {
      nota: "Ya terminó su asignación en <Bancolombia>",
    });
    expect(r.status).toBe(202);
    const t = (
      await bd.instalacion.query(
        `SELECT origen, payload FROM operacion.trabajos WHERE tipo = 'notificar' ORDER BY id DESC LIMIT 1`,
      )
    ).rows[0];
    expect(t).toEqual({
      origen: "panel",
      payload: {
        motivo: "dato_desactualizado",
        codigo,
        usuario: observadorId,
        nota: "Ya terminó su asignación en <Bancolombia>",
      },
    });
    expect(await vuelta(ctx)).toBeGreaterThanOrEqual(1);
    const estado = (
      await bd.instalacion.query(
        `SELECT estado, ultimo_error FROM operacion.trabajos WHERE tipo = 'notificar' ORDER BY id DESC LIMIT 1`,
      )
    ).rows[0];
    expect(estado).toEqual({ estado: "hecho", ultimo_error: null });
    const m = correo.enviados.find((x) => x.para === TALENTO)!;
    expect(m.asunto).toMatch(new RegExp(`\\(${codigo}\\)$`));
    expect(m.texto).toContain(`mirar@trycore.com avisa que el perfil de`);
    expect(m.texto).toContain("Lo que vio: Ya terminó su asignación en <Bancolombia>");
    expect(m.html).not.toContain("<Bancolombia>");
    expect((await pedir("/api/v1/perfiles/PS-9999/avisar", {})).status).toBe(404);
  });

  it("el panel solo encola `notificar` con el motivo del observador y un código de perfil", async () => {
    const p = bd.como("ps_panel");
    await expect(
      p.query(
        `SELECT operacion.encolar_panel('notificar', '{"motivo":"invitacion_solicitada","ref":"x"}'::jsonb)`,
      ),
    ).rejects.toThrow(/motivo o perfil no permitido/);
    await expect(
      p.query(
        `SELECT operacion.encolar_panel('notificar', '{"motivo":"dato_desactualizado","codigo":"X"}'::jsonb)`,
      ),
    ).rejects.toThrow(/motivo o perfil no permitido/);
  });
});
