// Revertir la última importación (EP-006 · sub-slice 4; HU-087; docs/10-specs/importacion-masiva.md
// §7; mismo contrato I-2 que aplicar). Lo ejecuta el worker, en una sola transacción:
//  - solo el último lote `aplicado` (los revertidos no cuentan); si hay otro aplicado después, se
//    explica cuáles (`antesDeRevertir`);
//  - cada perfil actualizado vuelve exactamente a su `estado_previo` (campos, hijas y experiencias
//    vigentes) y los creados se archivan, no se borran;
//  - un perfil cambiado después de la importación (su `version` ya no es la que dejó) solo se toca si
//    la persona lo incluyó; si no, se deja como está;
//  - la reversión es un evento propio en la auditoría (`origen = reversion`).
import "server-only";
import type pg from "pg";
import { registrarAuditoria, type CambioAuditado, type ClavesAuditoria } from "./auditoria";
import { CANDADO_IMPORTACION } from "./aplicar-importacion";
import { ETIQUETA_ESTADO } from "@ps/dominio/inventario/estados";
import { fechaCivil } from "@ps/dominio/fecha/colombia";
import { diferencias, leerPerfil, type PerfilEditor } from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

const VISIBLES = new Set(["publicado"]);
const COLUMNAS = [
  "nombre",
  "primer_apellido",
  "estado",
  "familia_id",
  "seniority_id",
  "anios_experiencia",
  "modalidad_id",
  "pais_id",
  "ciudad_id",
  "disponibilidad_fecha",
  "disponibilidad_actualizada_en",
  "motivo_pausa_id",
  "pausado_en",
  "modalidad_prueba_id",
  "capacidad",
  "anclaje",
  "resumen",
  "vinculo",
  "formacion",
  "idiomas",
  "sello_personal",
];
const HIJAS = [
  ["roles", "perfil_roles"],
  ["tecnologias", "perfil_tecnologias"],
  ["sectores", "perfil_sectores"],
] as const;

// ─── antes de revertir: lo que la persona tiene que saber (HU-087 escenarios 2 y 3) ────────────

export interface LotePosterior {
  id: string;
  aplicadoEn: string;
  confirmadoPor: string | null;
  perfiles: number;
}

export interface PerfilCambiadoDespues {
  codigo: string;
  nombre: string | null;
  creado: boolean;
}

export interface AntesDeRevertir {
  estado: string;
  // Lotes aplicados después de este: si hay alguno, este ya no es el último y no se revierte.
  posteriores: LotePosterior[];
  // Perfiles que la importación tocó y que alguien cambió después.
  cambiadosDespues: PerfilCambiadoDespues[];
  perfiles: number;
}

export async function antesDeRevertir(
  bd: Consultor,
  loteId: string,
): Promise<AntesDeRevertir | null> {
  const l = (
    await bd.query(`SELECT estado, aplicado_en FROM inventario.lotes_importacion WHERE id = $1`, [
      loteId,
    ])
  ).rows[0];
  if (!l) return null;
  const posteriores = l.aplicado_en
    ? (
        await bd.query(
          `SELECT l.id, l.aplicado_en, u.correo,
                  (SELECT count(*)::int FROM inventario.lote_filas f WHERE f.lote_id = l.id AND f.perfil_id IS NOT NULL) AS perfiles
             FROM inventario.lotes_importacion l
             LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.confirmado_por
            WHERE l.estado = 'aplicado' AND l.id <> $1
              AND l.aplicado_en > (SELECT aplicado_en FROM inventario.lotes_importacion WHERE id = $1)
            ORDER BY l.aplicado_en`,
          [loteId],
        )
      ).rows.map((x) => ({
        id: x.id,
        aplicadoEn: x.aplicado_en.toISOString(),
        confirmadoPor: x.correo ?? null,
        perfiles: x.perfiles,
      }))
    : [];
  const tocados = await bd.query(
    `SELECT p.codigo, p.nombre, p.primer_apellido, f.creado, p.version <> f.version_aplicada AS cambiado
       FROM inventario.lote_filas f JOIN inventario.perfiles p ON p.id = f.perfil_id
      WHERE f.lote_id = $1 ORDER BY f.numero`,
    [loteId],
  );
  return {
    estado: l.estado,
    posteriores,
    cambiadosDespues: tocados.rows
      .filter((x) => x.cambiado)
      .map((x) => ({
        codigo: x.codigo,
        nombre: [x.nombre, x.primer_apellido].filter(Boolean).join(" ") || null,
        creado: x.creado,
      })),
    perfiles: tocados.rowCount ?? 0,
  };
}

