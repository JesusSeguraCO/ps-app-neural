// RF-19.2 (HU-144 «un perfil cambió», HU-091): al abrir el enlace se reevalúa cada código de la
// selección; ninguno se omite y el orden es el del correo.
import { describe, expect, it } from "vitest";
import { reevaluarSeleccion, type EstadoNoPublicado } from "./seleccion";

const pub = (codigo: string) => ({ codigo, nombre: `N-${codigo}` });

describe("reevaluarSeleccion", () => {
  it("todos publicados → los mismos perfiles en el mismo orden, sin cambios", () => {
    const r = reevaluarSeleccion(
      ["PS-0003", "PS-0001", "PS-0002"],
      [pub("PS-0001"), pub("PS-0002"), pub("PS-0003")],
      [],
    );
    expect(r.items.map((i) => [i.codigo, i.tipo])).toEqual([
      ["PS-0003", "disponible"],
      ["PS-0001", "disponible"],
      ["PS-0002", "disponible"],
    ]);
    expect(r.cambiaron).toBe(0);
    expect(r.ningunoPublicado).toBe(false);
  });

  it("un colocado queda en su lugar con su estado y la fecha en que se libera", () => {
    const colocado: EstadoNoPublicado = {
      codigo: "PS-0002",
      estado: "colocado",
      liberaEn: "2026-12-01",
      resumen: {
        nombre: "Camilo",
        primerApellido: "Vargas",
        familia: "QA",
        roles: ["QA rendimiento"],
        sectores: [],
        modalidad: "Remoto",
      },
    };
    const r = reevaluarSeleccion(
      ["PS-0001", "PS-0002", "PS-0003"],
      [pub("PS-0001"), pub("PS-0003")],
      [colocado],
    );
    expect(r.items[1]).toEqual({ tipo: "cambio", ...colocado });
    expect(r.items[0]).toEqual({ codigo: "PS-0001", tipo: "disponible", perfil: pub("PS-0001") });
    expect(r.cambiaron).toBe(1);
  });

  it("un código sin publicar ni estado conocido nunca desaparece: «no publicado» sin datos", () => {
    const r = reevaluarSeleccion(["PS-0001", "PS-0009"], [pub("PS-0001")], []);
    expect(r.items).toHaveLength(2);
    expect(r.items[1]).toEqual({
      codigo: "PS-0009",
      tipo: "cambio",
      estado: "no_publicado",
      liberaEn: null,
      resumen: null,
    });
  });

  it("publicado prevalece sobre un estado desfasado del mismo código", () => {
    const r = reevaluarSeleccion(
      ["PS-0001"],
      [pub("PS-0001")],
      [{ codigo: "PS-0001", estado: "pausado", liberaEn: null, resumen: null }],
    );
    expect(r.items[0]!.tipo).toBe("disponible");
  });

  it("ninguno sigue publicado → lista completa con estados y ningunoPublicado", () => {
    const r = reevaluarSeleccion(
      ["PS-0001", "PS-0002"],
      [],
      [
        { codigo: "PS-0001", estado: "archivado", liberaEn: null, resumen: null },
        { codigo: "PS-0002", estado: "pausado", liberaEn: null, resumen: null },
      ],
    );
    expect(r.items.map((i) => (i.tipo === "cambio" ? i.estado : i.tipo))).toEqual([
      "archivado",
      "pausado",
    ]);
    expect(r.cambiaron).toBe(2);
    expect(r.ningunoPublicado).toBe(true);
  });

  it("selección vacía (enlace sin selección) → sin items y sin «ninguno publicado»", () => {
    const r = reevaluarSeleccion([], [pub("PS-0001")], []);
    expect(r).toEqual({ items: [], cambiaron: 0, ningunoPublicado: false });
  });

  it("no filtra por rol ni criterio deducido: devuelve exactamente los códigos del enlace", () => {
    const r = reevaluarSeleccion(["PS-0002"], [pub("PS-0001"), pub("PS-0002"), pub("PS-0003")], []);
    expect(r.items.map((i) => i.codigo)).toEqual(["PS-0002"]);
  });
});
