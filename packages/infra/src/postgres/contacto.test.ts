// Contacto de Trycore contra PostgreSQL real (EP-006 · sub-slice 10; HU-147): sin fila, el portal lee el buzón
// por omisión; guardar escribe la fila única y su auditoría (valor anterior y nuevo, descifrables desde el
// panel) en la misma transacción; un correo externo no se guarda (ni el CHECK de la tabla lo deja pasar);
// `ps_portal` solo lee la vista, nunca la tabla.
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import type { ClavesAuditoria } from "./auditoria";
import { guardarContacto, historialContacto, leerContacto, leerContactoPanel } from "./contacto";
import { RechazoInventario } from "./unidad-inventario";

const claves: ClavesAuditoria = {
  hmac: randomBytes(32).toString("base64"),
  kek: randomBytes(32).toString("base64"),
};

describe.skipIf(!HAY_BD)("contacto de Trycore (HU-147)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let portal: pg.Pool;
  let karen: { usuarioId: string; correo: string };

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    portal = bd.como("ps_portal");
    const u = await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol)
       VALUES ('karen.rodriguez@trycore.com', $1, 'administrador') RETURNING id`,
      [randomBytes(32)],
    );
    karen = { usuarioId: u.rows[0].id, correo: "karen.rodriguez@trycore.com" };
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("sin configurar, el portal lee el buzón de People Service sin nombre ni cargo", async () => {
    expect(await leerContacto(portal)).toEqual({
      direccion: "people.service@trycore.com",
      nombre: null,
      cargo: null,
    });
    expect((await leerContactoPanel(panel)).actualizadoPor).toBeNull();
    expect(await historialContacto(panel, claves.kek)).toEqual([]);
  });

  it("guardar cambia lo que lee el portal y audita el anterior y el nuevo con su autor", async () => {
    await guardarContacto(panel, claves, karen, {
      correo: "eida.tinjaca@trycore.com",
      nombre: "Eida Tinjacá",
      cargo: "Coordinación de Servicio",
    });
    expect(await leerContacto(portal)).toEqual({
      direccion: "eida.tinjaca@trycore.com",
      nombre: "Eida Tinjacá",
      cargo: "Coordinación de Servicio",
    });
    const vigente = await leerContactoPanel(panel);
    expect(vigente.actualizadoPor).toBe(karen.correo);
    expect(vigente.actualizadoEn).not.toBeNull();

    const cambio = (await historialContacto(panel, claves.kek))[0]!;
    expect(cambio.actor).toBe(karen.correo);
    expect(cambio.antes).toEqual({
      direccion: "people.service@trycore.com",
      nombre: null,
      cargo: null,
    });
    expect(cambio.despues).toEqual({
      direccion: "eida.tinjaca@trycore.com",
      nombre: "Eida Tinjacá",
      cargo: "Coordinación de Servicio",
    });
    const filas = await bd.instalacion.query(
      `SELECT campo, origen, titular FROM auditoria.auditoria WHERE entidad = 'configuracion_contacto' ORDER BY seq`,
    );
    expect(filas.rows.map((f) => f.campo)).toEqual(["correo", "nombre", "cargo"]);
    expect(new Set(filas.rows.map((f) => `${f.origen}/${f.titular}`))).toEqual(
      new Set(["panel/sistema"]),
    );
  });

  it("solo correo: nombre y cargo se borran y la auditoría registra solo lo que cambió", async () => {
    await guardarContacto(panel, claves, karen, {
      correo: "servicio.clientes@trycore.com",
      nombre: " ",
      cargo: null,
    });
    expect(await leerContacto(portal)).toEqual({
      direccion: "servicio.clientes@trycore.com",
      nombre: null,
      cargo: null,
    });
    const ultimo = (await historialContacto(panel, claves.kek))[0]!;
    expect(ultimo.despues).toEqual({
      direccion: "servicio.clientes@trycore.com",
      nombre: null,
      cargo: null,
    });
    // Guardar lo mismo no deja otro cambio.
    const antes = (await historialContacto(panel, claves.kek)).length;
    expect(
      await guardarContacto(panel, claves, karen, { correo: "servicio.clientes@trycore.com" }),
    ).toEqual({ cambio: false });
    expect((await historialContacto(panel, claves.kek)).length).toBe(antes);
  });

  it("un correo externo no se guarda: el portal sigue con el anterior y nada se audita", async () => {
    const antes = await historialContacto(panel, claves.kek);
    const e = await guardarContacto(panel, claves, karen, {
      correo: "eida.tinjaca@gmail.com",
    }).catch((x) => x);
    expect(e).toBeInstanceOf(RechazoInventario);
    expect((e as RechazoInventario).motivo).toBe("correo_externo");
    expect((await leerContacto(portal)).direccion).toBe("servicio.clientes@trycore.com");
    expect((await historialContacto(panel, claves.kek)).length).toBe(antes.length);
    // Y la tabla tampoco lo deja pasar aunque alguien se salte el dominio.
    await expect(
      panel.query(`UPDATE inventario.configuracion_contacto SET correo = 'x@gmail.com'`),
    ).rejects.toThrow(/check/i);
  });

  it("el portal no lee ni escribe la tabla; solo la vista", async () => {
    await expect(portal.query(`SELECT * FROM inventario.configuracion_contacto`)).rejects.toThrow(
      /permission denied/,
    );
    await expect(
      portal.query(`UPDATE inventario.configuracion_contacto SET nombre = 'x'`),
    ).rejects.toThrow(/permission denied/);
  });
});
