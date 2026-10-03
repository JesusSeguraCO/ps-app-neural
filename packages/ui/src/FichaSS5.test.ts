// Ficha · EP-003 SS5 (HU-154, HU-155, HU-157) con el componente real: lo verificado y lo declarado con su
// origen, la experiencia solo en lo declarado; la validación técnica desplegable por clic/toque (sin
// hover) con los cinco campos de D59 en orden fijo, «Cumple el estándar», Nivel 0 sin fecha ni promesa,
// la línea de la sesión de alineación y ningún enlace; el contacto de Trycore con el texto de
// representación comercial y ninguna vía hacia la persona.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { armarFicha, type DatosFicha } from "@ps/contratos/ficha";
import { FichaPerfil } from "./FichaPerfil";
import { COPY_FICHA } from "./copy";

const AHORA = new Date("2026-10-02T15:00:00Z");
const base: DatosFicha = {
  codigo: "PS-0142",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend",
  seniority: "Senior",
  aniosExperiencia: 9,
  sectores: ["Banca"],
  tecnologias: ["Java", "Kafka"],
  modalidad: "Remoto",
  pais: "Colombia",
  ciudad: null,
  disponibilidadFecha: "2026-10-01",
  disponibilidadActualizadaEn: AHORA,
  resumen: "Backend de pagos con foco en confiabilidad.",
  selloPersonal: ["Liderazgo técnico", "Pensamiento sistémico", "Comunicación clara"],
  formacion: "Ingeniería de Sistemas",
  idiomas: ["Inglés"],
  trayectoria: [
    {
      cargo: "Arquitecta de software",
      cliente: "Bancolombia",
      desde: 2020,
      hasta: 2026,
      descripcion: "Diseñó la arquitectura de pagos para 3 millones de usuarios.",
    },
  ],
  incluyeClientes: true,
  enunciadoPrueba:
    "Resolvió un reto de código con entrega funcional revisado por un arquitecto de Trycore.",
  reporte: {
    modalidad: "Reto de código con entrega funcional",
    resultado: "Aprobada 4,5/5 (90 %)",
    evaluador: "Célula de arquitectura de Trycore",
    fecha: "2026-02-18",
    criterios: ["Diseño de servicios", "Cobertura de pruebas"],
  },
};
const CONTACTO = {
  direccion: "eida.tinjaca@trycore.com",
  nombre: "Eida Tinjacá",
  cargo: "Coordinación de Servicio",
};
const html = (d: Partial<DatosFicha> = {}, contacto: typeof CONTACTO | null = CONTACTO) =>
  renderToStaticMarkup(
    createElement(FichaPerfil, {
      ficha: armarFicha({ ...base, ...d }, { ahora: AHORA, necesidad: "remota" }),
      contacto: contacto ?? undefined,
    }),
  );
const visible = (h: string) =>
  h
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const seccion = (h: string, id: string) => {
  const i = h.indexOf(`aria-labelledby="${id}"`);
  const j = h.indexOf("</section>", i);
  return i < 0 ? "" : h.slice(i, j);
};
const validacion = (h: string) => {
  const m = h.match(/<details class="fp-validacion"[^>]*>.*?<\/details>/s);
  return m ? m[0] : "";
};

describe("HU-154 · verificado y declarado", () => {
  it("happy: «Verificado por Trycore» con el sello y la validación con tratamiento propio; «Declarado por la persona» con trayectoria, formación y stack", () => {
    const h = html();
    const ver = seccion(h, "fp-verificado");
    const dec = seccion(h, "fp-declarado");
    expect(ver).toContain("Verificado por Trycore");
    expect(ver).toContain("pp-bloque pp-bloque--verificado");
    expect(visible(ver)).toContain(
      "Liderazgo técnico · Pensamiento sistémico · Comunicación clara",
    );
    expect(ver).toContain("Validación técnica");
    expect(dec).toContain("Declarado por la persona");
    for (const x of [
      "Diseñó la arquitectura de pagos",
      "Bancolombia",
      "Ingeniería de Sistemas",
      "Java · Kafka",
    ])
      expect(visible(dec)).toContain(x);
    for (const x of ["Ingeniería de Sistemas", "Bancolombia"])
      expect(visible(ver)).not.toContain(x);
    expect(visible(h)).not.toMatch(
      /\bunidad(es)?\b|\bítem(s)?\b|disponible para asignación|\bstock\b/i,
    );
  });

  it("edge: la experiencia solo en lo declarado; la validación muestra solo la prueba, sin citar la trayectoria", () => {
    const h = html();
    expect(visible(seccion(h, "fp-verificado"))).not.toMatch(
      /arquitectura de pagos|Arquitecta de software|3 millones/,
    );
    expect(visible(validacion(h))).not.toMatch(/arquitectura de pagos|Bancolombia|9 años/);
  });
});

