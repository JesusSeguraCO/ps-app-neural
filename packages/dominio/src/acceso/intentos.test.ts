import { describe, expect, it } from "vitest";
import { estadoInicial, evaluarIntentos, registrarAcierto, registrarFallo } from "./intentos";

const T0 = new Date("2026-09-28T12:00:00Z");
const min = (m: number) => new Date(T0.getTime() + m * 60_000);

describe("PoliticaIntentos (ADR-0002: 5 en 15 min, 20 en 24 h → bloqueo de 24 h)", () => {
  it("sin fallos se puede verificar", () => {
    expect(evaluarIntentos(estadoInicial(T0), T0)).toEqual({ permitido: true });
  });

  it("tras 5 fallos en la ventana no se puede verificar hasta que termine la espera", () => {
    let e = estadoInicial(T0);
    for (let i = 0; i < 5; i++) e = registrarFallo(e, min(i)).estado;
    expect(evaluarIntentos(e, min(5))).toEqual({ permitido: false, hasta: min(15) });
    expect(evaluarIntentos(e, min(14.9)).permitido).toBe(false);
    expect(evaluarIntentos(e, min(15)).permitido).toBe(true);
  });

  it("4 fallos no bloquean", () => {
    let e = estadoInicial(T0);
    for (let i = 0; i < 4; i++) e = registrarFallo(e, min(i)).estado;
    expect(evaluarIntentos(e, min(4)).permitido).toBe(true);
  });

  it("la ventana se reinicia pasados 15 min desde su inicio", () => {
    let e = estadoInicial(T0);
    for (let i = 0; i < 4; i++) e = registrarFallo(e, min(i)).estado;
    e = registrarFallo(e, min(16)).estado; // nueva ventana: 1 fallo
    expect(e.fallosVentana).toBe(1);
    expect(evaluarIntentos(e, min(16)).permitido).toBe(true);
  });

  it("el fallo 20 del día bloquea 24 h y pide alerta", () => {
    let e = estadoInicial(T0);
    let alerta = false;
    for (let i = 0; i < 20; i++) {
      const r = registrarFallo(e, min(i * 16)); // nunca 5 en la misma ventana
      e = r.estado;
      alerta = r.alerta;
    }
    expect(alerta).toBe(true);
    expect(e.bloqueadoHasta).toEqual(new Date(min(19 * 16).getTime() + 24 * 3_600_000));
    expect(evaluarIntentos(e, min(19 * 16 + 60)).permitido).toBe(false);
  });

  it("el contador diario se reinicia a las 24 h", () => {
    let e = estadoInicial(T0);
    for (let i = 0; i < 3; i++) e = registrarFallo(e, min(i * 16)).estado;
    e = registrarFallo(e, min(24 * 60 + 1)).estado;
    expect(e.fallosDia).toBe(1);
  });

  it("un acierto limpia la ventana pero no el tope diario", () => {
    let e = estadoInicial(T0);
    for (let i = 0; i < 3; i++) e = registrarFallo(e, min(i)).estado;
    e = registrarAcierto(e);
    expect(e.fallosVentana).toBe(0);
    expect(e.fallosDia).toBe(3);
  });
});

describe("tope de emisión por sujeto (R-85)", () => {
  it("≤ 3 envíos cada 15 min", async () => {
    const { puedeEmitir, registrarEmision } = await import("./intentos");
    let e = estadoInicial(T0);
    for (let i = 0; i < 3; i++) {
      expect(puedeEmitir(e, min(i))).toBe(true);
      e = registrarEmision(e, min(i));
    }
    expect(puedeEmitir(e, min(3))).toBe(false);
    expect(puedeEmitir(e, min(15))).toBe(true);
  });
  it("≤ 10 envíos al día aunque se repartan en ventanas", async () => {
    const { puedeEmitir, registrarEmision } = await import("./intentos");
    let e = estadoInicial(T0);
    for (let i = 0; i < 10; i++) e = registrarEmision(e, min(i * 16));
    expect(puedeEmitir(e, min(10 * 16))).toBe(false);
    expect(e.bloqueadoHasta).toBeNull();
  });
});
