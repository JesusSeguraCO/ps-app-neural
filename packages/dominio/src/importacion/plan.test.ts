// Plan de importación (EP-006 · sub-slice 3, tarea 3.4; HU-086 escenarios 2–5; spec §4–§6 paso 3):
// puro, sin escribir nada. Grupos con conteo, diff solo de lo que cambia, duplicados que bloquean,
// valores nuevos de la taxonomía, modo, fusión ausente/vacío/[vaciar] y la ida y vuelta exportar →
// pegar = todo «sin cambios».
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { ClaveCampo } from "./campos";
import { VACIAR } from "./celdas";
import {
  type Catalogos,
  type FilaBanco,
  type FilaMapeada,
  calcularPlan,
  mapearFilas,
} from "./plan";

const HOY = "2026-10-01";

const CATALOGOS: Catalogos = {
  roles: [
    { nombre: "Desarrolladora backend Java", familia: "Desarrollo" },
    { nombre: "Analista QA", familia: "Calidad" },
  ],
  familias: ["Desarrollo", "Calidad", "Datos"],
  tecnologias: ["Java", "Spring Boot", "Kafka", "Figma", "Python"],
  sectores: ["Banca", "Seguros", "Retail"],
  seniorities: ["Junior", "Semi senior", "Senior"],
  ciudades: ["Bogotá", "Medellín", "Cali"],
  modalidades: ["Remoto", "Híbrido", "Presencial"],
  modalidadesPrueba: [
    { nombre: "Prueba práctica revisada por un arquitecto", familia: "Desarrollo" },
    { nombre: "Caso de pruebas sobre una app real", familia: "Calidad" },
  ],
  motivosPausa: ["En licencia o ausencia temporal", "Pidió no ser presentado"],
  alcancesSaro: [],
};

const laura: FilaBanco = {
  codigo: "PS-0142",
  estado: "publicado",
  nombre: "Laura",
  primerApellido: "Méndez",
  rol: "Desarrolladora backend Java",
  familia: "Desarrollo",
  seniority: "Senior",
  aniosExperiencia: 8,
  tecnologias: ["Java", "Spring Boot", "Kafka"],
  sectores: ["Banca"],
  modalidad: "Híbrido",
  ciudad: "Medellín",
  disponibilidad: "2026-11-01",
  modalidadPrueba: "Prueba práctica revisada por un arquitecto",
  capacidad: "Ingeniera Backend Senior",
  anclaje: "8 años en core bancario",
  resumen: "Backend transaccional.",
  formacion: "Ingeniera de Sistemas",
  vinculo: "vinculado",
  idiomas: ["Inglés B2"],
  selloPersonal: ["Rigurosidad", "Autodidactismo", "Cautela"],
  experiencias: ["Backend senior · Bancolombia · 2021-2026: pagos inmediatos con Kafka"],
  motivoPausa: null,
};
const mario: FilaBanco = {
  ...laura,
  codigo: "PS-0143",
  nombre: "Mario",
  primerApellido: "Ríos",
  rol: "Analista QA",
  familia: "Calidad",
  tecnologias: ["Python"],
  modalidadPrueba: "Caso de pruebas sobre una app real",
  disponibilidad: "2026-10-15",
  experiencias: [],
};
const ana: FilaBanco = {
  ...laura,
  codigo: "PS-0144",
  nombre: "Ana",
  estado: "pausado",
  motivoPausa: "Pidió no ser presentado",
};
const BANCO = new Map([laura, mario, ana].map((f) => [f.codigo as string, f]));

// Una fila de la exportación del banco: todas las celdas con su texto.
function exportada(f: FilaBanco): Partial<Record<ClaveCampo, string>> {
  return Object.fromEntries(
    Object.entries(f).map(([k, v]) => [
      k,
      v === null ? "" : Array.isArray(v) ? v.join("; ") : String(v),
    ]),
  );
}
const fila = (numero: number, celdas: Partial<Record<ClaveCampo, string>>): FilaMapeada => ({
  numero,
  celdas,
});
const plan = (filas: FilaMapeada[], opciones: Partial<Parameters<typeof calcularPlan>[0]> = {}) =>
  calcularPlan({
    filas,
    modo: "crear_y_actualizar",
    banco: BANCO,
    catalogos: CATALOGOS,
    hoy: HOY,
    ...opciones,
  });

