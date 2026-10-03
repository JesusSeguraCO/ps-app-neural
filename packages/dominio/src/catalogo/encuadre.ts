// Encuadre sin selección y banco completo (HU-093, HU-094, HU-091). Puras: la taxonomía del catálogo
// con cuántos perfiles publicados tiene hoy cada opción, y el filtro por UNA sola opción (el panel de
// facetas combinables es de EP-002, que reemplaza este filtro sin cambiar los criterios).

export interface EntradaTaxonomia {
  categoria: string;
  rol: string | null;
}

export interface OpcionCategoria {
  categoria: string;
  n: number;
  roles: Array<{ rol: string; n: number }>;
}

interface Clasificable {
  codigo: string;
  familia: string | null;
  roles: string[];
}

const porConteo = <T extends { n: number }>(nombre: (x: T) => string) => (a: T, b: T) =>
  b.n - a.n || nombre(a).localeCompare(nombre(b), "es");

export function taxonomiaConConteos(catalogo: readonly EntradaTaxonomia[], publicados: readonly Clasificable[]): OpcionCategoria[] {
  const categorias = new Map<string, Set<string>>();
  for (const e of catalogo) {
    const roles = categorias.get(e.categoria) ?? new Set<string>();
    if (e.rol) roles.add(e.rol);
    categorias.set(e.categoria, roles);
  }
  return [...categorias]
    .map(([categoria, roles]) => ({
      categoria,
      n: publicados.filter((p) => p.familia === categoria).length,
      roles: [...roles]
        .map((rol) => ({ rol, n: publicados.filter((p) => p.roles.includes(rol)).length }))
        .sort(porConteo((r) => r.rol)),
    }))
    .sort(porConteo((c) => c.categoria));
}

export type FiltroBanco =
  | { tipo: "todo" }
  | { tipo: "categoria"; valor: string }
  | { tipo: "rol"; valor: string }
  | { tipo: "contexto" }; // las categorías de la selección del enlace

type Consulta = Record<string, string | string[] | undefined>;

const primero = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export function filtroDeConsulta(q: Consulta): FiltroBanco {
  const categoria = primero(q.categoria);
  if (categoria) return { tipo: "categoria", valor: categoria.slice(0, 120) };
  const rol = primero(q.rol);
  if (rol) return { tipo: "rol", valor: rol.slice(0, 120) };
  if (primero(q.contexto) === "seleccion") return { tipo: "contexto" };
  return { tipo: "todo" };
}

// Una sola comparación por perfil: filtra la lista y resuelve el criterio de la evidencia ✓/– (HU-119).
export function cumpleFiltro(
  p: Clasificable,
  filtro: FiltroBanco,
  categoriasContexto: readonly string[],
): boolean {
  switch (filtro.tipo) {
    case "todo":
      return true;
    case "categoria":
      return p.familia === filtro.valor;
    case "rol":
      return p.roles.includes(filtro.valor);
    case "contexto":
      return p.familia !== null && categoriasContexto.includes(p.familia);
  }
}

export function aplicarFiltro<P extends Clasificable>(
  perfiles: readonly P[],
  filtro: FiltroBanco,
  categoriasContexto: readonly string[],
): P[] {
  return perfiles.filter((p) => cumpleFiltro(p, filtro, categoriasContexto));
}
