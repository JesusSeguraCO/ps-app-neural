// Importación masiva desde el panel (EP-006 · sub-slice 3; docs/10-specs/importacion-masiva.md; HU-088,
// HU-086, HU-148). Lee el banco en la forma del formato (la misma que exporta y que compara el plan),
// los catálogos con que el plan valida, registra el lote calculado sin tocar `perfiles` y guarda las
// plantillas de emparejamiento. Aplicar y revertir son del worker (sub-slice 4).
import "server-only";
import type pg from "pg";
import {
  ETIQUETA_CAMPO_IMPORTACION,
  MODALIDAD_FORMATO,
  VINCULO_FORMATO,
  type ClaveCampo,
} from "@ps/dominio/importacion/campos";
import { formatearExperiencia } from "@ps/dominio/importacion/celdas";
import type { ColumnaPlantilla } from "@ps/dominio/importacion/emparejar";
import type {
  Cambio,
  Catalogos,
  FilaBanco,
  FilaMapeada,
  Grupo,
  Modo,
  Plan,
  Problema,
} from "@ps/dominio/importacion/plan";
import type { Autor } from "./catalogos-panel";
import { RechazoInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

// ─── el banco en la forma del formato ────────────────────────────────────────────────────────

// Una sola consulta: el perfil con sus hijas agregadas en orden. Sin consentimiento ni nada B.4; el
// rol es el principal (orden 1). Incluye archivados: su código existe y el plan debe reconocerlo.
export async function bancoEnFormato(bd: Consultor): Promise<FilaBanco[]> {
  const r = await bd.query(
    `SELECT p.codigo, p.estado, p.nombre, p.primer_apellido, f.nombre AS familia,
            (SELECT v.nombre FROM inventario.perfil_roles h JOIN inventario.catalogo_roles v ON v.id = h.valor_id
              WHERE h.perfil_id = p.id ORDER BY h.orden LIMIT 1) AS rol,
            s.nombre AS seniority, p.anios_experiencia,
            ARRAY(SELECT v.nombre FROM inventario.perfil_tecnologias h JOIN inventario.catalogo_tecnologias v ON v.id = h.valor_id
                   WHERE h.perfil_id = p.id ORDER BY h.orden) AS tecnologias,
            ARRAY(SELECT v.nombre FROM inventario.perfil_sectores h JOIN inventario.catalogo_sectores v ON v.id = h.valor_id
                   WHERE h.perfil_id = p.id ORDER BY h.orden) AS sectores,
            mo.nombre AS modalidad, ci.nombre AS ciudad,
            to_char(p.disponibilidad_fecha, 'YYYY-MM-DD') AS disponibilidad,
            mp.nombre AS modalidad_prueba, p.capacidad, p.anclaje, p.resumen, p.formacion, p.vinculo,
            p.idiomas, p.sello_personal, mpa.nombre AS motivo_pausa,
            COALESCE((SELECT json_agg(json_build_object('cargo', e.cargo, 'cliente', e.cliente_nombrado,
                                                        'desde', e.desde, 'hasta', e.hasta,
                                                        'descripcion', e.descripcion) ORDER BY e.orden)
                        FROM inventario.perfil_experiencias e WHERE e.perfil_id = p.id AND e.vigente), '[]') AS experiencias
       FROM inventario.perfiles p
       LEFT JOIN inventario.catalogo_familias f ON f.id = p.familia_id
       LEFT JOIN inventario.catalogo_seniorities s ON s.id = p.seniority_id
       LEFT JOIN inventario.catalogo_modalidades mo ON mo.id = p.modalidad_id
       LEFT JOIN inventario.catalogo_ciudades ci ON ci.id = p.ciudad_id
       LEFT JOIN inventario.catalogo_modalidades_prueba mp ON mp.id = p.modalidad_prueba_id
       LEFT JOIN inventario.catalogo_motivos_pausa mpa ON mpa.id = p.motivo_pausa_id
      ORDER BY p.codigo`,
  );
  return r.rows.map((p) => {
    const fila: FilaBanco = {
      codigo: p.codigo,
      estado: p.estado,
      nombre: p.nombre,
      primerApellido: p.primer_apellido,
      rol: p.rol,
      familia: p.familia,
      seniority: p.seniority,
      aniosExperiencia: p.anios_experiencia,
      tecnologias: p.tecnologias,
      sectores: p.sectores,
      modalidad: p.modalidad
        ? MODALIDAD_FORMATO[p.modalidad as keyof typeof MODALIDAD_FORMATO]
        : null,
      ciudad: p.ciudad,
      disponibilidad: p.disponibilidad,
      modalidadPrueba: p.modalidad_prueba,
      capacidad: p.capacidad,
      anclaje: p.anclaje,
      resumen: p.resumen,
      formacion: p.formacion,
      vinculo: p.vinculo ? VINCULO_FORMATO[p.vinculo as keyof typeof VINCULO_FORMATO] : null,
      idiomas: p.idiomas,
      selloPersonal: p.sello_personal,
      experiencias: (p.experiencias as Array<Parameters<typeof formatearExperiencia>[0]>).map(
        formatearExperiencia,
      ),
      motivoPausa: p.motivo_pausa,
    };
    return fila;
  });
}

// Catálogos con que el plan reconoce los valores: activos e inactivos (un perfil puede conservar uno
// desactivado y la ida y vuelta no debe verlo «nuevo»); los fusionados no, porque ya no existen.
export async function catalogosImportacion(bd: Consultor): Promise<Catalogos> {
  const nombres = async (sql: string) => (await bd.query(sql)).rows.map((f) => f.nombre as string);
  const vivo = "fusionado_en_id IS NULL";
  return {
    roles: (
      await bd.query(
        `SELECT r.nombre, f.nombre AS familia FROM inventario.catalogo_roles r
           JOIN inventario.catalogo_familias f ON f.id = r.familia_id WHERE r.${vivo} ORDER BY r.nombre`,
      )
    ).rows,
    familias: await nombres(
      `SELECT nombre FROM inventario.catalogo_familias WHERE ${vivo} ORDER BY nombre`,
    ),
    tecnologias: await nombres(
      `SELECT nombre FROM inventario.catalogo_tecnologias WHERE ${vivo} ORDER BY nombre`,
    ),
    sectores: await nombres(
      `SELECT nombre FROM inventario.catalogo_sectores WHERE ${vivo} ORDER BY nombre`,
    ),
    seniorities: await nombres(`SELECT nombre FROM inventario.catalogo_seniorities ORDER BY orden`),
    ciudades: await nombres(`SELECT nombre FROM inventario.catalogo_ciudades ORDER BY nombre`),
    modalidades: (
      await nombres(`SELECT nombre FROM inventario.catalogo_modalidades ORDER BY nombre`)
    ).map((n) => MODALIDAD_FORMATO[n as keyof typeof MODALIDAD_FORMATO] ?? n),
    modalidadesPrueba: (
      await bd.query(
        `SELECT m.nombre, f.nombre AS familia FROM inventario.catalogo_modalidades_prueba m
           JOIN inventario.catalogo_familias f ON f.id = m.familia_id WHERE m.${vivo} ORDER BY m.nombre`,
      )
    ).rows,
    motivosPausa: await nombres(
      `SELECT nombre FROM inventario.catalogo_motivos_pausa ORDER BY nombre`,
    ),
  };
}

// ─── lotes ───────────────────────────────────────────────────────────────────────────────────

export interface NuevoLote {
  archivoHash: string;
  archivoNombre?: string | null;
  formato: "csv" | "tsv" | "json";
  modo: Modo;
  emparejamiento: ColumnaPlantilla[];
  filas: readonly FilaMapeada[];
  plan: Plan;
}

// El lote nace `calculado` con una fila por fila del plan y las celdas emparejadas (nunca columnas
// B.4: `mapearFilas` no las deja pasar y la BD rechaza claves fuera del formato).
export async function registrarLote(bd: pg.Pool, autor: Autor, l: NuevoLote): Promise<string> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const id = (
      await tx.query(
        `INSERT INTO inventario.lotes_importacion
           (modo, formato, archivo_hash, total_filas, conteos, emparejamiento, bloqueado, creado_por, archivo_nombre)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          l.modo,
          l.formato,
          l.archivoHash,
          l.filas.length,
          JSON.stringify(l.plan.conteos),
          JSON.stringify(l.emparejamiento),
          l.plan.bloqueado,
          autor.usuarioId,
          l.archivoNombre?.trim() || null,
        ],
      )
    ).rows[0].id as string;
    const entrada = new Map(l.filas.map((f) => [f.numero, f]));
    for (const f of l.plan.filas)
      await tx.query(
        `INSERT INTO inventario.lote_filas
           (lote_id, numero, codigo, grupo, incluida, datos, cambios, errores, avisos, motivo_omision, rechazadas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          f.numero,
          f.codigo,
          f.grupo,
          f.incluida,
          JSON.stringify(entrada.get(f.numero)?.celdas ?? {}),
          JSON.stringify(f.cambios),
          JSON.stringify(f.errores),
          JSON.stringify(f.avisos),
          f.motivoOmision ?? null,
          JSON.stringify(entrada.get(f.numero)?.rechazadas ?? []),
        ],
      );
    await tx.query("COMMIT");
    return id;
  } catch (e) {
    await tx.query("ROLLBACK");
    throw e;
  } finally {
    tx.release();
  }
}

