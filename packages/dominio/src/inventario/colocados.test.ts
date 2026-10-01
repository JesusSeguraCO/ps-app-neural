import { describe, expect, it } from "vitest";
import {
  DIAS_DESTACADO,
  proximoCambioDeBanda,
  tablaDeColocados,
  validarColocado,
  type ColocadoEnTabla,
} from "./colocados";

const HOY = "2026-10-01";

describe("validarColocado (HU-137; RF-8.13.2)", () => {
  const bien = { cuenta: "Bancolombia", inicio: "2026-10-01", liberacion: "2026-12-18" };

  it("cliente, inicio y liberación futura posterior al inicio: válido, con la cuenta sin espacios", () => {
    expect(validarColocado({ ...bien, cuenta: "  Bancolombia " }, HOY)).toEqual({
      ok: true,
      valor: bien,
    });
  });

  it("sin fecha de liberación: no se guarda, porque un colocado siempre la lleva", () => {
    expect(validarColocado({ ...bien, liberacion: null }, HOY)).toEqual({
      ok: false,
      motivo: "sin_liberacion",
    });
    expect(validarColocado({ ...bien, liberacion: "" }, HOY)).toEqual({
      ok: false,
      motivo: "sin_liberacion",
    });
  });

  it("sin cliente o solo espacios: no se guarda", () => {
    expect(validarColocado({ ...bien, cuenta: "   " }, HOY)).toEqual({
      ok: false,
      motivo: "sin_cuenta",
    });
  });

  it("sin inicio: es hoy en Bogotá", () => {
    expect(validarColocado({ ...bien, inicio: null }, HOY)).toEqual({
      ok: true,
      valor: { ...bien, inicio: HOY },
    });
  });

  it("liberación hoy o antes: no sería un colocado vigente", () => {
    expect(validarColocado({ ...bien, inicio: "2026-09-01", liberacion: HOY }, HOY)).toEqual({
      ok: false,
      motivo: "liberacion_pasada",
    });
    expect(
      validarColocado({ ...bien, inicio: "2026-09-02", liberacion: "2026-10-02" }, HOY).ok,
    ).toBe(true);
  });

  it("liberación igual o anterior al inicio: rechazada", () => {
    expect(
      validarColocado({ ...bien, inicio: "2026-12-18", liberacion: "2026-12-18" }, HOY),
    ).toEqual({ ok: false, motivo: "liberacion_antes_de_inicio" });
  });

  it("fechas que no existen: rechazadas", () => {
    expect(validarColocado({ ...bien, liberacion: "2026-02-30" }, HOY)).toEqual({
      ok: false,
      motivo: "fecha_invalida",
    });
    expect(validarColocado({ ...bien, inicio: "2026-13-01" }, HOY)).toEqual({
      ok: false,
      motivo: "fecha_invalida",
    });
  });
});

const fila = (codigo: string, liberacion: string): ColocadoEnTabla => ({
  codigo,
  liberacion,
});

describe("tablaDeColocados (HU-137: ordenados por vencimiento, ≤ 60 días destacados)", () => {
  it("ordena por proximidad del vencimiento y separa los que vencen dentro de 60 días", () => {
    const t = tablaDeColocados(
      [
        fila("PS-0003", "2027-03-01"),
        fila("PS-0001", "2026-10-09"),
        fila("PS-0004", "2026-11-30"), // 60 días: destacado
        fila("PS-0005", "2026-12-01"), // 61 días: después
        fila("PS-0002", "2026-11-29"), // 59 días
      ],
      HOY,
    );
    expect(DIAS_DESTACADO).toBe(60);
    expect(t.pronto.map((f) => [f.codigo, f.faltan])).toEqual([
      ["PS-0001", 8],
      ["PS-0002", 59],
      ["PS-0004", 60],
    ]);
    expect(t.despues.map((f) => [f.codigo, f.faltan])).toEqual([
      ["PS-0005", 61],
      ["PS-0003", 151],
    ]);
    expect(t.limitePronto).toBe("2026-11-30");
  });

  it("a igual vencimiento, por código; sin colocados, vacía", () => {
    const t = tablaDeColocados([fila("PS-0009", "2026-10-20"), fila("PS-0002", "2026-10-20")], HOY);
    expect(t.pronto.map((f) => f.codigo)).toEqual(["PS-0002", "PS-0009"]);
    expect(tablaDeColocados([], HOY)).toEqual({
      pronto: [],
      despues: [],
      limitePronto: "2026-11-30",
    });
  });
});

describe("proximoCambioDeBanda (lo que verá el cliente después)", () => {
  it("de «Más de 1 mes» a «1 mes» 30 días antes de la liberación", () => {
    expect(proximoCambioDeBanda("2026-11-13", HOY)).toEqual({
      desde: "2026-10-14",
      banda: "un_mes",
    });
  });
  it("de «1 mes» a «2 semanas», a «1 semana» y a «Inmediato» el día de la liberación", () => {
    expect(proximoCambioDeBanda("2026-10-20", HOY)).toEqual({
      desde: "2026-10-06",
      banda: "dos_semanas",
    });
    expect(proximoCambioDeBanda("2026-10-10", HOY)).toEqual({
      desde: "2026-10-03",
      banda: "una_semana",
    });
    expect(proximoCambioDeBanda("2026-10-05", HOY)).toEqual({
      desde: "2026-10-05",
      banda: "inmediato",
    });
  });
  it("ya liberado: sin cambio por delante", () => {
    expect(proximoCambioDeBanda(HOY, HOY)).toBeNull();
  });
});
