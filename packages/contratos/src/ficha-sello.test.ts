// Sello Personal en la ficha (ruta gemela de la tarjeta, HU-081 · error): la misma regla del dominio
// (`selloValido`). Un sello fuera de contrato no se dibuja recortado ni con huecos: la ficha lo omite,
// como si no hubiera sello, igual que la tarjeta. La vista previa del panel usa esta misma función.
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

describe("armarFicha · Sello Personal fuera de contrato (gemela de la tarjeta)", () => {
  it("un sello válido se conserva, recortado y en su orden", () => {
    expect(ficha({ selloPersonal: [" Calma bajo presión ", "Rigor"] }).selloPersonal).toEqual(["Calma bajo presión", "Rigor"]);
  });

  it.each([
    ["cuatro competencias", ["A", "B", "C", "D"]],
    ["una vacía", ["A", "", "C"]],
    ["una solo con espacios", ["A", "   "]],
  ])("%s → sin sello (nunca las tres primeras ni las no vacías)", (_d, sello) => {
    const f = ficha({ selloPersonal: sello });
    expect(f.selloPersonal).toEqual([]);
    expect(FichaPerfil.safeParse(f).success).toBe(true);
  });
});
