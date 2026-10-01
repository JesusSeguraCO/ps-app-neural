// Emparejamiento de columnas (EP-006 · sub-slice 3, tarea 3.3 y 3.5; HU-086, HU-148): propuesta por
// nombre, corregible; columnas B.4 y de consentimiento/validación nunca se importan; plantillas que
// conservan columna → campo y avisan de las columnas que faltan o sobran.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CLAVES_CAMPO, normalizarEncabezado } from "./campos";
import {
  type CampoEmparejable,
  aplicarPlantilla,
  aPlantilla,
  camposEmparejados,
  corregir,
  proponerEmparejamiento,
} from "./emparejar";

const CAMPOS: CampoEmparejable[] = [
  { clave: "codigo", encabezado: "Código (PS-0000)", alias: ["codigo", "code"] },
  { clave: "nombre", encabezado: "Nombre", alias: ["nombres"] },
  { clave: "primerApellido", encabezado: "Primer apellido", alias: ["apellido"] },
  {
    clave: "disponibilidad",
    encabezado: "Disponible desde (AAAA-MM-DD, …) · interno",
    alias: ["disponibilidad", "fecha de disponibilidad"],
  },
  { clave: "aniosExperiencia", encabezado: "Años de experiencia (número)", alias: ["años"] },
  { clave: "experiencias", encabezado: "Experiencia (Cargo · Cliente …)", alias: ["experiencia"] },
  { clave: "tecnologias", encabezado: "Tecnologías (separadas por ;)", alias: ["stack"] },
];

const destinos = (e: ReturnType<typeof proponerEmparejamiento>) =>
  e.map((c) => (c.destino.tipo === "campo" ? c.destino.clave : `no:${c.destino.motivo}`));

describe("propuesta por nombre (HU-086 · pegar desde la hoja de cálculo)", () => {
  it("empareja código y disponibilidad de un bloque de Excel por encabezado, alias o clave", () => {
    const e = proponerEmparejamiento(["Código", "Disponibilidad"], CAMPOS);
    expect(destinos(e)).toEqual(["codigo", "disponibilidad"]);
    expect(e.every((c) => !c.bloqueada)).toBe(true);
  });

  it("reconoce el encabezado exacto del formato, la clave del JSON y alias sin acentos ni mayúsculas", () => {
    const e = proponerEmparejamiento(
      [
        "Código (PS-0000)",
        "primerApellido",
        "AÑOS",
        "Disponible desde (AAAA-MM-DD, …) · interno",
        "STACK",
      ],
      CAMPOS,
    );
    expect(destinos(e)).toEqual([
      "codigo",
      "primerApellido",
      "aniosExperiencia",
      "disponibilidad",
      "tecnologias",
    ]);
  });

  it("«Años de experiencia» no se confunde con «Experiencia»", () => {
    const e = proponerEmparejamiento(["Experiencia", "Años de experiencia"], CAMPOS);
    expect(destinos(e)).toEqual(["experiencias", "aniosExperiencia"]);
  });

  it("una columna desconocida queda sin emparejar, sin bloquear", () => {
    const e = proponerEmparejamiento(["Código", "Observaciones de la reunión"], CAMPOS);
    expect(destinos(e)).toEqual(["codigo", "no:sin_emparejar"]);
    expect(e[1]!.bloqueada).toBe(false);
  });

  it("dos columnas para el mismo campo: la segunda queda sin emparejar y se informa", () => {
    const e = proponerEmparejamiento(["Código", "code"], CAMPOS);
    expect(destinos(e)).toEqual(["codigo", "no:campo_repetido"]);
  });

  it("columnas de la lista negra B.4 quedan bloqueadas en «no importar» con su motivo", () => {
    const e = proponerEmparejamiento(
      [
        "Teléfono",
        "Celular",
        "Correo electrónico",
        "Email",
        "Foto",
        "CV",
        "Hoja de vida",
        "Motivación",
        "Proyección",
        "Qué le interesa aportar",
        "Promedio académico",
        "Certificaciones",
        "DISC",
        "LinkedIn",
      ],
      CAMPOS,
    );
    for (const c of e) {
      expect(c.destino, c.columna).toMatchObject({ tipo: "no_importar", motivo: "lista_negra" });
      expect(c.bloqueada, c.columna).toBe(true);
    }
    expect(e[0]!.destino).toMatchObject({ detalle: "Datos de contacto: nunca se importan" });
    expect(e[9]!.destino).toMatchObject({ detalle: expect.stringMatching(/Motivación/) });
  });

  it("consentimiento y resultado de la validación se rechazan con motivo (la importación no los concede)", () => {
    const e = proponerEmparejamiento(["Consentimiento", "Resultado de la validación"], CAMPOS);
    expect(destinos(e)).toEqual(["no:rechazada", "no:rechazada"]);
    expect(e.every((c) => c.bloqueada)).toBe(true);
    expect(e[0]!.destino).toMatchObject({ detalle: expect.stringMatching(/consentimiento/i) });
  });

  it("propiedad: ninguna columna B.4 termina emparejada con un campo, sea cual sea el adorno", () => {
    const b4 = ["telefono", "correo", "foto", "hoja de vida", "motivacion", "promedio", "disc"];
    fc.assert(
      fc.property(
        fc.constantFrom(...b4),
        fc.constantFrom("", " ", "  "),
        fc.boolean(),
        (base, esp, mayus) => {
          const col = `${esp}${mayus ? base.toUpperCase() : base}${esp}`;
          const [c] = proponerEmparejamiento([col], CAMPOS);
          return c!.destino.tipo === "no_importar" && c!.bloqueada;
        },
      ),
    );
  });
});

