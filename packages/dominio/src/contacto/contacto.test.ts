import { describe, expect, it } from "vitest";
import { CONTACTO_POR_OMISION, quienAtiende, textoContacto, validarContacto } from "./contacto";

describe("contacto de Trycore (HU-147)", () => {
  it("por omisión, el buzón de People Service sin nombre ni cargo", () => {
    expect(CONTACTO_POR_OMISION).toEqual({
      direccion: "people.service@trycore.com",
      nombre: null,
      cargo: null,
    });
    expect(textoContacto(CONTACTO_POR_OMISION)).toBe("People Service: people.service@trycore.com");
  });

  it("con nombre y cargo: «Nombre, Cargo: correo»", () => {
    const c = {
      direccion: "eida.tinjaca@trycore.com",
      nombre: "Eida Tinjacá",
      cargo: "Coordinación de Servicio",
    };
    expect(quienAtiende(c)).toBe("Eida Tinjacá, Coordinación de Servicio");
    expect(textoContacto(c)).toBe(
      "Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com",
    );
  });

  it("solo correo: «People Service: correo», nunca un nombre vacío ni un cargo suelto", () => {
    const c = { direccion: "servicio.clientes@trycore.com", nombre: null, cargo: null };
    expect(textoContacto(c)).toBe("People Service: servicio.clientes@trycore.com");
    expect(textoContacto({ ...c, nombre: "  ", cargo: "" })).toBe(
      "People Service: servicio.clientes@trycore.com",
    );
  });

  it("nombre sin cargo o cargo sin nombre, sin separadores huérfanos", () => {
    const correo = "eida.tinjaca@trycore.com";
    expect(quienAtiende({ direccion: correo, nombre: "Eida Tinjacá", cargo: null })).toBe("Eida Tinjacá");
    expect(quienAtiende({ direccion: correo, nombre: null, cargo: "Coordinación de Servicio" })).toBe(
      "Coordinación de Servicio",
    );
  });

  it("valida: correo @trycore.com obligatorio, nombre y cargo opcionales y recortados", () => {
    expect(
      validarContacto({
        correo: " Eida.Tinjaca@Trycore.com ",
        nombre: " Eida Tinjacá ",
        cargo: "",
      }),
    ).toEqual({
      ok: true,
      contacto: { direccion: "eida.tinjaca@trycore.com", nombre: "Eida Tinjacá", cargo: null },
    });
    expect(validarContacto({ correo: "eida.tinjaca@gmail.com" })).toEqual({
      ok: false,
      motivo: "correo_externo",
    });
    expect(validarContacto({ correo: "eida" })).toEqual({ ok: false, motivo: "correo_invalido" });
    expect(validarContacto({ correo: "a@trycore.com", nombre: "x".repeat(81) })).toEqual({
      ok: false,
      motivo: "texto_largo",
    });
  });
});
