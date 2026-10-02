// Emparejamiento de columnas del asistente de importación (docs/10-specs/importacion-masiva.md §6,
// paso 2; HU-086, HU-148). Puro y determinista: propone columna → campo por nombre, deja corregir,
// y guarda/aplica plantillas. Las columnas de la lista negra B.4 (PRD Anexo B) y las que intentan
// conceder consentimiento o dictar la validación quedan bloqueadas en «no importar»: no hay forma de
// que lleguen a `perfiles` (RF-3.7, RF-8.15.7).
import { type ClaveCampo, normalizarEncabezado } from "./campos";

export interface CampoEmparejable {
  clave: ClaveCampo;
  encabezado: string;
  alias?: readonly string[];
}

export type MotivoNoImportar =
  | "sin_emparejar" // nadie la reconoció: se ignora y se informa
  | "campo_repetido" // otra columna anterior ya alimenta ese campo
  | "decision" // la administradora la dejó en «no importar»
  | "lista_negra" // B.4: nunca se importa
  | "rechazada"; // consentimiento o resultado de la validación: la importación no los concede

export type Destino =
  | { tipo: "campo"; clave: ClaveCampo }
  | { tipo: "no_importar"; motivo: MotivoNoImportar; detalle?: string };

export interface ColumnaEmparejada {
  indice: number;
  columna: string;
  destino: Destino;
  // B.4 o rechazada: ninguna corrección ni plantilla la abre.
  bloqueada: boolean;
}

export interface ColumnaPlantilla {
  columna: string;
  clave: ClaveCampo | null;
}

// ─── columnas que nunca se importan ──────────────────────────────────────────────────────────

const BLOQUEOS: ReadonlyArray<{ patron: RegExp; motivo: MotivoNoImportar; detalle: string }> = [
  {
    patron:
      /\b(telefono|tel|celular|movil|whatsapp|correo|email|e mail|mail|linkedin|github|redes|direccion|contacto)\b/,
    motivo: "lista_negra",
    detalle: "Datos de contacto: nunca se importan",
  },
  {
    patron: /\b(foto|fotografia|imagen|avatar)\b/,
    motivo: "lista_negra",
    detalle: "Fotografía: nunca se importa",
  },
  {
    patron: /\b(cv|hoja de vida|curriculum|resume)\b/,
    motivo: "lista_negra",
    detalle: "Hoja de vida: nunca se importa",
  },
  {
    patron: /\b(motivacion|proyeccion|aporte|aportar|le interesa)\b/,
    motivo: "lista_negra",
    detalle: "Motivación y proyección: material interno de Talento Humano, nunca se importa",
  },
  {
    patron: /\b(promedio|certificacion|certificaciones|certificado|certificados)\b/,
    motivo: "lista_negra",
    detalle: "Promedio académico y certificaciones: nunca se importan",
  },
  {
    patron: /\bdisc\b/,
    motivo: "lista_negra",
    detalle: "Resultado del DISC: solo se usa el Sello Personal",
  },
  {
    patron: /\b(consentimiento|autorizacion|habeas)\b/,
    motivo: "rechazada",
    detalle: "El consentimiento no se concede importando: se registra en el perfil",
  },
  {
    patron: /\bvalidacion\b/,
    motivo: "rechazada",
    detalle: "El resultado de la validación viene del registro de evaluación, no de la importación",
  },
];

// La fecha de la evaluación DISC sí se importa (B.7, HU-191): solo ella escapa al bloqueo del DISC.
const FECHA_DISC = /^(fecha( de la evaluacion)? disc|disc fecha)$/;

function bloqueo(columna: string): Destino | null {
  const n = normalizarEncabezado(columna);
  if (FECHA_DISC.test(n)) return null;
  const b = BLOQUEOS.find((x) => x.patron.test(n));
  return b ? { tipo: "no_importar", motivo: b.motivo, detalle: b.detalle } : null;
}

// Forma de comparación: normalizada y sin espacios («primer apellido» = «primerApellido»).
const compacto = (t: string) => normalizarEncabezado(t).replace(/ /g, "");

function indicePorNombre(campos: readonly CampoEmparejable[]): Map<string, ClaveCampo> {
  const m = new Map<string, ClaveCampo>();
  for (const c of campos)
    for (const nombre of [c.encabezado, c.clave, ...(c.alias ?? [])]) {
      const k = compacto(nombre);
      if (k && !m.has(k)) m.set(k, c.clave);
    }
  return m;
}

