// Validaciones de entrada SARO y DISC (HU-176, HU-177; D61, D63; diseño §2). Puras: la guarda única de
// publicar (`evaluarPublicacion`) exige el alcance de la verificación SARO, su fecha y la fecha DISC,
// con el motivo exacto («Falta <motivo>») y el campo del editor al que se salta; un alcance desactivado
// pero asignado cuenta como registrado; el Sello Personal no entra en la guarda. La fecha de una
// verificación no puede ser posterior a hoy (America/Bogota).
import { describe, expect, it } from "vitest";
import { mesDeAnio } from "../fecha/colombia";
import {
  MENSAJE_FECHA_FUTURA,
  evaluarPublicacion,
  faltaDe,
  validarFechaVerificacion,
  type DatosParaPublicar,
} from "./perfil";

const completo: DatosParaPublicar = {
  nombre: "Lorena",
  primerApellido: "Salcedo",
  rol: true,
  tecnologias: 4,
  seniority: true,
  aniosExperiencia: 8,
  ciudad: true,
  modalidadTrabajo: true,
  disponibilidadFecha: "2026-10-01",
  experiencias: 2,
  modalidadPrueba: { elegida: true, activa: true },
  familiaConModalidades: true,
  consentimiento: { vigente: true, nominal: true },
  saro: { alcance: true, fecha: true },
  disc: { fecha: true },
};

describe("evaluarPublicacion · SARO y DISC (HU-176)", () => {
  it.each([
    [
      "el alcance de la verificación SARO",
      { saro: { alcance: false, fecha: true } },
      "saro_alcance",
      "saro_alcance",
    ],
    [
      "la fecha de la verificación SARO",
      { saro: { alcance: true, fecha: false } },
      "saro_fecha",
      "saro_fecha",
    ],
    ["la fecha de la evaluación DISC", { disc: { fecha: false } }, "disc_fecha", "disc_fecha"],
  ] as const)(
    "falta %s → no publicable, «Falta <motivo>» exacto y salto a su campo",
    (motivo, cambio, clave, campo) => {
      const r = evaluarPublicacion({ ...completo, ...cambio });
      expect(r.publicable).toBe(false);
      const fallan = r.condiciones.filter((c) => !c.cumple);
      expect(fallan.map((c) => c.clave)).toEqual([clave]);
      expect(fallan[0]).toMatchObject({ motivo, campo });
      expect(faltaDe(fallan[0]!)).toBe(`Falta ${motivo}`);
      expect(r.faltanDatos).toEqual([]);
    },
  );

  it("sin ninguno de los tres: las tres condiciones fallan en orden fijo", () => {
    const r = evaluarPublicacion({
      ...completo,
      saro: { alcance: false, fecha: false },
      disc: { fecha: false },
    });
    expect(r.condiciones.filter((c) => !c.cumple).map((c) => faltaDe(c))).toEqual([
      "Falta el alcance de la verificación SARO",
      "Falta la fecha de la verificación SARO",
      "Falta la fecha de la evaluación DISC",
    ]);
  });

  it("las condiciones de siempre también dicen su motivo y su campo", () => {
    const r = evaluarPublicacion({
      ...completo,
      consentimiento: null,
      modalidadPrueba: { elegida: false, activa: false },
    });
    expect(
      r.condiciones.filter((c) => !c.cumple).map((c) => [faltaDe(c), c.campo]),
    ).toEqual([
      ["Falta el consentimiento nominal", "consentimiento"],
      ["Falta la modalidad de prueba", "modalidad_prueba"],
    ]);
  });

  it("un alcance desactivado pero asignado cuenta como registrado (HU-177 edge): la guarda pregunta si lo tiene", () => {
    // El adaptador dice «tiene alcance» sin mirar si está activo; la guarda no recibe el estado del valor.
    expect(evaluarPublicacion({ ...completo, saro: { alcance: true, fecha: true } }).publicable).toBe(
      true,
    );
  });

  it("el Sello Personal no es condición de publicación (D63)", () => {
    const r = evaluarPublicacion(completo);
    expect(r.condiciones.map((c) => c.clave)).not.toContain("sello_personal");
    expect(r.publicable).toBe(true);
  });
});

describe("validarFechaVerificacion (HU-176 error)", () => {
  it("posterior a hoy → rechazada con el mensaje del panel", () => {
    expect(validarFechaVerificacion("2026-11-15", "2026-10-02")).toEqual({
      ok: false,
      motivo: "fecha_futura",
    });
    expect(MENSAJE_FECHA_FUTURA).toBe(
      "La fecha de una verificación no puede ser posterior a hoy.",
    );
  });

  it("hoy y antes → aceptadas; vacía → aceptada (un borrador se guarda incompleto)", () => {
    expect(validarFechaVerificacion("2026-10-02", "2026-10-02")).toEqual({ ok: true });
    expect(validarFechaVerificacion("2026-03-15", "2026-10-02")).toEqual({ ok: true });
    expect(validarFechaVerificacion(null, "2026-10-02")).toEqual({ ok: true });
  });

  it("ilegible o inexistente → rechazada como ilegible", () => {
    for (const f of ["15/03/2026", "2026-02-30", "2026-13-01", "ayer"])
      expect(validarFechaVerificacion(f, "2026-10-02")).toEqual({
        ok: false,
        motivo: "fecha_ilegible",
      });
  });
});

describe("mesDeAnio (vista previa y ficha: «marzo de 2026»)", () => {
  it.each([
    ["2026-03-15", "marzo de 2026"],
    ["2026-04-10", "abril de 2026"],
    ["2026-02-20", "febrero de 2026"],
    ["2025-12-01", "diciembre de 2025"],
  ])("%s → %s", (fecha, texto) => expect(mesDeAnio(fecha)).toBe(texto));
});
