// La proyección del catálogo (única vía de un perfil al portal) entrega el Sello Personal solo si
// cumple su contrato (HU-081 · error, diseño §5): fuera de contrato la tarjeta se comporta como sin
// sello —no se cae la lista ni se dibuja a medias— y el servidor registra el perfil SIN datos
// personales para que Talento Humano lo corrija. La BD ya impide más de tres (CHECK de la 0014): la
// regla del dominio es la defensa del contrato, no la única.
import { afterEach, describe, expect, it, vi } from "vitest";
import { proyectar } from "./catalogo";

const AHORA = new Date("2026-10-02T15:00:00Z");
const fila = (codigo: string, sello: string[]) => ({
  codigo,
  nombre: "Laura",
  primer_apellido: "Méndez",
  familia: "Desarrollo",
  roles: ["Desarrolladora backend"],
  seniority: "Senior",
  anios_experiencia: 9,
  tecnologias: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Docker", "AWS", "Redis", "Go"],
  sectores: [],
  modalidad: "Remoto",
  pais: "Colombia",
  disponibilidad_fecha: "2026-10-12",
  disponibilidad_actualizada_en: AHORA,
  sello_personal: sello,
});

describe("proyección del catálogo · Sello Personal (HU-081)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("un sello válido viaja tal cual (recortado), en su orden", () => {
    const [p] = proyectar([fila("PS-0901", [" Calma bajo presión ", "Rigor"])], AHORA);
    expect(p!.selloPersonal).toEqual(["Calma bajo presión", "Rigor"]);
  });

  it("sin sello: lista vacía y ningún registro", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(proyectar([fila("PS-0902", [])], AHORA)[0]!.selloPersonal).toEqual([]);
    expect(error).not.toHaveBeenCalled();
  });

  it.each([
    ["cuatro competencias", ["A", "B", "C", "D"]],
    ["una competencia vacía", ["A", "", "C"]],
    ["una competencia solo con espacios", ["A", "   "]],
  ])("fuera de contrato (%s): sin sello, el resto de la lista intacto y registro sin datos personales", (_d, sello) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const ps = proyectar([fila("PS-0903", sello), fila("PS-0904", ["Liderazgo técnico"])], AHORA);
    expect(ps.map((p) => p.codigo)).toEqual(["PS-0903", "PS-0904"]);
    expect(ps[0]!.selloPersonal).toEqual([]);
    expect(ps[1]!.selloPersonal).toEqual(["Liderazgo técnico"]);
    expect(error).toHaveBeenCalledTimes(1);
    const registro = JSON.parse(error.mock.calls[0]![0] as string);
    expect(registro).toEqual({ evento: "sello_fuera_de_contrato", codigo: "PS-0903" });
    expect(JSON.stringify(registro)).not.toMatch(/Laura|Méndez/);
  });

  it("las tecnologías llegan completas y en orden de carga; la banda, nunca la fecha", () => {
    const [p] = proyectar([fila("PS-0905", [])], AHORA);
    expect(p!.tecnologias).toHaveLength(8);
    expect(p!.tecnologias[0]).toBe("Java");
    expect(p!.disponibilidad).toBe("dos_semanas");
  });
});
