// Asistente de importación del panel (EP-006 · sub-slice 3; docs/10-specs/importacion-masiva.md §6,
// pasos 1–3; HU-088, HU-086, HU-148). Une el contrato del formato (leer, escribir), el dominio
// (emparejar, calcularPlan) y la infra (banco, catálogos, lote, plantillas). Nada de aquí escribe en
// `perfiles`: el lote queda `calculado` y aplicarlo es del sub-slice 4.
import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  CAMPOS_IMPORTACION,
  EJEMPLOS_PLANTILLA,
  escribirCsv,
  escribirErrores,
  escribirJson,
  escribirTabla,
  leer,
  type Formato,
} from "@ps/contratos/importacion";
import { CLAVES_CAMPO, ETIQUETA_CAMPO_IMPORTACION } from "@ps/dominio/importacion/campos";
import {
  aplicarPlantilla,
  proponerEmparejamiento,
  type ColumnaEmparejada,
  type ColumnaPlantilla,
} from "@ps/dominio/importacion/emparejar";
import { calcularPlan, mapearFilas, type Modo, type Plan } from "@ps/dominio/importacion/plan";
import {
  actualizarPlanLote,
  bancoEnFormato,
  catalogosImportacion,
  confirmarLote,
  erroresDelLote,
  filasDelLote,
  leerLote,
  leerPlantilla,
  listarLotes,
  registrarLote,
  type LoteLeido,
} from "@ps/infra/postgres/importacion";
import { colocadosVigentes } from "@ps/infra/postgres/colocados";
import { poolDe } from "@ps/infra/postgres/pool";
import {
  confirmarReversion,
  detalleReversion,
  type DetalleReversion,
} from "@ps/infra/postgres/revertir-importacion";
import { RechazoInventario } from "@ps/infra/postgres/unidad-inventario";

const hoyEnColombia = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);

// ─── entradas ────────────────────────────────────────────────────────────────────────────────

const formato = z.enum(["csv", "tsv", "json"]);
const modo = z.enum(["crear_y_actualizar", "solo_actualizar", "solo_crear"]);
const columnas = z
  .array(
    z.strictObject({
      columna: z.string().max(200),
      clave: z.enum(CLAVES_CAMPO).nullable(),
    }),
  )
  .max(80);
// 200 filas de hasta ~4 000 caracteres caben de sobra en 1 MB.
const texto = z.string().min(1).max(1_000_000);

export const entradaEmparejar = z.strictObject({
  texto,
  formato: formato.optional(),
  plantillaId: z.uuid().optional(),
});
export const entradaLote = z.strictObject({
  texto,
  formato,
  modo,
  columnas,
  // Nombre del archivo cargado (sin ruta); se pegó → ausente.
  archivo: z.string().trim().min(1).max(200).nullish(),
});
export const entradaRecalcular = z.strictObject({
  modo: modo.optional(),
  excluidas: z.array(z.number().int().min(1)).max(200),
});
export const entradaPlantilla = z.strictObject({
  nombre: z.string().trim().min(1).max(80),
  columnas: columnas.min(1),
});

// ─── exportar y plantilla de muestra (HU-088) ────────────────────────────────────────────────

export type FormatoArchivo = "csv" | "json";

export function archivo(
  filas: Parameters<typeof escribirCsv>[0],
  f: FormatoArchivo,
  nombre: string,
): Response {
  const cuerpo = f === "csv" ? escribirCsv(filas) : escribirJson(filas);
  return new Response(cuerpo, {
    status: 200,
    headers: {
      "content-type": f === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${nombre}-${hoyEnColombia()}.${f}"`,
      "cache-control": "no-store",
    },
  });
}

export const exportarBanco = async (f: FormatoArchivo) =>
  archivo(await bancoEnFormato(poolDe("panel")), f, "banco-de-perfiles");

export const plantillaDeMuestra = (f: FormatoArchivo) =>
  archivo(EJEMPLOS_PLANTILLA, f, "plantilla-importacion");

// ─── paso 2: leer y emparejar ────────────────────────────────────────────────────────────────


