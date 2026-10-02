// Enter en el buscador del catálogo (hallazgo de la fidelidad final 11.3): nunca ofrece crear un valor
// que ya existe. Con las sugerencias aún sin llegar, espera; al llegar elige la coincidencia exacta.
import { describe, expect, it } from "vitest";
import { accionEnter, coincidenciaExacta, indiceInicial } from "./buscador-enter";

const docker = { id: "t1", nombre: "Docker" };
const compose = { id: "t2", nombre: "Docker Compose" };

describe("accionEnter", () => {
  it("con las sugerencias de otra consulta (o ninguna) espera: no abre la hoja de crear", () => {
    expect(
      accionEnter({
        q: "Docker",
        cargadas: null,
        todas: [],
        excluir: [],
        activa: 0,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "esperar" });
    expect(
      accionEnter({
        q: "Docker",
        cargadas: "Dock",
        todas: [compose],
        excluir: [],
        activa: 0,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "esperar" });
  });

  it("con la coincidencia exacta cargada elige el valor, aunque la opción activa fuera la de crear", () => {
    expect(
      accionEnter({
        q: "docker",
        cargadas: "docker",
        todas: [compose, docker],
        excluir: [],
        activa: 1,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "elegir", valor: docker });
    expect(
      accionEnter({
        q: "Docker",
        cargadas: "Docker",
        todas: [compose, docker],
        excluir: [],
        activa: 2,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "elegir", valor: docker });
  });

  it("si el valor exacto ya está elegido no ofrece crearlo: no hace nada", () => {
    expect(
      accionEnter({
        q: "Docker",
        cargadas: "Docker",
        todas: [docker],
        excluir: ["t1"],
        activa: 0,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "nada" });
  });

  it("sin coincidencia exacta: la opción activa, y crear solo si es la activa", () => {
    expect(
      accionEnter({
        q: "Dock",
        cargadas: "Dock",
        todas: [docker, compose],
        excluir: [],
        activa: 1,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "elegir", valor: compose });
    expect(
      accionEnter({
        q: "Podman",
        cargadas: "Podman",
        todas: [],
        excluir: [],
        activa: 0,
        puedeCrear: true,
      }),
    ).toEqual({ tipo: "crear" });
    expect(
      accionEnter({
        q: "Podman",
        cargadas: "Podman",
        todas: [],
        excluir: [],
        activa: 0,
        puedeCrear: false,
      }),
    ).toEqual({ tipo: "nada" });
    expect(
      accionEnter({ q: "", cargadas: "", todas: [], excluir: [], activa: 0, puedeCrear: true }),
    ).toEqual({ tipo: "nada" });
  });
});

describe("coincidenciaExacta e indiceInicial", () => {
  it("ignora mayúsculas, tildes y espacios de los extremos", () => {
    expect(coincidenciaExacta(" DOCKER ", [compose, docker])).toEqual(docker);
    expect(coincidenciaExacta("Análisis", [{ id: "a", nombre: "analisis" }])?.id).toBe("a");
    expect(coincidenciaExacta("Dock", [docker])).toBeNull();
  });

  it("la opción activa al llegar las sugerencias es la exacta si la hay", () => {
    expect(indiceInicial("docker", [compose, docker])).toBe(1);
    expect(indiceInicial("dock", [compose, docker])).toBe(0);
  });
});
