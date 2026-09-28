// V2-2 (aislamiento en BD, parte de identidad y cola) y V9-10 (origen de los trabajos) con roles
// reales por PgBouncer en modo transacción, sin superusuario (ADR-0002 «H0», ADR-0009).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import {
  EXCEPCION,
  HAY_BD,
  PERMISO_DENEGADO,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../../test/bd-prueba";

describe.skipIf(!HAY_BD)("permisos de identidad y cola (V2-2, V9-10)", () => {
  let bd: BdPrueba;
  let portal: pg.Pool;
  let panel: pg.Pool;
  let worker: pg.Pool;
  let enlaceId: string;
  let invitadoId: string;
  let usuarioPanelId: string;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    portal = bd.como("ps_portal");
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
    // Datos sembrados por la instalación (como dueño), no por los roles bajo prueba.
    const i = bd.instalacion;
    usuarioPanelId = (
      await i.query(
        `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', '\\x01', 'administrador') RETURNING id`,
      )
    ).rows[0].id;
    enlaceId = (
      await i.query(
        `INSERT INTO identidad.enlaces (cuenta_ref, cuenta_nombre, razon, codigos_perfil, vigente_hasta, generado_por)
         VALUES ('hs-1', 'Cuenta Uno', 'razón', ARRAY['P-1'], now() + interval '30 days', $1) RETURNING id`,
        [usuarioPanelId],
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

  describe("el portal no alcanza la identidad del panel", () => {
    it("SELECT en identidad_panel → permiso denegado", async () => {
      expect(
        await codigoDeError(portal.query("SELECT * FROM identidad_panel.usuarios_panel")),
      ).toBe(PERMISO_DENEGADO);
    });
    it("INSERT de una sesión del panel → permiso denegado", async () => {
      expect(
        await codigoDeError(
          portal.query(
            `INSERT INTO identidad_panel.sesiones_panel (id_hash, usuario_id, expira) VALUES ('\\x00', $1, now())`,
            [usuarioPanelId],
          ),
        ),
      ).toBe(PERMISO_DENEGADO);
    });
  });

  describe("el portal solo lee enlaces e invitados", () => {
    it.each([
      [
        `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'x@y.com', '\\x03')`,
      ],
      [`UPDATE identidad.enlaces SET razon = 'otra' WHERE id = $1`],
      [`INSERT INTO identidad.enlace_tokens (enlace_id, token_hash) VALUES ($1, '\\x04')`],
    ])("%s → permiso denegado", async (sentencia) => {
      expect(await codigoDeError(portal.query(sentencia, [enlaceId]))).toBe(PERMISO_DENEGADO);
    });
    it("SELECT de enlaces e invitados → permitido", async () => {
      const r = await portal.query(
        "SELECT e.id FROM identidad.enlaces e JOIN identidad.enlace_invitados i ON i.enlace_id = e.id",
      );
      expect(r.rowCount).toBe(1);
    });
  });

  describe("accesos_log por host (RLS)", () => {
    it("el portal escribe con host=portal", async () => {
      await portal.query(
        `INSERT INTO identidad.accesos_log (host, ambito, evento) VALUES ('portal', 'cliente', 'codigo_pedido')`,
      );
    });
    it("el portal no escribe con host=panel", async () => {
      expect(
        await codigoDeError(
          portal.query(
            `INSERT INTO identidad.accesos_log (host, ambito, evento) VALUES ('panel', 'panel', 'codigo_pedido')`,
          ),
        ),
      ).toBe(PERMISO_DENEGADO);
    });
    it("el worker solo escribe codigo_descartado", async () => {
      await worker.query(
        `INSERT INTO identidad.accesos_log (host, ambito, evento) VALUES ('portal', 'cliente', 'codigo_descartado')`,
      );
      expect(
        await codigoDeError(
          worker.query(
            `INSERT INTO identidad.accesos_log (host, ambito, evento) VALUES ('portal', 'cliente', 'verificacion_ok')`,
          ),
        ),
      ).toBe(PERMISO_DENEGADO);
    });
  });

  describe("sin DELETE directo en tablas transitorias", () => {
    it.each([
      ["ps_portal", "DELETE FROM identidad.sesiones_portal"],
      ["ps_portal", "DELETE FROM identidad.codigos_cliente"],
      ["ps_panel", "DELETE FROM identidad_panel.sesiones_panel"],
      ["ps_panel", "DELETE FROM identidad_panel.codigos_panel"],
      ["ps_worker", "DELETE FROM identidad.codigos_cliente"],
      ["ps_worker", "DELETE FROM identidad.accesos_log"],
    ] as const)("%s: %s → permiso denegado", async (rol, sentencia) => {
      const p = rol === "ps_portal" ? portal : rol === "ps_panel" ? panel : worker;
      expect(await codigoDeError(p.query(sentencia))).toBe(PERMISO_DENEGADO);
    });
    it("el portal no inserta códigos directamente", async () => {
      expect(
        await codigoDeError(
          portal.query(
            `INSERT INTO identidad.codigos_cliente (invitado_id, codigo_hmac, expira_en) VALUES ($1, '\\x05', now())`,
            [invitadoId],
          ),
        ),
      ).toBe(PERMISO_DENEGADO);
    });
  });

  describe("cerrar_sesion borra solo la fila de ese hash", () => {
    it("como ps_portal", async () => {
      await bd.instalacion.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ('\\xaa', $1, $2, now() + interval '1 day'), ('\\xbb', $1, $2, now() + interval '1 day')`,
        [enlaceId, invitadoId],
      );
      await portal.query(`SELECT identidad.cerrar_sesion('\\xaa')`);
      await portal.query(`SELECT identidad.cerrar_sesion('\\xcc')`);
      const quedan = await bd.instalacion.query(
        `SELECT encode(id_hash, 'hex') h FROM identidad.sesiones_portal ORDER BY 1`,
      );
      expect(quedan.rows.map((r) => r.h)).toEqual(["bb"]);
    });
  });

  describe("encolado solo por las funciones y con lista blanca (V9-10)", () => {
    it("INSERT directo en trabajos → permiso denegado para portal, panel y worker", async () => {
      for (const p of [portal, panel, worker]) {
        expect(
          await codigoDeError(
            p.query(
              `INSERT INTO operacion.trabajos (tipo, origen, payload) VALUES ('enviar_codigo', 'portal', '{}')`,
            ),
          ),
        ).toBe(PERMISO_DENEGADO);
      }
    });
    it("UPDATE directo en trabajos desde el portal → permiso denegado", async () => {
      expect(
        await codigoDeError(portal.query(`UPDATE operacion.trabajos SET estado = 'hecho'`)),
      ).toBe(PERMISO_DENEGADO);
    });
    it("encolar_portal('enviar_codigo') con ref invitado activo deja origen portal", async () => {
      const r = await portal.query(
        `SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb) AS id`,
        [JSON.stringify({ ref: invitadoId, ambito: "cliente" })],
      );
      const fila = await bd.instalacion.query(
        `SELECT origen, estado, caduca_en IS NOT NULL AS caduca FROM operacion.trabajos WHERE id = $1`,
        [r.rows[0].id],
      );
      expect(fila.rows[0]).toEqual({ origen: "portal", estado: "pendiente", caduca: true });
    });
    it("encolar_portal('enviar_codigo') con ref nulo (no invitado) se acepta con la misma forma", async () => {
      const r = await portal.query(
        `SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb) AS id`,
        [JSON.stringify({ ref: null, ambito: "cliente" })],
      );
      expect(r.rows[0].id).toBeTruthy();
    });
    it("encolar_portal('crear_negocio') deja origen portal", async () => {
      const r = await portal.query(
        `SELECT operacion.encolar_portal('crear_negocio', '{"solicitud_id":"s-1"}') AS id`,
      );
      const fila = await bd.instalacion.query(
        `SELECT origen FROM operacion.trabajos WHERE id = $1`,
        [r.rows[0].id],
      );
      expect(fila.rows[0].origen).toBe("portal");
    });
    it.each([
      ["aplicar_importacion", { lote: "l-1" }],
      ["enviar_codigo", { ref: null, ambito: "panel" }],
      ["notificar", { motivo: "otro" }],
      ["tipo_inventado", {}],
    ])("encolar_portal('%s') fuera de la lista → excepción", async (tipo, payload) => {
      expect(
        await codigoDeError(
          portal.query(`SELECT operacion.encolar_portal($1, $2::jsonb)`, [
            tipo,
            JSON.stringify(payload),
          ]),
        ),
      ).toBe(EXCEPCION);
    });
    it("encolar_portal con ref que no es invitado activo → excepción", async () => {
      expect(
        await codigoDeError(
          portal.query(`SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb)`, [
            JSON.stringify({ ref: usuarioPanelId, ambito: "cliente" }),
          ]),
        ),
      ).toBe(EXCEPCION);
    });
    it("encolar_panel('enviar_codigo', ambito panel) deja origen panel; ambito cliente → excepción", async () => {
      const r = await panel.query(
        `SELECT operacion.encolar_panel('enviar_codigo', $1::jsonb) AS id`,
        [JSON.stringify({ ref: usuarioPanelId, ambito: "panel" })],
      );
      const fila = await bd.instalacion.query(
        `SELECT origen FROM operacion.trabajos WHERE id = $1`,
        [r.rows[0].id],
      );
      expect(fila.rows[0].origen).toBe("panel");
      expect(
        await codigoDeError(
          panel.query(`SELECT operacion.encolar_panel('enviar_codigo', $1::jsonb)`, [
            JSON.stringify({ ref: null, ambito: "cliente" }),
          ]),
        ),
      ).toBe(EXCEPCION);
    });
    it("el portal no puede ejecutar encolar_panel ni encolar_worker", async () => {
      expect(
        await codigoDeError(
          portal.query(
            `SELECT operacion.encolar_panel('enviar_codigo', '{"ref":null,"ambito":"panel"}')`,
          ),
        ),
      ).toBe(PERMISO_DENEGADO);
      expect(
        await codigoDeError(portal.query(`SELECT operacion.encolar_worker('notificar', '{}')`)),
      ).toBe(PERMISO_DENEGADO);
    });
  });

  describe("modo degradado: reclamar_propio y guardar_codigo (H8)", () => {
    async function encolarCodigoPortal(): Promise<string> {
      const r = await portal.query(
        `SELECT operacion.encolar_portal('enviar_codigo', $1::jsonb) AS id`,
        [JSON.stringify({ ref: invitadoId, ambito: "cliente" })],
      );
      return String(r.rows[0].id);
    }

    it("el portal reclama su propia fila pendiente una sola vez", async () => {
      const id = await encolarCodigoPortal();
      const primero = await portal.query(`SELECT * FROM operacion.reclamar_propio($1, 'r-1')`, [
        id,
      ]);
      expect(primero.rowCount).toBe(1);
      const segundo = await portal.query(`SELECT * FROM operacion.reclamar_propio($1, 'r-2')`, [
        id,
      ]);
      expect(segundo.rowCount).toBe(0);
    });

    it("el portal no reclama una fila de origen panel", async () => {
      const r = await panel.query(
        `SELECT operacion.encolar_panel('enviar_codigo', $1::jsonb) AS id`,
        [JSON.stringify({ ref: usuarioPanelId, ambito: "panel" })],
      );
      const reclamo = await portal.query(`SELECT * FROM operacion.reclamar_propio($1, 'r-3')`, [
        r.rows[0].id,
      ]);
      expect(reclamo.rowCount).toBe(0);
    });

    it("guardar_codigo_cliente con un reclamo ajeno → excepción; con el propio guarda el HMAC", async () => {
      const id = await encolarCodigoPortal();
      await portal.query(`SELECT * FROM operacion.reclamar_propio($1, 'r-propio')`, [id]);
      expect(
        await codigoDeError(
          portal.query(`SELECT identidad.guardar_codigo_cliente($1, 'r-ajeno', '\\x0f')`, [id]),
        ),
      ).toBe(EXCEPCION);
      await portal.query(`SELECT identidad.guardar_codigo_cliente($1, 'r-propio', '\\x0f')`, [id]);
      const c = await bd.instalacion.query(
        `SELECT count(*)::int n FROM identidad.codigos_cliente WHERE invitado_id = $1`,
        [invitadoId],
      );
      expect(c.rows[0].n).toBeGreaterThanOrEqual(1);
    });
  });

  describe("purga solo por purgar_vencidos", () => {
    it("el worker purga lo vencido y conserva lo vigente", async () => {
      await bd.instalacion.query(
        `INSERT INTO identidad.sesiones_portal (id_hash, enlace_id, invitado_id, expira) VALUES ('\\xd1', $1, $2, now() - interval '1 minute'), ('\\xd2', $1, $2, now() + interval '1 day')`,
        [enlaceId, invitadoId],
      );
      await worker.query(`SELECT identidad.purgar_vencidos()`);
      const r = await bd.instalacion.query(
        `SELECT encode(id_hash,'hex') h FROM identidad.sesiones_portal WHERE id_hash IN ('\\xd1','\\xd2')`,
      );
      expect(r.rows.map((x) => x.h)).toEqual(["d2"]);
    });
    it("el portal no puede ejecutar purgar_vencidos", async () => {
      expect(await codigoDeError(portal.query(`SELECT identidad.purgar_vencidos()`))).toBe(
        PERMISO_DENEGADO,
      );
    });
  });

  describe("unicidad de correos por HMAC (H40)", () => {
    it("un invitado duplicado expone un hash, no el correo", async () => {
      try {
        await bd.instalacion.query(
          `INSERT INTO identidad.enlace_invitados (enlace_id, correo, correo_hmac) VALUES ($1, 'otro@cliente.com', '\\x02')`,
          [enlaceId],
        );
        expect.unreachable();
      } catch (e) {
        expect((e as { code: string }).code).toBe("23505");
        expect(String((e as { detail?: string }).detail)).not.toContain("@");
      }
    });
  });
});
