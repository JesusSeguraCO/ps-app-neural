// Colocados (HU-137, HU-150; RF-8.13, RF-8.13.2; D8, D12, D15, D16; diseño §11). Un colocado no es un
// estado: el perfil sigue publicado, su disponibilidad es la fecha de liberación y la asignación vive en
// `colocaciones`, con de dónde salió el dato. Toda escritura pasa por la unidad de inventario (auditoría
// encadenada y versión del inventario).
import "server-only";
import type pg from "pg";
import { leerOperaciones } from "@ps/contratos/operaciones";
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

// ─── carga de Operaciones (HU-150; D12, D15, D16) ──────────────────────────────────────────────

const valorColocacion = (c: { cuenta: string; inicio: string | null; liberacion: string }) =>
  `${c.cuenta} · desde ${c.inicio ?? "sin registrar"} · libera ${c.liberacion}`;

// Carga el archivo de Operaciones en una sola unidad: un archivo que no es JSON ni CSV, sin las
// columnas mínimas o sin filas se rechaza entero sin escribir nada (la pestaña conserva lo anterior).
// Cada fila válida, contra el banco: sin colocación vigente → colocación de Operaciones y
// disponibilidad = liberación; con una de una carga anterior → se reemplaza; con una del panel →
// igual no hace nada, distinta queda como diferencia (gana el panel, D15). Lo que no se aplica queda
// con su número y su motivo. `cargado_en` es la fecha de corte (D16). Auditado con origen
// `sincronizacion`.
export async function cargarOperaciones(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  archivo: { nombre: string; texto: string },
  ahora = new Date(),
): Promise<{ cargaId: string }> {
  const lectura = leerOperaciones(archivo.nombre, archivo.texto, diaCivilDeColombia(ahora));
  if (!lectura.ok)
    throw new RechazoInventario(lectura.motivo, "faltan" in lectura ? { faltan: lectura.faltan } : {});
  return conUnidadInventario(bd, claves, async (tx) => {
    const carga = (
      await tx.query(
        `INSERT INTO inventario.cargas_operaciones
           (cargado_por, archivo, formato, filas_aplicadas, filas_con_error, columnas_ignoradas)
         VALUES ($1, $2, $3, 0, 0, $4) RETURNING id`,
        [autor.usuarioId, archivo.nombre.slice(0, 200), lectura.formato, lectura.ignoradas],
      )
    ).rows[0].id as string;
    const errores = [...lectura.errores];
    const cambios: CambioAuditado[] = [];
    let aplicadas = 0;
    let visible = false;
    for (const fila of lectura.filas) {
      let f: Awaited<ReturnType<typeof bloquear>>;
      try {
        f = await bloquear(tx, fila.codigo);
      } catch (e) {
        if (!(e instanceof RechazoInventario)) throw e;
        errores.push({
          numero: fila.numero,
          codigo: fila.codigo,
          motivo: `No hay ningún perfil con el código ${fila.codigo}.`,
        });
        continue;
      }
      if (f.estado !== "publicado") {
        errores.push({
          numero: fila.numero,
          codigo: fila.codigo,
          motivo: `${fila.codigo} no está publicado: solo un perfil publicado puede estar colocado.`,
        });
        continue;
      }
      const cambio = (campo: string, antes: string | null, despues: string | null): CambioAuditado => ({
        actor: autor.correo,
        entidad: "perfiles",
        entidadId: f.id,
        campo,
        titular: fila.codigo,
        antes,
        despues,
        origen: "sincronizacion",
      });
      const vigente = (
        await tx.query(
          `SELECT id, cuenta, inicio::text AS inicio, liberacion::text AS liberacion, fuente
             FROM inventario.colocaciones
            WHERE perfil_id = $1 AND vigente AND liberacion > (now() AT TIME ZONE 'America/Bogota')::date`,
          [f.id],
        )
      ).rows[0] as
        | { id: string; cuenta: string; inicio: string | null; liberacion: string; fuente: string }
        | undefined;
      aplicadas++;
      const igual =
        vigente &&
        vigente.cuenta === fila.cuenta &&
        vigente.inicio === fila.inicio &&
        vigente.liberacion === fila.liberacion;
      if (vigente && vigente.fuente !== "operaciones") {
        if (igual) continue;
        // Gana el panel: la fila queda para decidir. Una diferencia pendiente anterior se actualiza.
        const r = await tx.query(
          `UPDATE inventario.diferencias_operaciones
              SET carga_id = $2, numero_fila = $3, cuenta = $4, inicio = $5, liberacion = $6
            WHERE colocacion_id = $1 AND decision IS NULL`,
          [vigente.id, carga, fila.numero, fila.cuenta, fila.inicio, fila.liberacion],
        );
        if (r.rowCount === 0)
          await tx.query(
            `INSERT INTO inventario.diferencias_operaciones
               (carga_id, colocacion_id, numero_fila, cuenta, inicio, liberacion)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [carga, vigente.id, fila.numero, fila.cuenta, fila.inicio, fila.liberacion],
          );
        continue;
      }
      // Sin colocación vigente o con una de una carga anterior: entra la de esta carga (la vencida o la
      // anterior se cierran), con la disponibilidad en la liberación.
      await tx.query(
        `UPDATE inventario.colocaciones SET vigente = false, cerrada_en = now()
          WHERE perfil_id = $1 AND vigente`,
        [f.id],
      );
      await tx.query(
        `INSERT INTO inventario.colocaciones (perfil_id, cuenta, inicio, liberacion, fuente, carga_id, registrado_por)
         VALUES ($1, $2, $3, $4, 'operaciones', $5, $6)`,
        [f.id, fila.cuenta, fila.inicio, fila.liberacion, carga, autor.usuarioId],
      );
      visible = true;
      if (igual) continue;
      cambios.push(cambio("colocacion", vigente ? valorColocacion(vigente) : null, valorColocacion(fila)));
      if (f.disponibilidad_fecha !== fila.liberacion) {
        const d = await escribirDisponibilidad(tx, autor, fila.codigo, f, { fecha: fila.liberacion }, ahora);
        cambios.push(...d.cambios.map((c) => ({ ...c, origen: "sincronizacion" as const })));
      }
    }
    errores.sort((a, b) => a.numero - b.numero);
    await tx.query(
      `UPDATE inventario.cargas_operaciones SET filas_aplicadas = $2, filas_con_error = $3, errores = $4
        WHERE id = $1`,
      [carga, aplicadas, errores.length, JSON.stringify(errores)],
    );
    return { resultado: { cargaId: carga }, cambios, visible, referencia: { tipo: "carga", id: carga } };
  });
}

export interface ResumenCarga {
  id: string;
  archivo: string;
  cargadoEn: string;
  filas: number;
  aplicadas: number;
  nuevos: number;
  venian: number;
  iguales: number;
  diferencias: number;
  ignoradas: string[];
  errores: Array<{ numero: number; codigo: string | null; motivo: string }>;
}

// Lo que dejó una carga, para el aviso tras cargarla: cuántos entraron nuevos, cuántos ya venían de la
// carga anterior (se cerró una de Operaciones en la misma transacción), cuántos coincidían con el
// panel, cuántas diferencias y las filas que no se aplicaron.
export async function resumenCarga(bd: Consultor, id: string): Promise<ResumenCarga | null> {
  const f = (
    await bd.query(
      `SELECT k.id, k.archivo, k.cargado_en, k.filas_aplicadas, k.filas_con_error, k.columnas_ignoradas, k.errores,
              (SELECT count(*)::int FROM inventario.colocaciones c WHERE c.carga_id = k.id) AS entraron,
              (SELECT count(*)::int FROM inventario.colocaciones c
                WHERE c.carga_id = k.id AND EXISTS (
                  SELECT 1 FROM inventario.colocaciones a
                   WHERE a.perfil_id = c.perfil_id AND a.fuente = 'operaciones' AND a.cerrada_en = k.cargado_en)) AS venian,
              (SELECT count(*)::int FROM inventario.diferencias_operaciones d WHERE d.carga_id = k.id) AS diferencias
         FROM inventario.cargas_operaciones k WHERE k.id = $1`,
      [id],
    )
  ).rows[0];
  if (!f) return null;
  return {
    id: f.id,
    archivo: f.archivo,
    cargadoEn: f.cargado_en.toISOString(),
    filas: f.filas_aplicadas + f.filas_con_error,
    aplicadas: f.filas_aplicadas,
    nuevos: f.entraron - f.venian,
    venian: f.venian,
    iguales: f.filas_aplicadas - f.entraron - f.diferencias,
    diferencias: f.diferencias,
    ignoradas: f.columnas_ignoradas,
    errores: f.errores,
  };
}

// Fecha de corte: la última carga que aplicó alguna fila (una carga en la que todo falló no renueva
// el dato de Operaciones).
export async function ultimoCorte(bd: Consultor): Promise<Date | null> {
  return (
    (
      await bd.query(
        `SELECT max(cargado_en) AS corte FROM inventario.cargas_operaciones WHERE filas_aplicadas > 0`,
      )
    ).rows[0].corte ?? null
  );
}

export interface DiferenciaOperaciones {
  id: string;
  codigo: string;
  nombre: string;
  numeroFila: number;
  cargadoEn: string;
  panel: { cuenta: string; inicio: string | null; liberacion: string; registradoPor: string | null };
  operaciones: { cuenta: string; inicio: string; liberacion: string };
}

export async function listarDiferencias(bd: Consultor): Promise<DiferenciaOperaciones[]> {
  return (
    await bd.query(
      `SELECT d.id, p.codigo, ${NOMBRE} AS nombre, d.numero_fila, k.cargado_en,
              c.cuenta AS p_cuenta, c.inicio::text AS p_inicio, c.liberacion::text AS p_liberacion, u.correo AS p_autor,
              d.cuenta, d.inicio::text AS inicio, d.liberacion::text AS liberacion
         FROM inventario.diferencias_operaciones d
         JOIN inventario.colocaciones c ON c.id = d.colocacion_id
         JOIN inventario.perfiles p ON p.id = c.perfil_id
         JOIN inventario.cargas_operaciones k ON k.id = d.carga_id
         LEFT JOIN identidad_panel.usuarios_panel u ON u.id = c.registrado_por
        WHERE d.decision IS NULL AND c.vigente
        ORDER BY k.cargado_en DESC, d.numero_fila`,
    )
  ).rows.map((f) => ({
    id: f.id,
    codigo: f.codigo,
    nombre: f.nombre,
    numeroFila: f.numero_fila,
    cargadoEn: f.cargado_en.toISOString(),
    panel: { cuenta: f.p_cuenta, inicio: f.p_inicio, liberacion: f.p_liberacion, registradoPor: f.p_autor },
    operaciones: { cuenta: f.cuenta, inicio: f.inicio, liberacion: f.liberacion },
  }));
}

// Decidir una diferencia (D15): «Aceptar la de Operaciones» reemplaza el colocado del panel por la fila
// (disponibilidad = su liberación); «Mantener la del panel» la descarta. Ambas quedan con su autor.
export async function decidirDiferencia(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  id: string,
  decision: "aceptada" | "descartada",
  ahora = new Date(),
): Promise<{ codigo: string }> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const d = (
      await tx.query(
        `SELECT d.id, d.decision, d.carga_id, d.cuenta, d.inicio::text AS inicio, d.liberacion::text AS liberacion,
                c.id AS colocacion_id, c.vigente, c.cuenta AS p_cuenta, c.inicio::text AS p_inicio,
                c.liberacion::text AS p_liberacion, p.codigo
           FROM inventario.diferencias_operaciones d
           JOIN inventario.colocaciones c ON c.id = d.colocacion_id
           JOIN inventario.perfiles p ON p.id = c.perfil_id
          WHERE d.id = $1 FOR UPDATE OF d`,
        [id],
      )
    ).rows[0];
    if (!d) throw new RechazoInventario("no_existe");
    if (d.decision) throw new RechazoInventario("ya_decidida", { decision: d.decision });
    if (!d.vigente) throw new RechazoInventario("no_aplica");
    const f = await bloquear(tx, d.codigo);
    const cambio = (campo: string, antes: string | null, despues: string | null): CambioAuditado => ({
      actor: autor.correo,
      entidad: "perfiles",
      entidadId: f.id,
      campo,
      titular: d.codigo,
      antes,
      despues,
      origen: "panel",
    });
    await tx.query(
      `UPDATE inventario.diferencias_operaciones SET decision = $2, decidida_por = $3, decidida_en = now()
        WHERE id = $1`,
      [id, decision, autor.usuarioId],
    );
    const panel = { cuenta: d.p_cuenta, inicio: d.p_inicio, liberacion: d.p_liberacion };
    const ops = { cuenta: d.cuenta, inicio: d.inicio, liberacion: d.liberacion };
    if (decision === "descartada")
      return {
        resultado: { codigo: d.codigo },
        cambios: [cambio("diferencia_operaciones", valorColocacion(ops), "descartada: se mantiene la del panel")],
        visible: false,
      };
    await tx.query(
      `UPDATE inventario.colocaciones SET vigente = false, cerrada_en = now() WHERE id = $1`,
      [d.colocacion_id],
    );
    await tx.query(
      `INSERT INTO inventario.colocaciones (perfil_id, cuenta, inicio, liberacion, fuente, carga_id, registrado_por)
       VALUES ($1, $2, $3, $4, 'operaciones', $5, $6)`,
      [f.id, ops.cuenta, ops.inicio, ops.liberacion, d.carga_id, autor.usuarioId],
    );
    const cambios = [cambio("colocacion", valorColocacion(panel), valorColocacion(ops))];
    if (f.disponibilidad_fecha !== ops.liberacion)
      cambios.push(
        ...(await escribirDisponibilidad(tx, autor, d.codigo, f, { fecha: ops.liberacion }, ahora)).cambios,
      );
    return { resultado: { codigo: d.codigo }, cambios, visible: true };
  });
}
