// Aplicar un lote de importación (EP-006 · sub-slice 4; HU-141; docs/10-specs/importacion-masiva.md
// §4–§5, §7–§8; contrato I-2 de ADR-0003). Lo ejecuta el worker, una sola transacción:
//  1. candado consultivo de la importación (`pg_try_advisory_xact_lock`): tomado → «ocupado»;
//  2. el lote `FOR UPDATE` y solo si sigue `calculado` (un reclamo que lo retome no aplica dos veces);
//  3. el plan se recalcula contra el banco de ahora y debe coincidir con el que vio la persona
//     (la «versión revalidada»): si algo cambió, no se aplica nada y se pide volver a calcular;
//  4. cada fila incluida escribe por la misma vía que el editor (fusión: solo lo que cambia), guarda
//     el estado previo del perfil y la versión que deja (HU-087);
//  5. al final, una sola subida de `inventario_version` (si el cliente ve algo distinto) y una sola
//     toma de la cabeza de auditoría, con origen `importacion` y actor = quien confirmó.
// Si falla o agota el tope de reloj, ROLLBACK y una transacción corta deja el lote `abortado` con el
// motivo: nada a medias.
import "server-only";
import type pg from "pg";
import { normalizar } from "@ps/dominio/catalogo/parecidos";
import {
  MODALIDAD_FORMATO,
  VINCULO_FORMATO,
  type ClaveCampo,
} from "@ps/dominio/importacion/campos";
import { leerExperiencia } from "@ps/dominio/importacion/celdas";
import {
  calcularPlan,
  type FilaBanco,
  type FilaPlan,
  type Valor,
} from "@ps/dominio/importacion/plan";
import { registrarAuditoria, type CambioAuditado, type ClavesAuditoria } from "./auditoria";
import { colocadosVigentes } from "./colocados";
import { bancoEnFormato, catalogosImportacion, filasDelLote } from "./importacion";
import {
  altaEnTransaccion,
  edicionEnTransaccion,
  leerPerfil,
  type EntradaPerfil,
  type Vinculo,
} from "./perfiles-panel";
import { RechazoInventario } from "./unidad-inventario";

export const TOPE_APLICAR_MS = 5 * 60_000;
export const CANDADO_IMPORTACION = "inventario.importacion";
const VISIBLES = new Set(["publicado"]);

export type ResultadoAplicar =
  | { tipo: "aplicado"; creados: number; actualizados: number; archivados: number }
  | { tipo: "ocupado" }
  // El lote ya no está `calculado`: aplicado por un reclamo anterior, abortado o revertido.
  | { tipo: "sin_efecto"; estado: string }
  | { tipo: "abortado"; motivo: string };

export interface OpcionesAplicar {
  hoy: string; // fecha civil de Bogotá (AAAA-MM-DD): la misma con que el panel calculó el plan
  topeMs?: number;
  reloj?: () => number;
}

// ─── de nombres del formato a identificadores del catálogo ──────────────────────────────────

type Indice = Map<string, string>; // nombre normalizado → id

interface Indices {
  roles: Map<string, { id: string; familiaId: string }>;
  familias: Indice;
  tecnologias: Indice;
  sectores: Indice;
  seniorities: Indice;
  ciudades: Indice;
  modalidades: Indice;
  modalidadesPrueba: Indice;
  motivosPausa: Indice;
  alcancesSaro: Indice;
}

async function indices(tx: pg.PoolClient): Promise<Indices> {
  const vivo = "fusionado_en_id IS NULL";
  const indice = async (sql: string): Promise<Indice> =>
    new Map((await tx.query(sql)).rows.map((f) => [normalizar(f.nombre), f.id as string]));
  return {
    roles: new Map(
      (
        await tx.query(`SELECT id, nombre, familia_id FROM inventario.catalogo_roles WHERE ${vivo}`)
      ).rows.map((f) => [normalizar(f.nombre), { id: f.id, familiaId: f.familia_id }]),
    ),
    familias: await indice(`SELECT id, nombre FROM inventario.catalogo_familias WHERE ${vivo}`),
    tecnologias: await indice(
      `SELECT id, nombre FROM inventario.catalogo_tecnologias WHERE ${vivo}`,
    ),
    sectores: await indice(`SELECT id, nombre FROM inventario.catalogo_sectores WHERE ${vivo}`),
    seniorities: await indice(`SELECT id, nombre FROM inventario.catalogo_seniorities`),
    ciudades: await indice(`SELECT id, nombre FROM inventario.catalogo_ciudades ORDER BY nombre`),
    modalidades: await indice(`SELECT id, nombre FROM inventario.catalogo_modalidades`),
    modalidadesPrueba: await indice(
      `SELECT id, nombre FROM inventario.catalogo_modalidades_prueba WHERE ${vivo}`,
    ),
    motivosPausa: await indice(`SELECT id, nombre FROM inventario.catalogo_motivos_pausa`),
    alcancesSaro: await indice(
      `SELECT id, nombre FROM inventario.catalogo_alcances_saro WHERE ${vivo}`,
    ),
  };
}

