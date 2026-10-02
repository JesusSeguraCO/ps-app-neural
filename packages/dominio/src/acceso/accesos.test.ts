import { describe, expect, it } from "vitest";
import { validarCorreoPanel } from "./accesos";

describe("validarCorreoPanel (HU-151)", () => {
  it("un correo @trycore.com, normalizado", () => {
    expect(validarCorreoPanel("  Analista.Mercadeo@Trycore.com ")).toEqual({
      ok: true,
      correo: "analista.mercadeo@trycore.com",
    });
  });
  it("otro dominio, aunque lo contenga, es externo", () => {
    for (const c of ["eida.tinjaca@gmail.com", "x@trycore.com.co", "x@mail.trycore.com"])
      expect(validarCorreoPanel(c)).toEqual({ ok: false, motivo: "correo_externo" });
  });
  it("lo que no es un correo", () => {
    for (const c of ["", "eida", "a@b", "a b@trycore.com"])
      expect(validarCorreoPanel(c)).toEqual({ ok: false, motivo: "correo_invalido" });
  });
});
