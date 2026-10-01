// Colocados (HU-137, HU-150; RF-8.13, RF-8.13.2; D8, D12, D15, D16; diseño §11). Un colocado no es un
// estado: el perfil sigue publicado, su disponibilidad es la fecha de liberación y la asignación vive en
// `colocaciones`, con de dónde salió el dato. Toda escritura pasa por la unidad de inventario (auditoría
// encadenada y versión del inventario).
import "server-only";
import type pg from "pg";
import { validarColocado, type EntradaColocado } from "@ps/dominio/inventario/colocados";
import type { EstadoAlmacenado } from "@ps/dominio/inventario/estados";
import { diaCivilDeColombia } from "@ps/dominio/inventario/vigencia";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { bloquear, escribirDisponibilidad } from "./estado-perfil";
import { leerPerfil, type PerfilEditor } from "./perfiles-panel";
import { RechazoInventario, conUnidadInventario } from "./unidad-inventario";

const ACTOR_MIGRACION = "worker:migrar_colocados";
const CUENTA_DESCONOCIDA = "Sin registrar";

// Trabajo `migrar_colocados` (sub-slice 9, antes de la migración contract 0021): cada perfil que aún está
// en estado `colocado` pasa a publicado con su colocación (cuenta «Sin registrar», liberación = la fecha que
// tenía; cerrada si ya pasó) y disponibilidad = liberación. Si no puede publicarse (sin consentimiento
// vigente, por ejemplo) queda en borrador con su colocación. Idempotente: sin colocados no hace nada.
export async function migrarColocados(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  ahora = new Date(),
): Promise<{ migrados: number; aBorrador: number }> {
  const hoy = diaCivilDeColombia(ahora);
  const codigos = (
    await bd.query(
      `SELECT codigo FROM inventario.perfiles WHERE estado = 'colocado' ORDER BY codigo`,
    )
  ).rows.map((f) => f.codigo as string);
  let aBorrador = 0;
  for (const codigo of codigos) {
    const borrador = await conUnidadInventario(bd, claves, async (tx) => {
      const f = (
        await tx.query(
          `SELECT id, estado, fecha_liberacion::text AS liberacion, disponibilidad_fecha::text AS disponibilidad
             FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`,
          [codigo],
        )
      ).rows[0] as
        | { id: string; estado: string; liberacion: string; disponibilidad: string | null }
        | undefined;
      if (!f || f.estado !== "colocado") return { resultado: false, cambios: [], visible: false };
      const vigente = f.liberacion > hoy;
      await tx.query(
        `INSERT INTO inventario.colocaciones (perfil_id, cuenta, liberacion, fuente, vigente, cerrada_en)
         VALUES ($1, $2, $3, 'migracion', $4, CASE WHEN $4 THEN NULL ELSE now() END)`,
        [f.id, CUENTA_DESCONOCIDA, f.liberacion, vigente],
      );
      const cambio = (
        campo: string,
        antes: string | null,
        despues: string | null,
      ): CambioAuditado => ({
        actor: ACTOR_MIGRACION,
        entidad: "perfiles",
        entidadId: f.id,
        campo,
        titular: codigo,
        antes,
        despues,
        origen: "migracion",
      });
      const cambios = [
        cambio("colocacion", null, `${CUENTA_DESCONOCIDA} · libera ${f.liberacion}`),
      ];
      if (f.disponibilidad !== f.liberacion)
        cambios.push(cambio("disponibilidad_fecha", f.disponibilidad, f.liberacion));
      // Publicar pasa por los disparadores de la BD (consentimiento vigente, modalidad de prueba): si no
      // se cumplen, el perfil queda en borrador en vez de perderse.
      await tx.query("SAVEPOINT publicar");
      let destino = "publicado";
      try {
        await tx.query(
          `UPDATE inventario.perfiles SET estado = 'publicado', fecha_liberacion = NULL, disponibilidad_fecha = $2
            WHERE id = $1`,
          [f.id, f.liberacion],
        );
      } catch {
        await tx.query("ROLLBACK TO SAVEPOINT publicar");
        destino = "borrador";
        await tx.query(
          `UPDATE inventario.perfiles SET estado = 'borrador', fecha_liberacion = NULL, disponibilidad_fecha = $2
            WHERE id = $1`,
          [f.id, f.liberacion],
        );
      }
      cambios.push(cambio("estado", "colocado", destino));
      return { resultado: destino === "borrador", cambios, visible: true };
    });
    if (borrador) aBorrador++;
  }
  return { migrados: codigos.length, aBorrador };
}

