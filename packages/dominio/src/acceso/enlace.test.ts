// HU-144 (enlace revocado o alterado), HU-092 (vencido) y HU-090 (alcance de la sesión): reglas puras
// del acceso del cliente al abrir `/e/#t=`.
import { describe, expect, it } from "vitest";
import {
  DURACION_PORTAL_MS,
  estadoAlAbrir,
  expiraSesionPortal,
  tokenConForma,
  type FilaTokenEnlace,
} from "./enlace";

const ahora = new Date("2026-09-29T15:00:00Z");
const vigente: FilaTokenEnlace = {
  tokenRevocado: false,
  enlaceEstado: "activo",
  vigenteHasta: new Date("2026-10-20T00:00:00Z"),
};

describe("estadoAlAbrir", () => {
  it("token inexistente (dirección alterada) = el mismo estado que revocado", () => {
    expect(estadoAlAbrir(null, ahora)).toEqual({ estado: "revocado" });
  });
  it("enlace revocado → revocado, aunque siga en vigencia", () => {
    expect(estadoAlAbrir({ ...vigente, enlaceEstado: "revocado" }, ahora)).toEqual({
      estado: "revocado",
    });
  });
  it("token revocado (regenerado) → revocado", () => {
    expect(estadoAlAbrir({ ...vigente, tokenRevocado: true }, ahora)).toEqual({
      estado: "revocado",
    });
  });
  it("revocado y además vencido → revocado (la revocación prevalece)", () => {
    const f = {
      ...vigente,
      enlaceEstado: "revocado" as const,
      vigenteHasta: new Date("2026-09-01T00:00:00Z"),
    };
    expect(estadoAlAbrir(f, ahora)).toEqual({ estado: "revocado" });
  });
  it("vencido → vencido con la fecha en que venció", () => {
    const vencio = new Date("2026-08-26T00:00:00Z");
    expect(estadoAlAbrir({ ...vigente, vigenteHasta: vencio }, ahora)).toEqual({
      estado: "vencido",
      vencio,
    });
  });
  it("vence justo ahora → vencido (el límite no se incluye)", () => {
    expect(estadoAlAbrir({ ...vigente, vigenteHasta: ahora }, ahora).estado).toBe("vencido");
  });
  it("vigente y sin revocar → activo", () => {
    expect(estadoAlAbrir(vigente, ahora)).toEqual({ estado: "activo" });
  });
});

describe("expiraSesionPortal (ADR-0002: 30 días, siempre acotada a la vigencia del enlace)", () => {
  it("30 días si el enlace dura más", () => {
    const hasta = new Date(ahora.getTime() + 60 * 86_400_000);
    expect(expiraSesionPortal(ahora, hasta).getTime()).toBe(ahora.getTime() + DURACION_PORTAL_MS);
    expect(DURACION_PORTAL_MS).toBe(30 * 86_400_000);
  });
  it("la vigencia del enlace si vence antes de 30 días", () => {
    const hasta = new Date(ahora.getTime() + 3 * 86_400_000);
    expect(expiraSesionPortal(ahora, hasta)).toEqual(hasta);
  });
});

describe("tokenConForma (H9: 32 bytes en base64url)", () => {
  it("acepta 43 caracteres base64url", () => {
    expect(tokenConForma("A".repeat(43))).toBe(true);
    expect(tokenConForma("abc-_" + "x".repeat(38))).toBe(true);
  });
  it.each(["", "A".repeat(42), "A".repeat(44), "A".repeat(42) + "=", "A".repeat(42) + "/"])(
    "rechaza %j",
    (t) => expect(tokenConForma(t)).toBe(false),
  );
});
