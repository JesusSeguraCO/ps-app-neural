// «Incompleto» y conteo de incompletos (HU-178; D62, D63, D80; diseño §2 y §4). Puras: un publicado
// está incompleto si la guarda única de publicar (`evaluarPublicacion`) lo rechazaría hoy; la marca
// dice qué le falta con las etiquetas de la guarda (SARO alcance y fecha se nombran juntos). No es un
// estado de la máquina: un borrador o un pausado no se marcan. El Sello Personal no cuenta (D63). El
// conteo que lee el portal sale de la misma guarda sobre los indicadores sin datos personales (0029).
import { describe, expect, it } from "vitest";
import {
  contarIncompletos,
  datosDeIndicadores,
  estadoDeEntrada,
  type IndicadoresPublicacion,
} from "./entrada";
import { evaluarPublicacion, type DatosParaPublicar } from "./perfil";

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
const con = (extra: Partial<DatosParaPublicar>) => evaluarPublicacion({ ...completo, ...extra });

describe("estadoDeEntrada (HU-178)", () => {
  it.each([
    [
      "sin SARO (alcance y fecha)",
      { saro: { alcance: false, fecha: false } },
      "Incompleto: falta la verificación SARO (alcance y fecha)",
    ],
    [
      "sin la fecha DISC",
      { disc: { fecha: false } },
      "Incompleto: falta la fecha de la evaluación DISC",
    ],
    [
      "sin modalidad de prueba",
      { modalidadPrueba: { elegida: false, activa: false } },
      "Incompleto: falta la modalidad de prueba",
    ],
    [
      "con la modalidad desactivada",
      { modalidadPrueba: { elegida: true, activa: false } },
      "Incompleto: falta la modalidad de prueba",
    ],
    [
      "solo sin el alcance SARO",
      { saro: { alcance: false, fecha: true } },
      "Incompleto: falta el alcance de la verificación SARO",
    ],
    [
      "solo sin la fecha SARO",
      { saro: { alcance: true, fecha: false } },
      "Incompleto: falta la fecha de la verificación SARO",
    ],
    [
      "sin SARO ni DISC",
      { saro: { alcance: false, fecha: false }, disc: { fecha: false } },
      "Incompleto: falta la verificación SARO (alcance y fecha) y la fecha de la evaluación DISC",
    ],
    [
      "sin modalidad, sin SARO ni DISC",
      {
        modalidadPrueba: { elegida: false, activa: false },
        saro: { alcance: false, fecha: false },
        disc: { fecha: false },
      },
      "Incompleto: falta la modalidad de prueba, la verificación SARO (alcance y fecha) y la fecha de la evaluación DISC",
    ],
  ] as const)("publicado %s → «%s»", (_, extra, texto) => {
    const e = estadoDeEntrada("publicado", con(extra as Partial<DatosParaPublicar>));
    expect(e.incompleto).toBe(true);
    expect(e.texto).toBe(texto);
  });

  it("un publicado completo, sin ninguna competencia del Sello Personal, no se marca (D63)", () => {
    // El Sello Personal no es dato de la guarda: un perfil completo sin él es publicable.
    const e = estadoDeEntrada("publicado", con({}));
    expect(e).toEqual({ incompleto: false, faltan: [], texto: null });
  });

  it.each(["borrador", "pausado", "archivado"] as const)(
    "un %s no se marca aunque le falte SARO: la marca es de los publicados, no un estado nuevo",
    (estado) => {
      const e = estadoDeEntrada(estado, con({ saro: { alcance: false, fecha: false } }));
      expect(e.incompleto).toBe(false);
      expect(e.texto).toBeNull();
    },
  );

  it("nombra también un dato obligatorio ausente (la guarda es una sola)", () => {
    const e = estadoDeEntrada("publicado", con({ experiencias: 0 }));
    expect(e.texto).toBe("Incompleto: falta la trayectoria");
  });

  it("devuelve las claves de lo que falta, para el filtro y la pregunta", () => {
    const e = estadoDeEntrada(
      "publicado",
      con({ saro: { alcance: false, fecha: false }, disc: { fecha: false } }),
    );
    expect(e.faltan).toEqual([
      "la verificación SARO (alcance y fecha)",
      "la fecha de la evaluación DISC",
    ]);
  });
});

const indicador = (extra: Partial<IndicadoresPublicacion> = {}): IndicadoresPublicacion => ({
  tieneNombre: true,
  tienePrimerApellido: true,
  tieneRol: true,
  tecnologias: 3,
  tieneSeniority: true,
  tieneAniosExperiencia: true,
  tieneCiudad: true,
  tieneModalidadTrabajo: true,
  tieneDisponibilidad: true,
  experiencias: 1,
  pruebaElegida: true,
  pruebaActiva: true,
  familiaConModalidades: true,
  consentimientoRegistrado: true,
  consentimientoVigente: true,
  consentimientoNominal: true,
  saroAlcance: true,
  saroFecha: true,
  discFecha: true,
  ...extra,
});

describe("conteo de incompletos sobre los indicadores (HU-178 · D80; 0029)", () => {
  it("los indicadores completos son publicables con la misma guarda", () => {
    expect(evaluarPublicacion(datosDeIndicadores(indicador())).publicable).toBe(true);
  });

  it.each([
    ["sin SARO", { saroAlcance: false, saroFecha: false }],
    ["sin DISC", { discFecha: false }],
    ["sin modalidad", { pruebaElegida: false, pruebaActiva: false }],
    ["modalidad inactiva", { pruebaActiva: false }],
    ["sin consentimiento vigente", { consentimientoVigente: false }],
    ["sin trayectoria", { experiencias: 0 }],
  ] as const)("%s → cuenta como incompleto", (_, extra) => {
    expect(contarIncompletos([indicador(), indicador(extra)])).toBe(1);
  });

  it("0 cuando todos los publicados están completos; el número sale de la guarda, no de una copia", () => {
    expect(contarIncompletos([indicador(), indicador(), indicador()])).toBe(0);
    expect(contarIncompletos([])).toBe(0);
    expect(
      contarIncompletos([indicador({ discFecha: false }), indicador({ saroFecha: false })]),
    ).toBe(2);
  });
});
