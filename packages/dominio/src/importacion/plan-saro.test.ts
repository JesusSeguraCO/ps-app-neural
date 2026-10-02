// SARO y DISC en el plan de importación (EP-003 · SS3, tarea 3.3; HU-191; D61, D81; spec §5–§6). Puro:
// el alcance se valida contra el catálogo cerrado normalizado (mayúsculas y tildes) y se guarda en su
// forma registrada; desconocido o desactivado sin tenerlo → error de fila, nunca valor nuevo de la
// taxonomía; fecha futura o ilegible → error con su motivo y el valor exacto; `[vaciar]` en un publicado
// → error con el motivo de HU-191; en un borrador → se aplica. Las demás filas siguen en la vista previa.
import { describe, expect, it } from "vitest";
import { VACIAR } from "./celdas";
import { type Catalogos, type FilaBanco, type FilaMapeada, calcularPlan } from "./plan";

// «Hoy» de los escenarios de HU-191: 2 de octubre de 2026.
const HOY = "2026-10-02";
const ANTECEDENTES = "Antecedentes judiciales, disciplinarios y fiscales";
const RETIRADO = "Solo antecedentes judiciales";

const CATALOGOS: Catalogos = {
  roles: [{ nombre: "Desarrolladora backend Java", familia: "Desarrollo" }],
  familias: ["Desarrollo"],
  tecnologias: ["Java"],
  sectores: ["Banca"],
  seniorities: ["Senior"],
  ciudades: ["Medellín"],
  modalidades: ["Remoto", "Híbrido", "Presencial"],
  modalidadesPrueba: [
    { nombre: "Prueba práctica revisada por un arquitecto", familia: "Desarrollo" },
  ],
  motivosPausa: ["En licencia o ausencia temporal"],
  alcancesSaro: [
    { nombre: ANTECEDENTES, activo: true },
    { nombre: RETIRADO, activo: false },
  ],
};

const publicado = (codigo: string, extra: FilaBanco = {}): FilaBanco => ({
  codigo,
  estado: "publicado",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend Java",
  familia: "Desarrollo",
  seniority: "Senior",
  aniosExperiencia: 8,
  tecnologias: ["Java"],
  sectores: ["Banca"],
  modalidad: "Híbrido",
  ciudad: "Medellín",
  disponibilidad: "2026-11-01",
  modalidadPrueba: "Prueba práctica revisada por un arquitecto",
  experiencias: ["Backend senior · 2021-2026: pagos"],
  saroAlcance: null,
  saroFecha: null,
  discFecha: null,
  ...extra,
});

const plan = (filas: FilaMapeada[], banco: FilaBanco[]) =>
  calcularPlan({
    filas,
    modo: "crear_y_actualizar",
    banco: new Map(banco.map((b) => [String(b.codigo), b])),
    catalogos: CATALOGOS,
    hoy: HOY,
  });
const fila = (numero: number, celdas: FilaMapeada["celdas"]): FilaMapeada => ({ numero, celdas });

