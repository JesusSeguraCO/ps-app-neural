// Evidencia del banco (HU-119; diseño §5): por perfil, las líneas de los criterios activos del filtro —la
// misma comparación que filtra la lista— y, si llegara un tipo sin plantilla, el registro técnico con el
// tipo (D96), una vez por tipo y sin datos del perfil.
import { afterEach, describe, expect, it, vi } from "vitest";
import { textoDeLinea } from "@ps/dominio/catalogo/evidencia";
import { evidenciaDelBanco, registrarSinPlantilla } from "./evidencia";

const perfiles = [
  { codigo: "PS-0001", familia: "Desarrollo", roles: ["Desarrolladora backend Java"] },
  { codigo: "PS-0002", familia: "Datos", roles: ["Ingeniera de datos"] },
];

describe("evidenciaDelBanco", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sin filtro no hay evidencia para nadie", () => {
    const e = evidenciaDelBanco(perfiles, { tipo: "todo" }, []);
    expect(e.get("PS-0001")).toEqual([]);
    expect(e.get("PS-0002")).toEqual([]);
  });

  it("categoría: cada perfil con su línea, del mismo cálculo que el filtro", () => {
    const e = evidenciaDelBanco(perfiles, { tipo: "categoria", valor: "Desarrollo" }, []);
    expect(e.get("PS-0001")!.map(textoDeLinea)).toEqual(["✓ Categoría: Desarrollo"]);
    expect(e.get("PS-0002")!.map(textoDeLinea)).toEqual(["– Categoría registrada: Datos"]);
  });

  it("rol: ✓ Rol con el valor del filtro", () => {
    const e = evidenciaDelBanco(perfiles, { tipo: "rol", valor: "Ingeniera de datos" }, []);
    expect(e.get("PS-0002")!.map(textoDeLinea)).toEqual(["✓ Rol: Ingeniera de datos"]);
  });

  it("contexto de la selección: la categoría del perfil", () => {
    const e = evidenciaDelBanco(perfiles, { tipo: "contexto" }, ["Datos"]);
    expect(e.get("PS-0002")!.map(textoDeLinea)).toEqual(["✓ Categoría: Datos"]);
  });
});

describe("registrarSinPlantilla (D96)", () => {
  it("una vez por tipo sin plantilla, nombrando solo el tipo", () => {
    const registro = vi.fn();
    registrarSinPlantilla(
      [
        { tipo: "disponibilidad", cumple: true, marca: "✓", texto: "Cumple Disponibilidad inmediata", sinPlantilla: true },
        { tipo: "disponibilidad", cumple: false, marca: "–", texto: "No cumple Disponibilidad inmediata", sinPlantilla: true },
        { tipo: "rol", cumple: true, marca: "✓", texto: "Rol: X", sinPlantilla: false },
      ],
      registro,
    );
    expect(registro).toHaveBeenCalledTimes(1);
    expect(JSON.parse(registro.mock.calls[0]![0])).toEqual({ evento: "criterio_sin_plantilla", tipo: "disponibilidad" });
  });

  it("sin tipos nuevos no registra nada", () => {
    const registro = vi.fn();
    registrarSinPlantilla([{ tipo: "rol", cumple: true, marca: "✓", texto: "Rol: X", sinPlantilla: false }], registro);
    expect(registro).not.toHaveBeenCalled();
  });
});
