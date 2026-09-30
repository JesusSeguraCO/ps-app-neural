import { describe, expect, it } from "vitest";
import {
  clasificarEnvio,
  generarCodigo,
  hmacCodigo,
  hmacCorreo,
  normalizarCorreo,
  planDeEnvioCodigo,
} from "./codigo";

describe("código de un uso (ADR-0002)", () => {
  it("tiene 6 dígitos y admite ceros a la izquierda", () => {
    for (let i = 0; i < 500; i++) expect(generarCodigo()).toMatch(/^\d{6}$/);
  });

  it("no se repite de forma trivial", () => {
    const vistos = new Set(Array.from({ length: 200 }, () => generarCodigo()));
    expect(vistos.size).toBeGreaterThan(190);
  });

  it("el HMAC depende del pepper del ámbito", () => {
    const a = hmacCodigo("123456", "p".repeat(32));
    const b = hmacCodigo("123456", "q".repeat(32));
    expect(a.equals(b)).toBe(false);
    expect(a.length).toBe(32);
    expect(hmacCodigo("123456", "p".repeat(32)).equals(a)).toBe(true);
  });
});

describe("correos", () => {
  it("normaliza minúsculas y espacios y conserva el alias +etiqueta", () => {
    expect(normalizarCorreo("  Ana.Perez+Proyecto@Cliente.COM ")).toBe(
      "ana.perez+proyecto@cliente.com",
    );
  });
  it("el HMAC del correo es estable tras normalizar", () => {
    const k = "k".repeat(32);
    expect(hmacCorreo(" ANA@x.com", k).equals(hmacCorreo("ana@x.com", k))).toBe(true);
  });
});

describe("plan de envío del código (ADR-0009: 5/15/30 s y caducidad a los 10 min)", () => {
  it.each([
    [0, 5],
    [1, 15],
    [2, 30],
  ])("tras %i intentos fallidos el siguiente va a los %i s", (intentos, segundos) => {
    expect(planDeEnvioCodigo(intentos)).toEqual({ tipo: "reintentar", enSegundos: segundos });
  });
  it("tras 3 intentos fallidos se abandona", () => {
    expect(planDeEnvioCodigo(3)).toEqual({ tipo: "abandonar" });
  });
});

describe("clasificación del resultado de Mailgun (H22)", () => {
  it.each([
    [200, "ok"],
    [429, "ambiguo"],
    [500, "ambiguo"],
    [503, "ambiguo"],
    [400, "definitivo"],
    [401, "definitivo"],
    [404, "definitivo"],
  ] as const)("HTTP %i → %s", (status, esperado) => {
    expect(clasificarEnvio({ status })).toBe(esperado);
  });
  it("timeout o fallo de red → ambiguo", () => {
    expect(clasificarEnvio({ error: "timeout" })).toBe("ambiguo");
    expect(clasificarEnvio({ error: "red" })).toBe("ambiguo");
  });
});