describe("ida y vuelta (HU-086 · vista previa; spec §4.4)", () => {
  it("pegar la exportación sin tocar deja todo «sin cambios»", () => {
    const p = plan([laura, mario, ana].map((f, i) => fila(i + 2, exportada(f))));
    expect(p.conteos).toEqual({
      nuevos: 0,
      actualizados: 0,
      archivados: 0,
      sin_cambios: 3,
      omitidos: 0,
      con_error: 0,
    });
    expect(p.bloqueado).toBe(false);
  });

  it("dos disponibilidades cambiadas → 2 actualizados, el resto sin cambios, diff solo de ese campo", () => {
    const p = plan([
      fila(2, { ...exportada(laura), disponibilidad: "2026-12-01" }),
      fila(3, { ...exportada(mario), disponibilidad: "En 1 semana" }),
      fila(4, exportada(ana)),
    ]);
    expect(p.conteos.actualizados).toBe(2);
    expect(p.conteos.sin_cambios).toBe(1);
    expect(p.filas[0]!.cambios).toEqual([
      { campo: "disponibilidad", antes: "2026-11-01", despues: "2026-12-01" },
    ]);
    // La banda se traduce a fecha contra hoy (2026-10-01 + 7 días).
    expect(p.filas[1]!.cambios).toEqual([
      { campo: "disponibilidad", antes: "2026-10-15", despues: "2026-10-08" },
    ]);
    expect(p.filas[2]!.grupo).toBe("sin_cambios");
  });

  it("una banda que da la misma fecha que ya hay no es un cambio", () => {
    const f = plan([fila(2, { codigo: "PS-0143", disponibilidad: "En 2 semanas" })]).filas[0]!;
    expect(f.grupo).toBe("sin_cambios");
  });

  it("propiedad: cualquier subconjunto reordenado de la exportación queda sin cambios", () => {
    fc.assert(
      fc.property(fc.shuffledSubarray([laura, mario, ana], { minLength: 1 }), (fs) => {
        const p = plan(fs.map((f, i) => fila(i + 2, exportada(f))));
        return p.conteos.sin_cambios === fs.length && p.filas.every((x) => x.cambios.length === 0);
      }),
    );
  });
});

describe("fusión: ausente, vacío y [vaciar] (spec §5.1)", () => {
  it("solo cambia lo que viene; celda vacía no toca; [vaciar] vacía", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", ciudad: "", capacidad: VACIAR, disponibilidad: "2026-12-01" }),
    ]);
    const f = p.filas[0]!;
    expect(f.grupo).toBe("actualizado");
    expect(f.cambios).toEqual([
      { campo: "disponibilidad", antes: "2026-11-01", despues: "2026-12-01" },
      { campo: "capacidad", antes: "Ingeniera Backend Senior", despues: null },
    ]);
  });

  it("[vaciar] en una lista la deja vacía", () => {
    const f = plan([fila(2, { codigo: "PS-0142", idiomas: VACIAR })]).filas[0]!;
    expect(f.cambios).toEqual([{ campo: "idiomas", antes: ["Inglés B2"], despues: [] }]);
  });

  it("nombre, primer apellido y código no se vacían", () => {
    const f = plan([fila(2, { codigo: "PS-0142", nombre: VACIAR })]).filas[0]!;
    expect(f.grupo).toBe("con_error");
    expect(f.errores[0]).toMatchObject({
      campo: "nombre",
      mensaje: expect.stringMatching(/no se puede vaciar/),
    });
  });
});