// «aplicando» no es un estado guardado: es un lote `calculado` ya confirmado, en la cola o en curso.
export type FaseLote = "calculado" | "aplicando" | "aplicado" | "abortado" | "revertido";

export interface LoteLeido {
  id: string;
  archivo: string | null;
  estado: string;
  fase: FaseLote;
  confirmadoPor: string | null;
  confirmadoEn: string | null;
  aplicadoEn: string | null;
  motivoAborto: string | null;
  revertidoEn: string | null;
  // La reversión está en la cola o en curso (confirmada y el lote sigue aplicado).
  revirtiendo: boolean;
  motivoReversion: string | null;
  modo: Modo;
  formato: string;
  bloqueado: boolean;
  conteos: Plan["conteos"];
  creadoEn: string;
  filas: Array<{
    numero: number;
    codigo: string | null;
    grupo: Grupo;
    incluida: boolean;
    datos: Partial<Record<ClaveCampo, string>>;
    cambios: Cambio[];
    errores: Problema[];
    avisos: Problema[];
    motivoOmision: string | null;
    // Para reconocer la fila: del perfil si existe, si no de lo que trae la fila.
    persona: { nombre: string | null; rol: string | null };
  }>;
}

export async function leerLote(bd: Consultor, id: string): Promise<LoteLeido | null> {
  const l = (
    await bd.query(
      `SELECT l.id, l.archivo_nombre, l.estado, l.modo, l.formato, l.bloqueado, l.conteos, l.creado_en, l.confirmado_en,
              l.aplicado_en, l.motivo_aborto, l.revertido_en, l.trabajo_reversion_id, l.motivo_reversion,
              u.correo AS confirmado_por
         FROM inventario.lotes_importacion l
         LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.confirmado_por
        WHERE l.id = $1`,
      [id],
    )
  ).rows[0];
  if (!l) return null;
  const filas = await bd.query(
    `SELECT f.numero, f.codigo, f.grupo, f.incluida, f.datos, f.cambios, f.errores, f.avisos, f.motivo_omision,
            NULLIF(concat_ws(' ', p.nombre, p.primer_apellido), '') AS nombre,
            (SELECT v.nombre FROM inventario.perfil_roles h JOIN inventario.catalogo_roles v ON v.id = h.valor_id
              WHERE h.perfil_id = p.id ORDER BY h.orden LIMIT 1) AS rol
       FROM inventario.lote_filas f
       LEFT JOIN inventario.perfiles p ON p.codigo = f.codigo
      WHERE f.lote_id = $1 ORDER BY f.numero`,
    [id],
  );
  return {
    id: l.id,
    archivo: l.archivo_nombre ?? null,
    estado: l.estado,
    fase: l.estado === "calculado" && l.confirmado_en ? "aplicando" : l.estado,
    confirmadoPor: l.confirmado_por ?? null,
    confirmadoEn: l.confirmado_en?.toISOString() ?? null,
    aplicadoEn: l.aplicado_en?.toISOString() ?? null,
    motivoAborto: l.motivo_aborto ?? null,
    revertidoEn: l.revertido_en?.toISOString() ?? null,
    revirtiendo: l.estado === "aplicado" && l.trabajo_reversion_id !== null,
    motivoReversion: l.motivo_reversion ?? null,
    modo: l.modo,
    formato: l.formato,
    bloqueado: l.bloqueado,
    conteos: l.conteos,
    creadoEn: l.creado_en.toISOString(),
    filas: filas.rows.map((f) => ({
      numero: f.numero,
      codigo: f.codigo,
      grupo: f.grupo,
      incluida: f.incluida,
      datos: f.datos,
      cambios: f.cambios,
      errores: f.errores,
      avisos: f.avisos,
      motivoOmision: f.motivo_omision,
      persona: {
        nombre:
          f.nombre ??
          ([f.datos.nombre, f.datos.primerApellido].filter(Boolean).join(" ") || null),
        rol: f.rol ?? f.datos.rol ?? null,
      },
    })),
  };
}

