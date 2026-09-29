// Textos del aterrizaje curado (prototipo aterrizaje-curado y variantes, HU-144/HU-091): puros para
// probarlos sin renderizar. Nunca inventan contexto: sin proyecto, el título nombra solo la cuenta.
import type { Banda } from "../catalogo/banda";
import { fechaCivil } from "../fecha/colombia";
import type { EstadoSeleccion } from "./seleccion";

const NUMEROS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"];

export function enLetras(n: number, femenino = false): string {
  if (n === 1) return femenino ? "una" : "un";
  return NUMEROS[n] ?? String(n);
}

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function tituloSeleccion(n: number, cuenta: string, proyecto: string | null): string {
  const cuantos = n === 1 ? "Un perfil" : `${mayuscula(enLetras(n))} perfiles`;
  return proyecto ? `${cuantos} para ${proyecto}` : `${cuantos} ${n === 1 ? "escogido" : "escogidos"} para ${cuenta}`;
}

export function avisoCambios(cambiaron: number, total: number, desde: string): { titulo: string; texto: string } | null {
  if (cambiaron === 0 || cambiaron === total) return null;
  const iguales = total - cambiaron;
  return {
    titulo:
      cambiaron === 1
        ? `Un perfil cambió desde el ${desde}.`
        : `${mayuscula(enLetras(cambiaron))} perfiles cambiaron desde el ${desde}.`,
    texto: `Sigue${cambiaron === 1 ? "" : "n"} en su lugar con su estado de hoy; ${
      iguales === 1 ? "el otro está igual" : `los otros ${enLetras(iguales)} están igual`
    } que en el correo.`,
  };
}

export const ETIQUETA_ESTADO: Record<EstadoSeleccion, string> = {
  pausado: "Pausado",
  colocado: "Colocado en otro proyecto",
  archivado: "Archivado",
  no_publicado: "No publicado",
};

export function notaEstado(estado: EstadoSeleccion, liberaEn: string | null): string {
  switch (estado) {
    case "pausado":
      return "Sigue en tu selección, pero por ahora no se puede sumar al equipo.";
    case "colocado":
      return `Se libera el ${liberaEn ? fechaCivil(liberaEn) : "—"}. Mientras tanto no se puede sumar al equipo.`;
    case "archivado":
      return "Ya no forma parte del banco.";
    case "no_publicado":
      return "Estamos actualizando su perfil.";
  }
}

export const DISPONIBILIDAD_CLIENTE: Record<Banda, string> = {
  inmediato: "Disponible ahora",
  una_semana: "En 1 semana",
  dos_semanas: "En 2 semanas",
  un_mes: "En 1 mes",
  mas_de_un_mes: "En más de 1 mes",
  por_confirmar: "Disponibilidad por confirmar",
};

// «3 desarrollo · 2 QA» por familia, en orden de aparición.
export function resumenFamilias(familias: Array<string | null>): string {
  const cuenta = new Map<string, number>();
  for (const f of familias) if (f) cuenta.set(f, (cuenta.get(f) ?? 0) + 1);
  return [...cuenta].map(([f, n]) => `${n} ${f === f.toUpperCase() ? f : f.toLowerCase()}`).join(" · ");
}
