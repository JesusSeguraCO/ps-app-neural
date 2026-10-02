// Léxico de búsqueda (HU-139; RF-8.12, RF-8.12.1; diseño §7). Panel: términos con su equivalencia en
// rol, tecnología o sector (FK real, nunca a un valor vacío), propuestas de Gemini que solo entran con
// aprobación humana y candidatas (consultas sin coincidencia) con dos salidas. Portal: vocabulario
// aprobado leído por vistas en cada petición, así que un término nuevo se reconoce sin despliegue.
import "server-only";
import type pg from "pg";
import { masCercanos, normalizar } from "@ps/dominio/catalogo/parecidos";
import {
  armarVocabulario,
  reconocer,
  type Reconocimiento,
  type TipoValor,
  type Vocabulario,
} from "@ps/dominio/lexico/reconocer";
import type { TipoEquivalencia } from "@ps/dominio/lexico/lote";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { RechazoInventario, conUnidadInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

const TABLA_TIPO: Record<TipoEquivalencia, string> = {
  rol: "catalogo_roles",
  tecnologia: "catalogo_tecnologias",
  sector: "catalogo_sectores",
};
const COLUMNA_TIPO: Record<TipoEquivalencia, string> = {
  rol: "rol_id",
  tecnologia: "tecnologia_id",
  sector: "sector_id",
};

export interface Equivalencia {
  tipo: TipoEquivalencia;
  id: string;
  nombre: string;
}

export interface TerminoLexico {
  id: string;
  termino: string;
  sinonimos: string[];
  equivalencias: Equivalencia[];
  origen: "manual" | "propuesta" | "candidata";
  actualizadoPor: string | null;
  actualizadoEn: Date;
}

const SQL_EQUIVALENCIAS = `
  SELECT e.lexico_id,
         CASE WHEN e.rol_id IS NOT NULL THEN 'rol' WHEN e.tecnologia_id IS NOT NULL THEN 'tecnologia' ELSE 'sector' END AS tipo,
         COALESCE(e.rol_id, e.tecnologia_id, e.sector_id) AS id,
         COALESCE(r.nombre, t.nombre, s.nombre) AS nombre
    FROM inventario.lexico_equivalencias e
    LEFT JOIN inventario.catalogo_roles r ON r.id = e.rol_id
    LEFT JOIN inventario.catalogo_tecnologias t ON t.id = e.tecnologia_id
    LEFT JOIN inventario.catalogo_sectores s ON s.id = e.sector_id
   WHERE e.vigente`;

export async function listarLexico(bd: Consultor): Promise<TerminoLexico[]> {
  const [t, e] = await Promise.all([
    bd.query(
      `SELECT l.id, l.termino, l.sinonimos, l.origen, u.correo AS actualizado_por, l.actualizado_en
         FROM inventario.lexico l LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.actualizado_por
        ORDER BY l.actualizado_en DESC`,
    ),
    bd.query(`${SQL_EQUIVALENCIAS} ORDER BY tipo, nombre`),
  ]);
  return t.rows.map((f) => ({
    id: f.id,
    termino: f.termino,
    sinonimos: f.sinonimos,
    origen: f.origen,
    actualizadoPor: f.actualizado_por,
    actualizadoEn: f.actualizado_en,
    equivalencias: e.rows
      .filter((x) => x.lexico_id === f.id)
      .map((x) => ({ tipo: x.tipo, id: x.id, nombre: x.nombre })),
  }));
}

export interface EntradaTermino {
  termino: string;
  sinonimos: string[];
  tipo: TipoEquivalencia;
  // Nombres de valores del catálogo del tipo elegido (una o varias tecnologías, por ejemplo).
  valores: string[];
}

export type MotivoRechazoLexico =
  "termino_vacio" | "sin_valor" | "valor_inexistente" | "no_existe" | "ya_decidida";

const limpiar = (s: string) => s.replace(/\s+/g, " ").trim();

// Traduce nombres a ids del catálogo del tipo; si alguno no existe (o está desactivado), rechaza con
// lo más parecido del catálogo para elegir (HU-139, error).
async function resolverValores(
  tx: Consultor,
  tipo: TipoEquivalencia,
  valores: string[],
): Promise<Array<{ id: string; nombre: string }>> {
  const pedidos = [...new Set(valores.map(limpiar).filter(Boolean))];
  if (!pedidos.length) throw new RechazoInventario<MotivoRechazoLexico>("sin_valor");
  const activos = (
    await tx.query(
      `SELECT id, nombre FROM inventario.${TABLA_TIPO[tipo]} WHERE activo ORDER BY nombre`,
    )
  ).rows as Array<{ id: string; nombre: string }>;
  const salida: Array<{ id: string; nombre: string }> = [];
  for (const p of pedidos) {
    const v = activos.find((a) => normalizar(a.nombre) === normalizar(p));
    if (!v)
      throw new RechazoInventario<MotivoRechazoLexico>("valor_inexistente", {
        valor: p,
        tipo,
        sugerencias: masCercanos(p, activos).map((a) => a.nombre),
      });
    if (!salida.some((x) => x.id === v.id)) salida.push(v);
  }
  return salida;
}

// Fija las equivalencias vigentes de un tipo para un término: retira (sin borrar) las que sobran y
// agrega las que faltan. Devuelve los cambios para auditar.
async function fijarEquivalencias(
  tx: Consultor,
  autor: Autor,
  lexicoId: string,
  tipo: TipoEquivalencia,
  valores: Array<{ id: string; nombre: string }>,
): Promise<CambioAuditado[]> {
  const col = COLUMNA_TIPO[tipo];
  const actuales = (
    await tx.query(
      `SELECT e.id, e.${col} AS valor_id, v.nombre FROM inventario.lexico_equivalencias e
         JOIN inventario.${TABLA_TIPO[tipo]} v ON v.id = e.${col}
        WHERE e.lexico_id = $1 AND e.vigente AND e.${col} IS NOT NULL FOR UPDATE OF e`,
      [lexicoId],
    )
  ).rows as Array<{ id: string; valor_id: string; nombre: string }>;
  const quitar = actuales.filter((a) => !valores.some((v) => v.id === a.valor_id));
  const poner = valores.filter((v) => !actuales.some((a) => a.valor_id === v.id));
  if (quitar.length)
    await tx.query(
      `UPDATE inventario.lexico_equivalencias SET vigente = false, retirada_en = now() WHERE id = ANY($1)`,
      [quitar.map((q) => q.id)],
    );
  for (const v of poner)
    await tx.query(
      `INSERT INTO inventario.lexico_equivalencias (lexico_id, ${col}) VALUES ($1, $2)`,
      [lexicoId, v.id],
    );
  const antes =
    actuales
      .map((a) => a.nombre)
      .sort()
      .join(", ") || null;
  const despues =
    valores
      .map((v) => v.nombre)
      .sort()
      .join(", ") || null;
  return antes === despues
    ? []
    : [
        {
          actor: autor.correo,
          entidad: "lexico",
          entidadId: lexicoId,
          campo: `equivalencias.${tipo}`,
          antes,
          despues,
          origen: "panel",
        },
      ];
}

// Crea o actualiza un término (por su forma normalizada) con las equivalencias del tipo elegido.
async function guardarEnTx(
  tx: Consultor,
  autor: Autor,
  e: EntradaTermino,
  opciones: { id?: string; origen: TerminoLexico["origen"] },
): Promise<{ id: string; cambios: CambioAuditado[] }> {
  const termino = limpiar(e.termino);
  if (!termino) throw new RechazoInventario<MotivoRechazoLexico>("termino_vacio");
  const sinonimos = [
    ...new Set(e.sinonimos.map(limpiar).filter((s) => s && normalizar(s) !== normalizar(termino))),
  ];
  const valores = await resolverValores(tx, e.tipo, e.valores);
  const previo = (
    await tx.query(
      opciones.id
        ? `SELECT id, termino, sinonimos FROM inventario.lexico WHERE id = $1 FOR UPDATE`
        : `SELECT id, termino, sinonimos FROM inventario.lexico WHERE termino_normal = inventario.normalizar_nombre($1) FOR UPDATE`,
      [opciones.id ?? termino],
    )
  ).rows[0] as { id: string; termino: string; sinonimos: string[] } | undefined;
  if (opciones.id && !previo) throw new RechazoInventario<MotivoRechazoLexico>("no_existe");
  const cambios: CambioAuditado[] = [];
  const registro = (id: string, campo: string, antes: string | null, despues: string | null) =>
    cambios.push({
      actor: autor.correo,
      entidad: "lexico",
      entidadId: id,
      campo,
      antes,
      despues,
      origen: "panel",
    });
  let id: string;
  if (previo) {
    id = previo.id;
    await tx.query(
      `UPDATE inventario.lexico SET termino = $2, sinonimos = $3, actualizado_por = $4, actualizado_en = now() WHERE id = $1`,
      [id, termino, sinonimos, autor.usuarioId],
    );
    if (previo.termino !== termino) registro(id, "termino", previo.termino, termino);
    if (previo.sinonimos.join(", ") !== sinonimos.join(", "))
      registro(id, "sinonimos", previo.sinonimos.join(", ") || null, sinonimos.join(", ") || null);
  } else {
    id = (
      await tx.query(
        `INSERT INTO inventario.lexico (termino, sinonimos, origen, actualizado_por) VALUES ($1, $2, $3, $4) RETURNING id`,
        [termino, sinonimos, opciones.origen, autor.usuarioId],
      )
    ).rows[0].id;
    registro(id, "termino", null, termino);
    if (sinonimos.length) registro(id, "sinonimos", null, sinonimos.join(", "));
    registro(id, "origen", null, opciones.origen);
  }
  cambios.push(...(await fijarEquivalencias(tx, autor, id, e.tipo, valores)));
  return { id, cambios };
}

export async function guardarTermino(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  e: EntradaTermino & { id?: string; candidataId?: string },
): Promise<{ id: string }> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const { id, cambios } = await guardarEnTx(tx, autor, e, {
      id: e.id,
      origen: e.candidataId ? "candidata" : "manual",
    });
    if (e.candidataId)
      cambios.push(...(await decidirCandidataEnTx(tx, autor, e.candidataId, "lexico")));
    return { resultado: { id }, cambios, visible: true };
  });
}

