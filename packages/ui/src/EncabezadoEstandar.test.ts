// Encabezado del estándar Neural-Grid y bloque de respaldo (HU-159; D64, D73, D80) con el componente
// real: cuatro dimensiones (tres condiciones de entrada y Neural Speed como garantía del servicio), la
// frase que llega del dominio una sola vez, en el flujo de la página (sin diálogo, sin cerrar ni aceptar,
// sin fijarse encima de la lista); el respaldo con Trycore University, Hive Mind, la Coordinación de
// Servicio dedicada y el SLA en el tamaño del texto.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FRASES_ESTANDAR } from "@ps/dominio/catalogo/estandar";
import { EncabezadoEstandar, RespaldoServicio } from "./EncabezadoEstandar";
import { COPY_ESTANDAR } from "./copy";

const visible = (h: string) =>
  h
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

describe("HU-159 · encabezado del estándar", () => {
  for (const frase of [FRASES_ESTANDAR.ninguno, FRASES_ESTANDAR.descriptiva]) {
    it(`explica las cuatro dimensiones y dice la frase una sola vez (${frase.slice(0, 12)}…)`, () => {
      const h = renderToStaticMarkup(createElement(EncabezadoEstandar, { frase }));
      const v = visible(h);
      for (const d of ["Grid de Seguridad", "Grid Técnico", "Neural Fit", "Neural Speed"])
        expect(v).toContain(d);
      expect(v.match(/Condición de entrada/g)?.length).toBe(3);
      expect(v.match(/Garantía del servicio/g)?.length).toBe(1);
      expect(v).toMatch(/cuatro dimensiones/);
      expect(v).not.toMatch(/cinco/i);
      expect(v.split(frase).length - 1).toBe(1);
      // Una sola vez: las tres validaciones solo en la frase.
      for (const x of ["bajo SARO", "prueba técnica revisada por Trycore", "evaluación DISC"])
        expect(v.split(x).length - 1, x).toBe(1);
    });
  }

  it("en el flujo de la página: una sección, sin diálogo, sin botón de cerrar ni aceptar, sin fijarse", () => {
    const h = renderToStaticMarkup(
      createElement(EncabezadoEstandar, { frase: FRASES_ESTANDAR.descriptiva }),
    );
    expect(h).toMatch(/^<section class="ee-estandar"/);
    expect(h).not.toMatch(/role="dialog"|aria-modal|<dialog|<button|popover|ee-fijo|sticky|fixed/i);
    expect(visible(h)).not.toMatch(/Cerrar|Aceptar|Entendido|Descartar|No volver a mostrar/i);
  });

  it("sin número ni nombres de perfiles", () => {
    const h = renderToStaticMarkup(
      createElement(EncabezadoEstandar, { frase: FRASES_ESTANDAR.descriptiva }),
    );
    // El único número es el «día 1» de la garantía (RF-6.5): ningún conteo.
    expect(visible(h).replace("día 1", "")).not.toMatch(/\d|PS-/);
  });
});

describe("HU-159 · respaldo y plazo a la vista", () => {
  it("Trycore University, Hive Mind, la Coordinación de Servicio dedicada y el SLA en el tamaño del texto", () => {
    const h = renderToStaticMarkup(createElement(RespaldoServicio));
    const v = visible(h);
    for (const x of ["Trycore University", "Hive Mind", "Coordinación de Servicio dedicada"])
      expect(v).toContain(x);
    expect(v).toContain(COPY_ESTANDAR.sla);
    expect(COPY_ESTANDAR.sla).toMatch(/10 días hábiles/);
    expect(h).toMatch(/<p class="ee-respaldo__sla">/);
    expect(h).not.toMatch(/<small|pp-meta|<footer/);
  });
});
