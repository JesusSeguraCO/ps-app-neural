// SARO y DISC en la ficha compartida portal/vista previa (EP-003 · SS1, tarea 1.6; HU-176 happy y
// edge; HU-177 edge). `armarFicha` lleva el texto de cara al cliente del alcance y el mes de cada
// verificación («marzo de 2026»); lo ausente no viaja (D62: la ficha lo omite, sin marca). El
// contrato estricto del portal los admite anulables, así un publicado heredado sin ellos sigue
// abriendo su ficha. La corrección de un publicado declara el cambio al cliente (HU-126).
import { describe, expect, it } from "vitest";
import { FichaPerfil, armarFicha, cambiosDeCaraAlCliente, type DatosFicha } from "./ficha";

const ahora = new Date("2026-10-02T15:00:00Z");
const base: DatosFicha = {
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
  disponibilidadActualizadaEn: ahora,
  resumen: null,
  selloPersonal: [],
  formacion: null,
  idiomas: [],
  trayectoria: [{ cargo: "Backend senior", cliente: null, desde: 2020, hasta: 2026, descripcion: "Pagos." }],
  incluyeClientes: false,
  enunciadoPrueba: "Validada por Trycore con un reto de código.",
  saro: { texto: "Verificamos antecedentes judiciales, disciplinarios y fiscales.", fecha: "2026-03-15" },
  disc: { fecha: "2026-04-10" },
};
const ficha = (d: Partial<DatosFicha> = {}) => armarFicha({ ...base, ...d }, { ahora, necesidad: "remota" });

describe("armarFicha · SARO y DISC", () => {
  it("lleva el texto del alcance y «marzo de 2026»; la DISC con «abril de 2026»", () => {
    const f = ficha();
    expect(f.seguridad).toEqual({
      alcance: "Verificamos antecedentes judiciales, disciplinarios y fiscales.",
      fecha: "marzo de 2026",
    });
    expect(f.disc).toEqual({ fecha: "abril de 2026" });
    expect(FichaPerfil.parse(f)).toMatchObject({ seguridad: f.seguridad, disc: f.disc });
  });

  it("sin dato (heredado o borrador): no viaja y el contrato del portal lo admite", () => {
    const f = ficha({ saro: null, disc: null });
    expect(f.seguridad).toBeNull();
    expect(f.disc).toBeNull();
    expect(() => FichaPerfil.parse(f)).not.toThrow();
    // Con alcance pero sin fecha (o al revés) tampoco hay línea: se muestra solo lo registrado completo.
    expect(ficha({ saro: { texto: "x", fecha: null } }).seguridad).toBeNull();
    expect(ficha({ saro: { texto: null, fecha: "2026-03-15" } }).seguridad).toBeNull();
  });

  it("el contrato del portal no admite el id del alcance ni nada de más", () => {
    const f = { ...ficha(), seguridad: { alcance: "x", fecha: "marzo de 2026", id: "u" } };
    expect(() => FichaPerfil.parse(f)).toThrow();
  });

  it("corregir la fecha de un publicado declara el cambio de cara al cliente (HU-176 edge)", () => {
    const c = cambiosDeCaraAlCliente(ficha(), ficha({ saro: { ...base.saro!, fecha: "2026-02-20" } }));
    expect(c).toEqual([
      {
        campo: "seguridad",
        etiqueta: "Verificación de seguridad SARO",
        antes: "Verificamos antecedentes judiciales, disciplinarios y fiscales. · marzo de 2026",
        despues: "Verificamos antecedentes judiciales, disciplinarios y fiscales. · febrero de 2026",
      },
    ]);
    expect(cambiosDeCaraAlCliente(ficha(), ficha({ disc: { fecha: "2026-05-01" } }))).toEqual([
      { campo: "disc", etiqueta: "Evaluación DISC", antes: "abril de 2026", despues: "mayo de 2026" },
    ]);
  });
});
