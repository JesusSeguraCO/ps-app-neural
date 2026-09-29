import { describe, expect, it } from "vitest";
import { diaCortoDeColombia, momentoCortoDeColombia, momentoDeColombia } from "./colombia";

// 29 sep 2026, 10:00 a. m. en Bogotá (15:00 UTC).
const AHORA = new Date("2026-09-29T15:00:00Z");

describe("momentos relativos en hora de Colombia (prototipo peticiones-invitacion)", () => {
  it("el mismo día civil en Bogotá dice «hoy»", () => {
    expect(momentoDeColombia(new Date("2026-09-29T14:14:00Z"), AHORA)).toBe("hoy, 9:14 a. m.");
    expect(momentoCortoDeColombia(new Date("2026-09-29T15:42:00Z"), AHORA)).toBe("hoy 10:42");
  });
  it("la medianoche es la de Bogotá, no la de UTC", () => {
    // 29 sep 03:00 UTC = 28 sep 10:00 p. m. en Bogotá: no es «hoy».
    expect(momentoDeColombia(new Date("2026-09-29T03:00:00Z"), AHORA)).toBe("28 sep, 10:00 p. m.");
  });
  it("otro día del mismo año omite el año", () => {
    expect(momentoDeColombia(new Date("2026-09-26T16:02:00Z"), AHORA)).toBe("26 sep, 11:02 a. m.");
    expect(momentoCortoDeColombia(new Date("2026-09-19T14:48:00Z"), AHORA)).toBe("19 sep 09:48");
    expect(momentoCortoDeColombia(new Date("2026-09-26T21:05:00Z"), AHORA)).toBe("26 sep 16:05");
  });
  it("otro año lo dice", () => {
    expect(momentoDeColombia(new Date("2025-12-30T17:00:00Z"), AHORA)).toBe(
      "30 dic 2025, 12:00 p. m.",
    );
    expect(momentoCortoDeColombia(new Date("2025-12-30T17:00:00Z"), AHORA)).toBe(
      "30 dic 2025 12:00",
    );
  });
  it("el día corto no lleva año", () => {
    expect(diaCortoDeColombia(new Date("2026-09-26T06:44:00Z"))).toBe("26 sep");
  });
});
