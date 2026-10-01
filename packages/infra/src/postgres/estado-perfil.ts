// Disponibilidad, pausa, reactivación, archivo y bandeja de vigencia (HU-132, HU-133, HU-136; diseño §2;
// RF-8.14). Cada perfil va en su propia unidad de trabajo: en bloque, uno que no aplica no aborta a los
// demás y el resultado es por perfil. Todo cambio audita su campo con el autor y, si el perfil está a la
// vista, sube la versión del inventario (el portal ve la banda nueva de inmediato).
import "server-only";
import type pg from "pg";
import { transicion, type EstadoAlmacenado } from "@ps/dominio/inventario/estados";
import {
  fechaDeOpcionDisponibilidad,
  type OpcionDisponibilidad,
} from "@ps/dominio/inventario/perfil";
import { bandejaDeVigencia, type BandejaVigencia } from "@ps/dominio/inventario/vigencia";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { leerPerfil, type PerfilEditor } from "./perfiles-panel";
import { RechazoInventario, conUnidadInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

export const TOPE_BLOQUE = 200;

// `confirmar`: la fecha sigue siendo la misma; solo se renueva cuándo se revisó (bandeja, HU-136).
export type CambioDisponibilidad =
  { opcion: OpcionDisponibilidad } | { fecha: string } | { confirmar: true };

export type ResultadoDisponibilidad =
  | { codigo: string; ok: true; fecha: string | null }
  | { codigo: string; ok: false; motivo: "no_existe" | "no_aplica" | "sin_fecha"; estado?: string };

const visible = (e: EstadoAlmacenado) => e === "publicado" || e === "colocado";
// La disponibilidad aplica a lo que está o puede estar en el banco a la vista. A un pausado se le puede
// poner una fecha desde su fila (uno a la vez): queda la contradicción ALTA señalada con su salida
// (HU-134, D6). En bloque no aplica, para no crear contradicciones en masa sin verlas (D32).
const ADMITE_DISPONIBILIDAD = new Set<EstadoAlmacenado>(["borrador", "publicado", "colocado"]);

const cambio = (
  autor: Autor,
  fila: { id: string },
  codigo: string,
  campo: string,
  antes: string | null,
  despues: string | null,
): CambioAuditado => ({
  actor: autor.correo,
  entidad: "perfiles",
  entidadId: fila.id,
  campo,
  titular: codigo,
  antes,
  despues,
  origen: "panel",
});

async function bloquear(tx: Consultor, codigo: string) {
  const f = (
    await tx.query(
      `SELECT p.id, p.estado, p.version, p.disponibilidad_fecha::text AS disponibilidad_fecha,
              p.disponibilidad_actualizada_en, p.fecha_liberacion::text AS fecha_liberacion,
              m.nombre AS motivo
         FROM inventario.perfiles p
         LEFT JOIN inventario.catalogo_motivos_pausa m ON m.id = p.motivo_pausa_id
        WHERE p.codigo = $1 FOR UPDATE OF p`,
      [codigo],
    )
  ).rows[0];
  if (!f) throw new RechazoInventario("no_existe");
  return f as {
    id: string;
    estado: EstadoAlmacenado;
    version: number;
    disponibilidad_fecha: string | null;
    disponibilidad_actualizada_en: Date | null;
    fecha_liberacion: string | null;
    motivo: string | null;
  };
}

// Deja la disponibilidad vacía (pausar, archivar, «Quitar la disponibilidad»): la matriz D5 marca ALTA
// a un pausado o archivado con cualquier disponibilidad (D32).
async function vaciarDisponibilidad(
  tx: Consultor,
  autor: Autor,
  codigo: string,
  f: Awaited<ReturnType<typeof bloquear>>,
): Promise<CambioAuditado[]> {
  if (!f.disponibilidad_fecha) return [];
  await tx.query(`UPDATE inventario.perfiles SET disponibilidad_fecha = NULL WHERE id = $1`, [
    f.id,
  ]);
  return [cambio(autor, f, codigo, "disponibilidad_fecha", f.disponibilidad_fecha, null)];
}

// Escribe la disponibilidad dentro de una unidad ya abierta y devuelve lo que hay que auditar.
async function escribirDisponibilidad(
  tx: Consultor,
  autor: Autor,
  codigo: string,
  f: Awaited<ReturnType<typeof bloquear>>,
  c: CambioDisponibilidad,
  ahora: Date,
): Promise<{ fecha: string | null; cambios: CambioAuditado[] }> {
  const fecha =
    "confirmar" in c
      ? f.disponibilidad_fecha
      : "fecha" in c
        ? c.fecha
        : fechaDeOpcionDisponibilidad(c.opcion, ahora);
  if (!fecha) throw new RechazoInventario("sin_fecha");
  await tx.query(
    `UPDATE inventario.perfiles SET disponibilidad_fecha = $2, disponibilidad_actualizada_en = $3 WHERE id = $1`,
    [f.id, fecha, ahora],
  );
  const cambios = [
    cambio(
      autor,
      f,
      codigo,
      "disponibilidad_actualizada_en",
      f.disponibilidad_actualizada_en?.toISOString() ?? null,
      ahora.toISOString(),
    ),
  ];
  if (fecha !== f.disponibilidad_fecha)
    cambios.unshift(
      cambio(autor, f, codigo, "disponibilidad_fecha", f.disponibilidad_fecha, fecha),
    );
  return { fecha, cambios };
}

export async function actualizarDisponibilidad(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigos: string[],
  c: CambioDisponibilidad,
  ahora = new Date(),
): Promise<ResultadoDisponibilidad[]> {
  const unicos = [...new Set(codigos)];
  if (unicos.length > TOPE_BLOQUE)
    throw new RechazoInventario("lote_demasiado_grande", { tope: TOPE_BLOQUE });
  const resultados: ResultadoDisponibilidad[] = [];
  for (const codigo of unicos) {
    try {
      const fecha = await conUnidadInventario(bd, claves, async (tx) => {
        const f = await bloquear(tx, codigo);
        const pausadoSolo = f.estado === "pausado" && unicos.length === 1;
        if (!ADMITE_DISPONIBILIDAD.has(f.estado) && !pausadoSolo)
          throw new RechazoInventario("no_aplica", { estado: f.estado });
        const r = await escribirDisponibilidad(tx, autor, codigo, f, c, ahora);
        return { resultado: r.fecha, cambios: r.cambios, visible: visible(f.estado) };
      });
      resultados.push({ codigo, ok: true, fecha });
    } catch (e) {
      if (!(e instanceof RechazoInventario)) throw e;
      resultados.push({
        codigo,
        ok: false,
        motivo: e.motivo as "no_existe" | "no_aplica" | "sin_fecha",
        ...(typeof e.detalle.estado === "string" ? { estado: e.detalle.estado } : {}),
      });
    }
  }
  return resultados;
}

export interface MotivoPausa {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export async function listarMotivosPausa(bd: Consultor): Promise<MotivoPausa[]> {
  return (
    await bd.query(
      `SELECT id, nombre, descripcion FROM inventario.catalogo_motivos_pausa
        WHERE activo AND fusionado_en_id IS NULL ORDER BY nombre`,
    )
  ).rows;
}

// Pausar (HU-133): solo lo que está a la vista, con un motivo activo del catálogo. Sale del portal; el
// disparador de la 0019 guarda desde cuándo.
export async function pausarPerfil(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  motivoId: string,
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const f = await bloquear(tx, codigo);
    const t = transicion(f.estado, "pausar");
    if (!t.ok) throw new RechazoInventario("transicion_invalida", { estado: f.estado });
    const m = (
      await tx.query(
        `SELECT nombre FROM inventario.catalogo_motivos_pausa WHERE id = $1 AND activo AND fusionado_en_id IS NULL`,
        [motivoId],
      )
    ).rows[0];
    if (!m) throw new RechazoInventario("motivo_no_disponible");
    await tx.query(
      `UPDATE inventario.perfiles SET estado = 'pausado', motivo_pausa_id = $2, fecha_liberacion = NULL WHERE id = $1`,
      [f.id, motivoId],
    );
    const vaciada = await vaciarDisponibilidad(tx, autor, codigo, f);
    return {
      resultado: (await leerPerfil(tx, codigo))!,
      cambios: [
        ...vaciada,
        cambio(autor, f, codigo, "estado", f.estado, "pausado"),
        cambio(autor, f, codigo, "motivo_pausa", f.motivo, m.nombre),
      ],
      visible: true,
    };
  });
}