describe("código y modo (spec §4)", () => {
  it("sin código o con forma inválida → error", () => {
    const p = plan([fila(2, { nombre: "X" }), fila(3, { codigo: "PS-12" })]);
    expect(p.filas.map((f) => f.grupo)).toEqual(["con_error", "con_error"]);
    expect(p.filas[0]!.errores[0]!.mensaje).toMatch(/Falta el código/);
    expect(p.filas[1]!.errores[0]!.mensaje).toMatch(/PS-0000/);
  });

  it("el código se acepta con espacios y en minúsculas", () => {
    expect(plan([fila(2, { codigo: " ps-0142 " })]).filas[0]).toMatchObject({
      codigo: "PS-0142",
      grupo: "sin_cambios",
    });
  });

  it("código nuevo crea en borrador con su ficha; exige nombre y primer apellido", () => {
    const p = plan([
      fila(2, {
        codigo: "PS-0900",
        nombre: "Andrés",
        primerApellido: "Molina",
        rol: "Analista QA",
      }),
      fila(3, { codigo: "PS-0901", nombre: "Sin apellido" }),
    ]);
    expect(p.filas[0]).toMatchObject({
      grupo: "nuevo",
      ficha: { estado: "borrador", nombre: "Andrés", rol: "Analista QA", familia: "Calidad" },
    });
    expect(p.filas[1]!.grupo).toBe("con_error");
    expect(p.filas[1]!.errores[0]).toMatchObject({ campo: "primerApellido" });
  });

  it("solo actualizar omite el código que no existe; solo crear omite el que existe", () => {
    const filas = [
      fila(2, { codigo: "PS-0142", ciudad: "Cali" }),
      fila(3, { codigo: "PS-0900", nombre: "A", primerApellido: "B" }),
    ];
    const a = plan(filas, { modo: "solo_actualizar" });
    expect(a.filas.map((f) => f.grupo)).toEqual(["actualizado", "omitido"]);
    expect(a.filas[1]!.motivoOmision).toMatch(/no existe/);
    const c = plan(filas, { modo: "solo_crear" });
    expect(c.filas.map((f) => f.grupo)).toEqual(["omitido", "nuevo"]);
    expect(c.filas[0]!.motivoOmision).toMatch(/ya existe/);
  });
});

describe("duplicados (HU-086 · dos filas con el mismo código; spec §4.3)", () => {
  it("ambas al grupo con error, ninguna se aplica y el plan queda bloqueado", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", ciudad: "Cali" }),
      fila(3, exportada(mario)),
      fila(4, { codigo: "ps-0142" }),
    ]);
    expect(p.filas.map((f) => f.grupo)).toEqual(["con_error", "sin_cambios", "con_error"]);
    expect(p.filas[0]!.errores[0]!.mensaje).toMatch(/PS-0142.*repetido.*fila 4/);
    expect(p.filas[2]!.errores[0]!.mensaje).toMatch(/fila 2/);
    expect(p.bloqueado).toBe(true);
  });

  it("excluir una de las dos resuelve el duplicado", () => {
    const p = plan(
      [fila(2, { codigo: "PS-0142", ciudad: "Cali" }), fila(3, { codigo: "PS-0142" })],
      { excluidas: new Set([3]) },
    );
    expect(p.filas[0]!.grupo).toBe("actualizado");
    expect(p.filas[1]!.incluida).toBe(false);
    expect(p.bloqueado).toBe(false);
  });
});

