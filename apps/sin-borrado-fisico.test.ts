// HU-135 · RF-8.3: el borrado físico de un perfil no existe a propósito. «Eliminar» archiva. Este test
// falla en CI si aparece una vía de borrado: un `DELETE FROM inventario.perfiles` en el código (fuera de
// migraciones y tests), un Route Handler `DELETE` bajo /api/v1/perfiles, o el privilegio DELETE de
// algún rol de aplicación sobre la tabla de perfiles.
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HAY_BD, crearBdPrueba, type BdPrueba } from "@ps/infra/pruebas/bd-prueba";
import { RAIZ } from "@ps/infra/pruebas/servidor-next";

function ficheros(dir: string): string[] {
  const salida: string[] = [];
  for (const f of readdirSync(dir)) {
    if (["node_modules", ".next", "dist", "migraciones"].includes(f)) continue;
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) salida.push(...ficheros(p));
    else if (/\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f)) salida.push(p);
  }
  return salida;
}

describe("sin borrado físico de perfiles (HU-135, RF-8.3)", () => {
  it("ningún código de aplicación borra filas de inventario.perfiles", () => {
    const culpables = ["apps", "packages"]
      .flatMap((d) => ficheros(`${RAIZ}${d}`))
      .filter((f) => /DELETE\s+FROM\s+inventario\.perfiles\b/i.test(readFileSync(f, "utf8")));
    expect(culpables).toEqual([]);
  });

  it("ninguna ruta del panel bajo /api/v1/perfiles exporta DELETE", () => {
    const rutas = ficheros(`${RAIZ}apps/panel/app/api/v1/perfiles`).filter((f) =>
      f.endsWith("route.ts"),
    );
    expect(rutas.length).toBeGreaterThan(5);
    expect(rutas.filter((f) => /export\s+const\s+DELETE\b/.test(readFileSync(f, "utf8")))).toEqual(
      [],
    );
  });

  describe.skipIf(!HAY_BD)("en la BD", () => {
    let bd: BdPrueba;
    beforeAll(async () => {
      bd = await crearBdPrueba();
    }, 60_000);
    afterAll(async () => {
      await bd?.cerrar();
    });

    it("ningún rol de aplicación tiene DELETE sobre inventario.perfiles", async () => {
      const r = await bd.instalacion.query(
        `SELECT rol FROM unnest(ARRAY['ps_portal', 'ps_panel', 'ps_worker', 'ps_exportador']) AS rol
          WHERE has_table_privilege(rol, 'inventario.perfiles', 'DELETE')`,
      );
      expect(r.rows).toEqual([]);
    });
  });
});
