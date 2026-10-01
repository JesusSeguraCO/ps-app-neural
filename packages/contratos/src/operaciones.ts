// Archivo de colocados de Operaciones (HU-150; RF-8.13.1; D8, D12, D16): solo JSON o CSV (otro
// formato se rechaza entero), las cuatro columnas mínimas —código del perfil, cliente, fecha de inicio
// y fecha de liberación— con sinónimos razonables en el encabezado, el resto ignorado e informado, y
// cada fila validada con su número y su motivo. La fecha de corte no sale del archivo: es el momento
// de la carga (D16). Lo que depende del banco (código inexistente, no publicado) lo decide la carga.
import { normalizarEncabezado } from "@ps/dominio/importacion/campos";
import { diasCivilesDesde } from "@ps/dominio/inventario/vigencia";
import { LIMITE_FILAS, leerJson, leerTabular, type Tabla } from "./importacion";

export type FormatoOperaciones = "json" | "csv";
export const DIAS_SIN_CARGA = 7;

type Columna = "codigo" | "cuenta" | "inicio" | "liberacion";

const SINONIMOS: Record<Columna, string[]> = {
  codigo: ["codigo", "codigo del perfil", "codigo perfil", "perfil", "codigo ps"],
  cuenta: ["cliente", "cuenta", "empresa"],
  inicio: ["fecha de inicio", "fecha inicio", "inicio", "desde"],
  liberacion: [
    "fecha de liberacion",
    "fecha liberacion",
    "liberacion",
    "fecha de fin",
    "fecha fin",
    "fin",
    "hasta",
  ],
};

const NOMBRE_COLUMNA: Record<Columna, string> = {
  codigo: "código del perfil",
  cuenta: "cliente",
  inicio: "fecha de inicio",
  liberacion: "fecha de liberación",
};

export interface FilaOperaciones {
  numero: number;
  codigo: string;
  cuenta: string;
  inicio: string;
  liberacion: string;
}

export interface ErrorFilaOperaciones {
  numero: number;
  codigo: string | null;
  motivo: string;
}

export type LecturaOperaciones =
  | {
      ok: true;
      formato: FormatoOperaciones;
      filas: FilaOperaciones[];
      errores: ErrorFilaOperaciones[];
      ignoradas: string[];
    }
  | { ok: false; motivo: "formato_no_admitido" | "sin_filas" | "demasiadas_filas" }
  | { ok: false; motivo: "faltan_columnas"; faltan: string[] };

export function formatoDeArchivo(nombre: string): FormatoOperaciones | null {
  const ext = nombre.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return ext === "json" || ext === "csv" ? ext : null;
}

const dia = (aaaammdd: string) => Date.parse(`${aaaammdd}T00:00:00Z`);

// AAAA-MM-DD o DD/MM/AAAA (como lo exporta una hoja en español); solo fechas que existen.
function fecha(t: string): string | null {
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dmy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const f = iso
    ? `${iso[1]}-${iso[2]}-${iso[3]}`
    : dmy
      ? `${dmy[3]}-${dmy[2]!.padStart(2, "0")}-${dmy[1]!.padStart(2, "0")}`
      : null;
  if (!f || Number.isNaN(dia(f))) return null;
  return new Date(dia(f)).toISOString().slice(0, 10) === f ? f : null;
}

function tabla(formato: FormatoOperaciones, texto: string): Tabla | null {
  if (formato === "json") {
    const t = texto.replace(/^﻿/, "").trim();
    if (!t.startsWith("[") && !t.startsWith("{")) return null;
    const r = leerJson(t);
    return r.ok ? r.tabla : null;
  }
  const primera = texto.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? "";
  const separador = primera.includes(";") && !primera.includes(",") ? ";" : ",";
  return leerTabular(texto, separador);
}

export function leerOperaciones(nombre: string, texto: string, hoy: string): LecturaOperaciones {
  const formato = formatoDeArchivo(nombre);
  // Un binario con extensión de texto (una hoja de cálculo renombrada) tampoco es CSV ni JSON.
   
  if (!formato || /[\u0000-\u0008\u000e-\u001f]/.test(texto))
    return { ok: false, motivo: "formato_no_admitido" };
  const t = tabla(formato, texto);
  if (!t) return { ok: false, motivo: "formato_no_admitido" };

  const indice = {} as Record<Columna, number>;
  const ignoradas: string[] = [];
  t.encabezados.forEach((h, i) => {
    const n = normalizarEncabezado(h);
    const col = (Object.keys(SINONIMOS) as Columna[]).find(
      (c) => SINONIMOS[c].includes(n) && indice[c] === undefined,
    );
    if (col) indice[col] = i;
    else if (h.trim()) ignoradas.push(h.trim());
  });
  const faltan = (Object.keys(SINONIMOS) as Columna[]).filter((c) => indice[c] === undefined);
  if (faltan.length)
    return { ok: false, motivo: "faltan_columnas", faltan: faltan.map((c) => NOMBRE_COLUMNA[c]) };
  if (t.filas.length === 0) return { ok: false, motivo: "sin_filas" };
  if (t.filas.length > LIMITE_FILAS) return { ok: false, motivo: "demasiadas_filas" };

  const filas: FilaOperaciones[] = [];
  const errores: ErrorFilaOperaciones[] = [];
  const vistos = new Map<string, number>();
  for (const f of t.filas) {
    const celda = (c: Columna) => (f.celdas[indice[c]] ?? "").trim();
    const codigo = celda("codigo").toUpperCase().replace(/\s+/g, "");
    const error = (motivo: string) =>
      errores.push({ numero: f.numero, codigo: codigo || null, motivo });
    if (!/^PS-\d{4}$/.test(codigo)) {
      error("El código no tiene el formato PS-XXXX (cuatro dígitos).");
      continue;
    }
    const cuenta = celda("cuenta");
    if (!cuenta) {
      error("Falta el cliente.");
      continue;
    }
    if (cuenta.length > 200) {
      error("El cliente tiene más de 200 caracteres.");
      continue;
    }
    const fechaDe = (c: "inicio" | "liberacion", nombre: string) => {
      const v = celda(c);
      if (!v) return { error: `Falta la ${nombre}.` };
      const f2 = fecha(v);
      return f2 ? { valor: f2 } : { error: `«${v}» no es una ${nombre} válida.` };
    };
    const inicio = fechaDe("inicio", "fecha de inicio");
    if (inicio.error) {
      error(inicio.error);
      continue;
    }
    const liberacion = fechaDe("liberacion", "fecha de liberación");
    if (liberacion.error) {
      error(liberacion.error);
      continue;
    }
    if (liberacion.valor! <= inicio.valor!) {
      error("La fecha de liberación no es posterior a la de inicio.");
      continue;
    }
    if (liberacion.valor! <= hoy) {
      error("La fecha de liberación ya llegó: no es un colocado vigente.");
      continue;
    }
    const previa = vistos.get(codigo);
    if (previa !== undefined) {
      error(`El código ${codigo} ya viene en la fila ${previa}.`);
      continue;
    }
    vistos.set(codigo, f.numero);
    filas.push({
      numero: f.numero,
      codigo,
      cuenta,
      inicio: inicio.valor!,
      liberacion: liberacion.valor!,
    });
  }
  return { ok: true, formato, filas, errores, ignoradas };
}

// «Dato desincronizado» (D12): más de 7 días civiles de Bogotá desde la última carga sin otra nueva.
export function datoDesincronizado(corte: Date, ahora: Date): boolean {
  return diasCivilesDesde(corte, ahora) > DIAS_SIN_CARGA;
}
