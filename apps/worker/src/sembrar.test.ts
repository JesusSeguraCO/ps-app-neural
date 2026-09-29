// Tarea `sembrar_admin_inicial` (ADR-0002 enmienda, ADR-0009, ADR-0010 §3.3) contra PostgreSQL real
// con `ps_worker` por PgBouncer: siembra una sola vez, auditada con origen `migracion`.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hmacCorreo } from "@ps/dominio/acceso/codigo";
import { verificarCadena } from "@ps/infra/postgres/auditoria";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { sembrarAdminInicial, type ContextoSiembra } from "./sembrar";

const CLAVES = { hmac: "h".repeat(48), kek: "k".repeat(48) };
const EMAIL_HMAC = "e".repeat(48);

describe.skipIf(!HAY_BD)("sembrar_admin_inicial (ADR-0002)", () => {
  let bd: BdPrueba;
  let eventos: Array<Record<string, unknown>>;
  let ctx: ContextoSiembra;

  beforeAll(async () => {
    bd = await crearBdPrueba();
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  beforeEach(async () => {
    await bd.instalacion.query(`DELETE FROM identidad_panel.usuarios_panel`);
    eventos = [];
    ctx = {
      bd: bd.como("ps_worker"),
      auditoria: CLAVES,
      emailHmac: EMAIL_HMAC,
      registrar: (e) => eventos.push(e),
    };
  });

  it("con el panel vacío inscribe al administrador inicial y lo audita con origen migracion", async () => {
    const r = await sembrarAdminInicial(ctx, "  Karen@Trycore.com ");
    expect(r).toBe("sembrado");

    const u = await bd.instalacion.query(
      `SELECT id::text, correo, correo_hmac, rol, activo FROM identidad_panel.usuarios_panel`,
    );
    expect(u.rows).toHaveLength(1);
    expect(u.rows[0]).toMatchObject({
      correo: "karen@trycore.com",
      rol: "administrador",
      activo: true,
    });
    expect(
      Buffer.from(u.rows[0].correo_hmac).equals(hmacCorreo("karen@trycore.com", EMAIL_HMAC)),
    ).toBe(true);

    const a = await bd.instalacion.query(
      `SELECT actor, entidad, entidad_id, campo, origen FROM auditoria.auditoria WHERE entidad_id = $1`,
      [u.rows[0].id],
    );
    expect(a.rows).toEqual([
      {
        actor: "sistema:sembrar_admin_inicial",
        entidad: "usuarios_panel",
        entidad_id: u.rows[0].id,
        campo: "rol",
        origen: "migracion",
      },
    ]);
    expect((await verificarCadena(bd.instalacion, CLAVES.hmac)).ok).toBe(true);
    expect(eventos).toContainEqual(expect.objectContaining({ evento: "admin_inicial_sembrado" }));
  });

  it("si el panel ya tiene usuarios no inscribe a nadie ni audita (no sirve para añadir administradores)", async () => {
    await bd.instalacion.query(
      `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('ana@trycore.com', '\\x01', 'observador')`,
    );
    const cabeza = (
      await bd.instalacion.query(`SELECT max(seq) AS s FROM auditoria.auditoria_cabeza`)
    ).rows[0].s;

    const r = await sembrarAdminInicial(ctx, "intruso@trycore.com");
    expect(r).toBe("ya_sembrado");

    const u = await bd.instalacion.query(`SELECT correo, rol FROM identidad_panel.usuarios_panel`);
    expect(u.rows).toEqual([{ correo: "ana@trycore.com", rol: "observador" }]);
    expect(
      (await bd.instalacion.query(`SELECT max(seq) AS s FROM auditoria.auditoria_cabeza`)).rows[0]
        .s,
    ).toBe(cabeza);
    expect(eventos).toContainEqual(expect.objectContaining({ evento: "admin_inicial_omitido" }));
  });

  it("dos workers que arrancan a la vez siembran un solo administrador", async () => {
    const otro = { ...ctx, bd: bd.como("ps_worker") };
    const r = await Promise.all([
      sembrarAdminInicial(ctx, "karen@trycore.com"),
      sembrarAdminInicial(otro, "karen@trycore.com"),
    ]);
    expect(r.sort()).toEqual(["sembrado", "ya_sembrado"]);
    expect(
      (await bd.instalacion.query(`SELECT count(*)::int AS n FROM identidad_panel.usuarios_panel`))
        .rows[0].n,
    ).toBe(1);
  });

  it("ps_worker no puede inscribir usuarios del panel por escritura directa", async () => {
    await expect(
      bd
        .como("ps_worker")
        .query(
          `INSERT INTO identidad_panel.usuarios_panel (correo, correo_hmac, rol) VALUES ('x@trycore.com', '\\x09', 'administrador')`,
        ),
    ).rejects.toMatchObject({ code: "42501" });
  });
});
