import { describe, expect, it } from "vitest";
import { mannWhitney, mediana } from "./estadistica";

describe("estadística de tiempos", () => {
  it("mediana de muestras par e impar", () => {
    expect(mediana([3, 1, 2])).toBe(2);
    expect(mediana([4, 1, 3, 2])).toBe(2.5);
  });

  it("dos muestras iguales no difieren (p = 1)", () => {
    const a = Array.from({ length: 30 }, (_, i) => i);
    expect(mannWhitney(a, [...a]).p).toBeCloseTo(1, 5);
  });

  it("muestras desplazadas difieren (p < 0,05) en ambos sentidos", () => {
    const a = Array.from({ length: 30 }, (_, i) => i);
    const b = a.map((x) => x + 15);
    expect(mannWhitney(a, b).p).toBeLessThan(0.05);
    expect(mannWhitney(b, a).p).toBeLessThan(0.05);
  });

  it("coincide con el valor de referencia (U = 0, N = 20+20 → z ≈ -5,41)", () => {
    const a = Array.from({ length: 20 }, (_, i) => i);
    const b = Array.from({ length: 20 }, (_, i) => 100 + i);
    const r = mannWhitney(a, b);
    expect(r.u).toBe(0);
    expect(r.z).toBeCloseTo(-5.41, 2);
    expect(r.p).toBeLessThan(1e-6);
  });

  it("exige N ≥ 20 por grupo", () => {
    expect(() => mannWhitney([1, 2], [3, 4])).toThrow("N ≥ 20");
  });
});