const MODALIDAD_DESDE_FORMATO = new Map(
  Object.entries(MODALIDAD_FORMATO).map(([clave, f]) => [normalizar(f), clave]),
);
const VINCULO_DESDE_FORMATO = new Map(
  Object.entries(VINCULO_FORMATO).map(([clave, f]) => [normalizar(f), clave as Vinculo]),
);

class Traductor {
  // Valores nuevos de la taxonomía que la importación crea (§6: ampliar el banco es legítimo).
  readonly creados: CambioAuditado[] = [];

  constructor(
    private readonly tx: pg.PoolClient,
    private readonly k: Indices,
    private readonly actor: string,
  ) {}

  private id(indice: Indice, nombre: string, campo: string): string {
    const id = indice.get(normalizar(nombre));
    if (!id) throw new RechazoInventario("valor_no_disponible", { campo, nombre });
    return id;
  }

  private async valorAbierto(
    tabla: "catalogo_tecnologias" | "catalogo_sectores",
    indice: Indice,
    nombre: string,
  ): Promise<string> {
    const ya = indice.get(normalizar(nombre));
    if (ya) return ya;
    const id = (
      await this.tx.query(`INSERT INTO inventario.${tabla} (nombre) VALUES ($1) RETURNING id`, [
        nombre,
      ])
    ).rows[0].id as string;
    indice.set(normalizar(nombre), id);
    this.creados.push(this.cambioCatalogo(tabla, id, nombre));
    return id;
  }

  private async rol(nombre: string, familia: string | null): Promise<string> {
    const ya = this.k.roles.get(normalizar(nombre));
    if (ya) return ya.id;
    if (!familia) throw new RechazoInventario("rol_nuevo_sin_familia", { rol: nombre });
    const familiaId = this.id(this.k.familias, familia, "familia");
    const id = (
      await this.tx.query(
        `INSERT INTO inventario.catalogo_roles (nombre, familia_id) VALUES ($1, $2) RETURNING id`,
        [nombre, familiaId],
      )
    ).rows[0].id as string;
    this.k.roles.set(normalizar(nombre), { id, familiaId });
    this.creados.push(this.cambioCatalogo("catalogo_roles", id, nombre));
    return id;
  }

  private cambioCatalogo(tabla: string, id: string, nombre: string): CambioAuditado {
    return {
      actor: this.actor,
      entidad: tabla,
      entidadId: id,
      campo: "nombre",
      antes: null,
      despues: nombre,
      origen: "importacion",
    };
  }