// ─── qué va a pasar, con detalle (pantalla «Deshacer la última importación») ───────────────

export interface CambiadoConDetalle extends PerfilCambiadoDespues {
  // Última edición posterior a la importación: quién, cuándo y qué campos.
  autor: string | null;
  cuando: string | null;
  campos: string[];
  // Cómo queda el perfil hoy y cómo quedaría si se incluye, solo en lo que difiere.
  hoy: string[];
  siIncluyes: string[];
}

export interface DetalleReversion extends Omit<AntesDeRevertir, "cambiadosDespues"> {
  archivo: string | null;
  aplicadoEn: string | null;
  confirmadoPor: string | null;
  // Lo que les pasa a los no cambiados después.
  vuelven: { actualizados: number; creados: number; archivados: number };
  cambiadosDespues: CambiadoConDetalle[];
}

const CAMPOS_VISTOS: Array<[string, (p: PerfilEditor) => string | null]> = [
  ["estado", (p) => ETIQUETA_ESTADO[p.estado]],
  ["nombre", (p) => [p.nombre, p.primerApellido].filter(Boolean).join(" ") || null],
  ["rol", (p) => p.rol?.nombre ?? null],
  ["seniority", (p) => p.seniority?.nombre ?? null],
  ["años", (p) => (p.aniosExperiencia === null ? null : `${p.aniosExperiencia} años`)],
  ["tecnologías", (p) => p.tecnologias.map((t) => t.nombre).join(", ") || null],
  ["sectores", (p) => p.sectores.map((t) => t.nombre).join(", ") || null],
  ["ciudad", (p) => p.ciudad?.nombre ?? null],
  ["modalidad", (p) => p.modalidadTrabajo?.nombre ?? null],
  ["disponibilidad", (p) => (p.disponibilidadFecha ? `Disponible el ${fechaCivil(p.disponibilidadFecha)}` : null)],
  ["prueba", (p) => p.modalidadPrueba?.nombre ?? null],
  ["capacidad", (p) => p.capacidad],
  ["anclaje", (p) => p.anclaje],
  ["resumen", (p) => p.resumen],
  ["formación", (p) => p.formacion],
  ["idiomas", (p) => p.idiomas.join(", ") || null],
  ["sello", (p) => p.selloPersonal.join(", ") || null],
  ["trayectoria", (p) => `${p.experiencias.length} ${p.experiencias.length === 1 ? "experiencia" : "experiencias"}`],
];
const corto = (t: string) => (t.length > 48 ? `${t.slice(0, 47)}…` : t);

function contraste(hoy: PerfilEditor, luego: PerfilEditor): { hoy: string[]; siIncluyes: string[] } {
  const a: string[] = [];
  const b: string[] = [];
  for (const [campo, valor] of CAMPOS_VISTOS) {
    const x = valor(hoy);
    const y = valor(luego);
    if (x === y) continue;
    a.push(x === null ? `sin ${campo}` : corto(x));
    b.push(y === null ? `sin ${campo}` : corto(y));
  }
  return { hoy: a, siIncluyes: b };
}

