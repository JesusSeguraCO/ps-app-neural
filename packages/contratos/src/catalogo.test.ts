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
  selloPersonal: ["Comunicación directa con negocio", "Rigor en la documentación"],
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

  it("el Sello Personal viaja con 0 a 3 competencias no vacías (HU-081)", () => {
    expect(PerfilCatalogo.safeParse({ ...valido, selloPersonal: [] }).success).toBe(true);
    expect(PerfilCatalogo.safeParse({ ...valido, selloPersonal: ["A", "B", "C"] }).success).toBe(true);
    expect(PerfilCatalogo.safeParse({ ...valido, selloPersonal: ["A", "B", "C", "D"] }).success).toBe(false);
    expect(PerfilCatalogo.safeParse({ ...valido, selloPersonal: ["A", ""] }).success).toBe(false);
    expect(PerfilCatalogo.safeParse({ ...valido, selloPersonal: ["A", "   "] }).success).toBe(false);
    const sinSello: Partial<typeof valido> = { ...valido };
    delete sinSello.selloPersonal;
    expect(PerfilCatalogo.safeParse(sinSello).success).toBe(false);
  });

  it("las tecnologías conservan el orden de carga (la tarjeta corta en 5, la ficha hasta 8)", () => {
    const ocho = ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Docker", "AWS", "Redis", "Kubernetes"];
    expect(PerfilCatalogo.parse({ ...valido, tecnologias: ocho }).tecnologias).toEqual(ocho);
  });
});
