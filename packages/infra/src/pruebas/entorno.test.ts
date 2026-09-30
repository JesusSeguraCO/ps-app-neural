// En CI (REQUIERE_BD=1) los tests de BD y de servidores no pueden saltarse en silencio: la ausencia de
// BD o de build es un fallo, no un verde (regla de verificación ejecutada).
import { describe, expect, it } from "vitest";
import { HAY_BD } from "./bd-prueba";
import { hayBuild } from "./servidor-next";

describe.runIf(process.env.REQUIERE_BD === "1")("entorno de verificación", () => {
  it("hay BD de pruebas", () => expect(HAY_BD).toBe(true));
  it("hay build standalone de portal y panel", () => {
    expect(hayBuild("portal")).toBe(true);
    expect(hayBuild("panel")).toBe(true);
  });
});
