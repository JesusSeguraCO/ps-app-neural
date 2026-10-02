// Lectura y escritura de una celda del formato de importación (docs/10-specs/importacion-masiva.md
// §5.1 y §9): listas separadas por «;», el literal `[vaciar]` y la experiencia en una sola celda.
// Vive en el dominio porque la usan el plan (calcularPlan) y el contrato (@ps/contratos/importacion).

export const VACIAR = "[vaciar]";
export const SEPARADOR_LISTA = ";";

// Lista de una celda: separada por «;» (un «;» escrito como «\;» no separa).
export function partirLista(celda: string): string[] {
  return celda
    .split(/(?<!\\);/)
    .map((x) => x.replaceAll("\\;", ";").trim())
    .filter(Boolean);
}

export function unirLista(valores: readonly string[]): string {
  return valores.map((x) => x.replaceAll(SEPARADOR_LISTA, "\\;")).join(`${SEPARADOR_LISTA} `);
}

// Experiencia en una celda: «Cargo · Cliente · 2021-2026: qué hizo».

export interface ExperienciaTexto {
  cargo: string;
  cliente: string | null;
  desde: number | null;
  hasta: number | null;
  descripcion: string;
}

export function formatearExperiencia(e: ExperienciaTexto): string {
  const periodo = e.desde || e.hasta ? `${e.desde ?? ""}-${e.hasta ?? ""}` : "";
  const cabeza = [e.cargo, e.cliente ?? "", periodo].join(" · ");
  return `${cabeza}: ${e.descripcion}`;
}

export function leerExperiencia(t: string): ExperienciaTexto | null {
  const i = t.indexOf(":");
  if (i < 0) return null;
  const [cargo = "", cliente = "", periodo = ""] = t
    .slice(0, i)
    .split("·")
    .map((x) => x.trim());
  const descripcion = t.slice(i + 1).trim();
  if (!cargo || !descripcion) return null;
  const m = periodo.match(/^(\d{4})?\s*-\s*(\d{4})?$/);
  if (periodo && !m) return null;
  return {
    cargo,
    cliente: cliente || null,
    desde: m?.[1] ? Number(m[1]) : null,
    hasta: m?.[2] ? Number(m[2]) : null,
    descripcion,
  };
}

// Inyección de fórmulas: una celda que empieza por = + - @ (o tabulador/retorno) Excel la ejecuta al
// abrir la hoja. Al exportar se antepone un apóstrofo, que Excel muestra como texto; al volver a
// importar se quita, así la ida y vuelta exportar → pegar sigue dando «sin cambios».
const FORMULA = /^[=+\-@\t\r]/;
export const neutralizar = (c: string) => (FORMULA.test(c) ? `'${c}` : c);
export const sinNeutralizar = (c: string) =>
  c.startsWith("'") && FORMULA.test(c.slice(1)) ? c.slice(1) : c;
