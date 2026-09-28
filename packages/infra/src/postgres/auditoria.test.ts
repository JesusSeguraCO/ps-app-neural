// V3-1 (la cadena no se bifurca con escritores concurrentes) y permisos de la auditoría con roles
// reales (ADR-0003 «Revisión adversarial»).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { descifrarValor, desenvolverClave } from "@ps/dominio/auditoria/cadena";
import {
  PERMISO_DENEGADO,
  EXCEPCION,
  HAY_BD,
  codigoDeError,
  crearBdPrueba,
  type BdPrueba,
} from "../pruebas/bd-prueba";
import {
  conAuditoria,
  registrarAuditoria,
  verificarCadena,
  type ClavesAuditoria,
} from "./auditoria";

const CLAVES: ClavesAuditoria = { hmac: "h".repeat(48), kek: "k".repeat(48) };
const SEGUNDOS_V31 = Number(process.env.AUDITORIA_V31_SEGUNDOS ?? "5");

describe.skipIf(!HAY_BD)("auditoría encadenada (V3-1)", () => {
  let bd: BdPrueba;
  let panel: pg.Pool;
  let worker: pg.Pool;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    panel = bd.como("ps_panel");
    worker = bd.como("ps_worker");
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  const cambio = (i: number) => ({
    actor: "ana@trycore.com",
    entidad: "enlaces",
    entidadId: `e-${i}`,
    campo: "estado",
    antes: "activo",
    despues: "revocado",
    origen: "panel" as const,
  });

  it("registra un acto, avanza la cabeza y la cadena verifica", async () => {
    await conAuditoria(panel, CLAVES, async () => ({
      resultado: null,
      cambios: [cambio(0), cambio(1)],
    }));
    const v = await verificarCadena(bd.instalacion, CLAVES.hmac);
    expect(v).toEqual({ ok: true, filas: 2 });
  });

  it("los valores se guardan cifrados con la clave del sistema y se descifran con AUDIT_KEK", async () => {
    const r = await bd.instalacion.query(
      `SELECT v.despues_cifrado, k.clave_envuelta FROM auditoria.auditoria_valores v, identidad.claves_titular k
        WHERE k.titular = 'sistema' ORDER BY v.seq LIMIT 1`,
    );
    const { despues_cifrado, clave_envuelta } = r.rows[0];
    expect(Buffer.from(despues_cifrado).toString("utf8")).not.toContain("revocado");
    expect(descifrarValor(desenvolverClave(CLAVES.kek, clave_envuelta), despues_cifrado)).toBe(
      "revocado",
    );
  });

  it("si el acto falla no queda auditoría (misma transacción)", async () => {
    const antes = (await bd.instalacion.query(`SELECT seq FROM auditoria.auditoria_cabeza`)).rows[0]
      .seq;
    await expect(
      conAuditoria(panel, CLAVES, async (tx) => {
        await registrarAuditoria(tx, CLAVES, [cambio(9)]);
        throw new Error("el acto falló");
      }),
    ).rejects.toThrow("el acto falló");
    expect(
      (await bd.instalacion.query(`SELECT seq FROM auditoria.auditoria_cabeza`)).rows[0].seq,
    ).toBe(antes);
  });

  it(`16 escritores concurrentes (panel y worker) durante ${SEGUNDOS_V31} s no bifurcan la cadena`, async () => {
    const hasta = Date.now() + SEGUNDOS_V31 * 1000;
    let escritas = 0;
    const escritor = async (pool: pg.Pool, n: number) => {
      let i = 0;
      while (Date.now() < hasta) {
        const filas = 1 + ((n + i) % 3);
        await conAuditoria(pool, CLAVES, async () => ({
          resultado: null,
          cambios: Array.from({ length: filas }, (_, k) => cambio(n * 10_000 + i * 10 + k)),
        }));
        escritas += filas;
        i++;
      }
    };
    const previas = (await verificarCadena(bd.instalacion, CLAVES.hmac)).filas;
    await Promise.all(Array.from({ length: 16 }, (_, n) => escritor(n % 2 ? panel : worker, n)));
    const v = await verificarCadena(bd.instalacion, CLAVES.hmac);
    expect(v.ok).toBe(true);
    expect(v.filas).toBe(previas + escritas);
    expect(escritas).toBeGreaterThan(16);
  }, 120_000);

  it("un lote que no enlaza con la cabeza se rechaza", async () => {
    const tx = await panel.connect();
    try {
      await tx.query("BEGIN");
      // seq y tramo correctos: solo el enlace con la cabeza es falso.
      const c = (await tx.query(`SELECT tramo, seq FROM auditoria.bloquear_cabeza()`)).rows[0];
      const falso = [
        {
          seq: Number(c.seq) + 1,
          tramo: c.tramo,
          actor: "x",
          entidad: "x",
          entidad_id: "x",
          campo: "x",
          titular: "sistema",
          origen: "panel",
          hash_anterior: "00".repeat(32),
          hash: "11".repeat(32),
          cuando: new Date().toISOString(),
        },
      ];
      expect(
        await codigoDeError(
          tx.query(`SELECT auditoria.registrar($1::jsonb)`, [JSON.stringify(falso)]),
        ),
      ).toBe(EXCEPCION);
    } finally {
      await tx.query("ROLLBACK");
      tx.release();
    }
  });

  describe("nadie escribe la cadena directamente", () => {
    it.each([
      [
        "ps_panel",
        `INSERT INTO auditoria.auditoria (seq, tramo, actor, entidad, entidad_id, campo, titular, origen, cuando, hash_anterior, hash) VALUES (999999, 1, 'x', 'x', 'x', 'x', 'sistema', 'panel', now(), '\\x00', '\\x00')`,
      ],
      ["ps_worker", `UPDATE auditoria.auditoria_cabeza SET seq = 0`],
      ["ps_panel", `SELECT * FROM auditoria.auditoria_cabeza FOR UPDATE`],
      ["ps_worker", `DELETE FROM auditoria.auditoria_valores`],
      ["ps_panel", `UPDATE identidad.claves_titular SET clave_envuelta = NULL`],
    ] as const)("%s: %s → permiso denegado", async (rol, sentencia) => {
      const p = rol === "ps_panel" ? panel : worker;
      expect(await codigoDeError(p.query(sentencia))).toBe(PERMISO_DENEGADO);
    });

    it("el portal no puede registrar (sin USAGE del esquema)", async () => {
      expect(
        await codigoDeError(bd.como("ps_portal").query(`SELECT auditoria.registrar('[]'::jsonb)`)),
      ).toBe(PERMISO_DENEGADO);
    });

    it("ni el dueño puede modificar filas: el trigger lo impide", async () => {
      expect(
        await codigoDeError(bd.instalacion.query(`UPDATE auditoria.auditoria SET actor = 'otro'`)),
      ).toBe(EXCEPCION);
    });
  });

  it("una fila manipulada rompe la verificación en su seq", async () => {
    await bd.instalacion.query(
      `ALTER TABLE auditoria.auditoria DISABLE TRIGGER auditoria_solo_insercion`,
    );
    await bd.instalacion.query(
      `UPDATE auditoria.auditoria SET actor = 'intruso@trycore.com' WHERE seq = 2`,
    );
    await bd.instalacion.query(
      `ALTER TABLE auditoria.auditoria ENABLE TRIGGER auditoria_solo_insercion`,
    );
    expect(await verificarCadena(bd.instalacion, CLAVES.hmac)).toMatchObject({
      ok: false,
      rotaEnSeq: 2,
    });
  });
});
