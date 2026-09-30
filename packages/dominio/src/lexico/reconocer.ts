// Reconocimiento determinista de una consulta (RF-2.6, HU-139): coincidencia exacta de la forma
// normalizada, la más larga primero, contra los valores del catálogo y los términos y sinónimos del
// léxico aprobado. Lo usan el portal (qué entendió la búsqueda) y el panel (qué no reconoció cada
// consulta sin coincidencia). El intérprete completo con facetas y distancia de edición es de EP-009.
import { normalizar } from "../catalogo/parecidos";

export type TipoValor = "rol" | "tecnologia" | "sector" | "seniority";

export interface ValorReconocido {
  tipo: TipoValor;
  nombre: string;
}

export interface EntradaLexico {
  termino: string;
  sinonimos: readonly string[];
  equivalencias: readonly ValorReconocido[];
}

export type Vocabulario = ReadonlyMap<string, ValorReconocido[]>;

// Palabras de enlace: ni se reconocen ni se señalan como no reconocidas.
const NEUTRAS = new Set(
  (
    "a al con de del el en la las los o para por que un una y u e experiencia años anos ano " +
    "busco buscamos necesito necesitamos perfil perfiles alguien persona profesional haya trabajado sepa"
  ).split(" "),
);
const MAX_PALABRAS = 8;

export function armarVocabulario(p: {
  catalogo: readonly ValorReconocido[];
  lexico: readonly EntradaLexico[];
}): Vocabulario {
  const v = new Map<string, ValorReconocido[]>();
  const agregar = (forma: string, valores: readonly ValorReconocido[]) => {
    const n = normalizar(forma.replace(/[^\p{L}\p{N}\s.+#/-]/gu, " "));
    if (!n) return;
    const previos = v.get(n) ?? [];
    for (const x of valores)
      if (!previos.some((y) => y.tipo === x.tipo && y.nombre === x.nombre)) previos.push(x);
    v.set(n, previos);
  };
  for (const c of p.catalogo) agregar(c.nombre, [c]);
  for (const t of p.lexico) {
    agregar(t.termino, t.equivalencias);
    for (const s of t.sinonimos) agregar(s, t.equivalencias);
  }
  return v;
}

export type Tramo = { texto: string; tipo: "reconocido" | "sin_reconocer" | "neutro" };

export interface Reconocimiento {
  reconocidos: Array<{ texto: string; valores: ValorReconocido[] }>;
  sinReconocer: string[];
  tramos: Tramo[];
}

// Una palabra de la consulta: su texto sin la puntuación que la rodea y su forma normalizada.
function palabras(consulta: string): Array<{ texto: string; n: string }> {
  return consulta
    .split(/\s+/)
    .map((p) => p.replace(/^[^\p{L}\p{N}#+.]+|[^\p{L}\p{N}#+]+$/gu, ""))
    .filter(Boolean)
    .map((texto) => ({ texto, n: normalizar(texto) }));
}

export function reconocer(consulta: string, vocabulario: Vocabulario): Reconocimiento {
  const ps = palabras(consulta);
  const crudos: Array<Tramo & { valores?: ValorReconocido[] }> = [];
  let i = 0;
  while (i < ps.length) {
    let encontrado = 0;
    for (let largo = Math.min(MAX_PALABRAS, ps.length - i); largo >= 1; largo--) {
      const forma = ps
        .slice(i, i + largo)
        .map((p) => p.n)
        .join(" ");
      const valores = vocabulario.get(forma);
      if (valores) {
        crudos.push({
          texto: ps
            .slice(i, i + largo)
            .map((p) => p.texto)
            .join(" "),
          tipo: "reconocido",
          valores,
        });
        encontrado = largo;
        break;
      }
    }
    if (encontrado) {
      i += encontrado;
      continue;
    }
    crudos.push({ texto: ps[i]!.texto, tipo: NEUTRAS.has(ps[i]!.n) ? "neutro" : "sin_reconocer" });
    i += 1;
  }
  // Une palabras seguidas del mismo tipo, salvo los reconocidos (cada uno es un valor).
  const tramos: Array<Tramo & { valores?: ValorReconocido[] }> = [];
  for (const t of crudos) {
    const ultimo = tramos.at(-1);
    if (ultimo && t.tipo !== "reconocido" && ultimo.tipo === t.tipo) ultimo.texto += ` ${t.texto}`;
    else tramos.push({ ...t });
  }
  return {
    reconocidos: tramos
      .filter((t) => t.tipo === "reconocido")
      .map((t) => ({ texto: t.texto, valores: t.valores! })),
    sinReconocer: tramos.filter((t) => t.tipo === "sin_reconocer").map((t) => t.texto),
    tramos: tramos.map(({ texto, tipo }) => ({ texto, tipo })),
  };
}
