import { describe, expect, it } from "vitest";
import { CAMPOS_PERFIL_CATALOGO, PerfilCatalogo, RespuestaCatalogo } from "./catalogo";

const valido = {
  codigo: "PS-0142",
  nombre: "Laura",
  primerApellido: "Méndez",
  familia: "Desarrollo",
  roles: ["Desarrolladora backend Java"],
  seniority: "Senior",
  aniosExperiencia: 8,
  tecnologias: ["Java"],
  sectores: ["Banca"],
  modalidad: "Híbrido",
  pais: "Colombia",
  disponibilidad: "inmediato",
};

describe("contrato del catálogo (V8-4)", () => {
  it("acepta un perfil con exactamente los campos publicables", () => {
    expect(PerfilCatalogo.parse(valido)).toEqual(valido);
    expect(Object.keys(PerfilCatalogo.shape).sort()).toEqual([...CAMPOS_PERFIL_CATALOGO].sort());
  });

  it.each(["ciudad", "disponibilidadFecha", "correo", "foto", "motivacion"])(
    "falla (no descarta) ante el campo extra %s",
    (extra) => {
      expect(PerfilCatalogo.safeParse({ ...valido, [extra]: "x" }).success).toBe(false);
    },
  );

  it("la respuesta también es estricta", () => {
    expect(RespuestaCatalogo.safeParse({ perfiles: [valido] }).success).toBe(true);
    expect(RespuestaCatalogo.safeParse({ perfiles: [valido], total: 1 }).success).toBe(false);
  });

  it("la disponibilidad es una banda, nunca una fecha", () => {
    expect(PerfilCatalogo.safeParse({ ...valido, disponibilidad: "2026-10-01" }).success).toBe(false);
  });
});
