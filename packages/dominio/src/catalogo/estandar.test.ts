// Frase del estándar Neural-Grid (HU-159; D80, D97; diseño §4): «ningún perfil llega al portal sin…»
// solo con 0 publicados incompletos; con uno o más, o sin conteo, la versión que describe lo que el
// estándar exige. Nunca el número ni los perfiles. Las cuatro dimensiones (D64), no cinco.
import { describe, expect, it } from "vitest";
import { DIMENSIONES_ESTANDAR, FRASES_ESTANDAR, fraseDelEstandar } from "./estandar";

const TRES = [
  "verificación de identidad bajo SARO",
  "prueba técnica revisada por Trycore",
  "evaluación DISC",
];

describe("fraseDelEstandar (HU-159, D80, D97)", () => {
  it("0 incompletos: afirma que ningún perfil llega al portal sin las tres validaciones", () => {
    const f = fraseDelEstandar(0);
    expect(f).toBe(FRASES_ESTANDAR.ninguno);
    expect(f).toMatch(/^Ningún perfil llega al portal sin /);
    for (const x of TRES) expect(f).toContain(x);
  });

  it("1 o más incompletos: describe lo que el estándar exige, sin «ningún» ni afirmar que todos cumplen", () => {
    for (const n of [1, 2, 37]) {
      const f = fraseDelEstandar(n);
      expect(f).toBe(FRASES_ESTANDAR.descriptiva);
      expect(f).not.toMatch(/ningún|ninguno|todos|cada uno de los perfiles cumple/i);
      for (const x of TRES) expect(f).toContain(x);
    }
  });

  it("sin conteo (falla o vence): la versión descriptiva", () => {
    expect(fraseDelEstandar(null)).toBe(FRASES_ESTANDAR.descriptiva);
  });

  it("un conteo que no es un entero no negativo no afirma nada", () => {
    for (const n of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])
      expect(fraseDelEstandar(n)).toBe(FRASES_ESTANDAR.descriptiva);
  });

  it("ninguna frase incluye un número ni nombra perfiles", () => {
    for (const n of [0, 1, 7, null]) expect(fraseDelEstandar(n)).not.toMatch(/\d|PS-/);
  });

  it("cuatro dimensiones: tres condiciones de entrada y Neural Speed como garantía del servicio (D64)", () => {
    expect(DIMENSIONES_ESTANDAR.map((d) => [d.nombre, d.papel])).toEqual([
      ["Grid de Seguridad", "Condición de entrada"],
      ["Grid Técnico", "Condición de entrada"],
      ["Neural Fit", "Condición de entrada"],
      ["Neural Speed", "Garantía del servicio"],
    ]);
  });
});