// Lo necesario para recalcular el plan de un lote (desmarcar tarjetas, cambiar el modo): sus filas
// tal como se emparejaron, con las columnas rechazadas.
export async function filasDelLote(
  bd: Consultor,
  id: string,
): Promise<{ estado: string; modo: Modo; filas: FilaMapeada[] } | null> {
  const l = (
    await bd.query(
      `SELECT estado, modo, emparejamiento FROM inventario.lotes_importacion WHERE id = $1`,
      [id],
    )
  ).rows[0];
  if (!l) return null;
  const r = await bd.query(
    `SELECT numero, datos, rechazadas FROM inventario.lote_filas WHERE lote_id = $1 ORDER BY numero`,
    [id],
  );
  // JSONB no guarda el orden de las claves: se repone el de las columnas de la hoja (el del
  // emparejamiento), para que la fila cruda de un error se lea igual que antes de recalcular.
  const orden = (l.emparejamiento as ColumnaPlantilla[])
    .map((c) => c.clave)
    .filter((c): c is ClaveCampo => c !== null);
  const enOrden = (datos: Partial<Record<ClaveCampo, string>>) => {
    const celdas: Partial<Record<ClaveCampo, string>> = {};
    for (const c of orden) if (c in datos) celdas[c] = datos[c];
    for (const [c, v] of Object.entries(datos) as Array<[ClaveCampo, string]>)
      if (!(c in celdas)) celdas[c] = v;
    return celdas;
  };
  return {
    estado: l.estado,
    modo: l.modo,
    filas: r.rows.map((f) =>
      f.rechazadas.length
        ? { numero: f.numero, celdas: enOrden(f.datos), rechazadas: f.rechazadas }
        : { numero: f.numero, celdas: enOrden(f.datos) },
    ),
  };
}

