// Conteo de publicados incompletos con tiempo acotado (HU-159 · error, D97; diseño §4): con `ps_portal`
// cuenta con la guarda del dominio; si la consulta no responde a tiempo (`statement_timeout` local de la
// transacción) o falla, rechaza en lugar de colgar la página. La degradación a la frase descriptiva y el
// registro técnico son del portal.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  sembrarFicticios,
  sembrarHeredadosIncompletos,
} from "../../../../apps/worker/src/sembrar-ficticios";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "../pruebas/bd-prueba";
import { contarIncompletosConTiempo, contarIncompletosPublicados } from "./indicadores";
import { randomBytes } from "node:crypto";

describe.skipIf(!HAY_BD)("contarIncompletosConTiempo (HU-159, D97)", () => {
  let bd: BdPrueba;

  beforeAll(async () => {
    bd = await crearBdPrueba();
    const ctx = {
      bd: bd.como("ps_panel"),
      auditoria: {
        hmac: randomBytes(32).toString("base64"),
        kek: randomBytes(32).toString("base64"),
      },
      appEnv: "ci" as const,
      registrar: () => {},
    };
    await sembrarFicticios(ctx);
    await sembrarHeredadosIncompletos(ctx);
  }, 60_000);

  afterAll(async () => {
    await bd?.cerrar();
  });

  it("a tiempo: el mismo conteo que la guarda sin límite", async () => {
    const portal = bd.como("ps_portal");
    const conteo = await contarIncompletosConTiempo(portal, 500);
    expect(conteo).toBe(await contarIncompletosPublicados(portal));
    expect(conteo).toBeGreaterThan(0);
  });

  it("si la consulta no responde a tiempo, rechaza al vencer el límite (no cuelga)", async () => {
    const bloqueo = await bd.como("ps_migrador", { directa: true }).connect();
    try {
      await bloqueo.query("BEGIN");
      await bloqueo.query("LOCK TABLE inventario.perfiles IN ACCESS EXCLUSIVE MODE");
      const inicio = Date.now();
      await expect(contarIncompletosConTiempo(bd.como("ps_portal"), 300)).rejects.toThrow(
        /statement timeout|cancel/i,
      );
      expect(Date.now() - inicio).toBeLessThan(3_000);
    } finally {
      await bloqueo.query("ROLLBACK");
      bloqueo.release();
    }
  });

  it("si la consulta falla (sin permiso sobre la vista), rechaza", async () => {
    await bd.instalacion.query("REVOKE SELECT ON operacion.indicadores_publicacion FROM ps_portal");
    try {
      await expect(contarIncompletosConTiempo(bd.como("ps_portal"), 500)).rejects.toThrow(
        /permission|permiso/i,
      );
    } finally {
      await bd.instalacion.query("GRANT SELECT ON operacion.indicadores_publicacion TO ps_portal");
    }
  });
});
