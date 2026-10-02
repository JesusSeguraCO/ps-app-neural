// Columnas SARO y DISC del formato de importación (EP-003 · SS3, tarea 3.1; HU-191; D81): la
// exportación, la plantilla y el importador comparten tres columnas con encabezado autoexplicativo,
// ejemplo y alias. La fecha DISC se importa; cualquier otra columna «DISC» (el resultado detallado, B.4)
// sigue bloqueada. La plantilla trae como ejemplo del alcance uno activo del catálogo.
import { describe, expect, it } from "vitest";
import { proponerEmparejamiento } from "@ps/dominio/importacion/emparejar";
import { CAMPO, CAMPOS_IMPORTACION, ejemplosPlantilla, escribirCsv, leer } from "./importacion";

const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";

describe("columnas SARO y DISC (HU-191)", () => {
  it("tres columnas con encabezado autoexplicativo y ejemplo, de cara al cliente (no internas)", () => {
    expect(CAMPO.saroAlcance.encabezado).toBe("Alcance de la verificación SARO (del catálogo)");
    for (const c of [CAMPO.saroAlcance, CAMPO.saroFecha, CAMPO.discFecha]) expect(c.interno).toBeUndefined();
    expect(CAMPO.saroFecha.encabezado).toBe(
      "Fecha de la verificación SARO (AAAA-MM-DD o DD/MM/AAAA)",
    );
    expect(CAMPO.discFecha.encabezado).toBe(
      "Fecha de la evaluación DISC (AAAA-MM-DD o DD/MM/AAAA)",
    );
    for (const c of [CAMPO.saroAlcance, CAMPO.saroFecha, CAMPO.discFecha])
      expect(c.ejemplo).not.toBe("");
    const claves = CAMPOS_IMPORTACION.map((c) => c.clave);
    expect(claves.indexOf("saroAlcance")).toBe(claves.indexOf("modalidadPrueba") + 1);
  });

  it("el importador reconoce sus encabezados y sus alias", () => {
    const e = proponerEmparejamiento(
      [
        CAMPO.saroAlcance.encabezado,
        CAMPO.saroFecha.encabezado,
        CAMPO.discFecha.encabezado,
        "Alcance SARO",
        "Fecha SARO",
        "Fecha DISC",
        "discFecha",
      ],
      CAMPOS_IMPORTACION,
    );
    expect(e.map((c) => (c.destino.tipo === "campo" ? c.destino.clave : c.destino.motivo))).toEqual(
      [
        "saroAlcance",
        "saroFecha",
        "discFecha",
        "campo_repetido",
        "campo_repetido",
        "campo_repetido",
        "campo_repetido",
      ],
    );
    for (const [col, clave] of [
      ["Alcance SARO", "saroAlcance"],
      ["fecha saro", "saroFecha"],
      ["Fecha DISC", "discFecha"],
      ["discFecha", "discFecha"],
    ] as const)
      expect(proponerEmparejamiento([col], CAMPOS_IMPORTACION)[0]!.destino, col).toEqual({
        tipo: "campo",
        clave,
      });
  });

  it("el resultado DISC detallado sigue bloqueado (B.4): solo pasa la fecha", () => {
    for (const col of ["DISC", "Resultado DISC", "Perfil DISC", "DISC detallado"]) {
      const [c] = proponerEmparejamiento([col], CAMPOS_IMPORTACION);
      expect(c!.destino, col).toMatchObject({ tipo: "no_importar", motivo: "lista_negra" });
      expect(c!.bloqueada, col).toBe(true);
    }
  });

  it("la plantilla trae los tres con un alcance activo del catálogo, tal como está registrado", () => {
    const filas = ejemplosPlantilla(ANTECEDENTES);
    const nuevo = filas.find((f) => f.codigo === "PS-0900")!;
    expect(nuevo).toMatchObject({
      saroAlcance: ANTECEDENTES,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
    });
    const r = leer(escribirCsv(filas));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.tabla.encabezados).toEqual(
      expect.arrayContaining([CAMPO.saroAlcance.encabezado, CAMPO.discFecha.encabezado]),
    );
    const i = r.tabla.encabezados.indexOf(CAMPO.saroAlcance.encabezado);
    expect(r.tabla.filas.find((f) => f.celdas[0] === "PS-0900")!.celdas[i]).toBe(ANTECEDENTES);
  });

  it("sin ningún alcance activo, la plantilla deja la celda del alcance vacía (nunca inventa uno)", () => {
    const nuevo = ejemplosPlantilla(null).find((f) => f.codigo === "PS-0900")!;
    expect(nuevo.saroAlcance).toBeUndefined();
    expect(nuevo.saroFecha).toBe("2026-03-15");
  });
});