// Reactivar (HU-133 edge, HU-136): un pausado vuelve a publicado con su disponibilidad al día, si
// cumple las guardas de publicar (consentimiento, modalidad, obligatorios); si no, dice qué falta.
export async function reactivarPerfil(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  c: CambioDisponibilidad,
  ahora = new Date(),
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const f = await bloquear(tx, codigo);
    const t = transicion(f.estado, "reactivar");
    if (!t.ok) throw new RechazoInventario("transicion_invalida", { estado: f.estado });
    const d = await escribirDisponibilidad(tx, autor, codigo, f, c, ahora);
    const antes = (await leerPerfil(tx, codigo))!;
    if (!antes.evaluacion.publicable)
      throw new RechazoInventario("no_publicable", {
        evaluacion: antes.evaluacion,
        familia: antes.familia,
      });
    await tx.query(`UPDATE inventario.perfiles SET estado = 'publicado' WHERE id = $1`, [f.id]);
    return {
      resultado: (await leerPerfil(tx, codigo))!,
      cambios: [
        ...d.cambios,
        cambio(autor, f, codigo, "estado", f.estado, "publicado"),
        cambio(autor, f, codigo, "motivo_pausa", f.motivo, null),
      ],
      visible: true,
    };
  });
}

// Archivar (HU-135, que el sub-slice 8 completa; aquí desde la bandeja, HU-133 edge): «eliminar» sin
// borrar. Repetirlo informa sin escribir nada.
export async function archivarPerfil(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
): Promise<{ yaArchivado: boolean; perfil: PerfilEditor }> {
  return conUnidadInventario<{ yaArchivado: boolean; perfil: PerfilEditor }>(
    bd,
    claves,
    async (tx) => {
      const f = await bloquear(tx, codigo);
      const t = transicion(f.estado, "archivar");
      if (!t.ok)
        return {
          resultado: { yaArchivado: true, perfil: (await leerPerfil(tx, codigo))! },
          cambios: [],
          visible: false,
        };
      await tx.query(
        `UPDATE inventario.perfiles SET estado = 'archivado', archivado_en = now(), fecha_liberacion = NULL WHERE id = $1`,
        [f.id],
      );
      const cambios = [
        ...(await vaciarDisponibilidad(tx, autor, codigo, f)),
        cambio(autor, f, codigo, "estado", f.estado, "archivado"),
      ];
      if (f.motivo) cambios.push(cambio(autor, f, codigo, "motivo_pausa", f.motivo, null));
      return {
        resultado: { yaArchivado: false, perfil: (await leerPerfil(tx, codigo))! },
        cambios,
        visible: visible(f.estado),
      };
    },
  );
}

