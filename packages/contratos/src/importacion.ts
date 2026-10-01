// Formato único de la importación masiva (docs/10-specs/importacion-masiva.md §9; D2: exportar
// primero). La exportación del banco, la plantilla de muestra y el importador comparten estas
// columnas, encabezados y reglas, de modo que exportar y reimportar sin tocar deja todo «sin cambios».
//  - Una fila por perfil, una columna por campo; las listas en una sola celda separadas por «;».
//  - Celda vacía = no se toca; el literal `[vaciar]` (o `null` en JSON) vacía el campo a propósito.
//  - Los campos que el portal no publica van marcados «· interno» en el encabezado.
//  - Nunca viaja el consentimiento (la importación no lo concede, RF-8.15.7) ni nada de la lista
//    negra B.4: no hay columna donde ponerlo. «Qué le interesa aportar» queda fuera mientras el
//    sponsor decide si es Motivación (B.4, RF-3.7).
// Puro: lo usan el panel (servidor y navegador) y el worker.
import type { ClaveCampo } from "@ps/dominio/importacion/campos";

export const VACIAR = "[vaciar]";
export const SEPARADOR_LISTA = ";";
export const LIMITE_FILAS = 200;

export type TipoCampo = "texto" | "lista" | "numero" | "fecha_o_banda" | "enum";

export interface CampoImportacion {
  clave: ClaveCampo;
  encabezado: string;
  ejemplo: string;
  tipo: TipoCampo;
  interno?: boolean;
  // Otros nombres con que la gente suele titular la columna (se comparan normalizados).
  alias?: string[];
}

export { CLAVES_CAMPO, type ClaveCampo } from "@ps/dominio/importacion/campos";

export const CAMPOS_IMPORTACION: readonly CampoImportacion[] = [
  {
    clave: "codigo",
    encabezado: "Código (PS-0000)",
    ejemplo: "PS-0142",
    tipo: "texto",
    alias: ["codigo", "código", "code", "cod"],
  },
  {
    clave: "estado",
    encabezado: "Estado (borrador, pausado o archivado)",
    ejemplo: "pausado",
    tipo: "enum",
  },
  { clave: "nombre", encabezado: "Nombre", ejemplo: "Laura", tipo: "texto", alias: ["nombres"] },
  {
    clave: "primerApellido",
    encabezado: "Primer apellido",
    ejemplo: "Méndez",
    tipo: "texto",
    alias: ["apellido", "apellidos"],
  },
  {
    clave: "rol",
    encabezado: "Rol (del catálogo)",
    ejemplo: "Desarrolladora backend Java",
    tipo: "texto",
    alias: ["rol", "cargo"],
  },
  {
    clave: "familia",
    encabezado: "Familia del rol (solo si el rol es nuevo)",
    ejemplo: "Desarrollo",
    tipo: "texto",
    alias: ["familia", "categoria", "categoría"],
  },
  {
    clave: "seniority",
    encabezado: "Seniority",
    ejemplo: "Senior",
    tipo: "texto",
    alias: ["seniority", "nivel"],
  },
  {
    clave: "aniosExperiencia",
    encabezado: "Años de experiencia (número)",
    ejemplo: "8",
    tipo: "numero",
    alias: ["anios", "años", "experiencia anios", "años de experiencia"],
  },
  {
    clave: "tecnologias",
    encabezado: "Tecnologías (separadas por ;)",
    ejemplo: "Java; Spring Boot; Kafka",
    tipo: "lista",
    alias: ["tecnologias", "tecnologías", "stack"],
  },
  {
    clave: "sectores",
    encabezado: "Sectores (separados por ;)",
    ejemplo: "Banca; Seguros",
    tipo: "lista",
    alias: ["sector", "sectores"],
  },
  {
    clave: "modalidad",
    encabezado: "Modalidad de trabajo (Remoto, Híbrido o Presencial)",
    ejemplo: "Híbrido",
    tipo: "enum",
    alias: ["modalidad", "modalidad de trabajo"],
  },
  { clave: "ciudad", encabezado: "Ciudad", ejemplo: "Medellín", tipo: "texto", alias: ["ciudad"] },
  {
    clave: "disponibilidad",
    encabezado:
      "Disponible desde (AAAA-MM-DD, Disponible ahora, En 1 semana, En 2 semanas o En 1 mes) · interno",
    ejemplo: "2026-11-01",
    tipo: "fecha_o_banda",
    interno: true,
    alias: ["disponibilidad", "disponible desde", "disponibledesde", "fecha de disponibilidad"],
  },
  {
    clave: "modalidadPrueba",
    encabezado: "Modalidad de prueba (del catálogo de su familia)",
    ejemplo: "Prueba práctica revisada por un arquitecto",
    tipo: "texto",
    alias: ["modalidad de prueba", "prueba"],
  },
  {
    clave: "capacidad",
    encabezado: "Capacidad",
    ejemplo: "Ingeniera Backend Senior",
    tipo: "texto",
  },
  {
    clave: "anclaje",
    encabezado: "Anclaje de experiencia",
    ejemplo: "8 años en core bancario",
    tipo: "texto",
    alias: ["anclaje"],
  },
  {
    clave: "resumen",
    encabezado: "Resumen del perfil",
    ejemplo: "Backend con foco en sistemas transaccionales.",
    tipo: "texto",
    alias: ["resumen", "perfil profesional"],
  },
  {
    clave: "formacion",
    encabezado: "Nivel de formación",
    ejemplo: "Ingeniera de Sistemas",
    tipo: "texto",
    alias: ["formacion", "formación"],
  },
  {
    clave: "vinculo",
    encabezado: "Vínculo con Trycore (vinculado, banco no vinculado o fábrica) · interno",
    ejemplo: "vinculado",
    tipo: "enum",
    interno: true,
    alias: ["vinculo", "vínculo"],
  },
  {
    clave: "idiomas",
    encabezado: "Idiomas y nivel (separados por ;)",
    ejemplo: "Inglés B2",
    tipo: "lista",
    alias: ["idiomas"],
  },
  {
    clave: "selloPersonal",
    encabezado: "Sello Personal (tres competencias separadas por ;)",
    ejemplo: "Rigurosidad; Autodidactismo; Cautela",
    tipo: "lista",
    alias: ["sello", "sello personal"],
  },
  {
    clave: "experiencias",
    encabezado: "Experiencia (Cargo · Cliente · 2021-2026: qué hizo; separadas por ;)",
    ejemplo: "Backend senior · Bancolombia · 2021-2026: pagos inmediatos con Kafka",
    tipo: "lista",
    alias: ["experiencia", "experiencias", "experiencia clave", "trayectoria"],
  },
  {
    clave: "motivoPausa",
    encabezado: "Motivo de pausa (p. ej. En licencia o ausencia temporal) · interno",
    ejemplo: "En licencia o ausencia temporal",
    tipo: "texto",
    interno: true,
    alias: ["motivo de pausa", "motivopausa"],
  },
];