// Proyecta la reversión de cada perfil cambiado después dentro de una transacción que se deshace:
// lo que se muestra es exactamente lo que haría revertirlo.
export async function detalleReversion(bd: pg.Pool, loteId: string): Promise<DetalleReversion | null> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const base = await antesDeRevertir(tx, loteId);
    if (!base) return null;
    const l = (
      await tx.query(
        `SELECT l.archivo_nombre, l.aplicado_en, u.correo FROM inventario.lotes_importacion l
           LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.confirmado_por WHERE l.id = $1`,
        [loteId],
      )
    ).rows[0];
    const filas = (
      await tx.query(
        `SELECT f.perfil_id, f.creado, f.grupo, f.estado_previo, p.codigo, p.version <> f.version_aplicada AS cambiado
           FROM inventario.lote_filas f JOIN inventario.perfiles p ON p.id = f.perfil_id
          WHERE f.lote_id = $1 ORDER BY f.numero`,
        [loteId],
      )
    ).rows;
    const vuelven = { actualizados: 0, creados: 0, archivados: 0 };
    for (const f of filas.filter((x) => !x.cambiado))
      if (f.creado) vuelven.creados++;
      else if (f.grupo === "archivado") vuelven.archivados++;
      else vuelven.actualizados++;
    const cambiados: CambiadoConDetalle[] = [];
    for (const c of base.cambiadosDespues) {
      const f = filas.find((x) => x.codigo === c.codigo)!;
      const ultima = await tx.query(
        `SELECT actor, max(cuando) AS cuando, array_agg(DISTINCT campo) AS campos
           FROM auditoria.auditoria
          WHERE titular = $1 AND cuando > $2 AND origen NOT IN ('importacion', 'reversion')
          GROUP BY actor ORDER BY max(cuando) DESC LIMIT 1`,
        [c.codigo, l.aplicado_en],
      );
      const hoy = (await leerPerfil(tx, c.codigo))!;
      if (f.creado)
        await tx.query(`UPDATE inventario.perfiles SET estado = 'archivado' WHERE id = $1`, [f.perfil_id]);
      else await restaurar(tx, f.perfil_id, f.estado_previo);
      const luego = (await leerPerfil(tx, c.codigo))!;
      const u = ultima.rows[0];
      cambiados.push({
        ...c,
        autor: u?.actor ?? null,
        cuando: u?.cuando?.toISOString() ?? null,
        campos: (u?.campos as string[] | undefined) ?? [],
        ...contraste(hoy, luego),
      });
    }
    return {
      ...base,
      archivo: l.archivo_nombre ?? null,
      aplicadoEn: l.aplicado_en?.toISOString() ?? null,
      confirmadoPor: l.correo ?? null,
      vuelven,
      cambiadosDespues: cambiados,
    };
  } finally {
    await tx.query("ROLLBACK").catch(() => {});
    tx.release();
  }
}

// ─── confirmar la reversión (panel) ─────────────────────────────────────────────────────────

