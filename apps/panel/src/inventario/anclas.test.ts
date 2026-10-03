// El mapa campo→ancla es uno solo para el editor, la vista previa y publicar varios (EP-003 · cierre).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MOTIVO_CONDICION, type ClaveCondicion } from "@ps/dominio/inventario/perfil";
import { ANCLA_CONDICION, VALIDACION_ENTRADA, esValidacionDeEntrada } from "./anclas";

const fuente = (f: string) => readFileSync(new URL(f, import.meta.url), "utf8");
const claves = Object.keys(MOTIVO_CONDICION) as ClaveCondicion[];

describe("anclas de las condiciones de publicar (HU-176, HU-178)", () => {
  it("cada condición del dominio tiene su campo en el editor, sin claves de más", () => {
    expect(Object.keys(ANCLA_CONDICION).sort()).toEqual([...claves].sort());
  });

  it("las validaciones de entrada son SARO (alcance y fecha) y DISC (fecha), y saltan a su campo", () => {
    expect([...VALIDACION_ENTRADA].sort()).toEqual(["disc_fecha", "saro_alcance", "saro_fecha"]);
    expect([...VALIDACION_ENTRADA].map((c) => ANCLA_CONDICION[c])).toEqual([
      "pe-saro-alcance",
      "pe-saro-fecha",
      "pe-disc-fecha",
    ]);
  });

  it("solo las validaciones de entrada se reconocen como tales (lo demás tiene su propio salto)", () => {
    for (const c of claves) expect(esValidacionDeEntrada(c), c).toBe(VALIDACION_ENTRADA.has(c));
    expect(esValidacionDeEntrada("no_existe")).toBe(false);
    expect(esValidacionDeEntrada("constructor")).toBe(false);
  });

  it("el editor dibuja un campo con el id de cada validación de entrada", () => {
    const editor = fuente("./EditorPerfil.tsx");
    for (const c of VALIDACION_ENTRADA) expect(editor).toContain(`id="${ANCLA_CONDICION[c]}"`);
  });

  it("el editor, la vista previa y publicar varios usan este mapa y no una copia propia", () => {
    for (const f of ["./EditorPerfil.tsx", "./VistaPrevia.tsx", "./PublicacionMasiva.tsx"]) {
      const s = fuente(f);
      expect(s, f).toMatch(/from "\.\/anclas"/);
      // Ni un mapa propio (`saro_fecha: "pe-…"`) ni el ancla escrita a mano en un salto.
      expect(s, f).not.toMatch(/(saro_alcance|saro_fecha|disc_fecha)\s*:\s*"pe-/);
      expect(s, f).not.toMatch(/(irA|alVolver)\([^)]*"pe-(saro|disc)-/);
      expect(s, f).not.toMatch(/#pe-(saro|disc)-/);
    }
    for (const f of ["./VistaPrevia.tsx", "./PublicacionMasiva.tsx"])
      expect(fuente(f), f).not.toMatch(/"pe-saro-alcance"|"pe-saro-fecha"|"pe-disc-fecha"/);
  });
});