type Consultor = Pick<pg.PoolClient, "query">;

// Colocaciones vigentes por código, para el plan de importación (HU-137): la asignación no viaja en el
// archivo y un colocado no cambia de estado por importación.
export async function colocadosVigentes(
  bd: Consultor,
): Promise<Map<string, { cuenta: string; liberacion: string }>> {
  const r = await bd.query(
    `SELECT p.codigo, c.cuenta, c.liberacion::text AS liberacion
       FROM inventario.colocaciones c JOIN inventario.perfiles p ON p.id = c.perfil_id
      WHERE c.vigente AND c.liberacion > (now() AT TIME ZONE 'America/Bogota')::date`,
  );
  return new Map(r.rows.map((f) => [f.codigo, { cuenta: f.cuenta, liberacion: f.liberacion }]));
}

// Registrar un colocado en el panel (HU-137; D8: el panel es la fuente). Solo un publicado sin
// colocación vigente; exige cliente y fecha de liberación (sin ella no se escribe nada y el perfil
// conserva estado y disponibilidad, RF-8.13.2). En la misma unidad: la colocación con su autor y la
// disponibilidad = liberación, actualizada ahora; el portal ve la banda nueva de inmediato.
export async function registrarColocado(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  entrada: EntradaColocado,
  ahora = new Date(),
): Promise<PerfilEditor> {
  const v = validarColocado(entrada, diaCivilDeColombia(ahora));
  if (!v.ok) throw new RechazoInventario(v.motivo);
  const { cuenta, inicio, liberacion } = v.valor;
  return conUnidadInventario(bd, claves, async (tx) => {
    const f = await bloquear(tx, codigo);
    if (f.estado !== "publicado") throw new RechazoInventario("no_es_publicado", { estado: f.estado });
    if (f.fecha_liberacion)
      throw new RechazoInventario("ya_colocado", { liberacion: f.fecha_liberacion });
    const cambio = (campo: string, antes: string | null, despues: string | null): CambioAuditado => ({
      actor: autor.correo,
      entidad: "perfiles",
      entidadId: f.id,
      campo,
      titular: codigo,
      antes,
      despues,
      origen: "panel",
    });
    // Una colocación cuya liberación ya pasó deja de estar vigente al registrar la nueva.
    const vencidas = await tx.query(
      `UPDATE inventario.colocaciones SET vigente = false, cerrada_en = now()
        WHERE perfil_id = $1 AND vigente RETURNING cuenta, liberacion::text AS liberacion`,
      [f.id],
    );
    await tx.query(
      `INSERT INTO inventario.colocaciones (perfil_id, cuenta, inicio, liberacion, fuente, registrado_por)
       VALUES ($1, $2, $3, $4, 'panel', $5)`,
      [f.id, cuenta, inicio, liberacion, autor.usuarioId],
    );
    const d = await escribirDisponibilidad(tx, autor, codigo, f, { fecha: liberacion }, ahora);
    return {
      resultado: (await leerPerfil(tx, codigo))!,
      cambios: [
        ...vencidas.rows.map((c) => cambio("colocacion", `${c.cuenta} · libera ${c.liberacion}`, null)),
        cambio("colocacion", null, `${cuenta} · desde ${inicio} · libera ${liberacion}`),
        ...d.cambios,
      ],
      visible: true,
    };
  });
}