function leerTexto(t: string, f?: Formato) {
  const r = leer(t, f);
  if (!r.ok) throw new RechazoInventario(r.motivo, r.detalle ? { detalle: r.detalle } : {});
  return r;
}

export interface Emparejado {
  formato: Formato;
  encabezados: string[];
  totalFilas: number;
  // La primera fila de datos, para reconocer cada columna (vacía en las columnas bloqueadas).
  ejemplo: string[];
  emparejamiento: ColumnaEmparejada[];
  // Solo al aplicar una plantilla (HU-148).
  faltantes?: ColumnaPlantilla[];
  nuevas?: string[];
  plantilla?: { id: string; nombre: string };
}

export async function emparejar(e: z.infer<typeof entradaEmparejar>): Promise<Emparejado> {
  const r = leerTexto(e.texto, e.formato);
  const base = {
    formato: r.formato,
    encabezados: r.tabla.encabezados,
    totalFilas: r.tabla.filas.length,
  };
  const conEjemplo = (emparejamiento: ColumnaEmparejada[]) => ({
    ejemplo: emparejamiento.map((c) =>
      c.bloqueada ? "" : (r.tabla.filas[0]?.celdas[c.indice] ?? "").trim(),
    ),
    emparejamiento,
  });
  if (!e.plantillaId)
    return {
      ...base,
      ...conEjemplo(proponerEmparejamiento(r.tabla.encabezados, CAMPOS_IMPORTACION)),
    };
  const p = await leerPlantilla(poolDe("panel"), e.plantillaId);
  if (!p) throw new RechazoInventario("no_existe");
  const a = aplicarPlantilla(r.tabla.encabezados, p.columnas, CAMPOS_IMPORTACION);
  return {
    ...base,
    ...conEjemplo(a.emparejamiento),
    faltantes: a.faltantes,
    nuevas: a.nuevas,
    plantilla: { id: p.id, nombre: p.nombre },
  };
}

// ─── paso 3: vista previa (plan calculado, sin escritura en el banco) ────────────────────────

async function contexto() {
  const bd = poolDe("panel");
  const banco = await bancoEnFormato(bd);
  return {
    banco: new Map(banco.map((f) => [f.codigo as string, f])),
    catalogos: await catalogosImportacion(bd),
    hoy: hoyEnColombia(),
    colocados: await colocadosVigentes(bd),
  };
}

export interface VistaPrevia {
  loteId: string;
  modo: Modo;
  plan: Plan;
}

export async function calcularLote(
  e: z.infer<typeof entradaLote>,
  autor: { usuarioId: string; correo: string },
): Promise<VistaPrevia> {
  const r = leerTexto(e.texto, e.formato);
  // El emparejamiento final se aplica como una plantilla sobre los mismos encabezados: las columnas
  // B.4 y las rechazadas siguen bloqueadas aunque el cliente diga otra cosa.
  const { emparejamiento } = aplicarPlantilla(r.tabla.encabezados, e.columnas, CAMPOS_IMPORTACION);
  const filas = mapearFilas(r.tabla, emparejamiento);
  const plan = calcularPlan({ ...(await contexto()), filas, modo: e.modo });
  const loteId = await registrarLote(poolDe("panel"), autor, {
    archivoHash: createHash("sha256").update(e.texto).digest("hex"),
    archivoNombre: e.archivo?.split(/[\\/]/).pop() ?? null,
    formato: r.formato,
    modo: e.modo,
    emparejamiento: emparejamiento.map((c) => ({
      columna: c.columna,
      clave: c.destino.tipo === "campo" ? c.destino.clave : null,
    })),
    filas,
    plan,
  });
  return { loteId, modo: e.modo, plan };
}

export async function recalcularLote(
  id: string,
  e: z.infer<typeof entradaRecalcular>,
): Promise<VistaPrevia> {
  const bd = poolDe("panel");
  const l = await filasDelLote(bd, id);
  if (!l) throw new RechazoInventario("no_existe");
  const m = e.modo ?? l.modo;
  const plan = calcularPlan({
    ...(await contexto()),
    filas: l.filas,
    modo: m,
    excluidas: new Set(e.excluidas),
  });
  await actualizarPlanLote(bd, id, m, plan);
  return { loteId: id, modo: m, plan };
}

