import { describe, expect, it } from "vitest";
import { datoDesincronizado, leerOperaciones } from "./operaciones";

const HOY = "2026-10-01";

describe("leerOperaciones (HU-150; D12, D16)", () => {
  it("CSV con las cuatro columnas mínimas y una de observaciones: filas leídas y la columna ignorada", () => {
    const r = leerOperaciones(
      "asignaciones-30sep.csv",
      "Código del perfil,Cliente,Fecha de inicio,Fecha de liberación,Observaciones\n" +
        "PS-0192,Logística Magdalena,2026-07-06,2026-12-15,renovación probable\n" +
        "ps-0208 , Salud Integral Caribe ,10/08/2026,26/02/2027,\n",
      HOY,
    );
    expect(r).toEqual({
      ok: true,
      formato: "csv",
      ignoradas: ["Observaciones"],
      errores: [],
      filas: [
        {
          numero: 2,
          codigo: "PS-0192",
          cuenta: "Logística Magdalena",
          inicio: "2026-07-06",
          liberacion: "2026-12-15",
        },
        {
          numero: 3,
          codigo: "PS-0208",
          cuenta: "Salud Integral Caribe",
          inicio: "2026-08-10",
          liberacion: "2027-02-26",
        },
      ],
    });
  });

  it("CSV de Excel en español con punto y coma y sinónimos de encabezado", () => {
    const r = leerOperaciones(
      "ops.CSV",
      "codigo;cuenta;inicio;liberacion\nPS-0077;Cooperativa Horizonte;2026-03-02;2027-06-30\n",
      HOY,
    );
    expect(r.ok && r.filas.map((f) => [f.codigo, f.cuenta])).toEqual([
      ["PS-0077", "Cooperativa Horizonte"],
    ]);
  });

  it("JSON: arreglo de objetos con los mismos nombres; filas numeradas desde 1", () => {
    const r = leerOperaciones(
      "ops.json",
      JSON.stringify([
        {
          codigo: "PS-0155",
          cliente: "Banco del Valle Andino",
          fecha_inicio: "2026-09-01",
          fecha_liberacion: "2027-01-29",
          responsable: "Eida",
        },
      ]),
      HOY,
    );
    expect(r).toMatchObject({
      ok: true,
      formato: "json",
      ignoradas: ["responsable"],
      filas: [{ numero: 1, codigo: "PS-0155", liberacion: "2027-01-29" }],
    });
  });

  it("filas con errores: cada una con su número y su motivo; las válidas siguen", () => {
    const r = leerOperaciones(
      "ops.csv",
      [
        "codigo,cliente,fecha de inicio,fecha de liberacion",
        "PS-0001,Uno,2026-09-01,2026-12-01",
        "PS-237,Dos,2026-09-01,2026-12-01",
        "PS-0003,,2026-09-01,2026-12-01",
        "PS-0004,Cuatro,2026-09-01,30/02/2027",
        "PS-0005,Cinco,ayer,2026-12-01",
        "PS-0006,Seis,2026-12-01,2026-11-01",
        "PS-0007,Siete,2026-01-01,2026-10-01",
        "PS-0001,Repetido,2026-09-01,2026-12-01",
        "PS-0009,Nueve,2026-09-01,",
      ].join("\n"),
      HOY,
    );
    expect(r.ok && r.filas.map((f) => f.numero)).toEqual([2]);
    expect(r.ok && r.errores).toEqual([
      {
        numero: 3,
        codigo: "PS-237",
        motivo: "El código no tiene el formato PS-XXXX (cuatro dígitos).",
      },
      { numero: 4, codigo: "PS-0003", motivo: "Falta el cliente." },
      {
        numero: 5,
        codigo: "PS-0004",
        motivo: "«30/02/2027» no es una fecha de liberación válida.",
      },
      { numero: 6, codigo: "PS-0005", motivo: "«ayer» no es una fecha de inicio válida." },
      {
        numero: 7,
        codigo: "PS-0006",
        motivo: "La fecha de liberación no es posterior a la de inicio.",
      },
      {
        numero: 8,
        codigo: "PS-0007",
        motivo: "La fecha de liberación ya llegó: no es un colocado vigente.",
      },
      { numero: 9, codigo: "PS-0001", motivo: "El código PS-0001 ya viene en la fila 2." },
      { numero: 10, codigo: "PS-0009", motivo: "Falta la fecha de liberación." },
    ]);
  });

  it("otro formato (xlsx, txt, binario) o JSON roto: rechazo entero", () => {
    expect(leerOperaciones("asignaciones-octubre.xlsx", "PK\u0003\u0004…", HOY)).toEqual({
      ok: false,
      motivo: "formato_no_admitido",
    });
    expect(leerOperaciones("ops.txt", "codigo,cliente\n", HOY)).toEqual({
      ok: false,
      motivo: "formato_no_admitido",
    });
    expect(leerOperaciones("ops.csv", "codigo,cliente\u0000\u0001", HOY)).toEqual({
      ok: false,
      motivo: "formato_no_admitido",
    });
    expect(leerOperaciones("ops.json", "{no es json", HOY)).toEqual({
      ok: false,
      motivo: "formato_no_admitido",
    });
  });

  it("sin alguna columna mínima: rechazo entero diciendo cuáles faltan", () => {
    expect(leerOperaciones("ops.csv", "codigo,cliente\nPS-0001,Uno\n", HOY)).toEqual({
      ok: false,
      motivo: "faltan_columnas",
      faltan: ["fecha de inicio", "fecha de liberación"],
    });
  });

  it("sin filas o con más de 200: rechazo entero", () => {
    expect(leerOperaciones("ops.csv", "codigo,cliente,inicio,liberacion\n", HOY)).toEqual({
      ok: false,
      motivo: "sin_filas",
    });
    const muchas = Array.from(
      { length: 201 },
      (_, i) => `PS-${String(i).padStart(4, "0")},C,2026-09-01,2026-12-01`,
    );
    expect(
      leerOperaciones("ops.csv", ["codigo,cliente,inicio,liberacion", ...muchas].join("\n"), HOY),
    ).toEqual({ ok: false, motivo: "demasiadas_filas" });
  });
});

describe("datoDesincronizado (HU-150: más de 7 días civiles sin carga nueva)", () => {
  const ahora = new Date("2026-10-01T15:00:00Z"); // 10:00 en Bogotá
  it("7 días → no; 8 días → sí", () => {
    expect(datoDesincronizado(new Date("2026-09-24T13:00:00Z"), ahora)).toBe(false);
    expect(datoDesincronizado(new Date("2026-09-23T23:00:00Z"), ahora)).toBe(true);
  });
  it("cuenta días civiles de Bogotá: el 23 sep a las 11 p. m. en Bogotá es el 23 aunque en UTC sea el 24", () => {
    expect(datoDesincronizado(new Date("2026-09-24T04:00:00Z"), ahora)).toBe(true);
  });
});