// ─── propuestas de Gemini ───────────────────────────────────────────────────────────────────
export interface PropuestaPendiente {
  id: string;
  termino: string;
  sinonimos: string[];
  equivalencias: Equivalencia[];
  ejemplo: string;
  busquedas: number;
  cuentas: number;
  propuestaEn: Date;
}

export async function propuestasPendientes(bd: Consultor): Promise<PropuestaPendiente[]> {
  const r = await bd.query(
    `SELECT id, termino, sinonimos, equivalencias, ejemplo, busquedas, cuentas, propuesta_en
       FROM inventario.propuestas_lexico WHERE estado = 'pendiente' ORDER BY busquedas DESC, propuesta_en DESC`,
  );
  const nombres = await nombresDeValores(bd);
  return r.rows.map((f) => ({
    id: f.id,
    termino: f.termino,
    sinonimos: f.sinonimos,
    ejemplo: f.ejemplo,
    busquedas: f.busquedas,
    cuentas: f.cuentas,
    propuestaEn: f.propuesta_en,
    // Una equivalencia cuyo valor dejó de estar activo no se muestra ni se aprueba.
    equivalencias: (f.equivalencias as Array<{ tipo: TipoEquivalencia; id: string }>)
      .map((x) => ({ ...x, nombre: nombres.get(`${x.tipo}:${x.id}`) }))
      .filter((x): x is Equivalencia => Boolean(x.nombre)),
  }));
}

