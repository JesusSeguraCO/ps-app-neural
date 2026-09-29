// HU-092: la renovación del enlace vencido. Lo que ve quien pide depende solo del estado de la cuenta
// (nunca de si su correo estaba invitado); el enlace nuevo solo va al buzón de un invitado con cuenta
// activa y, si no se puede confirmar, la petición pasa a una persona (fallo cerrado).
import { describe, expect, it } from "vitest";
import {
  VENTANA_RENOVACION_MS,
  decidirRenovacion,
  enVentanaDeEspera,
  mensajeAvisoRenovacion,
  mensajeEnlaceRenovado,
} from "./renovacion";

describe("decidirRenovacion", () => {
  const activa = { estado: "activa" as const, propietario: "comercial@trycore.com" };
  const inactiva = { estado: "inactiva" as const, propietario: "comercial@trycore.com" };
  const desconocida = { estado: "desconocido" as const };

  it("invitado + cuenta activa → emitir el enlace; público «automatica»", () => {
    expect(decidirRenovacion(true, activa)).toEqual({ publico: "automatica", accion: { tipo: "emitir" } });
  });
  it("no invitado + cuenta activa → nada, con el MISMO público que el invitado", () => {
    expect(decidirRenovacion(false, activa)).toEqual({ publico: "automatica", accion: { tipo: "nada" } });
  });
  it("invitado + cuenta no activa → aviso al propietario de la empresa; público «persona»", () => {
    expect(decidirRenovacion(true, inactiva)).toEqual({
      publico: "persona",
      accion: { tipo: "avisar", a: "propietario", correo: "comercial@trycore.com" },
    });
  });
  it("cuenta no activa sin propietario con correo → a Talento Humano", () => {
    expect(decidirRenovacion(true, { estado: "inactiva", propietario: null })).toEqual({
      publico: "persona",
      accion: { tipo: "avisar", a: "talento_humano" },
    });
  });
  it("invitado + HubSpot sin respuesta → aviso a Talento Humano; nunca se emite (fallo cerrado)", () => {
    expect(decidirRenovacion(true, desconocida)).toEqual({ publico: "persona", accion: { tipo: "avisar", a: "talento_humano" } });
  });
  it("no invitado + cuenta no activa o desconocida → nada, mismo público «persona»", () => {
    expect(decidirRenovacion(false, inactiva)).toEqual({ publico: "persona", accion: { tipo: "nada" } });
    expect(decidirRenovacion(false, desconocida)).toEqual({ publico: "persona", accion: { tipo: "nada" } });
  });
});

describe("enVentanaDeEspera", () => {
  const ahora = new Date("2026-09-29T15:00:00Z");
  it("una petición de hace menos de la ventana la bloquea y dice desde cuándo se puede", () => {
    const pedida = new Date(ahora.getTime() - 5 * 60_000);
    expect(enVentanaDeEspera(pedida, ahora)).toEqual({ enEspera: true, desde: new Date(pedida.getTime() + VENTANA_RENOVACION_MS) });
  });
  it("sin petición previa o ya pasada la ventana → se puede pedir", () => {
    expect(enVentanaDeEspera(null, ahora)).toEqual({ enEspera: false });
    expect(enVentanaDeEspera(new Date(ahora.getTime() - VENTANA_RENOVACION_MS), ahora)).toEqual({ enEspera: false });
  });
});

describe("correos", () => {
  it("el enlace renovado lleva la dirección solo en el correo, con el token en el fragmento", () => {
    const m = mensajeEnlaceRenovado({
      url: "https://people.trycore.com/e/#t=ABC",
      cuenta: "Bancolombia",
      proyecto: "Modernización de pagos",
      correo: "mariana@bancolombia.com.co",
      venceEl: new Date("2026-10-29T15:00:00Z"),
    });
    expect(m.asunto).toBe("Tu enlace nuevo al portal de perfiles");
    expect(m.texto).toContain("https://people.trycore.com/e/#t=ABC");
    expect(m.texto).toContain("Bancolombia · Modernización de pagos");
    expect(m.texto).toContain("Vence el 29 oct 2026");
    expect(m.html).toContain('href="https://people.trycore.com/e/#t=ABC"');
  });
  it("el aviso a una persona dice quién pidió, de qué cuenta y por qué no fue automático", () => {
    const m = mensajeAvisoRenovacion({
      motivo: "cuenta_no_activa",
      cuenta: "Bancolombia",
      codigoEnlace: "ENL-0007",
      correoInvitado: "mariana@bancolombia.com.co",
    });
    expect(m.asunto).toContain("Bancolombia");
    expect(m.texto).toContain("mariana@bancolombia.com.co");
    expect(m.texto).toContain("ENL-0007");
    expect(m.texto).toMatch(/no figura como cuenta activa en HubSpot/);
    const t = mensajeAvisoRenovacion({ motivo: "hubspot_sin_respuesta", cuenta: "X", codigoEnlace: "ENL-1", correoInvitado: "a@x.com" });
    expect(t.texto).toMatch(/HubSpot no respondió/);
    expect(t.texto).not.toMatch(/#t=/);
  });
});
