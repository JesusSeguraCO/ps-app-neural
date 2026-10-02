// HU-140 (borrador por plantilla, determinista, sin IA ni red) y HU-130 edge (el reporte que confirma
// una persona). Puras, sin BD.
import { describe, expect, it } from "vitest";
import {
  borradorDesdeModalidad,
  criteriosDeTexto,
  faltaParaConfirmar,
  origenTrasEdicion,
} from "./validacion";

const modalidad = {
  id: "m1",
  nombre: "Reto de código sustentado",
  enunciadoReto: "Construir en 72 horas un servicio REST de conciliación de pagos.",
  entregables: "Repositorio con el código y las pruebas · README de despliegue",
  criterios: "• Diseño de la capa de servicios\n- Modelo de datos y persistencia\n\n  Cobertura y calidad de las pruebas  ",
};

describe("borradorDesdeModalidad", () => {
  it("precarga enunciado, entregables y criterios de la modalidad, cada uno con origen «plantilla»", () => {
    const r = borradorDesdeModalidad(modalidad);
    expect(r).toEqual({
      ok: true,
      borrador: {
        modalidadId: "m1",
        enunciadoReto: modalidad.enunciadoReto,
        entregables: modalidad.entregables,
        criterios: [
          "Diseño de la capa de servicios",
          "Modelo de datos y persistencia",
          "Cobertura y calidad de las pruebas",
        ],
        origen: { enunciadoReto: "plantilla", entregables: "plantilla", criterios: "plantilla" },
      },
    });
  });

  it("sin modalidad de prueba elegida no precarga nada: el borrador sale de la modalidad", () => {
    expect(borradorDesdeModalidad(null)).toEqual({ ok: false, motivo: "sin_modalidad_prueba" });
  });

  it("una plantilla sin texto deja el campo vacío para que lo escriba la persona", () => {
    const r = borradorDesdeModalidad({ ...modalidad, entregables: null, criterios: "  " });
    expect(r.ok && r.borrador.entregables).toBe("");
    expect(r.ok && r.borrador.criterios).toEqual([]);
  });

  it("es determinista: la misma modalidad da el mismo borrador", () => {
    expect(borradorDesdeModalidad(modalidad)).toEqual(borradorDesdeModalidad(modalidad));
  });
});

describe("criteriosDeTexto", () => {
  it("una línea por criterio, sin viñetas ni repetidos", () => {
    expect(criteriosDeTexto("1. Diseño\n2) Pruebas\n* Diseño\n")).toEqual(["Diseño", "Pruebas"]);
    expect(criteriosDeTexto(null)).toEqual([]);
  });
});

describe("origenTrasEdicion", () => {
  const p = borradorDesdeModalidad(modalidad);
  const plantilla = p.ok ? p.borrador : (null as never);

  it("un campo que la persona cambió deja de ser de la plantilla; uno igual lo sigue siendo", () => {
    expect(
      origenTrasEdicion(plantilla, {
        enunciadoReto: plantilla.enunciadoReto,
        entregables: "Repositorio con el código y las pruebas",
        criterios: plantilla.criterios,
      }),
    ).toEqual({ enunciadoReto: "plantilla", entregables: "persona", criterios: "plantilla" });
  });

  it("espacios de más no cuentan como edición; reordenar criterios sí", () => {
    expect(
      origenTrasEdicion(plantilla, {
        enunciadoReto: `  ${plantilla.enunciadoReto}  `,
        entregables: plantilla.entregables,
        criterios: [...plantilla.criterios].reverse(),
      }),
    ).toEqual({ enunciadoReto: "plantilla", entregables: "plantilla", criterios: "persona" });
  });
});

describe("faltaParaConfirmar", () => {
  const hoy = "2026-10-01";
  const listo = {
    enunciadoReto: "Reto",
    entregables: "Repositorio",
    criterios: ["Diseño"],
    evaluador: "Célula de arquitectura de Trycore",
    fecha: "2026-09-28",
    resultado: "Aprobada, nivel senior",
    revisado: true,
  };

  it("con todo escrito por la persona y revisado, no falta nada", () => {
    expect(faltaParaConfirmar(listo, hoy)).toEqual([]);
  });

  it("dice qué falta: revisión, evaluador, fecha, resultado y al menos un criterio", () => {
    expect(
      faltaParaConfirmar(
        { ...listo, revisado: false, evaluador: " ", fecha: null, resultado: "", criterios: [] },
        hoy,
      ),
    ).toEqual(["revisado", "criterios", "evaluador", "fecha", "resultado"]);
  });

  it("una fecha futura no vale: la validación ya ocurrió", () => {
    expect(faltaParaConfirmar({ ...listo, fecha: "2026-10-02" }, hoy)).toEqual(["fecha"]);
    expect(faltaParaConfirmar({ ...listo, fecha: hoy }, hoy)).toEqual([]);
  });
});
