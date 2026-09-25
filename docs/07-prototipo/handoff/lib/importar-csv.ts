import type { Perfil } from "@/lib/types";

/**
 * Importación de perfiles desde CSV — lectura y validación, sin UI.
 *
 * Reglas del producto que viven aquí:
 *  · Todo lo importado entra como BORRADOR. Nada llega al cliente sin revisión.
 *  · Columnas de contacto (correo, teléfono, LinkedIn, foto) se DESCARTAN.
 *  · Solo se guarda el primer apellido.
 *  · Sin consentimiento, el perfil se crea pero no podrá publicarse.
 *  · Un código existente ACTUALIZA ese perfil en lugar de duplicarlo.
 *
 * Acepta coma o punto y coma como separador, comillas dobles y BOM UTF‑8.
 * Máximo 500 filas por archivo.
 */

export type TipoFila = "crea" | "actualiza" | "error";

export interface FilaImport {
  fila: number;
  datos: Partial<Record<Campo, string>>;
  tipo: TipoFila;
  error?: string;
  avisos: string[];
}

type Campo = "codigo" | "nombre" | "apellido" | "rol" | "seniority" | "anos" | "tecnologias" | "sector" | "modalidad" | "ciudad" | "pais" | "consentimiento";

const ALIAS: Record<string, Campo> = {
  codigo: "codigo", referencia: "codigo", nombre: "nombre", apellido: "apellido", primerapellido: "apellido",
  rol: "rol", seniority: "seniority", anos: "anos", experiencia: "anos", tecnologias: "tecnologias",
  sector: "sector", sectores: "sector", modalidad: "modalidad", ciudad: "ciudad", pais: "pais", consentimiento: "consentimiento",
};
const CONTACTO = ["correo", "email", "telefono", "celular", "movil", "linkedin", "foto"];
const OBLIGATORIAS: Campo[] = ["nombre", "apellido", "rol"];

export const COLUMNAS_PLANTILLA = "codigo,nombre,apellido,rol,seniority,anos,tecnologias,sector,modalidad,ciudad,pais,consentimiento";

const normCab = (h: string) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

export function parseCSV(texto: string): string[][] {
  const txt = texto.replace(/^\uFEFF/, "");
  const primera = txt.split("\n")[0] ?? "";
  const sep = (primera.match(/;/g)?.length ?? 0) > (primera.match(/,/g)?.length ?? 0) ? ";" : ",";
  const filas: string[][] = [];
  let fila: string[] = [], campo = "", q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c;
    } else if (c === '"') q = true;
    else if (c === sep) { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && txt[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas.filter((r) => r.some((x) => x.trim()));
}

export interface ResultadoLectura {
  filas: FilaImport[];
  descartadas: string[];
  faltan: Campo[];
}

export function leerImportacion(texto: string, existentes: Perfil[], roles: string[], seniorities: string[]): ResultadoLectura {
  const [cabecera, ...cuerpo] = parseCSV(texto);
  if (!cabecera) return { filas: [], descartadas: [], faltan: OBLIGATORIAS };
  const cab = cabecera.map(normCab);
  const faltan = OBLIGATORIAS.filter((k) => !cab.some((h) => ALIAS[h] === k));
  const descartadas = cabecera.filter((_, i) => CONTACTO.includes(cab[i]));
  if (faltan.length) return { filas: [], descartadas, faltan };

  const vistos = new Set<string>();
  const filas = cuerpo.slice(0, 500).map((r, n): FilaImport => {
    const d: FilaImport["datos"] = {};
    cab.forEach((h, i) => { const k = ALIAS[h]; if (k) d[k] = (r[i] ?? "").trim(); });
    const avisos: string[] = [];
    const existe = !!d.codigo && existentes.some((p) => p.id === d.codigo);
    let error: string | undefined;
    if (!d.nombre) error = "Falta el nombre";
    else if (!d.apellido) error = "Falta el primer apellido";
    else if (!d.rol) error = "Falta el rol";
    else if (!roles.includes(d.rol)) error = `El rol «${d.rol}» no está en el catálogo`;
    else if (d.codigo && vistos.has(d.codigo)) error = "Código repetido en el archivo";
    if (d.codigo) vistos.add(d.codigo);
    if (!error) {
      if (d.seniority && !seniorities.includes(d.seniority)) avisos.push(`Seniority «${d.seniority}» no reconocido: queda Senior`);
      if (/\s/.test(d.apellido!)) avisos.push(`Solo publicamos el primer apellido: «${d.apellido!.split(/\s+/)[0]}»`);
      if (!d.consentimiento && !existe) avisos.push("Sin consentimiento: no podrá publicarse hasta registrarlo");
    }
    return { fila: n + 2, datos: d, tipo: error ? "error" : existe ? "actualiza" : "crea", error, avisos };
  });
  return { filas, descartadas, faltan: [] };
}

/** Convierte las filas válidas en cambios para el backend. Nunca publica. */
export function aCambios(filas: FilaImport[], seniorities: string[]) {
  const lista = (t?: string) => (t ?? "").split(/[|,]/).map((x) => x.trim()).filter(Boolean);
  return filas
    .filter((f) => f.tipo !== "error")
    .map((f) => {
      const d = f.datos;
      const seniority = d.seniority && seniorities.includes(d.seniority) ? d.seniority : "Senior";
      return {
        tipo: f.tipo as "crea" | "actualiza",
        codigo: d.codigo || undefined,
        perfil: {
          nombre: d.nombre!, apellido: d.apellido!.split(/\s+/)[0], rol: d.rol!, seniority,
          ...(d.tecnologias && { tecnologias: lista(d.tecnologias) }),
          ...(d.sector && { sector: lista(d.sector) }),
          ...(d.modalidad && { modalidad: d.modalidad }),
          ...(d.ciudad && { ciudad: d.ciudad }),
          ...(d.pais && { pais: d.pais }),
          ...(d.anos && { anclaje: `${d.anos} años declarados` }),
          consentimiento: d.consentimiento || null,
          estado: "borrador" as const,
        },
      };
    });
}