// Encola `revertir_importacion` una sola vez con los perfiles cambiados después que la persona
// decidió incluir. Solo el último lote aplicado.
export async function confirmarReversion(
  bd: pg.Pool,
  autor: { usuarioId: string },
  loteId: string,
  incluir: string[],
): Promise<{ trabajoId: string }> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const l = (
      await tx.query(
        `SELECT estado, trabajo_reversion_id FROM inventario.lotes_importacion WHERE id = $1 FOR UPDATE`,
        [loteId],
      )
    ).rows[0];
    if (!l) throw new RechazoInventario("no_existe");
    if (l.trabajo_reversion_id) {
      await tx.query("COMMIT");
      return { trabajoId: String(l.trabajo_reversion_id) };
    }
    if (l.estado !== "aplicado")
      throw new RechazoInventario("lote_no_aplicado", { estado: l.estado });
    const previo = (await antesDeRevertir(tx, loteId))!;
    if (previo.posteriores.length)
      throw new RechazoInventario("no_es_la_ultima", { posteriores: previo.posteriores });
    const cambiados = new Set(previo.cambiadosDespues.map((x) => x.codigo));
    const ajenos = incluir.filter((c) => !cambiados.has(c));
    if (ajenos.length) throw new RechazoInventario("incluir_invalido", { codigos: ajenos });
    const trabajo = (
      await tx.query(`SELECT operacion.encolar_panel('revertir_importacion', $1) AS id`, [
        JSON.stringify({ lote: loteId, incluir }),
      ])
    ).rows[0].id;
    await tx.query(
      `UPDATE inventario.lotes_importacion
          SET revertido_por = $2, trabajo_reversion_id = $3, motivo_reversion = NULL, actualizado_en = now()
        WHERE id = $1`,
      [loteId, autor.usuarioId, trabajo],
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

// La reversión no se hizo (otra regla lo impidió o el proceso murió): el lote sigue aplicado, queda
// el motivo y se puede volver a confirmar.
export async function liberarReversion(bd: pg.Pool, loteId: string, motivo: string): Promise<void> {
  await bd.query(
    `UPDATE inventario.lotes_importacion
        SET trabajo_reversion_id = NULL, revertido_por = NULL, motivo_reversion = $2, actualizado_en = now()
      WHERE id = $1 AND estado = 'aplicado'`,
    [loteId, motivo],
  );
}

// ─── revertir (worker) ──────────────────────────────────────────────────────────────────────

export type ResultadoRevertir =
  | { tipo: "revertido"; restaurados: number; archivados: number; dejados: number }
  | { tipo: "ocupado" }
  | { tipo: "sin_efecto"; estado: string }
  | { tipo: "rechazado"; motivo: string };

async function restaurar(tx: pg.PoolClient, perfilId: string, previo: Record<string, unknown>) {
  await tx.query(
    `UPDATE inventario.perfiles p SET (${COLUMNAS.join(", ")}) =
       (SELECT ${COLUMNAS.map((c) => `r.${c}`).join(", ")} FROM jsonb_populate_record(NULL::inventario.perfiles, $2) r)
      WHERE p.id = $1`,
    [perfilId, JSON.stringify(previo)],
  );
  for (const [clave, tabla] of HIJAS) {
    const ids = previo[clave] as string[];
    const actuales = (
      await tx.query(
        `SELECT valor_id FROM inventario.${tabla} WHERE perfil_id = $1 ORDER BY orden`,
        [perfilId],
      )
    ).rows.map((x) => x.valor_id as string);
    if (actuales.join() !== ids.join())
      await tx.query(`SELECT inventario.reemplazar_hijas($1, $2, $3::uuid[])`, [
        tabla,
        perfilId,
        ids,
      ]);
  }
  // Las experiencias nunca se borran: vuelven a ser vigentes las de antes y dejan de serlo las demás.
  await tx.query(
    `UPDATE inventario.perfil_experiencias
        SET vigente = (id = ANY($2::uuid[])),
            retirada_en = CASE WHEN id = ANY($2::uuid[]) THEN NULL ELSE COALESCE(retirada_en, now()) END
      WHERE perfil_id = $1 AND vigente IS DISTINCT FROM (id = ANY($2::uuid[]))`,
    [perfilId, previo.experiencias as string[]],
  );
}

const motivoPausa = async (tx: Consultor, perfilId: string): Promise<string | null> =>
  (
    await tx.query(
      `SELECT m.nombre FROM inventario.perfiles p
         LEFT JOIN inventario.catalogo_motivos_pausa m ON m.id = p.motivo_pausa_id WHERE p.id = $1`,
      [perfilId],
    )
  ).rows[0].nombre ?? null;

export async function revertirLote(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  loteId: string,
  incluir: readonly string[],
): Promise<ResultadoRevertir> {
  const tx = await bd.connect();
  try {
    await tx.query("BEGIN");
    const candado = await tx.query(`SELECT pg_try_advisory_xact_lock(hashtext($1)) AS ok`, [
      CANDADO_IMPORTACION,
    ]);
    if (!candado.rows[0].ok) {
      await tx.query("ROLLBACK");
      return { tipo: "ocupado" };
    }
    const lote = (
      await tx.query(
        `SELECT l.estado, u.correo FROM inventario.lotes_importacion l
           LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.revertido_por
          WHERE l.id = $1 FOR UPDATE OF l`,
        [loteId],
      )
    ).rows[0];
    if (!lote) throw new RechazoInventario("no_existe");
    if (lote.estado !== "aplicado") {
      await tx.query("ROLLBACK");
      return { tipo: "sin_efecto", estado: lote.estado };
    }
    if (!lote.correo) throw new RechazoInventario("sin_confirmar");
    const previo = (await antesDeRevertir(tx, loteId))!;
    if (previo.posteriores.length) throw new RechazoInventario("no_es_la_ultima");
    const autor = { usuarioId: "", correo: lote.correo as string };
    const incluidos = new Set(incluir);

    const filas = (
      await tx.query(
        `SELECT f.perfil_id, f.creado, f.estado_previo, f.version_aplicada, p.codigo, p.version
           FROM inventario.lote_filas f JOIN inventario.perfiles p ON p.id = f.perfil_id
          WHERE f.lote_id = $1 ORDER BY f.numero FOR UPDATE OF p`,
        [loteId],
      )
    ).rows;
    const cambios: CambioAuditado[] = [];
    let visible = false;
    const cuenta = { restaurados: 0, archivados: 0, dejados: 0 };
    for (const f of filas) {
      if (f.version !== f.version_aplicada && !incluidos.has(f.codigo)) {
        cuenta.dejados++;
        continue;
      }
      const antes = (await leerPerfil(tx, f.codigo))!;
      const motivoAntes = await motivoPausa(tx, f.perfil_id);
      if (f.creado) {
        if (antes.estado !== "archivado")
          await tx.query(`UPDATE inventario.perfiles SET estado = 'archivado' WHERE id = $1`, [
            f.perfil_id,
          ]);
        cuenta.archivados++;
      } else {
        // Restaurar puede chocar con una regla de la BD (republicar sin consentimiento vigente): no se
        // revierte nada y se dice qué perfil lo impidió.
        try {
          await restaurar(tx, f.perfil_id, f.estado_previo);
        } catch {
          throw new RechazoInventario("no_se_pudo_restaurar", { codigo: f.codigo });
        }
        cuenta.restaurados++;
      }
      const despues = (await leerPerfil(tx, f.codigo))!;
      cambios.push(...diferencias(antes, despues, autor, "reversion"));
      const motivoDespues = await motivoPausa(tx, f.perfil_id);
      if (motivoAntes !== motivoDespues)
        cambios.push({
          actor: autor.correo,
          entidad: "perfiles",
          entidadId: f.perfil_id,
          campo: "motivo_pausa",
          titular: f.codigo,
          antes: motivoAntes,
          despues: motivoDespues,
          origen: "reversion",
        });
      if (VISIBLES.has(antes.estado) || VISIBLES.has(despues.estado)) visible = true;
    }
    await tx.query(
      `UPDATE inventario.lotes_importacion SET estado = 'revertido', revertido_en = now(), actualizado_en = now()
        WHERE id = $1`,
      [loteId],
    );
    cambios.push({
      actor: autor.correo,
      entidad: "lotes_importacion",
      entidadId: loteId,
      campo: "estado",
      antes: "aplicado",
      despues: "revertido",
      origen: "reversion",
    });
    if (visible)
      await tx.query(
        `UPDATE inventario.inventario_version SET version = version + 1, actualizado_en = now() WHERE id = 1`,
      );
    await registrarAuditoria(tx, claves, cambios);
    await tx.query("COMMIT");
    return { tipo: "revertido", ...cuenta };
  } catch (e) {
    await tx.query("ROLLBACK").catch(() => {});
    if (!(e instanceof RechazoInventario)) throw e;
    return { tipo: "rechazado", motivo: e.motivo };
  } finally {
    tx.release();
  }
}