export const CAMPO: Record<ClaveCampo, CampoImportacion> = Object.fromEntries(
  CAMPOS_IMPORTACION.map((c) => [c.clave, c]),
) as Record<ClaveCampo, CampoImportacion>;

// ─── normalización de encabezados ───────────────────────────────────────────────────────────

const SIN_ACENTO: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  ñ: "n",
};
export function normalizarEncabezado(t: string): string {
  return t
    .toLowerCase()
    .replace(/[áéíóúüñ]/g, (c) => SIN_ACENTO[c]!)
    .replace(/\(.*?\)|·.*$/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ─── detección del formato y lectura ────────────────────────────────────────────────────────

export type Formato = "json" | "tsv" | "csv";
export type Deteccion = { formato: Formato } | { formato: null; motivo: "vacio" | "ambiguo" };

// `[`/`{` → JSON; tabuladores en la primera línea → celdas de hoja de cálculo; comas → CSV; si la
// primera línea no tiene separador alguno (una sola columna) o mezcla, se pregunta (spec §2).
export function detectarFormato(texto: string): Deteccion {
  const t = texto.replace(/^﻿/, "").trim();
  if (!t) return { formato: null, motivo: "vacio" };
  if (t.startsWith("[") || t.startsWith("{")) return { formato: "json" };
  const primera = t.split(/\r?\n/, 1)[0]!;
  const tabs = primera.includes("\t");
  const comas = primera.includes(",");
  if (tabs) return { formato: "tsv" };
  if (comas && comillasBalanceadas(t)) return { formato: "csv" };
  return { formato: null, motivo: "ambiguo" };
}

function comillasBalanceadas(t: string): boolean {
  return (t.match(/"/g)?.length ?? 0) % 2 === 0;
}

export interface Tabla {
  encabezados: string[];
  // Cada fila con su número en el archivo (la fila 1 son los encabezados) y su texto original.
  filas: Array<{ numero: number; celdas: string[]; original: string }>;
}

// CSV (RFC 4180: comillas dobles, comillas escapadas, saltos dentro de comillas) o TSV de Excel.
export function leerTabular(texto: string, separador: "," | "\t"): Tabla {
  const t = texto.replace(/^﻿/, "");
  const registros: Array<{ celdas: string[]; original: string }> = [];
  let celda = "";
  let celdas: string[] = [];
  let original = "";
  let enComillas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    original += c;
    if (enComillas) {
      if (c === '"' && t[i + 1] === '"') {
        celda += '"';
        original += t[++i];
      } else if (c === '"') enComillas = false;
      else celda += c;
    } else if (c === '"' && celda === "") enComillas = true;
    else if (c === separador) {
      celdas.push(celda);
      celda = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      celdas.push(celda);
      registros.push({ celdas, original: original.replace(/\r?\n$|\r$/, "") });
      celda = "";
      celdas = [];
      original = "";
    } else celda += c;
  }
  if (celda !== "" || celdas.length) {
    celdas.push(celda);
    registros.push({ celdas, original });
  }
  const utiles = registros.filter((r) => r.celdas.some((x) => x.trim() !== ""));
  const [cabeza, ...resto] = utiles;
  return {
    encabezados: (cabeza?.celdas ?? []).map((x) => x.trim()),
    filas: resto.map((r, k) => ({ numero: k + 2, celdas: r.celdas, original: r.original })),
  };
}

export type ResultadoLectura =
  | { ok: true; formato: Formato; tabla: Tabla }
  | {
      ok: false;
      motivo: "vacio" | "ambiguo" | "json_invalido" | "sin_filas" | "demasiadas_filas";
      detalle?: string;
    };

// JSON: arreglo de objetos con las claves del formato (o un objeto suelto). Se lleva a la misma
// tabla que el tabular: las listas a «a; b», `null` a `[vaciar]`, los números a texto.
export function leerJson(texto: string): ResultadoLectura {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch (e) {
    return { ok: false, motivo: "json_invalido", detalle: (e as Error).message };
  }
  const arreglo = Array.isArray(datos) ? datos : [datos];
  if (!arreglo.every((x) => x && typeof x === "object" && !Array.isArray(x)))
    return { ok: false, motivo: "json_invalido", detalle: "cada perfil debe ser un objeto" };
  const encabezados: string[] = [];
  for (const o of arreglo as Record<string, unknown>[])
    for (const k of Object.keys(o)) if (!encabezados.includes(k)) encabezados.push(k);
  const celda = (v: unknown): string =>
    v === undefined
      ? ""
      : v === null
        ? VACIAR
        : Array.isArray(v)
          ? v.map((x) => String(x).replaceAll(SEPARADOR_LISTA, "\\;")).join(`${SEPARADOR_LISTA} `)
          : typeof v === "object"
            ? JSON.stringify(v)
            : String(v);
  return {
    ok: true,
    formato: "json",
    tabla: {
      encabezados,
      filas: (arreglo as Record<string, unknown>[]).map((o, k) => ({
        numero: k + 1,
        celdas: encabezados.map((h) => (Object.hasOwn(o, h) ? celda(o[h]) : "")),
        original: JSON.stringify(o),
      })),
    },
  };
}

export function leer(texto: string, formatoElegido?: Formato): ResultadoLectura {
  const d = formatoElegido ? { formato: formatoElegido } : detectarFormato(texto);
  if (!d.formato) return { ok: false, motivo: (d as { motivo: "vacio" | "ambiguo" }).motivo };
  const r: ResultadoLectura =
    d.formato === "json"
      ? leerJson(texto)
      : {
          ok: true,
          formato: d.formato,
          tabla: leerTabular(texto, d.formato === "tsv" ? "\t" : ","),
        };
  if (!r.ok) return r;
  if (r.tabla.filas.length === 0) return { ok: false, motivo: "sin_filas" };
  if (r.tabla.filas.length > LIMITE_FILAS)
    return { ok: false, motivo: "demasiadas_filas", detalle: String(r.tabla.filas.length) };
  return r;
}

// Lista de una celda: separada por «;» (un «;» escrito como «\;» no separa).
export function partirLista(celda: string): string[] {
  return celda
    .split(/(?<!\\);/)
    .map((x) => x.replaceAll("\\;", ";").trim())
    .filter(Boolean);
}

export function unirLista(valores: readonly string[]): string {
  return valores.map((x) => x.replaceAll(SEPARADOR_LISTA, "\\;")).join(`${SEPARADOR_LISTA} `);
}

// ─── experiencias en una celda: «Cargo · Cliente · 2021-2026: qué hizo» ─────────────────────

export interface ExperienciaTexto {
  cargo: string;
  cliente: string | null;
  desde: number | null;
  hasta: number | null;
  descripcion: string;
}

export function formatearExperiencia(e: ExperienciaTexto): string {
  const periodo = e.desde || e.hasta ? `${e.desde ?? ""}-${e.hasta ?? ""}` : "";
  const cabeza = [e.cargo, e.cliente ?? "", periodo].join(" · ");
  return `${cabeza}: ${e.descripcion}`;
}

export function leerExperiencia(t: string): ExperienciaTexto | null {
  const i = t.indexOf(":");
  if (i < 0) return null;
  const [cargo = "", cliente = "", periodo = ""] = t
    .slice(0, i)
    .split("·")
    .map((x) => x.trim());
  const descripcion = t.slice(i + 1).trim();
  if (!cargo || !descripcion) return null;
  const m = periodo.match(/^(\d{4})?\s*-\s*(\d{4})?$/);
  if (periodo && !m) return null;
  return {
    cargo,
    cliente: cliente || null,
    desde: m?.[1] ? Number(m[1]) : null,
    hasta: m?.[2] ? Number(m[2]) : null,
    descripcion,
  };
}

// ─── escritura (exportación y plantilla) ────────────────────────────────────────────────────

export type FilaFormato = Partial<Record<ClaveCampo, string | string[] | number | null>>;

function aCelda(v: FilaFormato[ClaveCampo]): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return unirLista(v);
  return String(v);
}

function comillas(c: string): string {
  return /[",\n\r]/.test(c) ? `"${c.replaceAll('"', '""')}"` : c;
}

// Hoja de cálculo: CSV con BOM (Excel abre los acentos bien) y encabezados autoexplicativos.
export function escribirCsv(filas: readonly FilaFormato[]): string {
  const cabeza = CAMPOS_IMPORTACION.map((c) => comillas(c.encabezado)).join(",");
  const cuerpo = filas.map((f) =>
    CAMPOS_IMPORTACION.map((c) => comillas(aCelda(f[c.clave]))).join(","),
  );
  return `﻿${[cabeza, ...cuerpo].join("\r\n")}\r\n`;
}

// JSON: las mismas columnas con su clave; las listas como arreglos; los vacíos se omiten.
export function escribirJson(filas: readonly FilaFormato[]): string {
  const limpio = filas.map((f) =>
    Object.fromEntries(
      CAMPOS_IMPORTACION.flatMap((c) => {
        const v = f[c.clave];
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0))
          return [];
        return [[c.clave, v]];
      }),
    ),
  );
  return `${JSON.stringify(limpio, null, 2)}\n`;
}

// Plantilla de muestra con los tres casos (spec §6, paso 1): actualizar un campo de un perfil que
// existe, crear uno nuevo con todos sus datos y archivar uno.
export const EJEMPLOS_PLANTILLA: readonly FilaFormato[] = [
  { codigo: "PS-0142", disponibilidad: "2026-11-01" },
  {
    codigo: "PS-0900",
    nombre: "Andrés",
    primerApellido: "Molina",
    rol: "Desarrollador backend Java",
    familia: "Desarrollo",
    seniority: "Senior",
    aniosExperiencia: 8,
    tecnologias: ["Java", "Spring Boot", "Kafka"],
    sectores: ["Banca"],
    modalidad: "Híbrido",
    ciudad: "Bogotá",
    disponibilidad: "Disponible ahora",
    modalidadPrueba: "Prueba práctica revisada por un arquitecto",
    capacidad: "Ingeniero Backend Senior",
    anclaje: "8 años en core bancario",
    resumen: "Backend con foco en sistemas transaccionales.",
    formacion: "Ingeniero de Sistemas",
    vinculo: "vinculado",
    idiomas: ["Inglés B2"],
    selloPersonal: ["Rigurosidad y calidad", "Autodidactismo", "Cautela y responsabilidad"],
    experiencias: [
      "Backend senior · Davivienda · 2019-2026: migración de REST a gRPC para 50 mil usuarios",
    ],
  },
  { codigo: "PS-0099", estado: "archivado" },
];
