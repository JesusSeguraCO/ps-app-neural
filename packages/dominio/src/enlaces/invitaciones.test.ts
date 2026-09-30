// HU-095 (pedir la invitación de un colega) y HU-145 (decidirla en el panel): reglas puras.
import { describe, expect, it } from "vitest";
import { TOPE_PETICIONES_POR_INVITADO, dominioDistinto, situacionPeticion, topeDePeticiones, validarPeticion } from "./invitaciones";

describe("validarPeticion", () => {
  it("normaliza el correo y recorta los opcionales vacíos", () => {
    expect(validarPeticion({ correo: " Natalia@Banco.com ", nombre: " ", paraQue: " Revisar backend " }, "mariana@banco.com")).toEqual({
      ok: true,
      correo: "natalia@banco.com",
      nombre: null,
      paraQue: "Revisar backend",
    });
  });
  it.each(["", "sin-arroba", "a@b", "a b@c.com"])("rechaza el correo %j", (correo) => {
    expect(validarPeticion({ correo }, "m@b.com")).toEqual({ ok: false, error: "correo_invalido" });
  });
  it("no se puede pedir para uno mismo", () => {
    expect(validarPeticion({ correo: "M@B.com" }, "m@b.com")).toEqual({ ok: false, error: "es_tu_correo" });
  });
});

describe("situacionPeticion", () => {
  it("enlace vigente y correo nuevo → se puede aprobar o rechazar", () => {
    expect(situacionPeticion({ estadoEnlace: "vigente", yaInvitado: false })).toEqual({ marca: null, puedeAprobar: true, puedeRechazar: true });
  });
  it.each(["vencido", "revocado"] as const)("enlace %s → marcada y sin aprobar", (estadoEnlace) => {
    expect(situacionPeticion({ estadoEnlace, yaInvitado: false })).toEqual({ marca: `enlace_${estadoEnlace}`, puedeAprobar: false, puedeRechazar: true });
  });
  it("correo ya invitado → «ya tiene acceso»; cerrarla no lo duplica", () => {
    expect(situacionPeticion({ estadoEnlace: "vigente", yaInvitado: true })).toEqual({ marca: "ya_invitado", puedeAprobar: true, puedeRechazar: false });
  });
});

describe("dominioDistinto", () => {
  it("avisa cuando el colega es de otro dominio que quien pide", () => {
    expect(dominioDistinto("mariana@bancolombia.com.co", "sebastian@nexo.co")).toBe(true);
    expect(dominioDistinto("mariana@bancolombia.com.co", "NATALIA@Bancolombia.com.co")).toBe(false);
  });
});

describe("topeDePeticiones (por invitado)", () => {
  const ahora = new Date("2026-09-30T12:00:00Z");
  const hace = (min: number) => new Date(ahora.getTime() - min * 60_000);
  it("por debajo del tope en la última hora, permite; al alcanzarlo, dice hasta cuándo", () => {
    const cuatro = [hace(1), hace(2), hace(3), hace(4)];
    expect(topeDePeticiones(cuatro, ahora)).toEqual({ permitido: true });
    const cinco = [...cuatro, hace(30)];
    expect(cinco).toHaveLength(TOPE_PETICIONES_POR_INVITADO);
    expect(topeDePeticiones(cinco, ahora)).toEqual({ permitido: false, hasta: new Date(hace(30).getTime() + 60 * 60_000) });
  });
});