describe("estado: no publica, archiva (spec §3, HU-141)", () => {
  it("estado publicado en un perfil que no lo está → el campo se rechaza con aviso y lo demás se aplica", () => {
    const f = plan([fila(2, { codigo: "PS-0144", estado: "publicado", ciudad: "Cali" })]).filas[0]!;
    expect(f.grupo).toBe("actualizado");
    expect(f.cambios.map((c) => c.campo)).toEqual(["ciudad"]);
    expect(f.avisos[0]).toMatchObject({
      campo: "estado",
      mensaje: expect.stringMatching(/no publica/),
    });
  });

  it("un nuevo con estado publicado nace en borrador con aviso", () => {
    const f = plan([
      fila(2, { codigo: "PS-0900", nombre: "A", primerApellido: "B", estado: "Publicado" }),
    ]).filas[0]!;
    expect(f).toMatchObject({ grupo: "nuevo", ficha: { estado: "borrador" } });
    expect(f.avisos[0]!.campo).toBe("estado");
  });

  it("estado archivado → grupo archivados; si no existe el código, error", () => {
    const p = plan([
      fila(2, { codigo: "PS-0143", estado: "archivado" }),
      fila(3, { codigo: "PS-0999", estado: "archivado" }),
    ]);
    expect(p.filas[0]).toMatchObject({
      grupo: "archivado",
      cambios: [{ campo: "estado", antes: "publicado", despues: "archivado" }],
    });
    expect(p.filas[1]!.grupo).toBe("con_error");
  });

  it("pausar exige motivo de pausa (en la fila o ya registrado)", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", estado: "pausado" }),
      fila(3, {
        codigo: "PS-0143",
        estado: "pausado",
        motivoPausa: "en licencia o ausencia temporal",
      }),
    ]);
    expect(p.filas[0]!.grupo).toBe("con_error");
    expect(p.filas[1]!.cambios).toEqual([
      { campo: "estado", antes: "publicado", despues: "pausado" },
      { campo: "motivoPausa", antes: null, despues: "En licencia o ausencia temporal" },
    ]);
  });

  it("marca la contradicción ALTA que la fila crearía entre estado y disponibilidad (HU-134, D5)", () => {
    const alta = (i: number) =>
      p.filas[i]!.avisos.filter((x) => x.mensaje.startsWith("Contradicción alta: "));
    const p = plan(
      [
        fila(2, { codigo: "PS-0144", disponibilidad: "2026-12-01" }),
        fila(3, {
          codigo: "PS-0143",
          estado: "pausado",
          motivoPausa: "en licencia o ausencia temporal",
        }),
        fila(4, { codigo: "PS-0142", disponibilidad: VACIAR }),
        fila(5, {
          codigo: "PS-0143",
          estado: "pausado",
          motivoPausa: "en licencia o ausencia temporal",
          disponibilidad: VACIAR,
        }),
      ],
      { excluidas: new Set([3]) },
    );
    expect(p.filas[0]!.grupo).toBe("actualizado");
    expect(alta(0).map((x) => x.mensaje)).toEqual([
      "Contradicción alta: Pausado y con disponibilidad «Más de 1 mes». Si está ocupado hasta una fecha, no es una pausa: debe seguir publicado con esa disponibilidad.",
    ]);
    expect(alta(0)[0]!.campo).toBe("disponibilidad");
    expect(alta(1)).toHaveLength(1);
    // Un publicado sin disponibilidad ya no es aviso: la fila va a error y no se aplica (gate data H1).
    expect(p.filas[2]!.grupo).toBe("con_error");
    expect(p.filas[2]!.errores.map((x) => x.campo)).toEqual(["disponibilidad"]);
    expect(alta(2)).toEqual([]);
    expect(alta(3)).toEqual([]);
  });

  it("no marca lo que la fila no toca: el pausado del banco con fecha no se señala si la fila no cambia su estado ni su disponibilidad", () => {
    const p = plan([fila(2, { codigo: "PS-0144", resumen: "Otro resumen." })]);
    expect(p.filas[0]!.avisos.filter((x) => x.mensaje.startsWith("Contradicción"))).toEqual([]);
  });

  it("un colocado no cambia de estado por importación y su disponibilidad no queda antes de la liberación", () => {
    const pedro: FilaBanco = { ...laura, codigo: "PS-0145", estado: "publicado" };
    const banco = new Map([...BANCO, ["PS-0145", pedro]]);
    const colocados = new Map([
      ["PS-0145", { cuenta: "Seguros Altamira", liberacion: "2026-11-13" }],
    ]);
    const archivar = plan([fila(2, { codigo: "PS-0145", estado: "archivado" })], {
      banco,
      colocados,
    }).filas[0]!;
    expect(archivar.grupo).toBe("con_error");
    expect(archivar.errores[0]!.mensaje).toMatch(
      /colocado \(Seguros Altamira, hasta el 2026-11-13\)/,
    );
    // Repetir su estado no es un cambio de estado: lo demás de la fila se aplica.
    const mismo = plan(
      [fila(2, { codigo: "PS-0145", estado: "publicado", anclaje: "Otro anclaje" })],
      {
        banco,
        colocados,
      },
    ).filas[0]!;
    expect(mismo.grupo).toBe("actualizado");
    const antes = plan([fila(2, { codigo: "PS-0145", disponibilidad: "2026-10-20" })], {
      banco,
      colocados,
    }).filas[0]!;
    expect(antes.avisos.map((x) => x.mensaje)).toContain(
      "Contradicción alta: Colocado en Seguros Altamira hasta el 2026-11-13 y con disponibilidad antes de esa fecha. Un colocado muestra su fecha de liberación.",
    );
    const ahora = plan([fila(2, { codigo: "PS-0145", disponibilidad: "Disponible ahora" })], {
      banco,
      colocados,
    }).filas[0]!;
    expect(ahora.avisos.map((x) => x.mensaje).join(" ")).toMatch(
      /Colocado y con «Disponible ahora»/,
    );
  });

  it("estado desconocido → error con las opciones", () => {
    const f = plan([fila(2, { codigo: "PS-0142", estado: "vacaciones" })]).filas[0]!;
    expect(f.errores[0]).toMatchObject({
      campo: "estado",
      opciones: ["borrador", "pausado", "archivado"],
    });
  });
});

