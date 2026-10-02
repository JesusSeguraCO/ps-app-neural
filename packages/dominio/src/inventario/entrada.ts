// «Incompleto» de un publicado y conteo de incompletos (HU-178; D62, D63, D80; diseño §2 y §4).
// Una sola regla: un publicado está incompleto si `evaluarPublicacion` lo rechazaría hoy. No es un
// estado de la máquina (ADR-0003): el panel lo calcula al leer y lo filtra; la pregunta D1 de editar
// un publicado (HU-126) sale de la misma evaluación. El Sello Personal no entra en la guarda (D63).
// El portal cuenta con la misma guarda sobre indicadores sin datos personales (vista 0029).
import type { EstadoAlmacenado } from "./estados";
import {
  evaluarPublicacion,
  type CampoObligatorio,
  type DatosParaPublicar,
  type EvaluacionPublicacion,
} from "./perfil";

// El dato obligatorio con su artículo, para decir «falta …» con las palabras del editor.
const MOTIVO_DATO: Record<CampoObligatorio, string> = {
  nombre: "el nombre",
  primer_apellido: "el primer apellido",
  rol: "el rol",
  tecnologias: "las tecnologías",
  seniority: "el seniority",
  anios_experiencia: "los años de experiencia",
  ciudad: "la ciudad",
  modalidad_trabajo: "la modalidad de trabajo",
  disponibilidad: "la disponibilidad",
  trayectoria: "la trayectoria",
};
// Las dos condiciones de la verificación SARO se nombran juntas cuando faltan ambas (HU-178).
export const MOTIVO_SARO_COMPLETO = "la verificación SARO (alcance y fecha)";

export interface EstadoDeEntrada {
  incompleto: boolean;
  // Lo que le falta, con las etiquetas de la guarda («la fecha de la evaluación DISC»).
  faltan: string[];
  // «Incompleto: falta …», o null si no se marca.
  texto: string | null;
}

const enumerar = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;

export function estadoDeEntrada(
  estado: EstadoAlmacenado,
  evaluacion: EvaluacionPublicacion,
): EstadoDeEntrada {
  if (estado !== "publicado" || evaluacion.publicable)
    return { incompleto: false, faltan: [], texto: null };
  const fallan = new Set(evaluacion.condiciones.filter((c) => !c.cumple).map((c) => c.clave));
  const faltan: string[] = evaluacion.faltanDatos.map((f) => MOTIVO_DATO[f.campo]);
  for (const c of evaluacion.condiciones) {
    if (c.cumple) continue;
    if (c.clave === "saro_alcance" && fallan.has("saro_fecha")) faltan.push(MOTIVO_SARO_COMPLETO);
    else if (c.clave === "saro_fecha" && fallan.has("saro_alcance")) continue;
    else if (!faltan.includes(c.motivo)) faltan.push(c.motivo);
  }
  return { incompleto: true, faltan, texto: `Incompleto: falta ${enumerar(faltan)}` };
}

// «mientras falte la verificación SARO (alcance y fecha)»: lo que la pregunta D1 nombra (HU-178 error).
export const faltaParaPublicar = (e: EstadoDeEntrada) => enumerar(e.faltan);

// Una fila de `operacion.indicadores_publicacion` (0029): solo booleanos y enteros de un publicado, sin
// código ni datos personales. Lo que la guarda pregunta, nada más.
export interface IndicadoresPublicacion {
  tieneNombre: boolean;
  tienePrimerApellido: boolean;
  tieneRol: boolean;
  tecnologias: number;
  tieneSeniority: boolean;
  tieneAniosExperiencia: boolean;
  tieneCiudad: boolean;
  tieneModalidadTrabajo: boolean;
  tieneDisponibilidad: boolean;
  experiencias: number;
  pruebaElegida: boolean;
  pruebaActiva: boolean;
  familiaConModalidades: boolean;
  consentimientoRegistrado: boolean;
  consentimientoVigente: boolean;
  consentimientoNominal: boolean;
  saroAlcance: boolean;
  saroFecha: boolean;
  discFecha: boolean;
}

// Adaptador a la entrada de la guarda: los textos se sustituyen por marcadores (la guarda solo pregunta
// si están), así ningún dato personal cruza al portal.
export function datosDeIndicadores(i: IndicadoresPublicacion): DatosParaPublicar {
  return {
    nombre: i.tieneNombre ? "x" : "",
    primerApellido: i.tienePrimerApellido ? "x" : "",
    rol: i.tieneRol,
    tecnologias: i.tecnologias,
    seniority: i.tieneSeniority,
    aniosExperiencia: i.tieneAniosExperiencia ? 0 : null,
    ciudad: i.tieneCiudad,
    modalidadTrabajo: i.tieneModalidadTrabajo,
    disponibilidadFecha: i.tieneDisponibilidad ? "x" : null,
    experiencias: i.experiencias,
    modalidadPrueba: { elegida: i.pruebaElegida, activa: i.pruebaActiva },
    familiaConModalidades: i.familiaConModalidades,
    consentimiento: i.consentimientoRegistrado
      ? { vigente: i.consentimientoVigente, nominal: i.consentimientoNominal }
      : null,
    saro: { alcance: i.saroAlcance, fecha: i.saroFecha },
    disc: { fecha: i.discFecha },
  };
}

// Publicados incompletos (D80): la frase del estándar afirma «ninguno» solo con 0.
export const contarIncompletos = (filas: IndicadoresPublicacion[]) =>
  filas.filter((f) => !evaluarPublicacion(datosDeIndicadores(f)).publicable).length;
