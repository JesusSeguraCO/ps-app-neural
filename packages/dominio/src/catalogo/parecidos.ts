// Parecidos deterministas del catálogo (HU-089; diseño §6): la forma normalizada decide el idéntico
// (bloqueo) y la distancia de Damerau-Levenshtein o la contención deciden el parecido (confirmación).
// La misma normalización la calcula la BD en `nombre_normal` (migración 0013) para el índice único.

const ACENTOS: Record<string, string> = {
  á: "a",
  à: "a",
  ä: "a",
  â: "a",
  é: "e",
  è: "e",
  ë: "e",
  ê: "e",
  í: "i",
  ì: "i",
  ï: "i",
  î: "i",
  ó: "o",
  ò: "o",
  ö: "o",
  ô: "o",
  ú: "u",
  ù: "u",
  ü: "u",
  û: "u",
  ç: "c",
  ñ: "n",
};

// Minúsculas, sin diacríticos (también la ñ: quien no la tiene en el teclado escribe n) y un solo
// espacio entre palabras.
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[áàäâéèëêíìïîóòöôúùüûçñ]/g, (c) => ACENTOS[c]!)
    .replace(/\s+/g, " ")
    .trim();
}

// Distancia de edición con transposiciones adyacentes (variante de alineación óptima).
export function distanciaDamerau(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + costo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + 1);
    }
  }
  return d[a.length]![b.length]!;
}

// Umbral por longitud: en nombres de hasta 4 letras una sola edición; en los demás, dos.
const umbral = (a: string, b: string) => (Math.min(a.length, b.length) <= 4 ? 1 : 2);
// Contención: el más corto (3 letras o más) está dentro del otro («Kafka» en «Kafka Streams»).
const contiene = (a: string, b: string) => {
  const [corto, largo] = a.length <= b.length ? [a, b] : [b, a];
  return corto.length >= 3 && largo.includes(corto);
};

export interface ValorCatalogo {
  id: string;
  nombre: string;
}

export type Clasificacion<V extends ValorCatalogo = ValorCatalogo> =
  | { tipo: "vacio" }
  | { tipo: "identico"; existente: V }
  | { tipo: "parecido"; parecidos: V[] }
  | { tipo: "nuevo" };

export function clasificarNombre<V extends ValorCatalogo>(
  nombre: string,
  catalogo: readonly V[],
): Clasificacion<V> {
  const n = normalizar(nombre);
  if (!n) return { tipo: "vacio" };
  const identico = catalogo.find((v) => normalizar(v.nombre) === n);
  if (identico) return { tipo: "identico", existente: identico };
  const parecidos = catalogo
    .map((v) => ({ v, x: normalizar(v.nombre) }))
    .map(({ v, x }) => ({ v, d: distanciaDamerau(n, x), c: contiene(n, x), u: umbral(n, x) }))
    .filter(({ d, c, u }) => d <= u || c)
    .sort((a, b) => a.d - b.d || a.v.nombre.localeCompare(b.v.nombre, "es"))
    .map(({ v }) => v);
  return parecidos.length ? { tipo: "parecido", parecidos } : { tipo: "nuevo" };
}

// Valores que coinciden con lo tecleado para elegir del catálogo (sin texto libre): primero los que
// empiezan por el texto, luego los que lo contienen; sin distinguir mayúsculas ni acentos.
export function coincidencias<V extends ValorCatalogo>(
  texto: string,
  catalogo: readonly V[],
  limite = 8,
): V[] {
  const n = normalizar(texto);
  if (!n) return [];
  const conNormal = catalogo.map((v) => ({ v, x: normalizar(v.nombre) }));
  const empiezan = conNormal.filter(({ x }) => x.startsWith(n));
  const contienen = conNormal.filter(({ x }) => !x.startsWith(n) && x.includes(n));
  const orden = (a: { v: V }, b: { v: V }) => a.v.nombre.localeCompare(b.v.nombre, "es");
  return [...empiezan.sort(orden), ...contienen.sort(orden)].slice(0, limite).map(({ v }) => v);
}

// Lo más parecido del catálogo para ofrecer cuando un valor no existe (HU-139, error): primero los
// parecidos, luego los que comparten una palabra, luego por distancia de edición.
export function masCercanos<V extends ValorCatalogo>(texto: string, catalogo: readonly V[], limite = 4): V[] {
  const n = normalizar(texto);
  if (!n) return [];
  const palabras = new Set(n.split(" ").filter((w) => w.length >= 3));
  return catalogo
    .map((v) => {
      const x = normalizar(v.nombre);
      const d = distanciaDamerau(n, x);
      const parecido = d <= umbral(n, x) || contiene(n, x);
      const comparte = x.split(" ").some((w) => palabras.has(w));
      return { v, rango: parecido ? 0 : comparte ? 1 : 2, d };
    })
    .sort((a, b) => a.rango - b.rango || a.d - b.d || a.v.nombre.localeCompare(b.v.nombre, "es"))
    .slice(0, limite)
    .map(({ v }) => v);
}