describe("corregir el emparejamiento", () => {
  it("cambia una columna a otro campo o a «no importar»", () => {
    let e = proponerEmparejamiento(["Código", "Fecha"], CAMPOS);
    expect(destinos(e)).toEqual(["codigo", "no:sin_emparejar"]);
    e = corregir(e, 1, "disponibilidad");
    expect(destinos(e)).toEqual(["codigo", "disponibilidad"]);
    e = corregir(e, 1, null);
    expect(destinos(e)).toEqual(["codigo", "no:decision"]);
  });

  it("si el campo ya lo tenía otra columna, esa queda en «no importar» (un campo, una columna)", () => {
    const e = corregir(proponerEmparejamiento(["Código", "Ref"], CAMPOS), 1, "codigo");
    expect(destinos(e)).toEqual(["no:decision", "codigo"]);
  });

  it("una columna bloqueada (B.4 o rechazada) no se puede emparejar", () => {
    const e = proponerEmparejamiento(["Código", "Teléfono"], CAMPOS);
    expect(() => corregir(e, 1, "nombre")).toThrow(/no se puede importar/);
  });

  it("camposEmparejados devuelve columna → campo solo de las emparejadas", () => {
    const e = proponerEmparejamiento(["Código", "Nota", "Disponibilidad"], CAMPOS);
    expect(camposEmparejados(e)).toEqual([
      { indice: 0, clave: "codigo" },
      { indice: 2, clave: "disponibilidad" },
    ]);
  });
});

describe("plantillas de emparejamiento (HU-148)", () => {
  const corregido = corregir(
    proponerEmparejamiento(["Cód.", "Disp. (mes)", "Comentario"], CAMPOS),
    0,
    "codigo",
  );
  const guardada = aPlantilla(corregir(corregido, 1, "disponibilidad"));

  it("guardar conserva qué columna va a qué campo y cuáles quedaron en «no importar»", () => {
    expect(guardada).toEqual([
      { columna: "Cód.", clave: "codigo" },
      { columna: "Disp. (mes)", clave: "disponibilidad" },
      { columna: "Comentario", clave: null },
    ]);
  });

  it("reutilizar en la hoja del mes siguiente: cada columna emparejada como se guardó", () => {
    const r = aplicarPlantilla(["Cód.", "Disp. (mes)", "Comentario"], guardada, CAMPOS);
    expect(destinos(r.emparejamiento)).toEqual(["codigo", "disponibilidad", "no:decision"]);
    expect(r.faltantes).toEqual([]);
    expect(r.nuevas).toEqual([]);
    // y se puede seguir corrigiendo antes de la vista previa
    expect(destinos(corregir(r.emparejamiento, 2, "nombre"))).toEqual([
      "codigo",
      "disponibilidad",
      "nombre",
    ]);
  });

  it("los encabezados se reconocen aunque cambien mayúsculas, acentos o espacios", () => {
    const r = aplicarPlantilla(["  cod. ", "DISP. (MES)"], guardada, CAMPOS);
    expect(destinos(r.emparejamiento)).toEqual(["codigo", "disponibilidad"]);
  });

  it("a la hoja le falta una columna: se dice cuál y su campo no se empareja", () => {
    const r = aplicarPlantilla(["Cód.", "Comentario"], guardada, CAMPOS);
    expect(r.faltantes).toEqual([{ columna: "Disp. (mes)", clave: "disponibilidad" }]);
    expect(camposEmparejados(r.emparejamiento).map((c) => c.clave)).toEqual(["codigo"]);
  });

  it("la hoja trae una columna que la plantilla no conoce: queda sin emparejar y se informa", () => {
    const r = aplicarPlantilla(
      ["Cód.", "Disp. (mes)", "Comentario", "Ciudad nueva"],
      guardada,
      CAMPOS,
    );
    expect(destinos(r.emparejamiento)).toEqual([
      "codigo",
      "disponibilidad",
      "no:decision",
      "no:sin_emparejar",
    ]);
    expect(r.nuevas).toEqual(["Ciudad nueva"]);
  });

  it("una plantilla nunca abre una columna B.4 aunque se hubiera guardado emparejada", () => {
    const r = aplicarPlantilla(["Teléfono"], [{ columna: "Teléfono", clave: "nombre" }], CAMPOS);
    expect(r.emparejamiento[0]!.destino).toMatchObject({
      tipo: "no_importar",
      motivo: "lista_negra",
    });
  });

  it("una plantilla con un campo que ya no existe en el formato lo descarta", () => {
    const r = aplicarPlantilla(
      ["Cód."],
      [{ columna: "Cód.", clave: "inexistente" as never }],
      CAMPOS,
    );
    expect(destinos(r.emparejamiento)).toEqual(["no:sin_emparejar"]);
  });
});

describe("normalizarEncabezado vive en el dominio", () => {
  it("quita paréntesis, «· interno», acentos y puntuación", () => {
    expect(normalizarEncabezado("Disponible desde (AAAA-MM-DD…) · interno")).toBe(
      "disponible desde",
    );
    expect(CLAVES_CAMPO).toContain("codigo");
  });
});