async function nombresDeValores(bd: Consultor): Promise<Map<string, string>> {
  const r = await bd.query(
    `SELECT 'rol' AS tipo, id, nombre FROM inventario.catalogo_roles WHERE activo
     UNION ALL SELECT 'tecnologia', id, nombre FROM inventario.catalogo_tecnologias WHERE activo
     UNION ALL SELECT 'sector', id, nombre FROM inventario.catalogo_sectores WHERE activo`,
  );
  return new Map(r.rows.map((f) => [`${f.tipo}:${f.id}`, f.nombre]));
}

async function propuestaPendiente(tx: Consultor, id: string) {
  const p = (
    await tx.query(`SELECT * FROM inventario.propuestas_lexico WHERE id = $1 FOR UPDATE`, [id])
  ).rows[0];
  if (!p) throw new RechazoInventario<MotivoRechazoLexico>("no_existe");
  if (p.estado !== "pendiente") throw new RechazoInventario<MotivoRechazoLexico>("ya_decidida");
  return p as {
    id: string;
    termino: string;
    sinonimos: string[];
    equivalencias: Array<{ tipo: TipoEquivalencia; id: string }>;
  };
}

// Aprobar tal cual (todas sus equivalencias) o editada (entra exactamente lo que quedó en el formulario).
export async function aprobarPropuesta(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  id: string,
  edicion?: EntradaTermino,
): Promise<{ lexicoId: string }> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const p = await propuestaPendiente(tx, id);
    const nombres = await nombresDeValores(tx);
    const entradas: EntradaTermino[] = edicion
      ? [edicion]
      : (["rol", "tecnologia", "sector"] as const)
          .map((tipo) => ({
            termino: p.termino,
            sinonimos: p.sinonimos,
            tipo,
            valores: p.equivalencias
              .filter((x) => x.tipo === tipo)
              .map((x) => nombres.get(`${tipo}:${x.id}`))
              .filter((n): n is string => Boolean(n)),
          }))
          .filter((e) => e.valores.length);
    if (!entradas.length) throw new RechazoInventario<MotivoRechazoLexico>("sin_valor");
    const cambios: CambioAuditado[] = [];
    let lexicoId = "";
    for (const e of entradas) {
      const g = await guardarEnTx(tx, autor, e, { origen: "propuesta" });
      lexicoId = g.id;
      cambios.push(...g.cambios);
    }
    await tx.query(
      `UPDATE inventario.propuestas_lexico SET estado = 'aprobada', decidido_por = $2, decidido_en = now(), lexico_id = $3 WHERE id = $1`,
      [id, autor.usuarioId, lexicoId],
    );
    cambios.push({
      actor: autor.correo,
      entidad: "propuestas_lexico",
      entidadId: id,
      campo: "estado",
      antes: "pendiente",
      despues: edicion ? "aprobada_editada" : "aprobada",
      origen: "panel",
    });
    return { resultado: { lexicoId }, cambios, visible: true };
  });
}