describe("tipos y catálogos cerrados → error con opciones", () => {
  it("años no numéricos o fuera de rango", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", aniosExperiencia: "ocho" }),
      fila(3, { codigo: "PS-0143", aniosExperiencia: "61" }),
    ]);
    expect(p.filas.map((f) => f.errores[0]?.campo)).toEqual([
      "aniosExperiencia",
      "aniosExperiencia",
    ]);
  });

  it("disponibilidad: fecha válida o rótulo del PRD; lo demás es error con las opciones", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", disponibilidad: "Disponible ahora" }),
      fila(3, { codigo: "PS-0143", disponibilidad: "en 1 mes" }),
      fila(4, { codigo: "PS-0144", disponibilidad: "2026-02-30" }),
    ]);
    expect(p.filas[0]!.cambios).toEqual([
      { campo: "disponibilidad", antes: "2026-11-01", despues: "2026-10-01" },
    ]);
    expect(p.filas[1]!.cambios).toEqual([
      { campo: "disponibilidad", antes: "2026-10-15", despues: "2026-10-31" },
    ]);
    expect(p.filas[2]!.errores[0]).toMatchObject({
      campo: "disponibilidad",
      opciones: ["AAAA-MM-DD", "Disponible ahora", "En 1 semana", "En 2 semanas", "En 1 mes"],
    });
  });

  it("seniority, ciudad, modalidad, motivo de pausa y vínculo: sin distinguir mayúsculas ni acentos; lo desconocido, error", () => {
    const ok = plan([
      fila(2, {
        codigo: "PS-0142",
        ciudad: "bogota",
        modalidad: "remoto",
        seniority: "SEMI SENIOR",
        vinculo: "Fábrica",
      }),
    ]).filas[0]!;
    expect(ok.cambios).toEqual([
      { campo: "seniority", antes: "Senior", despues: "Semi senior" },
      { campo: "modalidad", antes: "Híbrido", despues: "Remoto" },
      { campo: "ciudad", antes: "Medellín", despues: "Bogotá" },
      { campo: "vinculo", antes: "vinculado", despues: "fábrica" },
    ]);
    const mal = plan([fila(2, { codigo: "PS-0142", ciudad: "Bogta", seniority: "Experto" })])
      .filas[0]!;
    expect(mal.grupo).toBe("con_error");
    expect(mal.errores.map((e) => e.campo)).toEqual(["seniority", "ciudad"]);
    expect(mal.errores[1]!.opciones?.[0]).toBe("Bogotá");
  });

  it("modalidad de prueba: del catálogo y de la familia del rol", () => {
    const f = plan([
      fila(2, { codigo: "PS-0142", modalidadPrueba: "Caso de pruebas sobre una app real" }),
    ]).filas[0]!;
    expect(f.errores[0]).toMatchObject({
      campo: "modalidadPrueba",
      mensaje: expect.stringMatching(/familia Desarrollo/),
    });
  });

  it("listas con tope: idiomas ≤ 8, Sello Personal ≤ 3", () => {
    const f = plan([fila(2, { codigo: "PS-0142", selloPersonal: "a; b; c; d" })]).filas[0]!;
    expect(f.errores[0]!.campo).toBe("selloPersonal");
  });

  it("sectores: varios valores (D23) con el mismo tope que el editor, 8", () => {
    const ocho = plan([
      fila(2, { codigo: "PS-0142", sectores: "Banca; Seguros; Retail; a; b; c; d; e" }),
    ]);
    expect(ocho.filas[0]!.grupo).toBe("actualizado");
    const nueve = plan([
      fila(2, { codigo: "PS-0142", sectores: "Banca; Seguros; Retail; a; b; c; d; e; f" }),
    ]);
    expect(nueve.filas[0]!.errores[0]).toMatchObject({
      campo: "sectores",
      mensaje: "Máximo 8 (trae 9)",
    });
  });

  it("los mismos topes que el editor: 8 tecnologías, 12 experiencias, idioma ≤ 60 y competencia ≤ 80 caracteres", () => {
    const p = plan(
      [
        fila(2, {
          codigo: "PS-0142",
          tecnologias: "Java; Kafka; Python; Figma; Spring Boot; a; b; c; d",
        }),
        fila(3, { codigo: "PS-0143", idiomas: "x".repeat(61) }),
        fila(4, { codigo: "PS-0144", selloPersonal: "y".repeat(81) }),
        fila(5, {
          codigo: "PS-0142",
          experiencias: Array.from(
            { length: 13 },
            (_, i) => `Cargo ${i} · · 2020-2021: hizo ${i}`,
          ).join("; "),
        }),
      ],
      { excluidas: new Set([2]) },
    );
    expect(p.filas.map((f) => [f.grupo, f.errores[0]?.campo])).toEqual([
      ["con_error", "tecnologias"],
      ["con_error", "idiomas"],
      ["con_error", "selloPersonal"],
      ["con_error", "experiencias"],
    ]);
  });

  it("experiencia ilegible o que nombra al cliente en el texto → error", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", experiencias: "sin dos puntos" }),
      fila(3, {
        codigo: "PS-0143",
        experiencias: "QA · Nequi · 2020-2022: pruebas de la app de Nequi",
      }),
      fila(4, { codigo: "PS-0144", experiencias: "QA · · 2022-2020: al revés" }),
    ]);
    expect(p.filas.map((f) => f.grupo)).toEqual(["con_error", "con_error", "con_error"]);
    expect(p.filas[1]!.errores[0]!.mensaje).toMatch(/nombra al cliente/);
  });
});

