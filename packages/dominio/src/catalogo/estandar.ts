// Encabezado del estándar Neural-Grid (HU-159; D64, D80, D97; diseño §4). La frase que elige el portal
// según el conteo de publicados incompletos —la misma guarda que marca «Incompleto» en el panel
// (`contarIncompletos`)—: «Ningún perfil llega al portal sin…» solo con 0; con uno o más, o sin conteo
// (falla o vence), la versión que describe lo que el estándar exige, que vale siempre. Nunca el número ni
// los perfiles. Cuatro dimensiones (D64; el prototipo decía «cinco componentes»). Copy MARCADO PARA
// REVISIÓN con Mercadeo (D73); cambiarlo no cambia la regla.
export const FRASES_ESTANDAR = {
  ninguno:
    "Ningún perfil llega al portal sin verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC.",
  descriptiva:
    "El estándar exige a cada perfil verificación de identidad bajo SARO, prueba técnica revisada por Trycore y evaluación DISC.",
} as const;

export function fraseDelEstandar(conteoIncompletos: number | null): string {
  return conteoIncompletos === 0 ? FRASES_ESTANDAR.ninguno : FRASES_ESTANDAR.descriptiva;
}

export interface DimensionEstandar {
  nombre: string;
  papel: "Condición de entrada" | "Garantía del servicio";
  detalle: string;
}

// B.6: tres condiciones de entrada y Neural Speed como garantía del servicio. El detalle no repite la
// declaración de la frase (se dice una sola vez).
export const DIMENSIONES_ESTANDAR: readonly DimensionEstandar[] = [
  { nombre: "Grid de Seguridad", papel: "Condición de entrada", detalle: "Identidad y antecedentes, con fecha y alcance." },
  { nombre: "Grid Técnico", papel: "Condición de entrada", detalle: "Una prueba ejecutada, no una declaración." },
  { nombre: "Neural Fit", papel: "Condición de entrada", detalle: "Cómo trabaja la persona, con su Sello Personal." },
  {
    nombre: "Neural Speed",
    papel: "Garantía del servicio",
    detalle: "Agentes de IA desde el día 1 y línea directa al CoE.",
  },
];
