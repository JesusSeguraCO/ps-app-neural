// Confirmar y seguir una importación (EP-006 · sub-slice 4, tarea 4.1; HU-141; contrato I-2) contra el
// servidor standalone real del panel (`ps_panel`) y el despacho real del worker (`ps_worker`): el panel
// confirma (202) y no escribe en `perfiles`; el worker aplica; el panel sigue la fase del lote.
import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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

describe.skipIf(!HAY_BD || !hayBuild("panel"))(
  "Confirmar una importación desde el panel (HU-141, I-2)",
  () => {
    let bd: BdPrueba;
    let panel: ServidorPrueba;
    let ctx: ContextoDespacho;
    let admin: string;
    let observador: string;
    const csrf = randomBytes(16).toString("hex");

    const sesion = async (correo: string, rol: "administrador" | "observador") => {
      const u = await bd.instalacion.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, $3) RETURNING id`,
        [correo, randomBytes(32), rol],
      );
      const id = randomBytes(32).toString("base64url");
      await bd.instalacion.query(
        `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ($1, $2, now() + interval '12 hours')`,
        [createHash("sha256").update(id).digest(), u.rows[0].id],
      );
      return `__Host-pp=${id}`;
    };
    const enviar = (ruta: string, cuerpo: unknown, cookie = admin) =>
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
    const leerLote = async (id: string, cookie = admin) =>
      panel.pedir(`/api/v1/importacion/lotes/${id}`, { headers: { cookie } });
    const calcular = async (texto: string) => {
      const r = await enviar("/api/v1/importacion/lotes", {
        texto,
        formato: "tsv",
        modo: "crear_y_actualizar",
        columnas: texto
          .split("\n")[0]!
          .split("\t")
          .map((columna) => ({ columna, clave: columna === "Código" ? "codigo" : "anclaje" })),
      });
      expect(r.status).toBe(201);
      return ((await r.json()) as { loteId: string }).loteId;
    };
    const anclaje = async (codigo: string) =>
      (
        await bd.instalacion.query(`SELECT anclaje FROM inventario.perfiles WHERE codigo = $1`, [
          codigo,
        ])
      ).rows[0].anclaje;

    beforeAll(async () => {
      bd = await crearBdPrueba();
      const entorno = { ...entornoDev("panel"), APP_ENV: "ci", DATABASE_URL: bd.urlDe("ps_panel") };
      const auditoria = { hmac: entorno.AUDIT_HMAC_KEY!, kek: entorno.AUDIT_KEK! };
      const worker = bd.como("ps_worker");
      await sembrarFicticios({ bd: worker, auditoria, appEnv: "ci", registrar: () => {} });
      admin = await sesion("karen@trycore.com", "administrador");
      observador = await sesion("mirar@trycore.com", "observador");
      panel = await arrancarServidor("panel", entorno);
      ctx = {
        bd: worker,
        correo: new DobleCorreo(),
        peppers: { cliente: "c".repeat(40), panel: "p".repeat(40) },
        reclamo: "prueba",
        registrar: () => {},
        importacion: { auditoria },
      };
    }, 120_000);

    afterAll(async () => {
      await panel?.cerrar();
      await bd?.cerrar();
    });

    it("confirmar devuelve 202 con el trabajo, el panel no escribe y el lote queda «aplicando»", async () => {
      const id = await calcular("Código\tAnclaje\nPS-0160\tConfirmado desde el panel");
      const antes = await anclaje("PS-0160");
      const r = await enviar(`/api/v1/importacion/lotes/${id}/aplicar`, {});
      expect(r.status).toBe(202);
      const { trabajoId } = await r.json();
      expect(trabajoId).toMatch(/^\d+$/);
      // Confirmar otra vez (doble clic) devuelve el mismo trabajo.
      const otra = await enviar(`/api/v1/importacion/lotes/${id}/aplicar`, {});
      expect(otra.status).toBe(202);
      expect((await otra.json()).trabajoId).toBe(trabajoId);
      expect(await anclaje("PS-0160")).toBe(antes);
      const l = await (await leerLote(id)).json();
      expect(l.lote).toMatchObject({ fase: "aplicando", confirmadoPor: "karen@trycore.com" });

      // El worker aplica; el panel ve el resultado (también la observadora).
      await vuelta(ctx);
      expect(await anclaje("PS-0160")).toBe("Confirmado desde el panel");
      const aplicado = await (await leerLote(id, observador)).json();
      expect(aplicado.lote.fase).toBe("aplicado");
      expect(aplicado.lote.aplicadoEn).not.toBeNull();
    });

    it("la observadora no confirma (403); reconfirmar un aplicado no lo reencola; sin cambios → 422", async () => {
      const id = await calcular("Código\tAnclaje\nPS-0187\tNo lo confirma la observadora");
      expect((await enviar(`/api/v1/importacion/lotes/${id}/aplicar`, {}, observador)).status).toBe(
        403,
      );
      expect((await enviar(`/api/v1/importacion/lotes/${id}/aplicar`, {})).status).toBe(202);
      await vuelta(ctx);
      // El lote ya aplicado no vuelve a encolarse: devuelve su trabajo (idempotente).
      const trabajos = async () =>
        (await bd.instalacion.query(`SELECT count(*)::int AS n FROM operacion.trabajos`)).rows[0].n;
      const n = await trabajos();
      expect((await enviar(`/api/v1/importacion/lotes/${id}/aplicar`, {})).status).toBe(202);
      expect(await trabajos()).toBe(n);
      const sinCambios = await calcular("Código\tAnclaje\nPS-0187\t");
      const r = await enviar(`/api/v1/importacion/lotes/${sinCambios}/aplicar`, {});
      expect(r.status).toBe(422);
      expect((await r.json()).motivo).toBe("nada_que_aplicar");
    });

    it("un lote que no existe → 404", async () => {
      const r = await enviar("/api/v1/importacion/lotes/00000000-0000-4000-8000-000000000000/aplicar", {});
      expect(r.status).toBe(404);
      expect((await leerLote("00000000-0000-4000-8000-000000000000")).status).toBe(404);
    });
  },
);