// Un campo, una columna: la primera que lo pide se lo queda; las siguientes quedan informadas.
function asignar(
  columnas: string[],
  elegir: (columna: string, indice: number) => Destino,
): ColumnaEmparejada[] {
  const usados = new Set<ClaveCampo>();
  return columnas.map((columna, indice) => {
    const b = bloqueo(columna);
    if (b) return { indice, columna, destino: b, bloqueada: true };
    let destino = elegir(columna, indice);
    if (destino.tipo === "campo") {
      if (usados.has(destino.clave)) destino = { tipo: "no_importar", motivo: "campo_repetido" };
      else usados.add(destino.clave);
    }
    return { indice, columna, destino, bloqueada: false };
  });
}

export function proponerEmparejamiento(
  encabezados: readonly string[],
  campos: readonly CampoEmparejable[],
): ColumnaEmparejada[] {
  const porNombre = indicePorNombre(campos);
  return asignar([...encabezados], (columna) => {
    const clave = porNombre.get(compacto(columna));
    return clave ? { tipo: "campo", clave } : { tipo: "no_importar", motivo: "sin_emparejar" };
  });
}

// Corrección de una columna: a un campo (que se le quita a la columna que lo tuviera) o a «no
// importar» (`null`). Las bloqueadas no se abren.
export function corregir(
  emparejamiento: readonly ColumnaEmparejada[],
  indice: number,
  clave: ClaveCampo | null,
): ColumnaEmparejada[] {
  const objetivo = emparejamiento.find((c) => c.indice === indice);
  if (!objetivo) throw new Error(`No hay columna ${indice}`);
  if (objetivo.bloqueada && clave !== null)
    throw new Error(`La columna «${objetivo.columna}» no se puede importar`);
  return emparejamiento.map((c) => {
    if (c.indice === indice) {
      if (clave === null)
        return c.bloqueada ? c : { ...c, destino: { tipo: "no_importar", motivo: "decision" } };
      return { ...c, destino: { tipo: "campo", clave } };
    }
    if (clave !== null && c.destino.tipo === "campo" && c.destino.clave === clave)
      return { ...c, destino: { tipo: "no_importar", motivo: "decision" } };
    return c;
  });
}

export function camposEmparejados(
  emparejamiento: readonly ColumnaEmparejada[],
): Array<{ indice: number; clave: ClaveCampo }> {
  return emparejamiento.flatMap((c) =>
    c.destino.tipo === "campo" ? [{ indice: c.indice, clave: c.destino.clave }] : [],
  );
}

// ─── plantillas guardadas (HU-148) ───────────────────────────────────────────────────────────

export function aPlantilla(emparejamiento: readonly ColumnaEmparejada[]): ColumnaPlantilla[] {
  return emparejamiento.map((c) => ({
    columna: c.columna,
    clave: c.destino.tipo === "campo" ? c.destino.clave : null,
  }));
}

export interface PlantillaAplicada {
  emparejamiento: ColumnaEmparejada[];
  // Columnas de la plantilla que alimentaban un campo y la hoja no trae: esos campos no se tocan.
  faltantes: ColumnaPlantilla[];
  // Columnas de la hoja que la plantilla no conoce: quedan sin emparejar, ignoradas.
  nuevas: string[];
}

export function aplicarPlantilla(
  encabezados: readonly string[],
  plantilla: readonly ColumnaPlantilla[],
  campos: readonly CampoEmparejable[],
): PlantillaAplicada {
  const validas = new Set(campos.map((c) => c.clave));
  const guardadas = new Map(plantilla.map((p) => [compacto(p.columna), p.clave]));
  const nuevas: string[] = [];
  const emparejamiento = asignar([...encabezados], (columna) => {
    const k = compacto(columna);
    if (!guardadas.has(k)) {
      nuevas.push(columna);
      return { tipo: "no_importar", motivo: "sin_emparejar" };
    }
    const clave = guardadas.get(k)!;
    if (clave === null) return { tipo: "no_importar", motivo: "decision" };
    return validas.has(clave)
      ? { tipo: "campo", clave }
      : { tipo: "no_importar", motivo: "sin_emparejar" };
  });
  const presentes = new Set(encabezados.map(compacto));
  const faltantes = plantilla.filter(
    (p) => p.clave !== null && !presentes.has(compacto(p.columna)),
  );
  return {
    emparejamiento,
    faltantes,
    nuevas: nuevas.filter((n) => !bloqueo(n)),
  };
}
