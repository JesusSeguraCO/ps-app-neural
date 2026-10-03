// Los saltos «Falta …» de la vista previa y del resultado de publicar varios (HU-176, HU-129, HU-136):
// cada validación de entrada que falta lleva a su campo del editor, con el texto exacto del bloqueo.
import { describe, expect, it } from "vitest";
import {
  MOTIVO_CONDICION,
  type ClaveCondicion,
  type Condicion,
  type EvaluacionPublicacion,
} from "@ps/dominio/inventario/perfil";
import { motivo } from "./PublicacionMasiva";
import { accionDelAviso, entradasQueFaltan } from "./VistaPrevia";

const cond = (clave: ClaveCondicion, cumple: boolean): Condicion => ({
  clave,
  etiqueta: clave,
  motivo: MOTIVO_CONDICION[clave],
  campo: clave,
  cumple,
});
const evaluacion = (faltan: ClaveCondicion[]): EvaluacionPublicacion => ({
  condiciones: (Object.keys(MOTIVO_CONDICION) as ClaveCondicion[]).map((c) =>
    cond(c, !faltan.includes(c)),
  ),
  faltanDatos: [],
  publicable: faltan.length === 0,
});

describe("vista previa: la salida del aviso que impide publicar", () => {
  it("solo faltan validaciones de entrada → «Ir al campo» de la primera que falta", () => {
    for (const [falta, campo] of [
      ["saro_alcance", "pe-saro-alcance"],
      ["saro_fecha", "pe-saro-fecha"],
      ["disc_fecha", "pe-disc-fecha"],
    ] as const) {
      const entradas = entradasQueFaltan(evaluacion([falta]));
      expect(entradas.map((c) => c.clave)).toEqual([falta]);
      expect(accionDelAviso({ sinConsentimiento: false, entradas })).toEqual({
        tipo: "campo",
        campo,
        etiqueta: "Ir al campo",
      });
    }
  });

  it("con varias, salta a la primera en el orden de las condiciones (SARO antes que DISC)", () => {
    const entradas = entradasQueFaltan(evaluacion(["disc_fecha", "saro_fecha"]));
    expect(entradas.map((c) => c.clave)).toEqual(["saro_fecha", "disc_fecha"]);
    expect(accionDelAviso({ sinConsentimiento: false, entradas })).toMatchObject({
      campo: "pe-saro-fecha",
    });
  });

  it("un bloque que la ficha exige va antes que las validaciones de entrada", () => {
    const entradas = entradasQueFaltan(evaluacion(["saro_fecha"]));
    expect(accionDelAviso({ primero: "trayectoria", sinConsentimiento: false, entradas })).toEqual({
      tipo: "campo",
      campo: "pe-trayectoria",
      etiqueta: "Completar trayectoria",
    });
  });

  it("sin consentimiento, el aviso ofrece registrarlo y no salta a la validación", () => {
    const entradas = entradasQueFaltan(evaluacion(["consentimiento", "disc_fecha"]));
    expect(accionDelAviso({ sinConsentimiento: true, entradas })).toEqual({
      tipo: "consentimiento",
    });
  });

  it("las condiciones que no son de entrada no cuentan como «Falta …» de validación", () => {
    expect(
      entradasQueFaltan(evaluacion(["trayectoria", "disponibilidad", "modalidad_prueba"])),
    ).toEqual([]);
  });
});

describe("publicar varios: motivo y salida de un perfil que no se publicó", () => {
  const fallo = (claves: string[]) => ({
    codigo: "PS-0142",
    nombre: "Laura Méndez",
    motivos: ["condiciones"],
    condiciones: claves.map((clave) => ({ clave })),
  });

  it("falta la fecha DISC → «Falta la fecha de la evaluación DISC.» y el salto a su campo", () => {
    expect(motivo(fallo(["disc_fecha"]))).toEqual({
      nota: "Falta la fecha de la evaluación DISC.",
      accion: "Completar las validaciones",
      href: "/inventario/PS-0142#pe-disc-fecha",
    });
  });

  it("faltan las tres → tres notas y el salto a la primera (alcance SARO)", () => {
    const m = motivo(fallo(["saro_alcance", "saro_fecha", "disc_fecha"]));
    expect(m.nota).toBe(
      "Falta el alcance de la verificación SARO. Falta la fecha de la verificación SARO. Falta la fecha de la evaluación DISC.",
    );
    expect(m.href).toBe("/inventario/PS-0142#pe-saro-alcance");
  });

  it("con el consentimiento además, la salida es registrar el consentimiento", () => {
    const m = motivo({ ...fallo(["saro_fecha"]), motivos: ["consentimiento"] });
    expect(m.nota).toBe(
      "Falta el consentimiento nominal registrado. Falta la fecha de la verificación SARO.",
    );
    expect(m).toMatchObject({
      accion: "Registrar consentimiento",
      href: "/inventario/PS-0142#consentimiento",
    });
  });

  it("una clave que no es de entrada (ni del prototipo de Object) no pinta «Falta undefined»", () => {
    const m = motivo(fallo(["constructor", "toString", "trayectoria"]));
    expect(m.nota).not.toMatch(/undefined/);
    expect(m.href).toBe("/inventario/PS-0142");
  });
});
