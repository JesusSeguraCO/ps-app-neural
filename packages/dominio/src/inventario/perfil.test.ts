// HU-125 (lo que falta para publicar se señala; el perfil nace en borrador) y HU-127 (consentimiento
// nominal y explícito; el anonimizado no sirve). Puras, sin BD.
import { describe, expect, it } from "vitest";
import {
  evaluarPublicacion,
  fechaDeOpcionDisponibilidad,
  validarConsentimiento,
  type DatosParaPublicar,
} from "./perfil";

const completo: DatosParaPublicar = {
  nombre: "Lorena",
  primerApellido: "Salcedo",
  rol: true,
  tecnologias: 4,
  sector: true,
  seniority: true,
  aniosExperiencia: 8,
  ciudad: true,
  modalidadTrabajo: true,
  disponibilidadFecha: "2026-10-01",
  experiencias: 2,
  modalidadPrueba: { elegida: true, activa: true },
  familiaConModalidades: true,
  consentimiento: { vigente: true, nominal: true },
};

describe("evaluarPublicacion (HU-125)", () => {
  it("un perfil completo cumple las 4 condiciones y no le falta nada", () => {
    const r = evaluarPublicacion(completo);
    expect(r.publicable).toBe(true);
    expect(r.condiciones.map((c) => [c.clave, c.cumple])).toEqual([
      ["consentimiento", true],
      ["trayectoria", true],
      ["disponibilidad", true],
      ["modalidad_prueba", true],
    ]);
    expect(r.faltanDatos).toEqual([]);
  });

  it("campos obligatorios incompletos: señala cada dato que falta y no es publicable", () => {
    const r = evaluarPublicacion({
      ...completo,
      tecnologias: 0,
      ciudad: false,
      disponibilidadFecha: null,
      experiencias: 0,
      consentimiento: null,
    });
    expect(r.publicable).toBe(false);
    expect(r.faltanDatos.map((f) => f.campo)).toEqual([
      "tecnologias",
      "ciudad",
      "disponibilidad",
      "trayectoria",
    ]);
    expect(r.condiciones.filter((c) => !c.cumple).map((c) => c.clave)).toEqual([
      "consentimiento",
      "trayectoria",
      "disponibilidad",
    ]);
  });

  it("familia sin modalidades: la condición de modalidad falla con el motivo de la familia", () => {
    const r = evaluarPublicacion({
      ...completo,
      modalidadPrueba: { elegida: false, activa: false },
      familiaConModalidades: false,
    });
    const m = r.condiciones.find((c) => c.clave === "modalidad_prueba")!;
    expect(m).toMatchObject({ cumple: false, detalle: "familia_sin_modalidades" });
  });

  it("una modalidad elegida pero desactivada ya no cumple (D10)", () => {
    const r = evaluarPublicacion({
      ...completo,
      modalidadPrueba: { elegida: true, activa: false },
    });
    expect(r.condiciones.find((c) => c.clave === "modalidad_prueba")).toMatchObject({
      cumple: false,
      detalle: "modalidad_inactiva",
    });
  });

  it("un consentimiento revocado no cumple", () => {
    expect(
      evaluarPublicacion({ ...completo, consentimiento: { vigente: false, nominal: true } })
        .publicable,
    ).toBe(false);
  });

  it("años y nombre son obligatorios; 0 años es un dato válido", () => {
    expect(evaluarPublicacion({ ...completo, aniosExperiencia: 0 }).faltanDatos).toEqual([]);
    expect(
      evaluarPublicacion({ ...completo, aniosExperiencia: null, nombre: " " }).faltanDatos.map(
        (f) => f.campo,
      ),
    ).toEqual(["nombre", "anios_experiencia"]);
  });
});

describe("validarConsentimiento (HU-127)", () => {
  it("nominal: nombre y primer apellido con trayectoria → válido, con o sin clientes", () => {
    expect(
      validarConsentimiento({ nombreApellido: true, trayectoria: true, clientes: true }),
    ).toEqual({
      ok: true,
      incluyeClientes: true,
    });
    expect(
      validarConsentimiento({ nombreApellido: true, trayectoria: true, clientes: false }),
    ).toEqual({
      ok: true,
      incluyeClientes: false,
    });
  });
  it("anonimizado (sin nombre) o sin trayectoria → no cubre este uso", () => {
    expect(
      validarConsentimiento({ nombreApellido: false, trayectoria: true, clientes: false }),
    ).toEqual({
      ok: false,
      motivo: "no_nominal",
    });
    expect(
      validarConsentimiento({ nombreApellido: true, trayectoria: false, clientes: true }),
    ).toEqual({
      ok: false,
      motivo: "no_nominal",
    });
  });
});

describe("fechaDeOpcionDisponibilidad (RF-3.13: se carga fecha, se publica banda)", () => {
  it("las opciones rápidas se traducen a una fecha civil desde hoy en Bogotá", () => {
    const ahora = new Date("2026-09-30T23:30:00Z"); // 18:30 en Bogotá, 30 sep
    expect(fechaDeOpcionDisponibilidad("ahora", ahora)).toBe("2026-09-30");
    expect(fechaDeOpcionDisponibilidad("una_semana", ahora)).toBe("2026-10-07");
    expect(fechaDeOpcionDisponibilidad("dos_semanas", ahora)).toBe("2026-10-14");
    expect(fechaDeOpcionDisponibilidad("un_mes", ahora)).toBe("2026-10-30");
  });
});
