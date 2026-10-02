import { describe, expect, it } from "vitest";
import { bandaDeDisponibilidad } from "./banda";

// Hoy en Bogotá: 28 sep 2026 (las 10:00 en Colombia son las 15:00 UTC).
const HOY = new Date("2026-09-28T15:00:00Z");
const hace = (dias: number) => new Date(HOY.getTime() - dias * 86_400_000);

describe("banda de disponibilidad (RF-3.13, RF-8.14.4)", () => {
  it.each([
    ["2026-09-28", "inmediato"],
    ["2026-09-29", "una_semana"],
    ["2026-10-05", "una_semana"],
    ["2026-10-06", "dos_semanas"],
    ["2026-10-12", "dos_semanas"],
    ["2026-10-13", "un_mes"],
    ["2026-10-28", "un_mes"],
    ["2026-10-29", "mas_de_un_mes"],
  ] as const)("fecha %s → %s", (fecha, banda) => {
    expect(bandaDeDisponibilidad({ fecha, actualizadaEn: hace(1) }, HOY)).toBe(banda);
  });

  it("se calcula contra la fecha del día en Colombia, no en UTC", () => {
    // 28 sep a las 21:00 en Bogotá ya es 29 sep en UTC: sigue siendo «hoy».
    const noche = new Date("2026-09-29T02:00:00Z");
    expect(bandaDeDisponibilidad({ fecha: "2026-09-28", actualizadaEn: hace(1) }, noche)).toBe("inmediato");
  });

  it("fecha pasada y actualizada hace ≤ 30 días → inmediato", () => {
    expect(bandaDeDisponibilidad({ fecha: "2026-09-01", actualizadaEn: hace(30) }, HOY)).toBe("inmediato");
  });

  it("fecha pasada y sin tocar hace más de 30 días → por confirmar (no se afirma)", () => {
    expect(bandaDeDisponibilidad({ fecha: "2026-08-01", actualizadaEn: hace(31) }, HOY)).toBe("por_confirmar");
  });

  it("sin fecha o sin fecha de actualización → por confirmar", () => {
    expect(bandaDeDisponibilidad({ fecha: null, actualizadaEn: hace(1) }, HOY)).toBe("por_confirmar");
    expect(bandaDeDisponibilidad({ fecha: "2026-09-28", actualizadaEn: null }, HOY)).toBe("por_confirmar");
  });

  it("una fecha futura no caduca aunque nadie la toque (la promesa es a futuro)", () => {
    expect(bandaDeDisponibilidad({ fecha: "2026-12-01", actualizadaEn: hace(90) }, HOY)).toBe("mas_de_un_mes");
  });
});

describe("«sin tocar» cuenta días civiles de Bogotá, como la bandeja de vigencia (Release Gate R0, smell B2)", () => {
  it("actualizada el 1 sep a la 1 a. m. y vista el 1 oct a las 11 p. m.: 30 días civiles, todavía no «por confirmar»", () => {
    // En milisegundos son 30 días y 22 horas (> 30); en días civiles son 30: la bandeja no la lista.
    const banda = bandaDeDisponibilidad(
      { fecha: "2026-09-15", actualizadaEn: new Date("2026-09-01T06:00:00Z") },
      new Date("2026-10-02T04:00:00Z"),
    );
    expect(banda).toBe("inmediato");
  });

  it("al día civil 31 pasa a «por confirmar»", () => {
    const banda = bandaDeDisponibilidad(
      { fecha: "2026-09-15", actualizadaEn: new Date("2026-09-01T06:00:00Z") },
      new Date("2026-10-02T06:00:00Z"),
    );
    expect(banda).toBe("por_confirmar");
  });
});
