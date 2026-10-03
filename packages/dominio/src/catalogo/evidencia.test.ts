// Evidencia ✓/– por criterio (HU-119, RF-13.10, D96; diseño §5): plantilla fija por tipo, sin modelo,
// sin porcentajes; lo ausente es no cumplido. Toda la tabla de la historia y sus ejemplos.
import { describe, expect, it } from "vitest";
import {
  criteriosDelFiltro,
  lineaDeEvidencia,
  lineasDeEvidencia,
  type CriterioResuelto,
} from "./evidencia";
import { textoDeLinea } from "../pruebas/evidencia";

const c = (
  tipo: string,
  valor: string,
  cumple: boolean,
  dato: string | null = null,
): CriterioResuelto => ({
  tipo,
  valor,
  cumple,
  dato,
});
const linea = (x: CriterioResuelto) => textoDeLinea(lineaDeEvidencia(x));

describe("lineaDeEvidencia · tabla fija por tipo (HU-119)", () => {
  it.each([
    // tipo, criterio, cumple, dato, línea
    ["rol", "Desarrollador backend", true, "Desarrollador backend", "✓ Rol: Desarrollador backend"],
    ["rol", "Desarrollador backend", false, "Analista QA", "– Rol registrado: Analista QA"],
    ["rol", "Desarrollador backend", false, null, "– Sin rol declarado: Desarrollador backend"],
    ["seniority", "Senior", true, "Senior", "✓ Seniority: Senior"],
    ["seniority", "Senior", false, "Semi-senior", "– Seniority registrada: Semi-senior"],
    ["seniority", "Senior", false, null, "– Sin seniority declarada: Senior"],
    ["tecnologia", "Java", true, "Java", "✓ Java en su stack declarado"],
    ["tecnologia", "Java", false, null, "– Sin Java en su stack declarado"],
    ["tecnologia", "Java", false, "Kotlin", "– Sin Java en su stack declarado"],
    ["sector", "Banca", true, "8", "✓ Banca · 8 años declarados"],
    ["sector", "Banca", true, "1", "✓ Banca · 1 año declarado"],
    ["sector", "Seguros", false, null, "– Sin experiencia declarada en Seguros"],
    ["idioma", "Inglés", true, "Inglés", "✓ Inglés registrado"],
    ["idioma", "Inglés", false, null, "– Sin idioma declarado: Inglés"],
    ["idioma", "Inglés", false, "Francés", "– Sin idioma declarado: Inglés"],
    ["modalidad", "Remoto", true, "Remoto", "✓ Modalidad: Remoto"],
    ["modalidad", "Remoto", false, "Presencial", "– Modalidad registrada: Presencial"],
    ["modalidad", "Remoto", false, null, "– Sin modalidad declarada: Remoto"],
    ["pais", "Colombia", true, "Colombia", "✓ País: Colombia"],
    ["pais", "Colombia", false, "México", "– País registrado: México"],
    ["pais", "Colombia", false, null, "– Sin país declarado: Colombia"],
    // Categoría (familia) del encuadre del banco: plantilla de la misma forma que rol (decisión del
    // modelo por delegación del sponsor, design.md · SS4).
    ["categoria", "Desarrollo", true, "Desarrollo", "✓ Categoría: Desarrollo"],
    ["categoria", "Desarrollo", false, "Datos", "– Categoría registrada: Datos"],
    ["categoria", "Desarrollo", false, null, "– Sin categoría declarada: Desarrollo"],
  ] as const)("%s «%s» cumple=%s dato=%s → «%s»", (tipo, valor, cumple, dato, esperado) => {
    expect(linea(c(tipo, valor, cumple, dato))).toBe(esperado);
  });

  it("los cinco ejemplos del esquema «cada tipo usa su plantilla fija»", () => {
    expect(linea(c("rol", "Desarrollador backend", true, "Desarrollador backend"))).toBe(
      "✓ Rol: Desarrollador backend",
    );
    expect(linea(c("seniority", "Senior", false, "Semi-senior"))).toBe(
      "– Seniority registrada: Semi-senior",
    );
    expect(linea(c("tecnologia", "Java", true, "Java"))).toBe("✓ Java en su stack declarado");
    expect(linea(c("modalidad", "Remoto", false, null))).toBe("– Sin modalidad declarada: Remoto");
    expect(linea(c("pais", "Colombia", false, "México"))).toBe("– País registrado: México");
  });

  it("happy: «Banca» y «Seguros» → una línea por criterio, en el orden de los criterios", () => {
    const ls = lineasDeEvidencia([
      c("sector", "Banca", true, "8"),
      c("sector", "Seguros", false, null),
    ]);
    expect(ls.map(textoDeLinea)).toEqual([
      "✓ Banca · 8 años declarados",
      "– Sin experiencia declarada en Seguros",
    ]);
    expect(ls.map((l) => l.cumple)).toEqual([true, false]);
  });

  it("edge: el dato ausente nunca se da por cumplido aunque llegue `cumple` sin dato", () => {
    // Un criterio «cumplido» sin el dato que lo sustenta no se afirma (RF-3.4).
    expect(linea(c("idioma", "Inglés", false, null))).toBe("– Sin idioma declarado: Inglés");
    expect(linea(c("idioma", "Inglés", true, null))).toBe("– Sin idioma declarado: Inglés");
    expect(linea(c("sector", "Banca", true, null))).toBe("– Sin experiencia declarada en Banca");
    expect(linea(c("pais", "Colombia", true, null))).toBe("– Sin país declarado: Colombia");
    expect(lineaDeEvidencia(c("rol", "X", true, null)).cumple).toBe(false);
  });

  it("ninguna línea lleva porcentajes ni puntajes", () => {
    const todas = [
      "rol",
      "seniority",
      "tecnologia",
      "sector",
      "idioma",
      "modalidad",
      "pais",
      "categoria",
      "otro",
    ].flatMap((t) => [true, false].map((s) => linea(c(t, "X", s, s ? "3" : null))));
    for (const l of todas) expect(l).not.toMatch(/%|\bpuntaje\b|\d+\s*\/\s*\d+/);
  });
});

