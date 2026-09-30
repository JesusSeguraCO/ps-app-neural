// Lote de `proponer_lexico` (HU-139, RF-8.12.1; ADR-0004 H43, V9-8, V4-4): qué consultas sin
// coincidencia pueden viajar a Gemini y cómo lo que vuelve se convierte en propuestas pendientes.
// Puro: el worker lee los datos, llama al adaptador y guarda.
import { normalizar } from "../catalogo/parecidos";

export interface ConsultaSinCoincidencia {
  id: string;
  texto: string;
  modeloPermitido: boolean;
  veces: number;
  cuentas: number;
}

export type MotivoOmision = "modelo_no_permitido" | "nombre_de_perfil" | "vacia";

export interface LoteLexico {
  enviadas: Array<Pick<ConsultaSinCoincidencia, "id" | "texto" | "veces" | "cuentas">>;
  omitidas: Array<{ id: string; motivo: MotivoOmision }>;
}

// Solo las consultas con `modelo_permitido` y sin ninguna palabra que sea nombre o primer apellido de
// un perfil del inventario (cualquier estado); la consulta que contiene uno no viaja entera (R-65:
// un homónimo con una tecnología se pierde, nunca se expone un nombre).
export function armarLoteLexico(
  consultas: readonly ConsultaSinCoincidencia[],
  perfiles: ReadonlyArray<{ nombre: string; primerApellido: string }>,
): LoteLexico {
  const vetadas = new Set<string>();
  for (const p of perfiles)
    for (const parte of `${p.nombre} ${p.primerApellido}`.split(/\s+/)) {
      const n = normalizar(parte);
      if (n) vetadas.add(n);
    }
  const lote: LoteLexico = { enviadas: [], omitidas: [] };
  for (const c of consultas) {
    const palabras = normalizar(c.texto.replace(/[^\p{L}\p{N}\s]/gu, " "))
      .split(" ")
      .filter(Boolean);
    if (!c.modeloPermitido) lote.omitidas.push({ id: c.id, motivo: "modelo_no_permitido" });
    else if (palabras.length === 0) lote.omitidas.push({ id: c.id, motivo: "vacia" });
    else if (palabras.some((w) => vetadas.has(w)))
      lote.omitidas.push({ id: c.id, motivo: "nombre_de_perfil" });
    else
      lote.enviadas.push({ id: c.id, texto: c.texto.trim(), veces: c.veces, cuentas: c.cuentas });
  }
  return lote;
}

export type TipoEquivalencia = "rol" | "tecnologia" | "sector";

export interface RespuestaModeloLexico {
  propuestas: Array<{
    termino: string;
    sinonimos: string[];
    equivalencias: Array<{ tipo: TipoEquivalencia; valor: string }>;
    consultas: string[];
  }>;
}

export interface PropuestaLexico {
  termino: string;
  sinonimos: string[];
  equivalencias: Array<{ tipo: TipoEquivalencia; id: string }>;
  consultas: string[];
  ejemplo: string;
  busquedas: number;
  cuentas: number;
}

// El modelo nombra valores; aquí se traducen a ids del catálogo por forma normalizada y se descarta lo
// que no existe. `excluidos`: formas normalizadas ya en el léxico, pendientes o rechazadas.
export function propuestasDesdeRespuesta(
  respuesta: RespuestaModeloLexico,
  ctx: {
    enviadas: LoteLexico["enviadas"];
    catalogo: ReadonlyArray<{ tipo: TipoEquivalencia; id: string; nombre: string }>;
    excluidos: readonly string[];
  },
): PropuestaLexico[] {
  const vistos = new Set(ctx.excluidos);
  const porId = new Map(ctx.enviadas.map((c) => [c.id, c]));
  const salida: PropuestaLexico[] = [];
  for (const p of respuesta.propuestas) {
    const forma = normalizar(p.termino);
    if (!forma || vistos.has(forma)) continue;
    const equivalencias: PropuestaLexico["equivalencias"] = [];
    for (const e of p.equivalencias) {
      const v = ctx.catalogo.find(
        (x) => x.tipo === e.tipo && normalizar(x.nombre) === normalizar(e.valor),
      );
      if (v && !equivalencias.some((x) => x.id === v.id))
        equivalencias.push({ tipo: e.tipo, id: v.id });
    }
    const consultas = [...new Set(p.consultas)].filter((id) => porId.has(id));
    if (!equivalencias.length || !consultas.length) continue;
    vistos.add(forma);
    const origen = consultas.map((id) => porId.get(id)!);
    salida.push({
      termino: p.termino.trim(),
      sinonimos: [...new Set(p.sinonimos.map((s) => s.trim()).filter(Boolean))],
      equivalencias,
      consultas,
      ejemplo: origen[0]!.texto,
      busquedas: origen.reduce((s, c) => s + c.veces, 0),
      cuentas: Math.max(...origen.map((c) => c.cuentas)),
    });
  }
  return salida;
}
