// Recorrer fichas sin perder la lista (HU-120; D47): posición, anterior y siguiente dentro de la lista
// que el cliente tiene delante, y la dirección de cada ficha conservando el resto de la consulta.
import { describe, expect, it } from "vitest";
import { anclaDePerfil, cerrarFicha, conFicha, recorrido } from "./recorrido";

describe("recorrido de fichas (HU-120)", () => {
  const lista = ["PS-0142", "PS-0292", "PS-0268"];

  it("en medio: posición y vecinos", () => {
    expect(recorrido(lista, "PS-0292")).toEqual({
      abierto: "PS-0292",
      posicion: 2,
      total: 3,
      anterior: "PS-0142",
      siguiente: "PS-0268",
    });
  });

  it("en el primero no hay anterior; en el último no hay siguiente", () => {
    expect(recorrido(lista, "PS-0142")).toMatchObject({ posicion: 1, anterior: null, siguiente: "PS-0292" });
    expect(recorrido(lista, "PS-0268")).toMatchObject({ posicion: 3, anterior: "PS-0292", siguiente: null });
  });

  it("un código que no está en la lista no abre ficha (nada fuera de lo que el cliente ve)", () => {
    expect(recorrido(lista, "PS-9999")).toBeNull();
    expect(recorrido(lista, undefined)).toBeNull();
    expect(recorrido([], "PS-0142")).toBeNull();
  });

  it("la dirección de la ficha conserva el filtro y cambia solo la ficha; sin código, la cierra", () => {
    const consulta = { categoria: "Desarrollo", ficha: "PS-0142" };
    expect(conFicha("/banco", consulta, "PS-0292")).toBe("/banco?categoria=Desarrollo&ficha=PS-0292");
    expect(conFicha("/banco", consulta, null)).toBe("/banco?categoria=Desarrollo");
    expect(conFicha("/", {}, "PS-0142")).toBe("/?ficha=PS-0142");
    expect(conFicha("/", { ficha: "PS-0142" }, null)).toBe("/");
  });

  it("solo los parámetros de texto viajan (los repetidos toman el primero)", () => {
    expect(conFicha("/banco", { rol: ["Analista QA", "otro"], x: undefined }, null)).toBe(
      "/banco?rol=Analista+QA",
    );
  });

  it("HU-120 · cerrar vuelve a la misma lista, con su filtro, en la posición del perfil que estaba abierto", () => {
    expect(anclaDePerfil("PS-0268")).toBe("p-0268");
    expect(cerrarFicha("/banco", { categoria: "Desarrollo", ficha: "PS-0268" }, "PS-0268")).toBe(
      "/banco?categoria=Desarrollo#p-0268",
    );
    expect(cerrarFicha("/", { ficha: "PS-0142" }, "PS-0142")).toBe("/#p-0142");
  });

  it("el recorrido dice qué perfil está abierto (para volver a su posición)", () => {
    expect(recorrido(lista, "PS-0292")?.abierto).toBe("PS-0292");
  });
});