describe("valores nuevos en la taxonomía (HU-086 · valores que no existen)", () => {
  it("se destacan con el valor exacto, cuántas veces y sugerencias, sin bloquear", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", tecnologias: "Java; Fgima; Rust" }),
      fila(3, { codigo: "PS-0143", tecnologias: "fgima", sectores: "Salud" }),
    ]);
    expect(p.bloqueado).toBe(false);
    expect(p.filas.map((f) => f.grupo)).toEqual(["actualizado", "actualizado"]);
    expect(p.valoresNuevos).toEqual([
      { tipo: "tecnologia", valor: "Fgima", veces: 2, sugerencias: ["Figma"] },
      { tipo: "tecnologia", valor: "Rust", veces: 1, sugerencias: [] },
      { tipo: "sector", valor: "Salud", veces: 1, sugerencias: [] },
    ]);
    expect(p.filas[0]!.avisos.map((a) => a.campo)).toEqual(["tecnologias", "tecnologias"]);
  });

  it("los valores existentes se escriben como en el catálogo", () => {
    const f = plan([fila(2, { codigo: "PS-0143", tecnologias: "python; KAFKA" })]).filas[0]!;
    expect(f.cambios).toEqual([
      { campo: "tecnologias", antes: ["Python"], despues: ["Python", "Kafka"] },
    ]);
  });

  it("un rol nuevo exige una familia que exista; con ella es valor nuevo", () => {
    const p = plan([
      // Sobre un pausado: en un publicado, cambiar de familia exige además su modalidad de prueba.
      fila(2, { codigo: "PS-0144", rol: "Arquitecta de datos", familia: "Datos" }),
      fila(3, { codigo: "PS-0143", rol: "Arquitecta de datos" }),
      fila(4, { codigo: "PS-0142", rol: "Arquitecta de datos", familia: "Inventada" }),
    ]);
    expect(p.filas.map((f) => f.grupo)).toEqual(["actualizado", "con_error", "con_error"]);
    expect(p.valoresNuevos).toEqual([
      { tipo: "rol", valor: "Arquitecta de datos", veces: 1, sugerencias: [] },
    ]);
  });
});

