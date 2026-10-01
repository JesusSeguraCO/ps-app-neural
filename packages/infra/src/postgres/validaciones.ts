// Reporte de validación técnica (HU-140, HU-130 edge; diseño §4 con D11, D29, D30; T-2). El borrador
// se precarga desde la modalidad de prueba elegida con `borradorDesdeModalidad` —determinista, sin red
// ni modelo— y queda para la revisión de la persona: lo que corrige pasa a ser suyo, escribe evaluador,
// fecha y resultado, y confirma o descarta. Confirmar enriquece la ficha del portal (la vista toma la
// última confirmada de la modalidad elegida) sin tocar el estado ni la versión del perfil, y se audita
// con su autor; descartar no deja nada en la ficha ni en la auditoría. Sin artefacto (D29).
import "server-only";
import type pg from "pg";
import {
  borradorDesdeModalidad,
  faltaParaConfirmar,
  origenTrasEdicion,
  type CamposPlantilla,
  type OrigenPorCampo,
} from "@ps/dominio/inventario/validacion";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { leerPerfil, type PerfilEditor } from "./perfiles-panel";
import { RechazoInventario, conUnidadInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

export interface BorradorEditor extends CamposPlantilla {
  id: string;
  codigo: string;
  modalidad: { id: string; nombre: string };
  plantilla: CamposPlantilla;
  origen: OrigenPorCampo;
  evaluador: string | null;
  fecha: string | null;
  resultado: string | null;
  creadaEn: string;
}

export interface EntradaReporte extends CamposPlantilla {
  evaluador?: string | null;
  fecha?: string | null;
  resultado?: string | null;
}

const texto = (s: string | null | undefined) => {
  const t = s?.trim();
  return t ? t : null;
};
const criterios = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))];

const SELECCION = `SELECT x.id, p.codigo, x.modalidad_prueba_id, m.nombre AS modalidad_nombre, x.enunciado_reto,
       x.entregables, x.criterios, x.plantilla, x.origen, x.evaluador, x.fecha::text AS fecha,
       x.resultado, x.creada_en
  FROM inventario.validaciones x
  JOIN inventario.perfiles p ON p.id = x.perfil_id
  JOIN inventario.catalogo_modalidades_prueba m ON m.id = x.modalidad_prueba_id`;

function aBorrador(f: pg.QueryResultRow): BorradorEditor {
  return {
    id: f.id,
    codigo: f.codigo,
    modalidad: { id: f.modalidad_prueba_id, nombre: f.modalidad_nombre },
    enunciadoReto: f.enunciado_reto,
    entregables: f.entregables,
    criterios: f.criterios,
    plantilla: f.plantilla,
    origen: f.origen,
    evaluador: f.evaluador,
    fecha: f.fecha,
    resultado: f.resultado,
    creadaEn: (f.creada_en as Date).toISOString(),
  };
}

export async function leerBorrador(bd: Consultor, codigo: string): Promise<BorradorEditor | null> {
  const f = (await bd.query(`${SELECCION} WHERE p.codigo = $1 AND x.estado = 'borrador'`, [codigo]))
    .rows[0];
  return f ? aBorrador(f) : null;
}

async function perfilBloqueado(tx: Consultor, codigo: string) {
  const p = (
    await tx.query(
      `SELECT p.id, p.estado, p.modalidad_prueba_id, m.nombre, m.enunciado_reto, m.entregables, m.criterios
         FROM inventario.perfiles p
         LEFT JOIN inventario.catalogo_modalidades_prueba m ON m.id = p.modalidad_prueba_id
        WHERE p.codigo = $1 FOR UPDATE OF p`,
      [codigo],
    )
  ).rows[0];
  if (!p) throw new RechazoInventario("no_existe");
  if (p.estado === "archivado") throw new RechazoInventario("archivado");
  return p;
}