// Reescribe el plan de un lote que sigue `calculado` (bloqueado con FOR UPDATE: un aplicar en curso
// del sub-slice 4 no ve un plan a medias).
export async function actualizarPlanLote(
  bd: pg.Pool,
  id: string,
  modo: Modo,
  plan: Plan,
): Promise<void> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const l = (
      await tx.query(`SELECT estado FROM inventario.lotes_importacion WHERE id = $1 FOR UPDATE`, [
        id,
      ])
    ).rows[0];
    if (!l) throw new RechazoInventario("no_existe");
    if (l.estado !== "calculado")
      throw new RechazoInventario("lote_no_calculado", { estado: l.estado });
    await tx.query(
      `UPDATE inventario.lotes_importacion SET modo = $2, conteos = $3, bloqueado = $4, actualizado_en = now()
        WHERE id = $1`,
      [id, modo, JSON.stringify(plan.conteos), plan.bloqueado],
    );
    for (const f of plan.filas)
      await tx.query(
        `UPDATE inventario.lote_filas
            SET grupo = $3, incluida = $4, cambios = $5, errores = $6, avisos = $7, motivo_omision = $8
          WHERE lote_id = $1 AND numero = $2`,
        [
          id,
          f.numero,
          f.grupo,
          f.incluida,
          JSON.stringify(f.cambios),
          JSON.stringify(f.errores),
          JSON.stringify(f.avisos),
          f.motivoOmision ?? null,
        ],
      );
    await tx.query("COMMIT");
  } catch (e) {
    await tx.query("ROLLBACK");
    throw e;
  } finally {
    tx.release();
  }
}

// ─── plantillas de emparejamiento (HU-148) ───────────────────────────────────────────────────

export interface PlantillaGuardada {
  id: string;
  nombre: string;
  columnas: ColumnaPlantilla[];
  autor: string;
  actualizadaEn: string;
}

const VIOLACION_UNICA = "23505";