// Rechazar: no entra al léxico y no vuelve a proponerse (índice único sobre las rechazadas).
export async function rechazarPropuesta(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  id: string,
): Promise<void> {
  await conUnidadInventario(bd, claves, async (tx) => {
    await propuestaPendiente(tx, id);
    await tx.query(
      `UPDATE inventario.propuestas_lexico SET estado = 'rechazada', decidido_por = $2, decidido_en = now() WHERE id = $1`,
      [id, autor.usuarioId],
    );
    return {
      resultado: undefined,
      cambios: [
        {
          actor: autor.correo,
          entidad: "propuestas_lexico",
          entidadId: id,
          campo: "estado",
          antes: "pendiente",
          despues: "rechazada",
          origen: "panel",
        },
      ],
      visible: false,
    };
  });
}

// ─── candidatas (consultas sin coincidencia) ────────────────────────────────────────────────
export type DestinoCandidata = "lexico" | "agenda_reclutamiento" | "descartada";

export interface Candidata {
  id: string;
  consulta: string;
  veces: number;
  cuentas: number;
  ultimaEn: Date;
  destino: DestinoCandidata | null;
  decididoPor: string | null;
  decididoEn: Date | null;
  reconocimiento: Reconocimiento;
}

async function decidirCandidataEnTx(
  tx: Consultor,
  autor: Autor,
  id: string,
  destino: DestinoCandidata,
): Promise<CambioAuditado[]> {
  const r = await tx.query(
    `UPDATE inventario.candidatas_lexico SET destino = $2, decidido_por = $3, decidido_en = now()
      WHERE id = $1 AND destino IS NULL RETURNING id`,
    [id, destino, autor.usuarioId],
  );
  if (!r.rowCount) {
    const existe = await tx.query(`SELECT 1 FROM inventario.candidatas_lexico WHERE id = $1`, [id]);
    throw new RechazoInventario<MotivoRechazoLexico>(existe.rowCount ? "ya_decidida" : "no_existe");
  }
  return [
    {
      actor: autor.correo,
      entidad: "candidatas_lexico",
      entidadId: id,
      campo: "destino",
      antes: null,
      despues: destino,
      origen: "panel",
    },
  ];
}