// ─── paso 4–5: confirmar y seguir el resultado (HU-141) ──────────────────────────────────────

// Confirmar encola el trabajo del worker (202): el panel no escribe en `perfiles`.
export async function confirmar(
  id: string,
  autor: { usuarioId: string; correo: string },
): Promise<{ trabajoId: string }> {
  return confirmarLote(poolDe("panel"), autor, id);
}

export interface ResumenErrores {
  filas: number;
  todas: boolean;
  causaComun: string | null;
}

export async function estadoDeLote(
  id: string,
): Promise<{ lote: LoteLeido; errores: ResumenErrores }> {
  const bd = poolDe("panel");
  const l = await leerLote(bd, id);
  if (!l) throw new RechazoInventario("no_existe");
  const e = (await erroresDelLote(bd, id))!;
  return { lote: l, errores: { filas: e.filas.length, todas: e.todas, causaComun: e.causaComun } };
}

// Las filas con error en el formato en que llegaron, con su motivo (HU-142).
export async function archivoDeErrores(id: string): Promise<Response> {
  const e = await erroresDelLote(poolDe("panel"), id);
  if (!e) throw new RechazoInventario("no_existe");
  const tipo = { csv: "text/csv", tsv: "text/tab-separated-values", json: "application/json" }[e.formato];
  return new Response(escribirErrores(e.formato, e.encabezados, e.filas), {
    status: 200,
    headers: {
      "content-type": `${tipo}; charset=utf-8`,
      "content-disposition": `attachment; filename="filas-con-error-${hoyEnColombia()}.${e.formato}"`,
      "cache-control": "no-store",
    },
  });
}

export const historial = () => listarLotes(poolDe("panel"));

// ─── deshacer la última importación (HU-087) ─────────────────────────────────────────────────

export const entradaRevertir = z.strictObject({
  incluir: z.array(z.string().regex(/^PS-\d{4}$/)).max(200),
});

export async function previoAReversion(id: string): Promise<DetalleReversion> {
  const p = await detalleReversion(poolDe("panel"), id);
  if (!p) throw new RechazoInventario("no_existe");
  return p;
}

export const revertir = (
  id: string,
  autor: { usuarioId: string },
  e: z.infer<typeof entradaRevertir>,
) => confirmarReversion(poolDe("panel"), autor, id, e.incluir);

// Reporte de una importación (spec §6 paso 5): cada fila con lo que le pasó, en hoja de cálculo.
const RESULTADO_GRUPO = {
  nuevo: "Creado en borrador",
  actualizado: "Actualizado",
  archivado: "Archivado",
  sin_cambios: "Sin cambios",
  omitido: "Omitido",
  con_error: "Con error",
} as const;

export async function reporteDeLote(id: string): Promise<Response> {
  const l = await leerLote(poolDe("panel"), id);
  if (!l) throw new RechazoInventario("no_existe");
  const cuerpo = escribirTabla(
    "csv",
    ["Fila", "Código", "Profesional", "Resultado", "Detalle", "Avisos"],
    l.filas.map((f) => [
      String(f.numero),
      f.codigo ?? "",
      f.persona.nombre ?? "",
      !f.incluida && f.grupo !== "con_error" ? "Excluida por ti" : RESULTADO_GRUPO[f.grupo],
      f.grupo === "con_error"
        ? f.errores.map((e) => e.mensaje).join("; ")
        : f.grupo === "omitido"
          ? (f.motivoOmision ?? "")
          : f.cambios.map((c) => ETIQUETA_CAMPO_IMPORTACION[c.campo]).join(", "),
      f.avisos.map((a) => a.mensaje).join("; "),
    ]),
  );
  return new Response(cuerpo, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="reporte-importacion-${hoyEnColombia()}.csv"`,
      "cache-control": "no-store",
    },
  });
}