export async function guardarPlantilla(
  bd: Consultor,
  autor: Autor,
  p: { nombre: string; columnas: ColumnaPlantilla[] },
): Promise<PlantillaGuardada> {
  try {
    const r = await bd.query(
      `INSERT INTO inventario.plantillas_emparejamiento (nombre, columnas, creada_por, actualizada_por)
       VALUES ($1, $2, $3, $3) RETURNING id, nombre, columnas, actualizada_en`,
      [p.nombre.trim(), JSON.stringify(p.columnas), autor.usuarioId],
    );
    const f = r.rows[0];
    return {
      id: f.id,
      nombre: f.nombre,
      columnas: f.columnas,
      autor: autor.correo,
      actualizadaEn: f.actualizada_en.toISOString(),
    };
  } catch (e) {
    if ((e as { code?: string }).code === VIOLACION_UNICA)
      throw new RechazoInventario("nombre_repetido", { nombre: p.nombre.trim() });
    throw e;
  }
}

export async function listarPlantillas(bd: Consultor): Promise<PlantillaGuardada[]> {
  const r = await bd.query(
    `SELECT p.id, p.nombre, p.columnas, u.correo AS autor, p.actualizada_en
       FROM inventario.plantillas_emparejamiento p
       JOIN identidad_panel.usuarios_panel u ON u.id = p.actualizada_por
      ORDER BY p.nombre`,
  );
  return r.rows.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    columnas: f.columnas,
    autor: f.autor,
    actualizadaEn: f.actualizada_en.toISOString(),
  }));
}

export async function leerPlantilla(bd: Consultor, id: string): Promise<PlantillaGuardada | null> {
  return (await listarPlantillas(bd)).find((p) => p.id === id) ?? null;
}

// Perfiles del banco (todos los estados): lo que trae la exportación.
export async function contarBanco(bd: Consultor): Promise<number> {
  return (await bd.query(`SELECT count(*)::int AS n FROM inventario.perfiles`)).rows[0].n;
}

// ─── confirmar (HU-141): quién confirma y el trabajo que lo aplica ──────────────────────────

// Fija quién confirmó (el actor de cada cambio auditado) y encola `aplicar_importacion` una sola vez:
// confirmar dos veces devuelve el mismo trabajo. Nada se escribe en `perfiles` aquí.
export async function confirmarLote(
  bd: pg.Pool,
  autor: Autor,
  id: string,
): Promise<{ trabajoId: string }> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const l = (
      await tx.query(
        `SELECT estado, bloqueado, trabajo_id FROM inventario.lotes_importacion WHERE id = $1 FOR UPDATE`,
        [id],
      )
    ).rows[0];
    if (!l) throw new RechazoInventario("no_existe");
    if (l.trabajo_id) {
      await tx.query("COMMIT");
      return { trabajoId: String(l.trabajo_id) };
    }
    if (l.estado !== "calculado")
      throw new RechazoInventario("lote_no_calculado", { estado: l.estado });
    if (l.bloqueado) throw new RechazoInventario("codigo_repetido");
    const aplicables = (
      await tx.query(
        `SELECT count(*)::int AS n FROM inventario.lote_filas
          WHERE lote_id = $1 AND incluida AND grupo IN ('nuevo', 'actualizado', 'archivado')`,
        [id],
      )
    ).rows[0].n as number;
    if (!aplicables) throw new RechazoInventario("nada_que_aplicar");
    const trabajo = (
      await tx.query(`SELECT operacion.encolar_panel('aplicar_importacion', $1) AS id`, [
        JSON.stringify({ lote: id }),
      ])
    ).rows[0].id;
    await tx.query(
      `UPDATE inventario.lotes_importacion
          SET confirmado_por = $2, confirmado_en = now(), trabajo_id = $3, actualizado_en = now()
        WHERE id = $1`,
      [id, autor.usuarioId, trabajo],
    );
    await tx.query("COMMIT");
    return { trabajoId: String(trabajo) };
  } catch (e) {
    await tx.query("ROLLBACK");
    throw e;
  } finally {
    tx.release();
  }
}

// ─── historial (spec §7): quién, cuándo, modo y conteos de cada importación confirmada ────────

export interface LoteHistorial {
  id: string;
  archivo: string | null;
  fase: FaseLote;
  modo: Modo;
  formato: string;
  // Lo que se aplicó: solo las filas incluidas (las con error cuentan siempre), igual que el
  // resultado del lote. Las que la persona excluyó van aparte.
  conteos: Plan["conteos"];
  excluidas: number;
  confirmadoPor: string | null;
  confirmadoEn: string;
  aplicadoEn: string | null;
  revertidoEn: string | null;
  motivoAborto: string | null;
}

