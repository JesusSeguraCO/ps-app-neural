// Aviso de lenguaje de inventario en la trayectoria (HU-194; RF-3.6; D73: advierte, no bloquea).
// Puro y determinista (sin modelo, RF-16): lista fija de expresiones, por expresión completa (límite
// de palabra Unicode), sin distinguir mayúsculas ni tildes; devuelve la expresión tal como se escribió.
import { describe, expect, it } from "vitest";
import { EXPRESIONES_INVENTARIO, avisosDeLenguaje } from "./lenguaje";

describe("avisosDeLenguaje (HU-194)", () => {
  it("la lista es la de RF-3.6", () => {
    expect(EXPRESIONES_INVENTARIO).toEqual([
      "unidad",
      "ítem",
      "disponible para asignación",
      "stock",
    ]);
  });

  it("happy: «disponible para asignación» se señala tal como está escrita", () => {
    expect(
      avisosDeLenguaje("perfil disponible para asignación inmediata en proyectos de banca"),
    ).toEqual(["disponible para asignación"]);
  });

  it("error: «stock» se señala aunque el guardado falle por otra regla (es la misma función)", () => {
    expect(avisosDeLenguaje("stock de consultores para banca")).toEqual(["stock"]);
  });

  it.each([
    ["Lideró la migración de un ITEM crítico del core bancario", ["ITEM"]],
    ["Trabajó dos años en Stockholm para un banco nórdico", []],
    ["Lideró la unidad de pagos", ["unidad"]],
    ["Priorizó los ítems del backlog", ["ítems"]],
    ["Coordinó las Unidades de negocio", ["Unidades"]],
    ["Quedó DISPONIBLE  PARA\nASIGNACION en marzo", ["DISPONIBLE  PARA\nASIGNACION"]],
    ["Gestión de inventarios (stock-out) en retail", ["stock"]],
    ["Microunidad de despliegue, itemizar, stockear", []],
    ["Reescribió la frase sin esa expresión: lideró el área de pagos", []],
    ["", []],
  ] as const)("«%s» → %j", (texto, esperado) => {
    expect(avisosDeLenguaje(texto)).toEqual(esperado);
  });

  it("una expresión repetida se señala una vez por cada forma escrita", () => {
    expect(avisosDeLenguaje("stock, más stock y STOCK")).toEqual(["stock", "STOCK"]);
  });

  it("varias expresiones salen en el orden en que aparecen", () => {
    expect(avisosDeLenguaje("Cada unidad del stock")).toEqual(["unidad", "stock"]);
  });
});
