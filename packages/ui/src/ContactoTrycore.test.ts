// Componente único del contacto de Trycore (HU-147): «Nombre, Cargo: correo» o «People Service: correo»,
// con el correo como enlace mailto; nunca un nombre vacío ni un cargo suelto.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactoTrycore } from "./ContactoTrycore";

const texto = (html: string) => html.replace(/<[^>]+>/g, "");

describe("ContactoTrycore (HU-147)", () => {
  it("con nombre y cargo", () => {
    const html = renderToStaticMarkup(
      createElement(ContactoTrycore, {
        contacto: {
          direccion: "eida.tinjaca@trycore.com",
          nombre: "Eida Tinjacá",
          cargo: "Coordinación de Servicio",
        },
      }),
    );
    expect(texto(html)).toBe("Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com");
    expect(html).toContain('href="mailto:eida.tinjaca@trycore.com"');
  });

  it("solo correo", () => {
    const html = renderToStaticMarkup(
      createElement(ContactoTrycore, {
        contacto: { direccion: "servicio.clientes@trycore.com", nombre: null, cargo: null },
      }),
    );
    expect(texto(html)).toBe("People Service: servicio.clientes@trycore.com");
  });

  it("sin enlace, el correo como texto con la clase pedida", () => {
    const html = renderToStaticMarkup(
      createElement(ContactoTrycore, {
        contacto: { direccion: "a@trycore.com", nombre: "Ana", cargo: null },
        enlace: false,
        claseCorreo: "av-correo",
      }),
    );
    expect(html).toBe('Ana: <span class="av-correo">a@trycore.com</span>');
  });
});