describe("plan · SARO y DISC (HU-191)", () => {
  it("happy: tres publicados incompletos se completan con alcance, fecha SARO y fecha DISC; siguen publicados", () => {
    const banco = ["PS-0105", "PS-0112", "PS-0118"].map((c) => publicado(c));
    const p = plan(
      banco.map((b, i) =>
        fila(i + 2, {
          codigo: String(b.codigo),
          saroAlcance: "antecedentes JUDICIALES, disciplinarios y fiscales",
          saroFecha: "2026-03-15",
          discFecha: "2026-04-10",
        }),
      ),
      banco,
    );
    expect(p.filas.map((f) => f.grupo)).toEqual(["actualizado", "actualizado", "actualizado"]);
    expect(p.filas[0]!.cambios).toEqual([
      { campo: "saroAlcance", antes: null, despues: ANTECEDENTES },
      { campo: "saroFecha", antes: null, despues: "2026-03-15" },
      { campo: "discFecha", antes: null, despues: "2026-04-10" },
    ]);
    expect(p.filas.every((f) => f.errores.length === 0)).toBe(true);
    expect(p.valoresNuevos).toEqual([]);
  });

  it("acepta la fecha en DD/MM/AAAA y la guarda como AAAA-MM-DD", () => {
    const p = plan(
      [fila(2, { codigo: "PS-0105", saroFecha: "15/03/2026" })],
      [publicado("PS-0105")],
    );
    expect(p.filas[0]!.cambios).toEqual([
      { campo: "saroFecha", antes: null, despues: "2026-03-15" },
    ]);
  });

  it("ida y vuelta: los tres datos tal como se exportan dejan el perfil «sin cambios»", () => {
    const b = publicado("PS-0142", {
      saroAlcance: ANTECEDENTES,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
    });
    const p = plan(
      [
        fila(2, {
          codigo: "PS-0142",
          saroAlcance: ANTECEDENTES,
          saroFecha: "2026-03-15",
          discFecha: "2026-04-10",
        }),
      ],
      [b],
    );
    expect(p.filas[0]!.grupo).toBe("sin_cambios");
  });

  it.each([
    [
      "alcance SARO «Antecedentes penales», que no existe en el catálogo",
      { saroAlcance: "Antecedentes penales" },
      "saroAlcance",
      "El alcance SARO no está en el catálogo: «Antecedentes penales»",
    ],
    [
      "fecha SARO 15/11/2026",
      { saroFecha: "15/11/2026" },
      "saroFecha",
      "La fecha de una verificación no puede ser posterior a hoy: «15/11/2026»",
    ],
    [
      "fecha DISC «abril»",
      { discFecha: "abril" },
      "discFecha",
      "La fecha DISC no se reconoce como fecha: «abril»",
    ],
    [
      "fecha SARO «31/02/2026», que no existe",
      { saroFecha: "31/02/2026" },
      "saroFecha",
      "La fecha SARO no se reconoce como fecha: «31/02/2026»",
    ],
  ] as const)(
    "error: %s → grupo con error con su motivo y el valor exacto; las demás filas siguen",
    (_, celdas, campo, mensaje) => {
      const p = plan(
        [
          fila(2, { codigo: "PS-0105", ...celdas }),
          fila(3, { codigo: "PS-0112", discFecha: "2026-04-10" }),
        ],
        [publicado("PS-0105"), publicado("PS-0112")],
      );
      expect(p.filas[0]!.grupo).toBe("con_error");
      expect(p.filas[0]!.errores).toEqual([expect.objectContaining({ campo, mensaje })]);
      expect(p.filas[0]!.cambios).toEqual([]);
      expect(p.valoresNuevos).toEqual([]);
      expect(p.filas[1]!.grupo).toBe("actualizado");
    },
  );

  it("un alcance desactivado no se acepta para un perfil que no lo tenía; quien ya lo tiene queda «sin cambios»", () => {
    const p = plan(
      [
        fila(2, { codigo: "PS-0105", saroAlcance: RETIRADO }),
        fila(3, { codigo: "PS-0112", saroAlcance: "solo antecedentes judiciales" }),
      ],
      [publicado("PS-0105"), publicado("PS-0112", { saroAlcance: RETIRADO })],
    );
    expect(p.filas[0]!.grupo).toBe("con_error");
    expect(p.filas[0]!.errores[0]!.mensaje).toBe(
      `El alcance SARO está desactivado en el catálogo: «${RETIRADO}»`,
    );
    expect(p.filas[1]!.grupo).toBe("sin_cambios");
  });

  it("edge: `[vaciar]` la fecha DISC de un publicado → error con el motivo de HU-191; conserva su fecha", () => {
    const b = publicado("PS-0142", {
      saroAlcance: ANTECEDENTES,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
    });
    for (const campo of ["discFecha", "saroFecha", "saroAlcance"] as const) {
      const p = plan([fila(2, { codigo: "PS-0142", [campo]: VACIAR })], [b]);
      expect(p.filas[0]!.grupo, campo).toBe("con_error");
      expect(p.filas[0]!.errores, campo).toEqual([
        {
          campo,
          mensaje:
            "No se puede vaciar una validación de entrada de un perfil publicado; pásalo a borrador desde el editor",
        },
      ]);
    }
  });

  it("`[vaciar]` en un borrador sí se aplica", () => {
    const b = publicado("PS-0160", { estado: "borrador", discFecha: "2026-04-10" });
    const p = plan([fila(2, { codigo: "PS-0160", discFecha: VACIAR })], [b]);
    expect(p.filas[0]!.grupo).toBe("actualizado");
    expect(p.filas[0]!.cambios).toEqual([
      { campo: "discFecha", antes: "2026-04-10", despues: null },
    ]);
  });

  it("un perfil nuevo trae los tres datos y nace en borrador (la importación no publica)", () => {
    const p = plan(
      [
        fila(2, {
          codigo: "PS-0900",
          nombre: "Andrés",
          primerApellido: "Molina",
          saroAlcance: ANTECEDENTES,
          saroFecha: "2026-03-15",
          discFecha: "2026-04-10",
        }),
      ],
      [],
    );
    expect(p.filas[0]!.grupo).toBe("nuevo");
    expect(p.filas[0]!.ficha).toMatchObject({
      estado: "borrador",
      saroAlcance: ANTECEDENTES,
      saroFecha: "2026-03-15",
      discFecha: "2026-04-10",
    });
  });
});
