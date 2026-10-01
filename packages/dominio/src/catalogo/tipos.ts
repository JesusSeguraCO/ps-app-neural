// Catálogos paramétricos que administra el panel (RF-8.16; HU-089, HU-143). Una sola lista para la
// API, las pantallas y la fusión (que solo une valores del mismo tipo).

export const TIPOS_CATALOGO = [
  "rol",
  "familia",
  "tecnologia",
  "sector",
  "modalidad_prueba",
  // Motivos de pausa (RF-8.14.2, RF-8.16; HU-133): lista corta que administra Talento Humano.
  "motivo_pausa",
] as const;
export type TipoCatalogo = (typeof TIPOS_CATALOGO)[number];

export function esTipoCatalogo(x: string): x is TipoCatalogo {
  return (TIPOS_CATALOGO as readonly string[]).includes(x);
}

export const ETIQUETA_TIPO: Record<
  TipoCatalogo,
  { singular: string; plural: string; pestana: string }
> = {
  rol: { singular: "rol", plural: "roles", pestana: "Roles" },
  familia: { singular: "familia", plural: "familias", pestana: "Familias" },
  tecnologia: { singular: "tecnología", plural: "tecnologías", pestana: "Tecnologías" },
  sector: { singular: "sector", plural: "sectores", pestana: "Sectores" },
  modalidad_prueba: {
    singular: "modalidad de prueba",
    plural: "modalidades de prueba",
    pestana: "Modalidades de prueba",
  },
  motivo_pausa: { singular: "motivo de pausa", plural: "motivos de pausa", pestana: "Motivos de pausa" },
};

// Género gramatical para los textos («desactivado»/«desactivada», «Crear rol»/«Crear tecnología»).
export const FEMENINO: Record<TipoCatalogo, boolean> = {
  rol: false,
  familia: true,
  tecnologia: true,
  sector: false,
  modalidad_prueba: true,
  motivo_pausa: false,
};

// Grupo que orienta la tecnología en la lista (no filtra al cliente).
export const GRUPOS_TECNOLOGIA = [
  "Lenguaje",
  "Framework",
  "Base de datos",
  "Nube e infraestructura",
  "Mensajería",
  "Analítica",
  "Diseño de producto",
  "Pruebas",
  "Herramienta",
] as const;
