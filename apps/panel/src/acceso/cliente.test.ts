// Destino tras un 401 del panel (HU-138, HU-151): solo las causas conocidas viajan en la URL.
import { describe, expect, it } from "vitest";
import { destinoTrasRechazo } from "./cliente";

describe("destinoTrasRechazo", () => {
  it("lleva la causa conocida a la puerta", () => {
    expect(destinoTrasRechazo("sesion_expirada")).toBe("/acceso?motivo=sesion_expirada");
    expect(destinoTrasRechazo("rol_cambiado")).toBe("/acceso?motivo=rol_cambiado");
  });
  it("sin causa o con una desconocida va a la puerta sin parámetros (no hay redirector abierto)", () => {
    expect(destinoTrasRechazo(undefined)).toBe("/acceso");
    expect(destinoTrasRechazo("sin_sesion")).toBe("/acceso");
    expect(destinoTrasRechazo("//evil.example")).toBe("/acceso");
  });
});
