// Contrato del formato de importación (EP-006 · sub-slice 3, tarea 3.1; HU-088, HU-086): mismas
// columnas para exportar, plantilla e importar; listas con «;»; `[vaciar]`; detección del formato.
import { describe, expect, it } from "vitest";
import {
  CAMPOS_IMPORTACION,
  EJEMPLOS_PLANTILLA,
  VACIAR,
  detectarFormato,
  escribirCsv,
  escribirJson,
  formatearExperiencia,
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
    const todo = CAMPOS_IMPORTACION.map((c) => `${c.clave} ${c.encabezado}`).join(" ").toLowerCase();
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