export async function decidirCandidata(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  id: string,
  destino: Exclude<DestinoCandidata, "lexico">,
): Promise<void> {
  await conUnidadInventario(bd, claves, async (tx) => ({
    resultado: undefined,
    cambios: await decidirCandidataEnTx(tx, autor, id, destino),
    visible: false,
  }));
}

export async function periodosCandidatas(bd: Consultor): Promise<string[]> {
  const r = await bd.query(
    `SELECT DISTINCT periodo::text AS periodo FROM inventario.candidatas_lexico ORDER BY periodo DESC`,
  );
  return r.rows.map((f) => f.periodo);
}

// Candidatas de un período con lo que el vocabulario de HOY reconoce de cada una.
export async function candidatasDelPeriodo(bd: Consultor, periodo: string): Promise<Candidata[]> {
  const [r, vocabulario] = await Promise.all([
    bd.query(
      `SELECT c.id, c.consulta, c.veces, c.cuentas, c.ultima_en, c.destino, u.correo AS decidido_por, c.decidido_en
         FROM inventario.candidatas_lexico c LEFT JOIN identidad_panel.usuarios_panel u ON u.id = c.decidido_por
        WHERE c.periodo = $1::date ORDER BY (c.destino IS NULL) DESC, c.veces DESC, c.ultima_en DESC`,
      [periodo],
    ),
    vocabularioBusqueda(bd),
  ]);
  return r.rows.map((f) => ({
    id: f.id,
    consulta: f.consulta,
    veces: f.veces,
    cuentas: f.cuentas,
    ultimaEn: f.ultima_en,
    destino: f.destino,
    decididoPor: f.decidido_por,
    decididoEn: f.decidido_en,
    reconocimiento: reconocer(f.consulta, vocabulario),
  }));
}

// ─── vocabulario de búsqueda (portal y panel, por vistas) ──────────────────────────────────
// Se lee en cada llamada: aprobar un término cambia la búsqueda siguiente sin despliegue.
export async function vocabularioBusqueda(bd: Consultor): Promise<Vocabulario> {
  const [valores, lexico] = await Promise.all([
    bd.query(`SELECT tipo, nombre FROM operacion.valores_busqueda`),
    bd.query(`SELECT termino, sinonimos, tipo, valor FROM operacion.lexico_aprobado`),
  ]);
  const terminos = new Map<
    string,
    {
      termino: string;
      sinonimos: string[];
      equivalencias: Array<{ tipo: TipoValor; nombre: string }>;
    }
  >();
  for (const f of lexico.rows) {
    const t = terminos.get(f.termino) ?? {
      termino: f.termino,
      sinonimos: f.sinonimos,
      equivalencias: [] as Array<{ tipo: TipoValor; nombre: string }>,
    };
    t.equivalencias.push({ tipo: f.tipo, nombre: f.valor });
    terminos.set(f.termino, t);
  }
  return armarVocabulario({ catalogo: valores.rows, lexico: [...terminos.values()] });
}

// La búsqueda del portal: qué entendió de la consulta con el vocabulario vigente.
export async function interpretarConsulta(
  bd: Consultor,
  consulta: string,
): Promise<Reconocimiento> {
  return reconocer(consulta, await vocabularioBusqueda(bd));
}