// El borrador pendiente, o uno nuevo desde la modalidad elegida. Sin modalidad no hay borrador.
export async function pedirBorrador(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
): Promise<BorradorEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const p = await perfilBloqueado(tx, codigo);
    const pendiente = await leerBorrador(tx, codigo);
    if (pendiente) return { resultado: pendiente, cambios: [], visible: false };
    const r = borradorDesdeModalidad(
      p.modalidad_prueba_id
        ? {
            id: p.modalidad_prueba_id,
            nombre: p.nombre,
            enunciadoReto: p.enunciado_reto,
            entregables: p.entregables,
            criterios: p.criterios,
          }
        : null,
    );
    if (!r.ok) throw new RechazoInventario(r.motivo);
    const { modalidadId, origen, ...plantilla } = r.borrador;
    await tx.query(
      `INSERT INTO inventario.validaciones
         (perfil_id, modalidad_prueba_id, enunciado_reto, entregables, criterios, plantilla, origen, creada_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        p.id,
        modalidadId,
        plantilla.enunciadoReto,
        plantilla.entregables,
        plantilla.criterios,
        JSON.stringify(plantilla),
        JSON.stringify(origen),
        autor.usuarioId,
      ],
    );
    return { resultado: (await leerBorrador(tx, codigo))!, cambios: [], visible: false };
  });
}

async function borradorBloqueado(tx: Consultor, codigo: string, id: string) {
  const f = (
    await tx.query(
      `SELECT x.*, x.fecha::text AS fecha FROM inventario.validaciones x
         JOIN inventario.perfiles p ON p.id = x.perfil_id
        WHERE x.id = $1 AND p.codigo = $2 FOR UPDATE OF x`,
      [id, codigo],
    )
  ).rows[0];
  if (!f) throw new RechazoInventario("no_existe");
  if (f.estado !== "borrador")
    throw new RechazoInventario("borrador_resuelto", { estado: f.estado });
  return f;
}

async function escribirCampos(
  tx: Consultor,
  id: string,
  plantilla: CamposPlantilla,
  e: EntradaReporte,
) {
  const valores: CamposPlantilla = {
    enunciadoReto: e.enunciadoReto.trim(),
    entregables: e.entregables.trim(),
    criterios: criterios(e.criterios),
  };
  await tx.query(
    `UPDATE inventario.validaciones
        SET enunciado_reto = $2, entregables = $3, criterios = $4, origen = $5,
            evaluador = $6, fecha = $7, resultado = $8
      WHERE id = $1`,
    [
      id,
      valores.enunciadoReto,
      valores.entregables,
      valores.criterios,
      JSON.stringify(origenTrasEdicion(plantilla, valores)),
      texto(e.evaluador),
      e.fecha || null,
      texto(e.resultado),
    ],
  );
}

// Guardar sin confirmar: nada llega a la ficha.
export async function guardarBorrador(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  _autor: Autor,
  codigo: string,
  id: string,
  e: EntradaReporte,
): Promise<BorradorEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    await perfilBloqueado(tx, codigo);
    const f = await borradorBloqueado(tx, codigo, id);
    await escribirCampos(tx, id, f.plantilla, e);
    return { resultado: (await leerBorrador(tx, codigo))!, cambios: [], visible: false };
  });
}

// Confirmar (HU-140 «nunca se publica sin que yo lo confirme»; HU-130 edge): exige la revisión y lo que
// escribe la persona, y que el perfil siga con la modalidad del borrador. La ficha se enriquece sin
// republicar: el estado y la versión del perfil no cambian.
export async function confirmarBorrador(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  id: string,
  e: EntradaReporte & { revisado: boolean },
  hoy: string,
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const p = await perfilBloqueado(tx, codigo);
    const f = await borradorBloqueado(tx, codigo, id);
    if (f.modalidad_prueba_id !== p.modalidad_prueba_id)
      throw new RechazoInventario("modalidad_cambio");
    const faltan = faltaParaConfirmar(
      {
        enunciadoReto: e.enunciadoReto,
        entregables: e.entregables,
        criterios: e.criterios,
        evaluador: e.evaluador ?? null,
        fecha: e.fecha ?? null,
        resultado: e.resultado ?? null,
        revisado: e.revisado,
      },
      hoy,
    );
    if (faltan.length) throw new RechazoInventario("reporte_incompleto", { faltan });
    await escribirCampos(tx, id, f.plantilla, e);
    await tx.query(
      `UPDATE inventario.validaciones SET estado = 'confirmada', confirmada_por = $2, confirmada_en = now() WHERE id = $1`,
      [id, autor.usuarioId],
    );
    const v = (
      await tx.query(
        `SELECT enunciado_reto, entregables, criterios, origen, evaluador, fecha::text AS fecha, resultado
           FROM inventario.validaciones WHERE id = $1`,
        [id],
      )
    ).rows[0];
    const cambio = (
      campo: string,
      antes: string | null,
      despues: string | null,
    ): CambioAuditado => ({
      actor: autor.correo,
      entidad: "validaciones",
      entidadId: id,
      campo,
      titular: codigo,
      antes,
      despues,
      origen: "panel",
    });
    const cambios = [
      cambio("estado", "borrador", "confirmada"),
      cambio("enunciado_reto", null, v.enunciado_reto),
      cambio("entregables", null, v.entregables),
      cambio("criterios", null, JSON.stringify(v.criterios)),
      cambio("origen", null, JSON.stringify(v.origen)),
      cambio("evaluador", null, v.evaluador),
      cambio("fecha", null, v.fecha),
      cambio("resultado", null, v.resultado),
    ];
    // Si el perfil está a la vista, el cliente ve el reporte: sube la versión del inventario.
    const visible = p.estado === "publicado";
    return { resultado: (await leerPerfil(tx, codigo))!, cambios, visible };
  });
}

// Descartar: el borrador queda descartado y la ficha no recibe ningún campo suyo.
export async function descartarBorrador(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  _autor: Autor,
  codigo: string,
  id: string,
): Promise<void> {
  await conUnidadInventario(bd, claves, async (tx) => {
    await perfilBloqueado(tx, codigo);
    await borradorBloqueado(tx, codigo, id);
    await tx.query(
      `UPDATE inventario.validaciones SET estado = 'descartada', descartada_en = now() WHERE id = $1`,
      [id],
    );
    return { resultado: undefined, cambios: [], visible: false };
  });
}
