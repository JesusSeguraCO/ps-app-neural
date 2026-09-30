import { describe, expect, it } from "vitest";
import { topeEnVentana } from "./tope";

describe("topeEnVentana", () => {
  const ahora = new Date("2026-09-30T12:00:00Z");
  const hace = (min: number) => new Date(ahora.getTime() - min * 60_000);
  const HORA = 60 * 60_000;

  it("sin sucesos o por debajo del tope, permite", () => {
    expect(topeEnVentana([], ahora, 3, HORA)).toEqual({ permitido: true });
    expect(topeEnVentana([hace(1), hace(2)], ahora, 3, HORA)).toEqual({ permitido: true });
  });

  it("al alcanzar el tope, libera cuando sale el suceso que llena la ventana (sin importar el orden)", () => {
    expect(topeEnVentana([hace(2), hace(40), hace(10), hace(59)], ahora, 3, HORA)).toEqual({
      permitido: false,
      hasta: new Date(hace(40).getTime() + HORA),
    });
  });

  it("el borde de la ventana ya no cuenta", () => {
    expect(topeEnVentana([hace(60), hace(1), hace(2)], ahora, 3, HORA)).toEqual({ permitido: true });
  });
});