describe("HU-155 · validación técnica desplegable", () => {
  it("happy: bloque desplegable (clic/toque, abierto por omisión) con los cinco campos de D59 en orden fijo", () => {
    const v = validacion(html());
    expect(v).toMatch(/^<details class="fp-validacion" open=""[ >]/);
    expect(v).toMatch(/<summary[^>]*>.*Validación técnica.*<\/summary>/s);
    const campos = [...v.matchAll(/<dt>(.*?)<\/dt>\s*<dd>(.*?)<\/dd>/gs)].map((m) => [
      visible(m[1]!),
      visible(m[2]!),
    ]);
    expect(campos).toEqual([
      ["Prueba aplicada", "Reto de código con entrega funcional"],
      ["Qué se evaluó", "Diseño de servicios · Cobertura de pruebas"],
      ["Resultado", "Cumple el estándar"],
      ["Evaluador", "Célula de arquitectura de Trycore"],
      ["Fecha", "febrero de 2026"],
    ]);
    // Sin puntaje, nota ni porcentaje (el texto libre del reporte no cruza a la cara cliente).
    expect(visible(html())).not.toMatch(/4,5|\/5|%|Aprobada/);
    // No depende del cursor: nada de title/hover para mostrar el detalle.
    expect(v).not.toMatch(/title=|onmouseover|tooltip/i);
  });

  it("edge: ningún enlace, archivo ni repositorio; sí la línea de la sesión de alineación", () => {
    const v = validacion(html());
    expect(v).not.toMatch(/<a\b|href=|repositorio|\.zip|\.pdf|descarg/i);
    expect(visible(v)).toContain(COPY_FICHA.validacionAlineacion);
  });

  it("error: Nivel 0 → la prueba con el texto de cara al cliente, sin fecha, sin campos vacíos ni promesas", () => {
    const v = validacion(html({ reporte: null }));
    const campos = [...v.matchAll(/<dt>(.*?)<\/dt>\s*<dd>(.*?)<\/dd>/gs)].map((m) => [
      visible(m[1]!),
      visible(m[2]!),
    ]);
    expect(campos).toEqual([["Prueba aplicada", base.enunciadoPrueba]]);
    expect(visible(v)).not.toMatch(
      /Fecha|Evaluador|Resultado|no aplica|pendiente|próximamente|\b20\d\d\b/i,
    );
    expect(visible(v)).not.toContain(COPY_FICHA.validacionAlineacion);
  });
});

describe("HU-157 · la conversación va por Trycore", () => {
  it("happy: el contacto vigente con el texto de representación comercial, sin desplegar y sin acción aparte", () => {
    const h = html();
    const c = seccion(h, "fp-contacto");
    expect(visible(c)).toContain(COPY_FICHA.contactoConversacion);
    expect(visible(c)).toContain(COPY_FICHA.contactoRespaldo);
    expect(visible(c)).toContain(COPY_FICHA.contactoSinViaDirecta);
    expect(visible(c)).toContain(
      "Eida Tinjacá, Coordinación de Servicio: eida.tinjaca@trycore.com",
    );
    expect(c).not.toMatch(/<details|<button/);
    expect(visible(h)).not.toMatch(/Escribir a Trycore/);
    // Fuera del bloque de contacto no hay ningún mailto ni otra vía.
    expect(h.replace(c, "")).not.toMatch(/mailto:|tel:|https?:\/\//);
  });

  it("solo buzón: «People Service: …», como define HU-147", () => {
    const c = seccion(
      html({}, { direccion: "people.service@trycore.com", nombre: null, cargo: null } as never),
      "fp-contacto",
    );
    expect(visible(c)).toContain("People Service: people.service@trycore.com");
  });

  it("error: ningún camino hacia la persona (correo, teléfono, redes, hoja de vida)", () => {
    const h = html();
    const sinContacto = h.replace(seccion(h, "fp-contacto"), "");
    expect(sinContacto).not.toMatch(/@|linkedin|github|hoja de vida|\bCV\b|teléfono|\+57/i);
  });

  it("sin contacto (vista que no lo pasa) no deja un bloque vacío", () => {
    expect(html({}, null)).not.toContain("fp-contacto");
  });
});
