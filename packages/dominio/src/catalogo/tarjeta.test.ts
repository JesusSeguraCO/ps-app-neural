// Tarjeta del perfil (HU-153, HU-081; diseño §5): la capacidad como descriptor inmediato, las cinco
// primeras tecnologías en el orden de carga (D73) y el Sello Personal solo si cumple su contrato.
import { describe, expect, it } from "vitest";
import {
  capacidadDeTarjeta,
  selloValido,
  tecnologiasDeTarjeta,
  TECNOLOGIAS_EN_TARJETA,
} from "./tarjeta";

describe("capacidadDeTarjeta (HU-153 · happy)", () => {
  it("rol · seniority · años de experiencia, en ese orden", () => {
    expect(
      capacidadDeTarjeta({
        roles: ["Desarrolladora Backend"],
        familia: "Desarrollo",
        seniority: "Senior",
        aniosExperiencia: 9,
      }),
    ).toBe("Desarrolladora Backend · Senior · 9 años de experiencia");
  });

  it("un año en singular", () => {
    expect(
      capacidadDeTarjeta({
        roles: ["QA"],
        familia: null,
        seniority: "Junior",
        aniosExperiencia: 1,
      }),
    ).toBe("QA · Junior · 1 año de experiencia");
  });

  it("sin rol usa la familia; sin seniority ni años, no deja separadores sueltos", () => {
    expect(
      capacidadDeTarjeta({ roles: [], familia: "Datos", seniority: null, aniosExperiencia: null }),
    ).toBe("Datos");
    expect(
      capacidadDeTarjeta({ roles: [], familia: null, seniority: null, aniosExperiencia: 0 }),
    ).toBe("Perfil · 0 años de experiencia");
  });

  it("el primer rol es el principal (orden de carga)", () => {
    expect(
      capacidadDeTarjeta({
        roles: ["Arquitecta de datos", "Ingeniera de datos"],
        familia: "Datos",
        seniority: "Senior",
        aniosExperiencia: 5,
      }),
    ).toBe("Arquitecta de datos · Senior · 5 años de experiencia");
  });
});

describe("tecnologiasDeTarjeta (HU-153 · edge, D73)", () => {
  const ocho = [
    "Java",
    "Spring Boot",
    "Kafka",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Redis",
    "Kubernetes",
  ];

  it("las cinco primeras en el orden en que Talento Humano las cargó", () => {
    expect(TECNOLOGIAS_EN_TARJETA).toBe(5);
    expect(tecnologiasDeTarjeta(ocho)).toEqual([
      "Java",
      "Spring Boot",
      "Kafka",
      "PostgreSQL",
      "Docker",
    ]);
  });

  it("con cuatro, las cuatro; no reordena ni muta la entrada", () => {
    const cuatro = ["Kafka", "Java", "AWS", "Go"];
    expect(tecnologiasDeTarjeta(cuatro)).toEqual(["Kafka", "Java", "AWS", "Go"]);
    expect(tecnologiasDeTarjeta(ocho)).not.toBe(ocho);
    expect(ocho).toHaveLength(8);
  });
});

describe("selloValido (HU-081 · error, diseño §5)", () => {
  it("de una a tres competencias no vacías", () => {
    expect(selloValido(["Calma bajo presión"])).toBe(true);
    expect(selloValido(["Comunicación directa", "Rigor", "Calma bajo presión"])).toBe(true);
  });

  it("sin competencias no es un sello (se omite sin registro)", () => {
    expect(selloValido([])).toBe(false);
  });

  it.each([
    ["cuatro competencias", ["A", "B", "C", "D"]],
    ["una vacía", ["A", "", "C"]],
    ["una solo con espacios", ["A", "   ", "C"]],
  ])("fuera de contrato: %s", (_c, xs) => {
    expect(selloValido(xs)).toBe(false);
  });
});