  // Los valores del formato (los del plan: `despues` de cada cambio o la ficha de un nuevo) a la
  // entrada del editor. Solo las claves presentes: lo ausente no se toca (§5.1).
  async entrada(
    v: Partial<Record<ClaveCampo, Valor>>,
    familia: string | null,
  ): Promise<EntradaPerfil> {
    const e: EntradaPerfil = {};
    const s = (x: Valor | undefined) => (typeof x === "string" && x ? x : null);
    const lista = (x: Valor | undefined) => (Array.isArray(x) ? x : []);
    if ("nombre" in v) e.nombre = s(v.nombre);
    if ("primerApellido" in v) e.primerApellido = s(v.primerApellido);
    if ("rol" in v) e.rolId = s(v.rol) ? await this.rol(s(v.rol)!, familia) : null;
    if ("seniority" in v)
      e.seniorityId = s(v.seniority)
        ? this.id(this.k.seniorities, s(v.seniority)!, "seniority")
        : null;
    if ("aniosExperiencia" in v)
      e.aniosExperiencia = typeof v.aniosExperiencia === "number" ? v.aniosExperiencia : null;
    if ("tecnologias" in v) {
      e.tecnologiaIds = [];
      for (const t of lista(v.tecnologias))
        e.tecnologiaIds.push(
          await this.valorAbierto("catalogo_tecnologias", this.k.tecnologias, t),
        );
    }
    if ("sectores" in v) {
      e.sectorIds = [];
      for (const t of lista(v.sectores))
        e.sectorIds.push(await this.valorAbierto("catalogo_sectores", this.k.sectores, t));
    }
    if ("modalidad" in v) {
      const clave = s(v.modalidad) && MODALIDAD_DESDE_FORMATO.get(normalizar(s(v.modalidad)!));
      e.modalidadTrabajoId = clave ? this.id(this.k.modalidades, clave, "modalidad") : null;
    }
    if ("ciudad" in v)
      e.ciudadId = s(v.ciudad) ? this.id(this.k.ciudades, s(v.ciudad)!, "ciudad") : null;
    if ("disponibilidad" in v)
      e.disponibilidad = s(v.disponibilidad) ? { fecha: s(v.disponibilidad)! } : null;
    if ("modalidadPrueba" in v)
      e.modalidadPruebaId = s(v.modalidadPrueba)
        ? this.id(this.k.modalidadesPrueba, s(v.modalidadPrueba)!, "modalidadPrueba")
        : null;
    // Validaciones de entrada (HU-191): el alcance por su id del catálogo; las fechas tal cual (el editor
    // vuelve a aplicar la regla de no futura).
    if ("saroAlcance" in v)
      e.saroAlcanceId = s(v.saroAlcance)
        ? this.id(this.k.alcancesSaro, s(v.saroAlcance)!, "saroAlcance")
        : null;
    if ("saroFecha" in v) e.saroFecha = s(v.saroFecha);
    if ("discFecha" in v) e.discFecha = s(v.discFecha);
    for (const c of ["capacidad", "anclaje", "resumen", "formacion"] as const)
      if (c in v) e[c] = s(v[c]);
    if ("vinculo" in v)
      e.vinculo = s(v.vinculo)
        ? (VINCULO_DESDE_FORMATO.get(normalizar(s(v.vinculo)!)) ?? null)
        : null;
    if ("idiomas" in v) e.idiomas = lista(v.idiomas);
    if ("selloPersonal" in v) e.selloPersonal = lista(v.selloPersonal);
    if ("experiencias" in v)
      e.experiencias = lista(v.experiencias).map((t) => {
        const x = leerExperiencia(t)!;
        return {
          cargo: x.cargo,
          cliente: x.cliente,
          desde: x.desde,
          hasta: x.hasta,
          descripcion: x.descripcion,
        };
      });
    return e;
  }

  motivoPausa(v: Valor | undefined): string | null {
    return typeof v === "string" && v ? this.id(this.k.motivosPausa, v, "motivoPausa") : null;
  }
}

// ─── estado previo de un perfil (lo que la reversión restaura, HU-087) ─────────────────────

// Solo los campos que la importación puede cambiar: nunca el consentimiento ni nada B.4 (la columna
// `estado_previo` lo exige con `solo_claves_de_estado_previo`).
export const SQL_ESTADO_PREVIO = `
SELECT jsonb_build_object(
  'nombre', p.nombre, 'primer_apellido', p.primer_apellido, 'estado', p.estado,
  'familia_id', p.familia_id, 'seniority_id', p.seniority_id, 'anios_experiencia', p.anios_experiencia,
  'modalidad_id', p.modalidad_id, 'pais_id', p.pais_id, 'ciudad_id', p.ciudad_id,
  'saro_alcance_id', p.saro_alcance_id, 'saro_fecha', p.saro_fecha, 'disc_fecha', p.disc_fecha,
  'disponibilidad_fecha', p.disponibilidad_fecha, 'disponibilidad_actualizada_en', p.disponibilidad_actualizada_en,
  'motivo_pausa_id', p.motivo_pausa_id, 'pausado_en', p.pausado_en, 'modalidad_prueba_id', p.modalidad_prueba_id,
  'capacidad', p.capacidad, 'anclaje', p.anclaje, 'resumen', p.resumen, 'vinculo', p.vinculo,
  'formacion', p.formacion, 'idiomas', to_jsonb(p.idiomas), 'sello_personal', to_jsonb(p.sello_personal),
  'roles', (SELECT COALESCE(jsonb_agg(h.valor_id ORDER BY h.orden), '[]') FROM inventario.perfil_roles h WHERE h.perfil_id = p.id),
  'tecnologias', (SELECT COALESCE(jsonb_agg(h.valor_id ORDER BY h.orden), '[]') FROM inventario.perfil_tecnologias h WHERE h.perfil_id = p.id),
  'sectores', (SELECT COALESCE(jsonb_agg(h.valor_id ORDER BY h.orden), '[]') FROM inventario.perfil_sectores h WHERE h.perfil_id = p.id),
  'experiencias', (SELECT COALESCE(jsonb_agg(e.id ORDER BY e.orden), '[]') FROM inventario.perfil_experiencias e WHERE e.perfil_id = p.id AND e.vigente)
) AS previo
  FROM inventario.perfiles p WHERE p.id = $1`;

