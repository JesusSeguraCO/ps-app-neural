import { describe, expect, it } from "vitest";
import { MatrizPermisos, esAccion, puede } from "./permisos";

describe("MatrizPermisos (ADR-0002 H19)", () => {
  it("la administradora puede todas las acciones", () => {
    for (const accion of Object.keys(MatrizPermisos)) expect(puede("administrador", accion as never)).toBe(true);
  });
  it("el observador solo puede cerrar su sesión", () => {
    const permitidas = Object.keys(MatrizPermisos).filter((a) => puede("observador", a as never));
    expect(permitidas).toEqual(["sesion.salir"]);
  });
  it("EP-006: catálogos y léxico solo los escribe la administradora", () => {
    for (const accion of ["catalogo.escribir", "lexico.escribir"] as const) {
      expect(puede("administrador", accion)).toBe(true);
      expect(puede("observador", accion)).toBe(false);
    }
  });
  it("una acción desconocida no es acción", () => {
    expect(esAccion("enlaces.generar")).toBe(true);
    expect(esAccion("inventario.borrar")).toBe(false);
    expect(esAccion("toString")).toBe(false);
  });
});
