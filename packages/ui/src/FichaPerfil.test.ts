// La ficha compartida panel/portal dibuja la validación técnica (HU-130 edge): Nivel 0 con el
// enunciado; Nivel 1 con modalidad y resultado, evaluador y fecha, y los criterios evaluados.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { armarFicha, type DatosFicha } from "@ps/contratos/ficha";
import { FichaPerfil } from "./FichaPerfil";

const datos: DatosFicha = {
  codigo: "PS-0142",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend",
  seniority: "Senior",
  aniosExperiencia: 9,
  sectores: [],
  tecnologias: ["Java"],
  modalidad: "Híbrido",
  pais: "Colombia",
  ciudad: "Medellín",
  disponibilidadFecha: "2026-10-01",
  disponibilidadActualizadaEn: new Date("2026-10-01T15:00:00Z"),
  resumen: null,
  selloPersonal: [],
  formacion: null,
  idiomas: [],
  trayectoria: [{ cargo: "Backend senior", cliente: null, desde: 2020, hasta: 2026, descripcion: "Pagos." }],
  incluyeClientes: false,
  enunciadoPrueba: "Validada por Trycore con un reto de código.",
};
const html = (d: DatosFicha) =>
  renderToStaticMarkup(
    createElement(FichaPerfil, {
      ficha: armarFicha(d, { ahora: new Date("2026-10-01T15:00:00Z"), necesidad: "remota" }),
    }),
  );

describe("FichaPerfil · validación técnica", () => {
  it("Nivel 0: el enunciado de la modalidad", () => {
    expect(html(datos)).toContain("Validada por Trycore con un reto de código.");
  });

  it("Nivel 1: modalidad · resultado, evaluador · fecha y los criterios evaluados", () => {
    const h = html({
      ...datos,
      reporte: {
        modalidad: "Reto de código sustentado",
        resultado: "Aprobada, nivel senior",
        evaluador: "Célula de arquitectura de Trycore",
        fecha: "2026-09-29",
        criterios: ["Diseño de servicios", "Cobertura de pruebas"],
      },
    });
    expect(h).toContain("Reto de código sustentado · Aprobada, nivel senior");
    expect(h).toContain("Célula de arquitectura de Trycore · 29 sep 2026");
    expect(h).toContain("Evaluó: Diseño de servicios · Cobertura de pruebas.");
  });
});
