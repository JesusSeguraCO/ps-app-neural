import { describe, expect, it } from "vitest";
import { avisoCambios, notaEstado, resumenFamilias, tituloSeleccion } from "./textos-seleccion";

describe("textos del aterrizaje", () => {
  it("título con proyecto y sin proyecto (sin contexto inventado)", () => {
    expect(tituloSeleccion(6, "Bancolombia", "Modernización de pagos")).toBe("Seis perfiles para Modernización de pagos");
    expect(tituloSeleccion(6, "Bancolombia", null)).toBe("Seis perfiles escogidos para Bancolombia");
    expect(tituloSeleccion(1, "Bancolombia", null)).toBe("Un perfil escogido para Bancolombia");
    expect(tituloSeleccion(14, "Bancolombia", "X")).toBe("14 perfiles para X");
  });
  it("aviso de cambios: nada si no cambió ninguno ni si cambiaron todos", () => {
    expect(avisoCambios(0, 6, "22 sep")).toBeNull();
    expect(avisoCambios(6, 6, "22 sep")).toBeNull();
    expect(avisoCambios(2, 6, "22 sep")).toEqual({
      titulo: "Dos perfiles cambiaron desde el 22 sep.",
      texto: "Siguen en su lugar con su estado de hoy; los otros cuatro están igual que en el correo.",
    });
    expect(avisoCambios(1, 2, "22 sep")?.texto).toBe("Sigue en su lugar con su estado de hoy; el otro está igual que en el correo.");
  });
  it("el colocado dice la fecha en que se libera", () => {
    expect(notaEstado("colocado", "2026-12-15")).toBe("Se libera el 15 dic 2026. Mientras tanto no se puede sumar al equipo.");
  });
  it("resumen por familia en orden de aparición", () => {
    expect(resumenFamilias(["Desarrollo", "QA", "Desarrollo", null])).toBe("2 desarrollo · 1 QA");
  });
});
