// Campos del perfil que viajan en el formato de importación (docs/10-specs/importacion-masiva.md §9).
// La lista vive en el dominio para que el plan y el contrato (`@ps/contratos/importacion`) hablen de
// las mismas claves sin dependencia circular.
export const CLAVES_CAMPO = [
  "codigo",
  "estado",
  "nombre",
  "primerApellido",
  "rol",
  "familia",
  "seniority",
  "aniosExperiencia",
  "tecnologias",
  "sectores",
  "modalidad",
  "ciudad",
  "disponibilidad",
  "modalidadPrueba",
  // Validaciones de entrada SARO y DISC (HU-191, D81).
  "saroAlcance",
  "saroFecha",
  "discFecha",
  "capacidad",
  "anclaje",
  "resumen",
  "formacion",
  "vinculo",
  "idiomas",
  "selloPersonal",
  "experiencias",
  "motivoPausa",
] as const;
export type ClaveCampo = (typeof CLAVES_CAMPO)[number];

export const CAMPOS_LISTA: ReadonlySet<ClaveCampo> = new Set([
  "tecnologias",
  "sectores",
  "idiomas",
  "selloPersonal",
  "experiencias",
]);

export const ETIQUETA_CAMPO_IMPORTACION: Record<ClaveCampo, string> = {
  codigo: "Código",
  estado: "Estado",
  nombre: "Nombre",
  primerApellido: "Primer apellido",
  rol: "Rol",
  familia: "Familia",
  seniority: "Seniority",
  aniosExperiencia: "Años de experiencia",
  tecnologias: "Tecnologías",
  sectores: "Sectores",
  modalidad: "Modalidad de trabajo",
  ciudad: "Ciudad",
  disponibilidad: "Disponibilidad",
  modalidadPrueba: "Modalidad de prueba",
  saroAlcance: "Alcance de la verificación SARO",
  saroFecha: "Fecha de la verificación SARO",
  discFecha: "Fecha de la evaluación DISC",
  capacidad: "Capacidad",
  anclaje: "Anclaje",
  resumen: "Resumen",
  formacion: "Nivel de formación",
  vinculo: "Vínculo con Trycore (interno)",
  idiomas: "Idiomas",
  selloPersonal: "Sello Personal",
  experiencias: "Experiencia",
  motivoPausa: "Motivo de pausa (interno)",
};

// Forma comparable de un encabezado: sin mayúsculas, acentos, paréntesis, «· interno» ni puntuación.
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

// Cómo se escriben en el formato los valores que la BD guarda como clave.
export const MODALIDAD_FORMATO = {
  remoto: "Remoto",
  hibrido: "Híbrido",
  presencial: "Presencial",
} as const;
export const VINCULO_FORMATO = {
  vinculado: "vinculado",
  banco_no_vinculado: "banco no vinculado",
  fabrica: "fábrica",
} as const;