// «Quitar la disponibilidad» (HU-134): la salida de un pausado o archivado con fecha. A lo que está a la
// vista no se le quita: quedaría publicado sin disponibilidad (otra ALTA).
export async function quitarDisponibilidad(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const f = await bloquear(tx, codigo);
    if (f.estado !== "pausado" && f.estado !== "archivado")
      throw new RechazoInventario("no_aplica", { estado: f.estado });
    const cambios = await vaciarDisponibilidad(tx, autor, codigo, f);
    return { resultado: (await leerPerfil(tx, codigo))!, cambios, visible: false };
  });
}

// «Usar la fecha de liberación» (HU-134): un colocado con «Disponible ahora» pasa a mostrar la fecha en
// que queda libre (RF-8.13.2).
export async function usarFechaLiberacion(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  ahora = new Date(),
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const f = await bloquear(tx, codigo);
    if (!f.fecha_liberacion) throw new RechazoInventario("no_aplica", { estado: f.estado });
    const d = await escribirDisponibilidad(
      tx,
      autor,
      codigo,
      f,
      { fecha: f.fecha_liberacion },
      ahora,
    );
    return {
      resultado: (await leerPerfil(tx, codigo))!,
      cambios: d.cambios,
      visible: visible(f.estado),
    };
  });
}

