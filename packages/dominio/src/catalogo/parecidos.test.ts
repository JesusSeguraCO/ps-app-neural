// HU-089 (crear sin duplicar) y diseño §6: normalización, idéntico → bloqueo, parecido → confirmación.
// Casos de la historia: «figma» (idéntico salvo mayúsculas), «Fgima» (parecido), «Fig» (coincidencia
// al elegir). Propiedades con fast-check.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { clasificarNombre, coincidencias, distanciaDamerau, masCercanos, normalizar } from "./parecidos";

const catalogo = [
  { id: "1", nombre: "Figma" },
  { id: "2", nombre: "Java" },
  { id: "3", nombre: "JavaScript" },
  { id: "4", nombre: "Diseño de producto" },
  { id: "5", nombre: "Kafka" },
];

describe("normalizar", () => {
  it("quita mayúsculas, diacríticos (incluida la ñ) y espacios de más", () => {
    expect(normalizar("  Diseño   de PRODUCTO ")).toBe("diseno de producto");
    expect(normalizar("Ingeniería")).toBe("ingenieria");
    expect(normalizar("ÁÉÍÓÚÜ Ñ")).toBe("aeiouu n");
  });
  it("es idempotente", () => {
    fc.assert(fc.property(fc.string(), (s) => normalizar(normalizar(s)) === normalizar(s)));
  });
});

describe("distanciaDamerau", () => {
  it("cuenta una transposición como un solo cambio", () => {
    expect(distanciaDamerau("fgima", "figma")).toBe(1);
    expect(distanciaDamerau("kafka", "kafka")).toBe(0);
    expect(distanciaDamerau("", "abc")).toBe(3);
  });
  it("es simétrica y cero solo entre iguales", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 12 }), fc.string({ maxLength: 12 }), (a, b) => {
        const d = distanciaDamerau(a, b);
        return d === distanciaDamerau(b, a) && (d === 0) === (a === b);
      }),
    );
  });
});

describe("clasificarNombre (HU-089)", () => {
  it("error — idéntico salvo mayúsculas: «figma» se bloquea y nombra a «Figma»", () => {
    expect(clasificarNombre("figma", catalogo)).toEqual({
      tipo: "identico",
      existente: { id: "1", nombre: "Figma" },
    });
  });
  it("idéntico salvo acentos o espacios también se bloquea", () => {
    expect(clasificarNombre(" diseno  de producto", catalogo).tipo).toBe("identico");
  });
  it("error — parecido: «Fgima» ofrece «Figma» y exige confirmar", () => {
    expect(clasificarNombre("Fgima", catalogo)).toEqual({
      tipo: "parecido",
      parecidos: [{ id: "1", nombre: "Figma" }],
    });
  });
  it("contención: «Kafka Streams» se parece a «Kafka»", () => {
    const r = clasificarNombre("Kafka Streams", catalogo);
    expect(r.tipo).toBe("parecido");
    expect(r.tipo === "parecido" && r.parecidos.map((p) => p.nombre)).toEqual(["Kafka"]);
  });
  it("umbral ajustado por longitud: nombres cortos no se emparejan por una letra de más", () => {
    expect(clasificarNombre("Go", [{ id: "9", nombre: "C" }]).tipo).toBe("nuevo");
    expect(clasificarNombre("Rust", catalogo).tipo).toBe("nuevo");
  });
  it("nada parecido → nuevo", () => {
    expect(clasificarNombre("Especialista en seguridad de aplicaciones", catalogo)).toEqual({
      tipo: "nuevo",
    });
  });
  it("vacío tras normalizar → inválido", () => {
    expect(clasificarNombre("   ", catalogo)).toEqual({ tipo: "vacio" });
  });
  it("propiedad: todo valor del catálogo, reescrito con otras mayúsculas, es idéntico", () => {
    fc.assert(
      fc.property(fc.constantFrom(...catalogo), fc.boolean(), (v, mayus) => {
        const escrito = mayus ? v.nombre.toUpperCase() : v.nombre.toLowerCase();
        const r = clasificarNombre(escrito, catalogo);
        return r.tipo === "identico" && r.existente.id === v.id;
      }),
    );
  });
});

describe("coincidencias (HU-089, seleccionar en vez de escribir)", () => {
  it("«Fig» ofrece «Figma»", () => {
    expect(coincidencias("Fig", catalogo).map((v) => v.nombre)).toEqual(["Figma"]);
  });
  it("prefijo antes que contenido y sin distinguir acentos", () => {
    expect(coincidencias("java", catalogo).map((v) => v.nombre)).toEqual(["Java", "JavaScript"]);
    expect(coincidencias("diseno", catalogo).map((v) => v.nombre)).toEqual(["Diseño de producto"]);
  });
  it("texto vacío no ofrece nada", () => {
    expect(coincidencias("  ", catalogo)).toEqual([]);
  });
});

describe("masCercanos (HU-139, equivalencia a un valor inexistente)", () => {
  const tecnologias = [
    { id: "a", nombre: "Kafka" },
    { id: "b", nombre: "Spark Streaming" },
    { id: "c", nombre: "RabbitMQ" },
    { id: "d", nombre: "Figma" },
    { id: "e", nombre: "Apache Flink" },
  ];
  it("«Kafka Streams» ofrece primero Kafka (contención) y luego Spark Streaming (comparte palabra)", () => {
    expect(masCercanos("Kafka Streams", tecnologias, 2).map((v) => v.nombre)).toEqual([
      "Kafka",
      "Spark Streaming",
    ]);
  });
  it("nunca más del límite y nada con texto vacío", () => {
    expect(masCercanos("x", tecnologias)).toHaveLength(4);
    expect(masCercanos(" ", tecnologias)).toEqual([]);
  });
});
