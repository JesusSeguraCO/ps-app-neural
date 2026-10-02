// V9-8 / V4-4 (CON-8, RF-16.2): al modelo solo viaja el texto de consultas permitidas y sin nombres
// de perfiles, más la taxonomía. Y lo que vuelve solo se convierte en propuesta si apunta a valores
// que existen en el catálogo y no es un término ya en el léxico, pendiente o rechazado.
import { describe, expect, it } from "vitest";
import { armarLoteLexico, propuestasDesdeRespuesta } from "./lote";

const consultas = [
  {
    id: "c1",
    texto: "analista de calidad de software",
    modeloPermitido: true,
    veces: 3,
    cuentas: 2,
  },
  {
    id: "c2",
    texto: "algo como Laura Méndez pero en Java",
    modeloPermitido: true,
    veces: 1,
    cuentas: 1,
  },
  { id: "c3", texto: "pagos en tiempo real", modeloPermitido: false, veces: 4, cuentas: 3 },
  { id: "c4", texto: "experto en mendez framework", modeloPermitido: true, veces: 1, cuentas: 1 },
  { id: "c5", texto: "   ", modeloPermitido: true, veces: 1, cuentas: 1 },
];
const nombres = [{ nombre: "Laura", primerApellido: "Méndez" }];

describe("armarLoteLexico", () => {
  it("excluye las consultas sin permiso para el modelo y las que contienen un nombre o apellido de un perfil", () => {
    const lote = armarLoteLexico(consultas, nombres);
    expect(lote.enviadas.map((c) => c.id)).toEqual(["c1"]);
    expect(lote.omitidas).toEqual([
      { id: "c2", motivo: "nombre_de_perfil" },
      { id: "c3", motivo: "modelo_no_permitido" },
      { id: "c4", motivo: "nombre_de_perfil" },
      { id: "c5", motivo: "vacia" },
    ]);
  });
  it("el texto enviado no contiene ningún nombre ni apellido del inventario (sin distinguir tildes)", () => {
    const lote = armarLoteLexico(consultas, nombres);
    const payload = JSON.stringify(lote.enviadas).toLowerCase();
    expect(payload).not.toMatch(/laura|mendez|méndez|tiempo real/);
  });
});

const catalogo = [
  { tipo: "rol" as const, id: "r1", nombre: "Analista QA automatización" },
  { tipo: "tecnologia" as const, id: "t1", nombre: "Kafka" },
  { tipo: "sector" as const, id: "s1", nombre: "Banca" },
];

describe("propuestasDesdeRespuesta", () => {
  const enviadas = [
    { id: "c1", texto: "analista de calidad de software", veces: 3, cuentas: 2 },
    { id: "c6", texto: "pagos inmediatos para bancos", veces: 2, cuentas: 2 },
  ];
  it("traduce los nombres de valor a ids del catálogo y suma búsquedas y cuentas de sus consultas", () => {
    const r = propuestasDesdeRespuesta(
      {
        propuestas: [
          {
            termino: "Analista de calidad de software",
            sinonimos: ["tester automatizador"],
            equivalencias: [{ tipo: "rol", valor: "analista qa automatizacion" }],
            consultas: ["c1"],
          },
        ],
      },
      { enviadas, catalogo, excluidos: [] },
    );
    expect(r).toEqual([
      {
        termino: "Analista de calidad de software",
        sinonimos: ["tester automatizador"],
        equivalencias: [{ tipo: "rol", id: "r1" }],
        consultas: ["c1"],
        ejemplo: "analista de calidad de software",
        busquedas: 3,
        cuentas: 2,
      },
    ]);
  });
  it("descarta equivalencias a valores inexistentes y la propuesta que se queda sin ninguna", () => {
    const r = propuestasDesdeRespuesta(
      {
        propuestas: [
          {
            termino: "pagos inmediatos",
            sinonimos: [],
            equivalencias: [
              { tipo: "tecnologia", valor: "Kafka Streams" },
              { tipo: "sector", valor: "Banca" },
            ],
            consultas: ["c6", "c-inventada"],
          },
          {
            termino: "cosa rara",
            sinonimos: [],
            equivalencias: [{ tipo: "rol", valor: "Astronauta" }],
            consultas: ["c6"],
          },
        ],
      },
      { enviadas, catalogo, excluidos: [] },
    );
    expect(r).toHaveLength(1);
    expect(r[0]!.equivalencias).toEqual([{ tipo: "sector", id: "s1" }]);
    expect(r[0]!.consultas).toEqual(["c6"]);
  });
  it("no repropone términos ya en el léxico, pendientes o rechazados", () => {
    const r = propuestasDesdeRespuesta(
      {
        propuestas: [
          {
            termino: "Pagos Inmediatos",
            sinonimos: [],
            equivalencias: [{ tipo: "sector", valor: "Banca" }],
            consultas: ["c6"],
          },
        ],
      },
      { enviadas, catalogo, excluidos: ["pagos inmediatos"] },
    );
    expect(r).toEqual([]);
  });
});
