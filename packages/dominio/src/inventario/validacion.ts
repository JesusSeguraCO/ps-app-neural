// Reporte de validación técnica (HU-130 edge, HU-140; diseño §4 con D11 y D29; T-2). El borrador se
// arma con una plantilla determinista desde la modalidad de prueba elegida: nada se lee de un
// artefacto, nada sale del servidor y ningún modelo interviene. Cada campo dice si viene de la
// plantilla o lo escribió la persona; evaluador, fecha y resultado los escribe siempre la persona, y
// solo una persona confirma. Puro, sin BD ni red.

export type OrigenCampo = "plantilla" | "persona";

export interface ModalidadParaBorrador {
  id: string;
  nombre: string;
  enunciadoReto: string | null;
  entregables: string | null;
  criterios: string | null;
}

export interface CamposPlantilla {
  enunciadoReto: string;
  entregables: string;
  criterios: string[];
}

export type OrigenPorCampo = Record<keyof CamposPlantilla, OrigenCampo>;

export interface BorradorValidacion extends CamposPlantilla {
  modalidadId: string;
  origen: OrigenPorCampo;
}

// Una línea por criterio; sin viñetas ni numeración, sin vacíos ni repetidos.
export function criteriosDeTexto(texto: string | null | undefined): string[] {
  const vistos = new Set<string>();
  for (const linea of (texto ?? "").split(/\r?\n/)) {
    const c = linea.replace(/^\s*(?:[•*·-]|\d+[.)])\s*/, "").trim();
    if (c) vistos.add(c);
  }
  return [...vistos];
}

export function borradorDesdeModalidad(
  m: ModalidadParaBorrador | null,
): { ok: true; borrador: BorradorValidacion } | { ok: false; motivo: "sin_modalidad_prueba" } {
  if (!m) return { ok: false, motivo: "sin_modalidad_prueba" };
  return {
    ok: true,
    borrador: {
      modalidadId: m.id,
      enunciadoReto: m.enunciadoReto?.trim() ?? "",
      entregables: m.entregables?.trim() ?? "",
      criterios: criteriosDeTexto(m.criterios),
      origen: { enunciadoReto: "plantilla", entregables: "plantilla", criterios: "plantilla" },
    },
  };
}

// Lo que la persona dejó igual que la plantilla sigue siendo de la plantilla; lo demás, suyo.
export function origenTrasEdicion(
  plantilla: CamposPlantilla,
  valores: CamposPlantilla,
): OrigenPorCampo {
  const igual = (a: string, b: string) => a.trim() === b.trim();
  const criterios = valores.criterios.map((c) => c.trim()).filter(Boolean);
  return {
    enunciadoReto: igual(valores.enunciadoReto, plantilla.enunciadoReto) ? "plantilla" : "persona",
    entregables: igual(valores.entregables, plantilla.entregables) ? "plantilla" : "persona",
    criterios: criterios.join("\n") === plantilla.criterios.join("\n") ? "plantilla" : "persona",
  };
}

export interface ReporteParaConfirmar extends CamposPlantilla {
  evaluador: string | null;
  fecha: string | null;
  resultado: string | null;
  revisado: boolean;
}

export type FaltaReporte = "revisado" | "criterios" | "evaluador" | "fecha" | "resultado";

// Lo que impide confirmar, en el orden en que la página lo pide. La fecha es civil (AAAA-MM-DD) y no
// puede ser posterior a hoy en Colombia: la validación ya ocurrió.
export function faltaParaConfirmar(r: ReporteParaConfirmar, hoy: string): FaltaReporte[] {
  const vacio = (s: string | null) => !s || !s.trim();
  const falta: FaltaReporte[] = [];
  if (!r.revisado) falta.push("revisado");
  if (!r.criterios.some((c) => c.trim())) falta.push("criterios");
  if (vacio(r.evaluador)) falta.push("evaluador");
  if (!r.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(r.fecha) || r.fecha > hoy) falta.push("fecha");
  if (vacio(r.resultado)) falta.push("resultado");
  return falta;
}
