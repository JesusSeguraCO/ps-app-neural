/** Tipos compartidos del Portal de Perfiles People Service. */

export type Seniority = "Junior" | "Semi senior" | "Senior" | "Líder técnico";
export type Modalidad = "Remoto" | "Híbrido" | "Presencial";
export type EstadoPerfil = "borrador" | "publicado" | "pausado" | "archivado";
export type ModoCriterio = "obligatorio" | "deseable";

export type ClaveCriterio =
  | "rol"
  | "seniority"
  | "tecnologias"
  | "sector"
  | "modalidad"
  | "pais"
  | "ciudad"
  | "idioma";

export interface ValidacionTecnicaData {
  /** Estructura fija de cinco campos. No admite campos libres. */
  pruebaAplicada: string;
  evaluador: string;
  fecha: string;
  resultado: string;
  alcanceEvaluado: string;
}

export interface EvidenciaVerificada {
  identidad: string;
  seguridad: string;
  formacion: string;
  referencias: string;
  tecnica: ValidacionTecnicaData;
}

export interface EvidenciaDeclarada {
  trayectoria: Array<{ empresa: string; rol: string; periodo: string; resumen: string }>;
  formacion: string[];
  stack: string;
  aporte: string;
}

export interface Perfil {
  /** Código de referencia interno (BE-SR-014). Nunca es el título visual. */
  id: string;
  nombre: string;
  /** Solo el primer apellido. Nunca el segundo. */
  apellido: string;
  /** Rol + seniority + anclaje de experiencia. Es el título visual. */
  capacidad: string;
  rol: string;
  seniority: Seniority;
  anclaje: string;
  tecnologias: string[];
  sector: string[];
  modalidad: Modalidad;
  pais: string;
  ciudad: string;
  idioma: string[];
  disponibilidad: string;
  inicio: string;
  estado: EstadoPerfil;
  /** Fecha del consentimiento nominal. Sin esto el perfil no se publica. */
  consentimiento: string | null;
  vigenciaDias: number;
  verificado: EvidenciaVerificada;
  declarado: EvidenciaDeclarada;
}

export interface Criterio {
  clave: ClaveCriterio;
  etiqueta: string;
  valores: string[];
  modo: ModoCriterio;
  /** Solo tecnologías: basta con que tenga alguna de las marcadas. */
  bastaAlguna?: boolean;
  /** Valores añadidos por el cliente que no existen en el banco. */
  fueraDelBanco?: string[];
}

export interface Evidencia {
  clave: ClaveCriterio;
  etiqueta: string;
  cumple: boolean;
  /** Texto honesto, tanto de aciertos como de faltantes. */
  texto: string;
  modo: ModoCriterio;
}

export interface ResultadoPerfil {
  perfil: Perfil;
  evidencias: Evidencia[];
  deseablesCumplidos: number;
  deseablesTotal: number;
  /** Criterios obligatorios incumplidos. Longitud 1 = "lo más cercano". */
  obligatoriosFallidos: ClaveCriterio[];
}