export interface Colocado {
  codigo: string;
  nombre: string;
  rol: string | null;
  seniority: string | null;
  estado: EstadoAlmacenado;
  cuenta: string;
  inicio: string | null;
  liberacion: string;
  fuente: "panel" | "operaciones" | "migracion" | "siembra";
  // Correo de quien lo registró en el panel (identidad del panel); fecha de corte si vino de Operaciones.
  registradoPor: string | null;
  registradoEn: string;
  corte: string | null;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: string | null;
}

export interface CandidatoColocado {
  codigo: string;
  nombre: string;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: string | null;
}

const NOMBRE = `coalesce(nullif(concat_ws(' ', p.nombre, p.primer_apellido), ''), p.codigo)`;

// Pestaña de colocados (HU-137): las colocaciones vigentes con su perfil, y los publicados que se
// pueden marcar como colocados (sin colocación vigente), por nombre.
export async function listarColocados(
  bd: Consultor,
): Promise<{ colocados: Colocado[]; candidatos: CandidatoColocado[] }> {
  const colocados = (
    await bd.query(
      `SELECT p.codigo, ${NOMBRE} AS nombre, p.estado, s.nombre AS seniority,
              (SELECT r.nombre FROM inventario.perfil_roles h JOIN inventario.catalogo_roles r ON r.id = h.valor_id
                WHERE h.perfil_id = p.id ORDER BY h.orden LIMIT 1) AS rol,
              c.cuenta, c.inicio::text AS inicio, c.liberacion::text AS liberacion, c.fuente,
              u.correo AS registrado_por, c.registrado_en, k.cargado_en AS corte,
              p.disponibilidad_fecha::text AS disponibilidad_fecha, p.disponibilidad_actualizada_en
         FROM inventario.colocaciones c
         JOIN inventario.perfiles p ON p.id = c.perfil_id
         LEFT JOIN inventario.catalogo_seniorities s ON s.id = p.seniority_id
         LEFT JOIN identidad_panel.usuarios_panel u ON u.id = c.registrado_por
         LEFT JOIN inventario.cargas_operaciones k ON k.id = c.carga_id
        WHERE c.vigente AND c.liberacion > (now() AT TIME ZONE 'America/Bogota')::date
        ORDER BY c.liberacion, p.codigo`,
    )
  ).rows.map(
    (f): Colocado => ({
      codigo: f.codigo,
      nombre: f.nombre,
      rol: f.rol,
      seniority: f.seniority,
      estado: f.estado,
      cuenta: f.cuenta,
      inicio: f.inicio,
      liberacion: f.liberacion,
      fuente: f.fuente,
      registradoPor: f.registrado_por,
      registradoEn: f.registrado_en.toISOString(),
      corte: f.corte?.toISOString() ?? null,
      disponibilidadFecha: f.disponibilidad_fecha,
      disponibilidadActualizadaEn: f.disponibilidad_actualizada_en?.toISOString() ?? null,
    }),
  );
  const candidatos = (
    await bd.query(
      `SELECT p.codigo, ${NOMBRE} AS nombre, p.disponibilidad_fecha::text AS disponibilidad_fecha,
              p.disponibilidad_actualizada_en
         FROM inventario.perfiles p
        WHERE p.estado = 'publicado'
          AND NOT EXISTS (SELECT 1 FROM inventario.colocaciones c WHERE c.perfil_id = p.id AND c.vigente
                            AND c.liberacion > (now() AT TIME ZONE 'America/Bogota')::date)
        ORDER BY nombre, p.codigo`,
    )
  ).rows.map(
    (f): CandidatoColocado => ({
      codigo: f.codigo,
      nombre: f.nombre,
      disponibilidadFecha: f.disponibilidad_fecha,
      disponibilidadActualizadaEn: f.disponibilidad_actualizada_en?.toISOString() ?? null,
    }),
  );
  return { colocados, candidatos };
}
