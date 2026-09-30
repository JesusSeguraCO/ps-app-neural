// HU-093 (encuadre sin selección) y HU-094/HU-091 (banco completo o con el contexto de la selección):
// taxonomía con conteos del banco publicado y filtro por una sola opción. Puras.
import { describe, expect, it } from "vitest";
import { aplicarFiltro, filtroDeConsulta, taxonomiaConConteos } from "./encuadre";

const p = (codigo: string, familia: string | null, roles: string[]) => ({ codigo, familia, roles });
const banco = [
  p("PS-0001", "Desarrollo", ["Backend", "Full stack"]),
  p("PS-0002", "Desarrollo", ["Frontend"]),
  p("PS-0003", "Calidad", ["QA"]),
  p("PS-0004", "Desarrollo", ["Backend"]),
];

describe("taxonomiaConConteos", () => {
  it("categorías y roles del catálogo con cuántos publicados tienen hoy, incluidos los de 0, de más a menos", () => {
    const t = taxonomiaConConteos(
      [
        { categoria: "Calidad", rol: "QA" },
        { categoria: "Desarrollo", rol: "Backend" },
        { categoria: "Desarrollo", rol: "Frontend" },
        { categoria: "Desarrollo", rol: "Móvil" },
        { categoria: "Datos", rol: null },
      ],
      banco,
    );
    expect(t).toEqual([
      { categoria: "Desarrollo", n: 3, roles: [{ rol: "Backend", n: 2 }, { rol: "Frontend", n: 1 }, { rol: "Móvil", n: 0 }] },
      { categoria: "Calidad", n: 1, roles: [{ rol: "QA", n: 1 }] },
      { categoria: "Datos", n: 0, roles: [] },
    ]);
  });
});

describe("filtroDeConsulta", () => {
  it("una sola opción: categoría, rol, contexto de la selección o nada", () => {
    expect(filtroDeConsulta({ categoria: "Calidad" })).toEqual({ tipo: "categoria", valor: "Calidad" });
    expect(filtroDeConsulta({ rol: "QA" })).toEqual({ tipo: "rol", valor: "QA" });
    expect(filtroDeConsulta({ contexto: "seleccion" })).toEqual({ tipo: "contexto" });
    expect(filtroDeConsulta({})).toEqual({ tipo: "todo" });
    expect(filtroDeConsulta({ categoria: ["a", "b"] })).toEqual({ tipo: "categoria", valor: "a" });
    expect(filtroDeConsulta({ categoria: "  " })).toEqual({ tipo: "todo" });
    expect(filtroDeConsulta({ contexto: "otra" })).toEqual({ tipo: "todo" });
  });
});

describe("aplicarFiltro", () => {
  it("por categoría, por rol, por las categorías del contexto o todo el banco", () => {
    const c = (xs: Array<{ codigo: string }>) => xs.map((x) => x.codigo);
    expect(c(aplicarFiltro(banco, { tipo: "categoria", valor: "Desarrollo" }, []))).toEqual(["PS-0001", "PS-0002", "PS-0004"]);
    expect(c(aplicarFiltro(banco, { tipo: "rol", valor: "Backend" }, []))).toEqual(["PS-0001", "PS-0004"]);
    expect(c(aplicarFiltro(banco, { tipo: "contexto" }, ["Calidad"]))).toEqual(["PS-0003"]);
    expect(c(aplicarFiltro(banco, { tipo: "todo" }, []))).toEqual(["PS-0001", "PS-0002", "PS-0003", "PS-0004"]);
    expect(aplicarFiltro(banco, { tipo: "rol", valor: "Nadie" }, [])).toEqual([]);
  });
});
