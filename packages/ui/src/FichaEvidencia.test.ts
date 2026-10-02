// «Frente a tu búsqueda» en la ficha (HU-119, prototipo ficha-perfil): las mismas líneas, con el mismo
// texto y orden que la tarjeta (las dos llaman a `lineasDeEvidencia`); sin criterios no hay bloque.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { armarFicha, type DatosFicha } from "@ps/contratos/ficha";
import { lineasDeEvidencia, textoDeLinea } from "@ps/dominio/catalogo/evidencia";
import { FichaPerfil } from "./FichaPerfil";

const datos: DatosFicha = {
  codigo: "PS-0142",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend",
  seniority: "Senior",
  aniosExperiencia: 9,
  sectores: ["Banca"],
  tecnologias: ["Java"],
  modalidad: "Híbrido",
  pais: "Colombia",
  ciudad: null,
  disponibilidadFecha: "2026-10-01",
  disponibilidadActualizadaEn: new Date("2026-10-01T15:00:00Z"),
  resumen: null,
  selloPersonal: [],
  formacion: null,
  idiomas: [],
  trayectoria: [
    { cargo: "Backend senior", cliente: null, desde: 2020, hasta: 2026, descripcion: "Pagos." },
  ],
  incluyeClientes: false,
  enunciadoPrueba: "Validada por Trycore con un reto de código.",
};
const ficha = armarFicha(datos, { ahora: new Date("2026-10-01T15:00:00Z"), necesidad: "remota" });
const html = (evidencia?: ReturnType<typeof lineasDeEvidencia>) =>
  renderToStaticMarkup(createElement(FichaPerfil, { ficha, evidencia }));
const visible = (h: string) =>
  h
    .replace(/<span class="pp-sr">[^<]*<\/span>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

describe("FichaPerfil · «Frente a tu búsqueda» (HU-119)", () => {
  const lineas = lineasDeEvidencia([
    { tipo: "sector", valor: "Banca", cumple: true, dato: "8" },
    { tipo: "sector", valor: "Seguros", cumple: false, dato: null },
  ]);

  it("happy: una línea por criterio con el mismo texto y orden que la tarjeta; ✓ y – distinguibles", () => {
    const h = html(lineas);
    expect(h).toMatch(/<h3[^>]*id="fp-busqueda"[^>]*>Frente a tu búsqueda<\/h3>/);
    const enFicha = [...h.matchAll(/<li class="fp-criterio( fp-criterio--no)?">(.*?)<\/li>/g)].map(
      (m) => [Boolean(m[1]), visible(m[2]!)],
    );
    expect(enFicha).toEqual([
      [false, "✓ Banca · 8 años declarados"],
      [true, "– Sin experiencia declarada en Seguros"],
    ]);
    expect(enFicha.map((x) => x[1])).toEqual(lineas.map(textoDeLinea));
    expect(visible(h)).not.toMatch(/%|puntaje/i);
    // Va antes de lo verificado y lo declarado, como en el prototipo.
    expect(h.indexOf("fp-busqueda")).toBeLessThan(h.indexOf("fp-verificado"));
  });

  it("edge: sin criterios activos no hay bloque, ni vacío ni con título", () => {
    for (const h of [html(), html([])])
      expect(h).not.toMatch(/Frente a tu búsqueda|fp-criterio|fp-busqueda/);
  });
});
