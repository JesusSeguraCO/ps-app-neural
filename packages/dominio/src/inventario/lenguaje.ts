// Aviso de lenguaje de inventario en la trayectoria (HU-194; RF-3.6; D73: el panel advierte, no
// bloquea; diseño §3). Comprobación léxica pura, sin modelo (RF-16): lista fija de RF-3.6, ampliable sin
// cambiar la mecánica; por expresión completa con límite de palabra Unicode («Stockholm» no avisa),
// sin distinguir mayúsculas ni tildes (la misma `normalizar` del catálogo), con su plural («ítems del
// backlog» avisa a propósito: la decisión queda en Talento Humano). Devuelve cada expresión tal como
// se escribió. No entra en la guarda de publicación ni en «Incompleto».
import { normalizar } from "../catalogo/parecidos";

export const EXPRESIONES_INVENTARIO = [
  "unidad",
  "ítem",
  "disponible para asignación",
  "stock",
] as const;

// Normaliza carácter a carácter (misma longitud que el original) para recuperar la forma escrita.
function normalizarPorCaracter(texto: string): { norma: string; origen: number[] } {
  let norma = "";
  const origen: number[] = [];
  let i = 0;
  for (const c of texto) {
    const n = /\s/u.test(c) ? " " : normalizar(c) || c;
    for (const x of n) {
      norma += x;
      origen.push(i);
    }
    i += c.length;
  }
  origen.push(texto.length);
  return { norma, origen };
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Cada palabra admite su plural («unidades», «ítems», «stocks»); entre palabras, cualquier espacio.
const PATRONES = EXPRESIONES_INVENTARIO.map(
  (e) =>
    new RegExp(
      `(?<![\\p{L}\\p{N}])${normalizar(e)
        .split(" ")
        .map((p) => `${escapar(p)}(?:es|s)?`)
        .join("\\s+")}(?![\\p{L}\\p{N}])`,
      "gu",
    ),
);

export function avisosDeLenguaje(texto: string): string[] {
  const { norma, origen } = normalizarPorCaracter(texto);
  const hallazgos: Array<{ en: number; forma: string }> = [];
  for (const patron of PATRONES)
    for (const m of norma.matchAll(patron)) {
      const desde = origen[m.index]!;
      const hasta = origen[m.index + m[0].length]!;
      hallazgos.push({ en: desde, forma: texto.slice(desde, hasta) });
    }
  hallazgos.sort((a, b) => a.en - b.en);
  return [...new Set(hallazgos.map((h) => h.forma))];
}

// Las expresiones de una trayectoria (resumen y descripciones de las experiencias), sin repetir.
export function avisosDeTrayectoria(t: {
  resumen?: string | null;
  experiencias?: Array<{ descripcion?: string | null }>;
}): Array<{ tipo: "lenguaje_inventario"; expresion: string }> {
  const textos = [t.resumen ?? "", ...(t.experiencias ?? []).map((e) => e.descripcion ?? "")];
  const vistas = new Set<string>();
  const avisos: Array<{ tipo: "lenguaje_inventario"; expresion: string }> = [];
  for (const x of textos)
    for (const expresion of avisosDeLenguaje(x))
      if (!vistas.has(expresion)) {
        vistas.add(expresion);
        avisos.push({ tipo: "lenguaje_inventario", expresion });
      }
  return avisos;
}