// ─── bandeja de vigencia (HU-136) ───────────────────────────────────────────────────────────

export interface PerfilEnBandeja {
  nombre: string;
  rol: string | null;
  seniority: string | null;
  estado: EstadoAlmacenado;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: string | null;
  pausadoEn: string | null;
  motivoPausa: string | null;
  // En cuántos enlaces curados activos y vigentes está: a quién afecta lo que ve el cliente.
  enlacesActivos: number;
}

export async function listarVigencia(
  bd: Consultor,
  ahora = new Date(),
): Promise<BandejaVigencia & { perfiles: Record<string, PerfilEnBandeja> }> {
  const filas = (
    await bd.query(
      `SELECT p.codigo, p.nombre, p.primer_apellido, p.estado, p.disponibilidad_fecha::text AS disponibilidad_fecha,
              p.disponibilidad_actualizada_en, p.pausado_en, m.nombre AS motivo, s.nombre AS seniority,
              (SELECT r.nombre FROM inventario.perfil_roles h JOIN inventario.catalogo_roles r ON r.id = h.valor_id
                WHERE h.perfil_id = p.id ORDER BY h.orden LIMIT 1) AS rol,
              (SELECT count(*)::int FROM identidad.enlaces e
                WHERE e.estado = 'activo' AND now() >= e.vigente_desde AND now() < e.vigente_hasta
                  AND p.codigo = ANY (e.codigos_perfil)) AS enlaces_activos
         FROM inventario.perfiles p
         LEFT JOIN inventario.catalogo_motivos_pausa m ON m.id = p.motivo_pausa_id
         LEFT JOIN inventario.catalogo_seniorities s ON s.id = p.seniority_id
        WHERE p.estado IN ('publicado', 'colocado', 'pausado')`,
    )
  ).rows;
  const nombre = (f: (typeof filas)[number]) =>
    [f.nombre, f.primer_apellido].filter(Boolean).join(" ") || f.codigo;
  const bandeja = bandejaDeVigencia(
    filas.map((f) => ({
      codigo: f.codigo,
      nombre: nombre(f),
      estado: f.estado,
      disponibilidadFecha: f.disponibilidad_fecha,
      disponibilidadActualizadaEn: f.disponibilidad_actualizada_en,
      pausadoEn: f.pausado_en,
      motivoPausa: f.motivo,
    })),
    ahora,
  );
  const perfiles: Record<string, PerfilEnBandeja> = {};
  for (const f of filas)
    perfiles[f.codigo] = {
      nombre: nombre(f),
      rol: f.rol,
      seniority: f.seniority,
      estado: f.estado,
      disponibilidadFecha: f.disponibilidad_fecha,
      disponibilidadActualizadaEn: f.disponibilidad_actualizada_en?.toISOString() ?? null,
      pausadoEn: f.pausado_en?.toISOString() ?? null,
      motivoPausa: f.motivo,
      enlacesActivos: f.enlaces_activos,
    };
  return { ...bandeja, perfiles };
}