// ─── aplicar ────────────────────────────────────────────────────────────────────────────────

// Lo que vio la persona frente a lo que saldría ahora: mismo grupo y mismos cambios por fila (como
// tuplas: `jsonb` no conserva el orden de las claves).
const huella = (f: Pick<FilaPlan, "numero" | "grupo" | "incluida" | "cambios">) =>
  JSON.stringify([f.numero, f.grupo, f.incluida, f.cambios.map((c) => [c.campo, c.antes, c.despues])]);

export async function aplicarLote(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  loteId: string,
  o: OpcionesAplicar,
): Promise<ResultadoAplicar> {
  const reloj = o.reloj ?? Date.now;
  const limite = reloj() + (o.topeMs ?? TOPE_APLICAR_MS);
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
        `SELECT l.estado, l.modo, l.bloqueado, u.id AS usuario_id, u.correo
           FROM inventario.lotes_importacion l
           LEFT JOIN identidad_panel.usuarios_panel u ON u.id = l.confirmado_por
          WHERE l.id = $1 FOR UPDATE OF l`,
        [loteId],
      )
    ).rows[0];
    if (!lote) throw new RechazoInventario("no_existe");
    if (lote.estado !== "calculado") {
      await tx.query("ROLLBACK");
      return { tipo: "sin_efecto", estado: lote.estado };
    }
    if (!lote.usuario_id) throw new RechazoInventario("sin_confirmar");
    if (lote.bloqueado) throw new RechazoInventario("codigo_repetido");
    const autor = { usuarioId: lote.usuario_id as string, correo: lote.correo as string };

    // 3. Revalidar: el plan de ahora debe ser el que se vio.
    const guardadas = (
      await tx.query(
        `SELECT numero, grupo, incluida, cambios FROM inventario.lote_filas WHERE lote_id = $1 ORDER BY numero`,
        [loteId],
      )
    ).rows as Array<Pick<FilaPlan, "numero" | "grupo" | "incluida" | "cambios">>;
    const { filas } = (await filasDelLote(tx, loteId))!;
    const banco = await bancoEnFormato(tx);
    const porCodigo = new Map(banco.map((f) => [f.codigo as string, f]));
    const plan = calcularPlan({
      filas,
      modo: lote.modo,
      banco: porCodigo,
      catalogos: await catalogosImportacion(tx),
      hoy: o.hoy,
      colocados: await colocadosVigentes(tx),
      excluidas: new Set(guardadas.filter((f) => !f.incluida).map((f) => f.numero)),
    });
    const vistas = new Map(guardadas.map((f) => [f.numero, huella(f)]));
    if (plan.filas.some((f) => vistas.get(f.numero) !== huella(f)))
      throw new RechazoInventario("banco_cambiado");

    // 4. Aplicar fila por fila.
    const ahora = new Date(reloj());
    const traductor = new Traductor(tx, await indices(tx), autor.correo);
    const cambios: CambioAuditado[] = [];
    const tocados: Array<{ numero: number; perfilId: string; creado: boolean; previo: unknown }> =
      [];
    let visible = false;
    const cuenta = { creados: 0, actualizados: 0, archivados: 0 };
    for (const f of plan.filas) {
      if (!f.incluida || !["nuevo", "actualizado", "archivado"].includes(f.grupo)) continue;
      if (reloj() > limite) throw new RechazoInventario("tope_de_tiempo");
      const celdaFamilia = filas.find((x) => x.numero === f.numero)?.celdas.familia ?? null;
      if (f.grupo === "nuevo") {
        const ficha: FilaBanco = { ...f.ficha };
        delete ficha.codigo;
        delete ficha.estado;
        delete ficha.familia;
        const familia = typeof f.ficha?.familia === "string" ? f.ficha.familia : celdaFamilia;
        const entrada = await traductor.entrada(ficha, familia);
        const alta = await altaEnTransaccion(tx, claves, autor, entrada, {
          origen: "importacion",
          ahora,
          codigo: f.codigo!,
        });
        cambios.push(...alta.cambios);
        tocados.push({ numero: f.numero, perfilId: alta.perfil.id, creado: true, previo: null });
        cuenta.creados++;
        continue;
      }
      const fila = (
        await tx.query(`SELECT id FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`, [
          f.codigo,
        ])
      ).rows[0];
      const previo = (await tx.query(SQL_ESTADO_PREVIO, [fila.id])).rows[0].previo;
      const antes = (await leerPerfil(tx, f.codigo!))!;
      const valores = Object.fromEntries(f.cambios.map((c) => [c.campo, c.despues])) as Partial<
        Record<ClaveCampo, Valor>
      >;
      const actual = porCodigo.get(f.codigo!)!;
      const familia =
        typeof valores.familia === "string"
          ? valores.familia
          : (celdaFamilia ?? (typeof actual.familia === "string" ? actual.familia : null));
      // Estado y motivo de pausa: no son del editor; van primero para que el diff de abajo los vea.
      if ("estado" in valores || "motivoPausa" in valores) {
        const sets: string[] = [];
        const vals: unknown[] = [fila.id];
        if ("estado" in valores) {
          vals.push(valores.estado);
          sets.push(`estado = $${vals.length}`);
        }
        if ("motivoPausa" in valores) {
          vals.push(traductor.motivoPausa(valores.motivoPausa));
          sets.push(`motivo_pausa_id = $${vals.length}`);
          cambios.push({
            actor: autor.correo,
            entidad: "perfiles",
            entidadId: fila.id,
            campo: "motivo_pausa",
            titular: f.codigo!,
            antes: typeof actual.motivoPausa === "string" ? actual.motivoPausa : null,
            despues: typeof valores.motivoPausa === "string" ? valores.motivoPausa : null,
            origen: "importacion",
          });
        }
        await tx.query(`UPDATE inventario.perfiles SET ${sets.join(", ")} WHERE id = $1`, vals);
      }
      const delEditor = { ...valores };
      delete delEditor.estado;
      delete delEditor.motivoPausa;
      delete delEditor.familia;
      const edicion = await edicionEnTransaccion(
        tx,
        autor,
        antes,
        await traductor.entrada(delEditor, familia),
        { origen: "importacion", ahora },
      );
      cambios.push(...edicion.cambios);
      if (VISIBLES.has(antes.estado) || VISIBLES.has(edicion.perfil.estado)) visible = true;
      tocados.push({ numero: f.numero, perfilId: fila.id, creado: false, previo });
      if (f.grupo === "archivado") cuenta.archivados++;
      else cuenta.actualizados++;
    }
    if (traductor.creados.length) visible = true;
    cambios.unshift(...traductor.creados);

    // Estado previo y versión que deja la importación, por fila tocada.
    for (const t of tocados)
      await tx.query(
        `UPDATE inventario.lote_filas
            SET perfil_id = $3, creado = $4, estado_previo = $5,
                version_aplicada = (SELECT version FROM inventario.perfiles WHERE id = $3)
          WHERE lote_id = $1 AND numero = $2`,
        [
          loteId,
          t.numero,
          t.perfilId,
          t.creado,
          t.previo === null ? null : JSON.stringify(t.previo),
        ],
      );
    await tx.query(
      `UPDATE inventario.lotes_importacion SET estado = 'aplicado', aplicado_en = now(), actualizado_en = now()
        WHERE id = $1`,
      [loteId],
    );
    cambios.push({
      actor: autor.correo,
      entidad: "lotes_importacion",
      entidadId: loteId,
      campo: "estado",
      antes: "calculado",
      despues: "aplicado",
      origen: "importacion",
    });

    // 5. Una sola subida de la versión global y una sola toma de la cabeza de auditoría.
    if (visible)
      await tx.query(
        `UPDATE inventario.inventario_version SET version = version + 1, actualizado_en = now() WHERE id = 1`,
      );
    await registrarAuditoria(tx, claves, cambios, { tipo: "lote", id: loteId });
    await tx.query("COMMIT");
    return { tipo: "aplicado", ...cuenta };
  } catch (e) {
    await tx.query("ROLLBACK").catch(() => {});
    const motivo = e instanceof RechazoInventario ? e.motivo : "error_inesperado";
    await abortarLote(bd, loteId, motivo);
    if (!(e instanceof RechazoInventario)) throw e;
    return { tipo: "abortado", motivo };
  } finally {
    tx.release();
  }
}

// Transacción corta: el lote que no se aplicó queda `abortado` con su motivo (solo si sigue
// `calculado`; un lote ya aplicado nunca se marca abortado).
export async function abortarLote(bd: pg.Pool, loteId: string, motivo: string): Promise<void> {
  await bd.query(
    `UPDATE inventario.lotes_importacion SET estado = 'abortado', motivo_aborto = $2, actualizado_en = now()
      WHERE id = $1 AND estado = 'calculado'`,
    [loteId, motivo],
  );
}