describe("tarjetas: quién es y la fila cruda del error", () => {
  it("nombre y rol del banco si existe; de la fila si es nuevo; la fila cruda solo en errores", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", ciudad: "Cali" }),
      fila(3, {
        codigo: "PS-0900",
        nombre: "Andrés",
        primerApellido: "Molina",
        rol: "Analista QA",
      }),
      fila(4, { codigo: "PS-0311", nombre: "Tatiana", disponibilidad: "Pronto" }),
    ]);
    expect(p.filas.map((f) => f.persona)).toEqual([
      { nombre: "Laura Méndez", rol: "Desarrolladora backend Java" },
      { nombre: "Andrés Molina", rol: "Analista QA" },
      { nombre: "Tatiana", rol: null },
    ]);
    expect(p.filas[0]!.cruda).toBeUndefined();
    expect(p.filas[2]!.cruda).toBe("PS-0311 · Tatiana · Pronto");
  });
});

describe("exclusión y resumen (spec §6 paso 3–4)", () => {
  it("una tarjeta desmarcada no cuenta en el resumen de lo que se aplicará", () => {
    const p = plan(
      [
        fila(2, { codigo: "PS-0142", ciudad: "Cali" }),
        fila(3, { codigo: "PS-0143", ciudad: "Cali" }),
      ],
      {
        excluidas: new Set([2]),
      },
    );
    expect(p.conteos.actualizados).toBe(2);
    expect(p.resumen).toEqual({
      crear: 0,
      actualizar: 1,
      archivar: 0,
      omitir: 0,
      error: 0,
      excluidas: 1,
    });
  });
});

