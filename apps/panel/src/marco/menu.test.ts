// Menú por rol (D43, prototipo inventario-perfiles--observador y D14): la observadora solo ve
// Inventario, Enlaces y Colocados; la administradora, los doce destinos canónicos.
import { describe, expect, it } from "vitest";
import { MENU_PANEL, menuDelRol } from "./menu";

const etiquetas = (m: ReturnType<typeof menuDelRol>) =>
  m.map((s) => [s.titulo, s.destinos.map((d) => d.etiqueta)]);

describe("menuDelRol", () => {
  it("administración: el menú canónico completo", () => {
    expect(menuDelRol("administrador")).toEqual(MENU_PANEL);
  });

  it("observadora: solo Inventario, Enlaces y Colocados, sin secciones vacías ni destinos futuros", () => {
    expect(etiquetas(menuDelRol("observador"))).toEqual([
      ["Banco de perfiles", ["Inventario"]],
      ["Clientes", ["Enlaces", "Colocados"]],
    ]);
  });
});