export async function listarLotes(bd: Consultor, limite = 50): Promise<LoteHistorial[]> {
  const r = await bd.query(
    `SELECT l.id, l.archivo_nombre, l.estado, l.modo, l.formato, l.confirmado_en, l.aplicado_en, l.revertido_en,
            l.motivo_aborto, u.correo, c.*
       FROM inventario.lotes_importacion l
       LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.confirmado_por
       CROSS JOIN LATERAL (
         SELECT count(*) FILTER (WHERE f.incluida AND f.grupo = 'nuevo')::int AS nuevos,
                count(*) FILTER (WHERE f.incluida AND f.grupo = 'actualizado')::int AS actualizados,
                count(*) FILTER (WHERE f.incluida AND f.grupo = 'archivado')::int AS archivados,
                count(*) FILTER (WHERE f.incluida AND f.grupo = 'sin_cambios')::int AS sin_cambios,
                count(*) FILTER (WHERE f.incluida AND f.grupo = 'omitido')::int AS omitidos,
                count(*) FILTER (WHERE f.grupo = 'con_error')::int AS con_error,
                count(*) FILTER (WHERE NOT f.incluida AND f.grupo <> 'con_error')::int AS excluidas
           FROM inventario.lote_filas f WHERE f.lote_id = l.id
       ) c
      WHERE l.confirmado_en IS NOT NULL
      ORDER BY l.confirmado_en DESC LIMIT $1`,
    [limite],
  );
  return r.rows.map((l) => ({
    id: l.id,
    archivo: l.archivo_nombre ?? null,
    fase: l.estado === "calculado" ? "aplicando" : l.estado,
    modo: l.modo,
    formato: l.formato,
    conteos: {
      nuevos: l.nuevos,
      actualizados: l.actualizados,
      archivados: l.archivados,
      sin_cambios: l.sin_cambios,
      omitidos: l.omitidos,
      con_error: l.con_error,
    },
    excluidas: l.excluidas,
    confirmadoPor: l.correo ?? null,
    confirmadoEn: l.confirmado_en.toISOString(),
    aplicadoEn: l.aplicado_en?.toISOString() ?? null,
    revertidoEn: l.revertido_en?.toISOString() ?? null,
    motivoAborto: l.motivo_aborto ?? null,
  }));
}

// ─── filas con error (HU-142) ────────────────────────────────────────────────────────────────

export interface ErroresDelLote {
  formato: "csv" | "tsv" | "json";
  // Las columnas que se importaron, con su nombre original y en su orden.
  encabezados: string[];
  filas: Array<{ numero: number; celdas: string[]; motivo: string }>;
  total: number;
  // Ninguna fila se pudo procesar.
  todas: boolean;
  // Si el problema es del archivo entero y no de cada fila, por qué.
  causaComun: string | null;
}

export async function erroresDelLote(bd: Consultor, id: string): Promise<ErroresDelLote | null> {
  const l = (
    await bd.query(
      `SELECT formato, emparejamiento, total_filas FROM inventario.lotes_importacion WHERE id = $1`,
      [id],
    )
  ).rows[0];
  if (!l) return null;
  const columnas = (l.emparejamiento as ColumnaPlantilla[]).filter((c) => c.clave !== null);
  const columnaDe = new Map(columnas.map((c) => [c.clave as ClaveCampo, c.columna]));
  const r = await bd.query(
    `SELECT numero, datos, errores FROM inventario.lote_filas
      WHERE lote_id = $1 AND grupo = 'con_error' ORDER BY numero`,
    [id],
  );
  const filas = r.rows.map((f) => ({
    numero: f.numero as number,
    celdas: columnas.map((c) => (f.datos as Record<string, string>)[c.clave as string] ?? ""),
    motivo: (f.errores as Problema[])
      .map((e) =>
        e.campo
          ? `${columnaDe.get(e.campo) ?? ETIQUETA_CAMPO_IMPORTACION[e.campo]}: ${e.mensaje}`
          : e.mensaje,
      )
      .join("; "),
  }));
  const todas = filas.length === l.total_filas;
  const causaComun = !columnaDe.has("codigo")
    ? "Ninguna columna es el código: sin él no se puede reconocer ningún perfil"
    : todas && filas.length > 1 && filas.every((f) => f.motivo === filas[0]!.motivo)
      ? filas[0]!.motivo
      : null;
  return {
    formato: l.formato,
    encabezados: columnas.map((c) => c.columna),
    filas,
    total: l.total_filas,
    todas,
    causaComun,
  };
}