describe("tipo sin plantilla (D96 · error)", () => {
  it.each([
    [true, "✓ Cumple Disponibilidad inmediata"],
    [false, "– No cumple Disponibilidad inmediata"],
  ])("cumple=%s → «%s», marcado para el registro técnico", (cumple, esperado) => {
    const l = lineaDeEvidencia(c("disponibilidad", "Disponibilidad inmediata", cumple));
    expect(textoDeLinea(l)).toBe(esperado);
    expect(l.sinPlantilla).toBe(true);
    expect(l.tipo).toBe("disponibilidad");
  });

  it("los tipos de la tabla no se marcan sin plantilla", () => {
    expect(lineaDeEvidencia(c("rol", "X", true, "X")).sinPlantilla).toBe(false);
  });

  it("nunca una línea en blanco: un valor vacío sigue nombrando el tipo", () => {
    expect(textoDeLinea(lineaDeEvidencia(c("disponibilidad", "  ", true))).trim()).not.toBe("✓");
  });
});

describe("criteriosDelFiltro · fuente productiva de EP-003 (diseño §5)", () => {
  const p = {
    codigo: "PS-0001",
    familia: "Desarrollo",
    roles: ["Desarrolladora backend Java", "Líder técnica"],
  };

  it("sin filtro (banco completo o selección del correo) no hay criterios", () => {
    expect(criteriosDelFiltro(p, { tipo: "todo" }, [])).toEqual([]);
  });

  it("categoría: un criterio con la familia del perfil como dato", () => {
    expect(criteriosDelFiltro(p, { tipo: "categoria", valor: "Desarrollo" }, [])).toEqual([
      { tipo: "categoria", valor: "Desarrollo", cumple: true, dato: "Desarrollo" },
    ]);
    expect(
      criteriosDelFiltro(
        { ...p, familia: "Datos" },
        { tipo: "categoria", valor: "Desarrollo" },
        [],
      ),
    ).toEqual([{ tipo: "categoria", valor: "Desarrollo", cumple: false, dato: "Datos" }]);
  });

  it("rol: cumple si cualquiera de sus roles coincide (misma comparación que aplicarFiltro)", () => {
    expect(criteriosDelFiltro(p, { tipo: "rol", valor: "Líder técnica" }, [])).toEqual([
      { tipo: "rol", valor: "Líder técnica", cumple: true, dato: "Líder técnica" },
    ]);
    expect(criteriosDelFiltro(p, { tipo: "rol", valor: "Arquitecta" }, [])).toEqual([
      { tipo: "rol", valor: "Arquitecta", cumple: false, dato: "Desarrolladora backend Java" },
    ]);
  });

  it("contexto de la selección: la categoría del perfil si está entre las de la selección", () => {
    expect(criteriosDelFiltro(p, { tipo: "contexto" }, ["Calidad", "Desarrollo"])).toEqual([
      { tipo: "categoria", valor: "Desarrollo", cumple: true, dato: "Desarrollo" },
    ]);
    expect(
      criteriosDelFiltro({ ...p, familia: null }, { tipo: "contexto" }, ["Calidad", "Desarrollo"]),
    ).toEqual([{ tipo: "categoria", valor: "Calidad o Desarrollo", cumple: false, dato: null }]);
  });
});
