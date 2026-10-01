// Lista de acceso del panel contra PostgreSQL real con `ps_panel` (EP-006 · sub-slice 10; HU-151): alta solo
// @trycore.com con su auditoría, cambio de rol con el anterior y el nuevo, baja lógica, reinscripción, y la
// invariante «al menos un administrador activo», también con dos bajas a la vez (bloqueo de fila).
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { cambiarRol, darDeBaja, inscribirCorreo, listarAccesos } from "./accesos-panel";
import type { ClavesAuditoria } from "./auditoria";
import { RechazoInventario } from "./unidad-inventario";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};
const CLAVE_CORREO = randomBytes(32).toString("base64");

async function rechazo(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof RechazoInventario) return e;
    throw e;
  }
  throw new Error("sin_rechazo");
}

describe.skipIf(!HAY_BD)("accesos al panel (HU-151)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let karen: { usuarioId: string; correo: string };

  const auditoria = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT campo, actor, origen, titular FROM auditoria.auditoria
          WHERE entidad = 'usuarios_panel' AND entidad_id = $1 ORDER BY seq`,
        [id],
      )
    ).rows;
  const fila = async (id: string) =>
    (
      await bd.instalacion.query(
        `SELECT correo, rol, activo, dado_de_baja_en IS NOT NULL AS de_baja, actualizado_por
           FROM identidad_panel.usuarios_panel WHERE id = $1`,
        [id],
      )
    ).rows[0];

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
  }, 60_000);

  beforeEach(async () => {
    // Cada caso empieza con una sola administradora activa: Karen.
    await bd.instalacion.query(
      `UPDATE identidad_panel.usuarios_panel SET activo = false, dado_de_baja_en = now() WHERE activo`,
    );
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ($1, $2, 'administrador') RETURNING id`,
      [`karen.${randomBytes(3).toString("hex")}@trycore.com`, randomBytes(32)],
    );
    karen = { usuarioId: u.rows[0].id, correo: "karen@trycore.com" };
  });

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("inscribir: entra activo con su rol, auditado con quién; el correo se normaliza", async () => {
    const r = await inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
      correo: " Analista.Mercadeo@Trycore.com ",
      rol: "observador",
    });
    expect(r).toMatchObject({ correo: "analista.mercadeo@trycore.com", reactivado: false });
    expect(await fila(r.id)).toMatchObject({
      correo: "analista.mercadeo@trycore.com",
      rol: "observador",
      activo: true,
    });
    expect(await auditoria(r.id)).toEqual([
      { campo: "alta", actor: "karen@trycore.com", origen: "panel", titular: "sistema" },
    ]);
    const lista = await listarAccesos(panel);
    expect(lista.find((x) => x.id === r.id)).toMatchObject({
      rol: "observador",
      activo: true,
      sesionAbierta: false,
    });
    expect(
      (
        await rechazo(
          inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
            correo: "analista.mercadeo@trycore.com",
            rol: "administrador",
          }),
        )
      ).motivo,
    ).toBe("ya_inscrito");
  });

  it("un correo que no es @trycore.com no se inscribe y la lista queda igual", async () => {
    const antes = (await listarAccesos(panel)).length;
    const e = await rechazo(
      inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
        correo: "eida.tinjaca@gmail.com",
        rol: "observador",
      }),
    );
    expect(e.motivo).toBe("correo_externo");
    expect((await listarAccesos(panel)).length).toBe(antes);
  });

  it("cambiar el rol queda auditado con el anterior y el nuevo; bajar a la otra administradora es posible", async () => {
    const eida = await inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
      correo: `eida.${randomBytes(2).toString("hex")}@trycore.com`,
      rol: "administrador",
    });
    expect(await cambiarRol(panel, claves, karen, eida.id, "observador")).toEqual({
      rolAnterior: "administrador",
      rol: "observador",
    });
    expect(await fila(eida.id)).toMatchObject({
      rol: "observador",
      actualizado_por: karen.usuarioId,
    });
    expect((await auditoria(eida.id)).map((a) => a.campo)).toEqual(["alta", "rol"]);
  });

  it("dar de baja: sale de los activos sin borrarse; reinscribir lo reactiva", async () => {
    const laura = await inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
      correo: `laura.${randomBytes(2).toString("hex")}@trycore.com`,
      rol: "observador",
    });
    expect(await darDeBaja(panel, claves, karen, laura.id)).toEqual({ yaDeBaja: false });
    expect(await fila(laura.id)).toMatchObject({ activo: false, de_baja: true });
    expect(await darDeBaja(panel, claves, karen, laura.id)).toEqual({ yaDeBaja: true });
    const otra = await inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
      correo: (await fila(laura.id)).correo,
      rol: "administrador",
    });
    expect(otra).toMatchObject({ id: laura.id, reactivado: true });
    expect(await fila(laura.id)).toMatchObject({
      activo: true,
      de_baja: false,
      rol: "administrador",
    });
    expect((await auditoria(laura.id)).map((a) => a.campo)).toEqual([
      "alta",
      "activo",
      "activo",
      "rol",
    ]);
  });

  it("la única administradora activa no puede quitarse el rol ni darse de baja; sigue igual", async () => {
    for (const intento of [
      cambiarRol(panel, claves, karen, karen.usuarioId, "observador"),
      darDeBaja(panel, claves, karen, karen.usuarioId),
    ])
      expect((await rechazo(intento)).motivo).toBe("ultimo_administrador");
    expect(await fila(karen.usuarioId)).toMatchObject({ rol: "administrador", activo: true });
    expect(await auditoria(karen.usuarioId)).toEqual([]);
  });

  it("dos bajas a la vez de las dos únicas administradoras: una entra y la otra se niega", async () => {
    const eida = await inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
      correo: `eida2.${randomBytes(2).toString("hex")}@trycore.com`,
      rol: "administrador",
    });
    const resultados = await Promise.allSettled([
      darDeBaja(panel, claves, karen, karen.usuarioId),
      darDeBaja(panel, claves, { usuarioId: eida.id, correo: "eida@trycore.com" }, eida.id),
    ]);
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const fallo = resultados.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(fallo.reason).toBeInstanceOf(RechazoInventario);
    expect(fallo.reason.motivo).toBe("ultimo_administrador");
    const activas = await bd.instalacion.query(
      `SELECT count(*)::int AS n FROM identidad_panel.usuarios_panel WHERE rol = 'administrador' AND activo`,
    );
    expect(activas.rows[0].n).toBe(1);
  });

  it("carrera real: con la primera baja sin confirmar, la segunda espera y luego se niega", async () => {
    const eida = await inscribirCorreo(panel, claves, CLAVE_CORREO, karen, {
      correo: `eida3.${randomBytes(2).toString("hex")}@trycore.com`,
      rol: "administrador",
    });
    const a = await panel.connect();
    const b = await panel.connect();
    try {
      await a.query("BEGIN");
      await b.query("BEGIN");
      await a.query(`SELECT * FROM identidad_panel.cambiar_acceso($1, 'administrador', false, $1)`, [
        karen.usuarioId,
      ]);
      // B se lanza mientras A no ha confirmado: con el bloqueo espera; sin él vería a Karen activa.
      const segunda = b
        .query(`SELECT * FROM identidad_panel.cambiar_acceso($1, 'administrador', false, $1)`, [eida.id])
        .then(
          () => "aplicada",
          (e: Error) => e.message,
        );
      await new Promise((r) => setTimeout(r, 300));
      await a.query("COMMIT");
      expect(await segunda).toBe("ultimo_administrador");
      await b.query("ROLLBACK");
    } finally {
      a.release();
      b.release();
    }
    expect(await fila(eida.id)).toMatchObject({ activo: true, rol: "administrador" });
  });

  it("el portal no ve la lista de acceso ni puede cambiarla", async () => {
    const portal = bd.como("ps_portal");
    await expect(portal.query(`SELECT * FROM identidad_panel.usuarios_panel`)).rejects.toThrow();
    await expect(
      portal.query(`SELECT * FROM identidad_panel.cambiar_acceso($1, 'observador', true, $1)`, [
        karen.usuarioId,
      ]),
    ).rejects.toThrow();
  });
});
