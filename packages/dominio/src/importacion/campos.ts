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
