// HU-092 y HU-146: la renovación del enlace vencido. Desde el 2026-09-29 (sponsor) no consulta HubSpot:
// a un invitado le llega el enlace nuevo solo a su buzón; a quien no estaba invitado, nada. Quien pide ve
// siempre la misma respuesta, y toda petición avisa a Talento Humano.
import { describe, expect, it } from "vitest";
import {
  VENTANA_RENOVACION_MS,
  decidirRenovacion,
  enVentanaDeEspera,
  mensajeAvisoRenovacion,
  mensajeEnlaceRenovado,
} from "./renovacion";

describe("decidirRenovacion", () => {
  it("invitado → emitir el enlace nuevo y avisar a Talento Humano", () => {
    expect(decidirRenovacion(true)).toEqual({ resultado: "enlace_enviado", emitir: true, avisar: true });
  });
  it("no invitado → nada que emitir, pero Talento Humano se entera", () => {
    expect(decidirRenovacion(false)).toEqual({ resultado: "no_invitado", emitir: false, avisar: true });
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
  it("el enlace renovado sigue el prototipo correo-enlace-renovado: cuenta en negrita, dirección en bloque mono, secundarios en pequeño", () => {
    const { html } = mensajeEnlaceRenovado({
      url: "https://people.trycore.com/e/#t=ABC",
      cuenta: "Bancolombia",
      proyecto: "Modernización de pagos",
      correo: "mariana@bancolombia.com.co",
      venceEl: new Date("2026-10-29T15:00:00Z"),
    });
    expect(html).toMatch(/<strong[^>]*>Bancolombia · Modernización de pagos<\/strong>/);
    expect(html).toMatch(/<p style="[^"]*background:#F1F3F7[^"]*'Geist Mono'[^"]*">https:\/\/people\.trycore\.com\/e\/#t=ABC<\/p>/);
    expect(html).toMatch(/<p style="[^"]*font-size:13px[^"]*">Vence el 29 oct 2026/);
    expect(html).toMatch(/<p style="[^"]*font-size:12px[^"]*">Si el botón no funciona, copia esta dirección:<\/p>/);
    expect(html).toMatch(/<p style="[^"]*font-size:13px[^"]*">El enlace es personal/);
  });
  it("el aviso a Talento Humano de un invitado dice quién pidió, de qué cuenta y el enlace nuevo", () => {
    const m = mensajeAvisoRenovacion({
      resultado: "enlace_enviado",
      cuenta: "APAP",
      proyecto: "Core bancario",
      codigoEnlace: "ENL-0007",
      codigoNuevo: "ENL-0031",
      correo: "mariana@apap.com.do",
      pedidaEn: new Date("2026-09-29T14:14:00Z"),
    });
    expect(m.asunto).toBe("Enlace nuevo pedido: APAP · Core bancario");
    expect(m.texto).toContain("mariana@apap.com.do");
    expect(m.texto).toContain("ENL-0007");
    expect(m.texto).toContain("Se le envió el enlace nuevo ENL-0031 a su buzón.");
    expect(m.texto).toContain("29 sep 2026, 9:14 a. m.");
    expect(m.texto).not.toMatch(/HubSpot|#t=/);
  });
  it("el aviso de quien no estaba invitado dice que no se le envió nada", () => {
    const m = mensajeAvisoRenovacion({
      resultado: "no_invitado",
      cuenta: "APAP",
      proyecto: null,
      codigoEnlace: "ENL-0007",
      codigoNuevo: null,
      correo: "reenviado@gmail.com",
      pedidaEn: new Date("2026-09-29T14:14:00Z"),
    });
    expect(m.asunto).toBe("Enlace nuevo pedido por alguien no invitado: APAP");
    expect(m.texto).toContain("reenviado@gmail.com no estaba invitado al enlace ENL-0007");
    expect(m.texto).toContain("No se le envió ningún enlace.");
    expect(m.html).not.toMatch(/<script/);
  });
});
