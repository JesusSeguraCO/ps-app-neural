// Qué hace Enter en el buscador del catálogo (BuscadorCatalogo). Lo escrito solo sirve para encontrar:
// Enter elige una opción del catálogo y nunca ofrece crear un valor que ya existe. Mientras las
// sugerencias de lo escrito no han llegado, espera (el buscador lo resuelve al llegar).

export interface ValorCatalogo {
  id: string;
  nombre: string;
}

export type AccionEnter =
  | { tipo: "esperar" }
  | { tipo: "elegir"; valor: ValorCatalogo }
  | { tipo: "crear" }
  | { tipo: "nada" };

const normal = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

// El valor del catálogo que se llama igual que lo escrito (sin distinguir mayúsculas ni tildes).
export function coincidenciaExacta(q: string, valores: ValorCatalogo[]): ValorCatalogo | null {
  const n = normal(q);
  return n ? (valores.find((v) => normal(v.nombre) === n) ?? null) : null;
}

// Al llegar las sugerencias, la opción activa es la coincidencia exacta si la hay.
export function indiceInicial(q: string, visibles: ValorCatalogo[]): number {
  const exacta = coincidenciaExacta(q, visibles);
  return exacta ? visibles.indexOf(exacta) : 0;
}

export function accionEnter(e: {
  q: string;
  // Consulta a la que corresponden `todas` (null: ninguna todavía).
  cargadas: string | null;
  // Sugerencias del catálogo para `cargadas`, incluidas las ya elegidas.
  todas: ValorCatalogo[];
  excluir: string[];
  activa: number;
  puedeCrear: boolean;
}): AccionEnter {
  if (!e.q) return { tipo: "nada" };
  if (e.cargadas !== e.q) return { tipo: "esperar" };
  const exacta = coincidenciaExacta(e.q, e.todas);
  if (exacta)
    return e.excluir.includes(exacta.id) ? { tipo: "nada" } : { tipo: "elegir", valor: exacta };
  const visibles = e.todas.filter((v) => !e.excluir.includes(v.id));
  const total = visibles.length + (e.puedeCrear ? 1 : 0);
  if (!total) return { tipo: "nada" };
  const i = e.activa < total ? e.activa : 0;
  return i < visibles.length ? { tipo: "elegir", valor: visibles[i]! } : { tipo: "crear" };
}
