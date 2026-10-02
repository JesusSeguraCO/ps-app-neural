// HU-139: el léxico aprobado hace que la búsqueda reconozca el término del cliente; lo que no se
// reconoce se subraya en las candidatas. Intérprete determinista mínimo (RF-2.6: léxico y
// normalización; el intérprete completo con facetas es de EP-009).
import { describe, expect, it } from "vitest";
import { armarVocabulario, reconocer } from "./reconocer";

const vocabulario = armarVocabulario({
  catalogo: [
    { tipo: "rol", nombre: "Analista QA automatización" },
    { tipo: "tecnologia", nombre: "Kafka" },
    { tipo: "tecnologia", nombre: "Java" },
    { tipo: "sector", nombre: "Banca" },
    { tipo: "seniority", nombre: "Senior" },
  ],
  lexico: [
    {
      termino: "pagos en tiempo real",
      sinonimos: ["pagos inmediatos"],
      equivalencias: [
        { tipo: "tecnologia", nombre: "Kafka" },
        { tipo: "sector", nombre: "Banca" },
      ],
    },
  ],
});

describe("reconocer", () => {
  it("un valor del catálogo escrito con otras mayúsculas y sin tildes se reconoce", () => {
    const r = reconocer("analista qa automatizacion senior", vocabulario);
    expect(r.reconocidos.map((x) => x.texto)).toEqual(["analista qa automatizacion", "senior"]);
    expect(r.reconocidos[0]!.valores).toEqual([
      { tipo: "rol", nombre: "Analista QA automatización" },
    ]);
    expect(r.sinReconocer).toEqual([]);
  });

  it("el término del léxico se reconoce con su equivalencia (tal como quedó aprobada)", () => {
    const r = reconocer("desarrollador con experiencia en pagos en tiempo real", vocabulario);
    expect(r.reconocidos).toEqual([
      {
        texto: "pagos en tiempo real",
        valores: [
          { tipo: "tecnologia", nombre: "Kafka" },
          { tipo: "sector", nombre: "Banca" },
        ],
      },
    ]);
    expect(r.sinReconocer).toEqual(["desarrollador"]);
  });

  it("los sinónimos del término también lo reconocen", () => {
    expect(reconocer("Pagos inmediatos", vocabulario).reconocidos[0]!.valores).toHaveLength(2);
  });

  it("sin el término en el léxico, la misma consulta no se reconoce", () => {
    const sinLexico = armarVocabulario({ catalogo: [], lexico: [] });
    const r = reconocer("pagos en tiempo real", sinLexico);
    expect(r.reconocidos).toEqual([]);
    expect(r.sinReconocer).toEqual(["pagos", "tiempo real"]);
  });

  it("tramos para subrayar: palabras de enlace neutras, lo no reconocido agrupado", () => {
    const r = reconocer("ingeniero de integraciones con experiencia en Java", vocabulario);
    expect(r.tramos).toEqual([
      { texto: "ingeniero", tipo: "sin_reconocer" },
      { texto: "de", tipo: "neutro" },
      { texto: "integraciones", tipo: "sin_reconocer" },
      { texto: "con experiencia en", tipo: "neutro" },
      { texto: "Java", tipo: "reconocido" },
    ]);
  });

  it("gana la coincidencia más larga", () => {
    const v = armarVocabulario({
      catalogo: [
        { tipo: "tecnologia", nombre: "Java" },
        { tipo: "tecnologia", nombre: "Java Spring" },
      ],
      lexico: [],
    });
    expect(reconocer("java spring", v).reconocidos.map((x) => x.texto)).toEqual(["java spring"]);
  });

  it("la puntuación no impide reconocer", () => {
    expect(reconocer("Kafka, Banca.", vocabulario).reconocidos.map((x) => x.texto)).toEqual([
      "Kafka",
      "Banca",
    ]);
  });
});