describe("mapearFilas: de la tabla y el emparejamiento a celdas por campo", () => {
  it("toma solo las columnas emparejadas y anota las rechazadas no vacías", () => {
    const filas = mapearFilas(
      {
        encabezados: ["Código", "Teléfono", "Disponibilidad", "Consentimiento"],
        filas: [{ numero: 2, celdas: ["PS-0142", "300 123", "2026-12-01", "sí"] }],
      },
      [
        {
          indice: 0,
          columna: "Código",
          destino: { tipo: "campo", clave: "codigo" },
          bloqueada: false,
        },
        {
          indice: 1,
          columna: "Teléfono",
          destino: {
            tipo: "no_importar",
            motivo: "lista_negra",
            detalle: "Datos de contacto: nunca se importan",
          },
          bloqueada: true,
        },
        {
          indice: 2,
          columna: "Disponibilidad",
          destino: { tipo: "campo", clave: "disponibilidad" },
          bloqueada: false,
        },
        {
          indice: 3,
          columna: "Consentimiento",
          destino: {
            tipo: "no_importar",
            motivo: "rechazada",
            detalle: "El consentimiento no se concede importando",
          },
          bloqueada: true,
        },
      ],
    );
    expect(filas).toEqual([
      {
        numero: 2,
        celdas: { codigo: "PS-0142", disponibilidad: "2026-12-01" },
        rechazadas: [
          { columna: "Consentimiento", detalle: "El consentimiento no se concede importando" },
        ],
      },
    ]);
    // El valor de la columna B.4 no viaja ni en el aviso.
    expect(JSON.stringify(filas)).not.toContain("300 123");
  });

  it("la columna rechazada llega como aviso en la tarjeta y el resto de la fila se aplica", () => {
    const f = plan([
      {
        numero: 2,
        celdas: { codigo: "PS-0142", ciudad: "Cali" },
        rechazadas: [{ columna: "Consentimiento", detalle: "x" }],
      },
    ]).filas[0]!;
    expect(f.grupo).toBe("actualizado");
    expect(f.avisos).toEqual([{ campo: null, mensaje: "Columna «Consentimiento» rechazada: x" }]);
  });
});

describe("un publicado no queda incompleto por importación (D1, D10, RF-8.4; gate data H1)", () => {
  const errorDe = (p: ReturnType<typeof plan>) => p.filas[0]!.errores.map((e) => e.campo);

  it("vaciar la modalidad de prueba de un publicado es error de la fila y no se aplica", () => {
    const p = plan([fila(2, { codigo: "PS-0142", modalidadPrueba: VACIAR })]);
    expect(p.filas[0]!.grupo).toBe("con_error");
    expect(errorDe(p)).toContain("modalidadPrueba");
    expect(p.filas[0]!.errores[0]!.mensaje).toMatch(/publicado/);
  });

  it("vaciar tecnologías y experiencia de un publicado es error y nombra los dos campos", () => {
    const p = plan([
      fila(2, { codigo: "PS-0142", tecnologias: VACIAR, aniosExperiencia: VACIAR }),
    ]);
    expect(p.filas[0]!.grupo).toBe("con_error");
    expect(errorDe(p)).toEqual(expect.arrayContaining(["tecnologias", "aniosExperiencia"]));
  });

  it("un rol de otra familia deja sin modalidad de prueba válida: error si no trae una de la familia nueva", () => {
    const p = plan([fila(2, { codigo: "PS-0142", rol: "Analista QA" })]);
    expect(p.filas[0]!.grupo).toBe("con_error");
    expect(errorDe(p)).toContain("modalidadPrueba");
  });

  it("el mismo cambio de rol con la modalidad de la familia nueva se aplica", () => {
    const p = plan([
      fila(2, {
        codigo: "PS-0142",
        rol: "Analista QA",
        modalidadPrueba: "Caso de pruebas sobre una app real",
      }),
    ]);
    expect(p.filas[0]!.grupo).toBe("actualizado");
  });

  it("si la misma fila lo pasa a borrador, vaciar es válido (sale del portal)", () => {
    const p = plan([fila(2, { codigo: "PS-0142", estado: "borrador", modalidadPrueba: VACIAR })]);
    expect(p.filas[0]!.grupo).toBe("actualizado");
  });

  it("un hueco que el publicado ya tenía no convierte en error una fila que no lo toca", () => {
    // Mario ya está publicado sin trayectoria (dato heredado): actualizar su ciudad sigue valiendo.
    const p = plan([fila(2, { codigo: "PS-0143", ciudad: "Cali" })]);
    expect(p.filas[0]!.grupo).toBe("actualizado");
  });

  it("vaciar la disponibilidad de un publicado es error (publicado sin disponibilidad, D5 ALTA)", () => {
    const p = plan([fila(2, { codigo: "PS-0142", disponibilidad: VACIAR })]);
    expect(p.filas[0]!.grupo).toBe("con_error");
    expect(errorDe(p)).toContain("disponibilidad");
  });
});
