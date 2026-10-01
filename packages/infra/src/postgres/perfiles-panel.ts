// ServicioPerfiles (diseño §1–§2, ADR-0003; HU-125, HU-127): única vía de escritura del perfil desde el
// panel. Crear deja siempre un borrador con los valores elegidos del catálogo (nunca texto libre) y la
// clave de titular del profesional; guardar exige la versión que se abrió (If-Match → 409 si cambió);
// el consentimiento nominal se registra con su autor y su revocación saca al perfil de publicado en la
// misma transacción. Todo pasa por la unidad de trabajo del inventario (versión global + auditoría por
// campo con la clave del titular). Editar un publicado es de HU-126 (dos pasos, sub-slice 6).
import "server-only";
import { randomBytes } from "node:crypto";
import type pg from "pg";
import { envolverClave } from "@ps/dominio/auditoria/cadena";
import { ESTADO_INICIAL, transicion, type EstadoAlmacenado } from "@ps/dominio/inventario/estados";
import {
  clienteEnDescripcion,
  evaluarPublicacion,
  fechaDeOpcionDisponibilidad,
  validarConsentimiento,
  type EvaluacionPublicacion,
  type OpcionDisponibilidad,
} from "@ps/dominio/inventario/perfil";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import type { Autor } from "./catalogos-panel";
import { RechazoInventario, conUnidadInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

export interface ExperienciaEntrada {
  id?: string | null;
  cargo: string;
  cliente?: string | null;
  desde?: number | null;
  hasta?: number | null;
  descripcion: string;
}

export const VINCULOS = ["vinculado", "banco_no_vinculado", "fabrica"] as const;
export type Vinculo = (typeof VINCULOS)[number];

// Lo que el editor envía: identificadores del catálogo, no nombres (HU-089 «seleccionar en vez de
// escribir»). Todo es opcional: un borrador se guarda incompleto y se le dice qué falta.
export interface EntradaPerfil {
  nombre?: string | null;
  primerApellido?: string | null;
  rolId?: string | null;
  tecnologiaIds?: string[];
  // Varios sectores del catálogo, como las tecnologías; ninguno es válido (D23, D24).
  sectorIds?: string[];
  seniorityId?: string | null;
  aniosExperiencia?: number | null;
  ciudadId?: string | null;
  modalidadTrabajoId?: string | null;
  disponibilidad?: { opcion: OpcionDisponibilidad } | { fecha: string } | null;
  modalidadPruebaId?: string | null;
  capacidad?: string | null;
  anclaje?: string | null;
  resumen?: string | null;
  vinculo?: Vinculo | null;
  formacion?: string | null;
  idiomas?: string[];
  selloPersonal?: string[];
  aporte?: string | null;
  experiencias?: ExperienciaEntrada[];
}

export interface ExperienciaPerfil {
  id: string;
  cargo: string;
  cliente: string | null;
  desde: number | null;
  hasta: number | null;
  descripcion: string;
}

export interface ConsentimientoPerfil {
  vigente: boolean;
  nominal: boolean;
  incluyeClientes: boolean;
  anteQuien: string;
  vigencia: string;
  firmadoEn: string | null;
  registradoPor: string | null;
  registradoEn: string;
  revocadoPor: string | null;
  revocadoEn: string | null;
}

export interface PerfilEditor {
  id: string;
  codigo: string;
  estado: EstadoAlmacenado;
  version: number;
  actualizadoEn: string;
  nombre: string | null;
  primerApellido: string | null;
  rol: { id: string; nombre: string } | null;
  familia: { id: string; nombre: string; modalidades: number } | null;
  tecnologias: Array<{ id: string; nombre: string }>;
  sectores: Array<{ id: string; nombre: string }>;
  seniority: { id: string; nombre: string } | null;
  aniosExperiencia: number | null;
  ciudad: { id: string; nombre: string; pais: string } | null;
  modalidadTrabajo: { id: string; nombre: string; textoCliente: string } | null;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: string | null;
  modalidadPrueba: { id: string; nombre: string; activa: boolean; textoCliente: string } | null;
  capacidad: string | null;
  anclaje: string | null;
  resumen: string | null;
  vinculo: Vinculo | null;
  formacion: string | null;
  idiomas: string[];
  selloPersonal: string[];
  aporte: string | null;
  experiencias: ExperienciaPerfil[];
  consentimiento: ConsentimientoPerfil | null;
  // Reporte de validación confirmado de la modalidad elegida hoy (HU-130 edge) y el borrador
  // pendiente, si lo hay (HU-140).
  reporte: ReportePerfil | null;
  borradorValidacion: { id: string; creadaEn: string } | null;
  evaluacion: EvaluacionPublicacion;
}

export interface ReportePerfil {
  modalidad: string;
  resultado: string;
  evaluador: string;
  fecha: string;
  criterios: string[];
  enunciadoReto: string;
  entregables: string;
  confirmadaPor: string | null;
  confirmadaEn: string;
}

const texto = (s: string | null | undefined) => {
  const t = s?.trim();
  return t ? t : null;
};
const lista = (xs: string[] | undefined) => [
  ...new Set((xs ?? []).map((x) => x.trim()).filter(Boolean)),
];

// ─── lectura ────────────────────────────────────────────────────────────────────────────────

export async function leerPerfil(bd: Consultor, codigo: string): Promise<PerfilEditor | null> {
  const r = await bd.query(
    `SELECT p.*, f.nombre AS familia_nombre,
            (SELECT count(*)::int FROM inventario.catalogo_modalidades_prueba m
              WHERE m.familia_id = p.familia_id AND m.activo) AS familia_modalidades,
            s.nombre AS seniority_nombre, ci.nombre AS ciudad_nombre, pa.nombre AS pais_nombre,
            mo.nombre AS modalidad_nombre, mo.texto_cliente AS modalidad_texto,
            mp.nombre AS prueba_nombre, mp.activo AS prueba_activa, mp.texto_cliente AS prueba_texto,
            mp.familia_id AS prueba_familia
       FROM inventario.perfiles p
       LEFT JOIN inventario.catalogo_familias f ON f.id = p.familia_id
       LEFT JOIN inventario.catalogo_seniorities s ON s.id = p.seniority_id
       LEFT JOIN inventario.catalogo_ciudades ci ON ci.id = p.ciudad_id
       LEFT JOIN inventario.catalogo_paises pa ON pa.id = p.pais_id
       LEFT JOIN inventario.catalogo_modalidades mo ON mo.id = p.modalidad_id
       LEFT JOIN inventario.catalogo_modalidades_prueba mp ON mp.id = p.modalidad_prueba_id
      WHERE p.codigo = $1`,
    [codigo],
  );
  const p = r.rows[0];
  if (!p) return null;
  const hija = async (tabla: string, catalogo: string) =>
    (
      await bd.query(
        `SELECT v.id, v.nombre FROM inventario.${tabla} h JOIN inventario.${catalogo} v ON v.id = h.valor_id
          WHERE h.perfil_id = $1 ORDER BY h.orden`,
        [p.id],
      )
    ).rows as Array<{ id: string; nombre: string }>;
  const roles = await hija("perfil_roles", "catalogo_roles");
  const tecnologias = await hija("perfil_tecnologias", "catalogo_tecnologias");
  const sectores = await hija("perfil_sectores", "catalogo_sectores");
  const experiencias = (
    await bd.query(
      `SELECT id, cargo, cliente_nombrado, desde, hasta, descripcion FROM inventario.perfil_experiencias
        WHERE perfil_id = $1 AND vigente ORDER BY orden`,
      [p.id],
    )
  ).rows.map((e) => ({
    id: e.id,
    cargo: e.cargo,
    cliente: e.cliente_nombrado,
    desde: e.desde,
    hasta: e.hasta,
    descripcion: e.descripcion,
  }));
  // El vigente si lo hay; si no, el último revocado (para explicar por qué no se publica).
  const c = (
    await bd.query(
      `SELECT c.*, ur.correo AS registrado_correo, uv.correo AS revocado_correo
         FROM inventario.consentimientos c
         LEFT JOIN identidad_panel.usuarios_panel ur ON ur.id = c.registrado_por
         LEFT JOIN identidad_panel.usuarios_panel uv ON uv.id = c.revocado_por
        WHERE c.perfil_id = $1 ORDER BY c.vigente DESC, c.otorgado_en DESC LIMIT 1`,
      [p.id],
    )
  ).rows[0];
  const consentimiento: ConsentimientoPerfil | null = c
    ? {
        vigente: c.vigente,
        nominal: c.nominal,
        incluyeClientes: c.incluye_clientes,
        anteQuien: c.ante_quien,
        vigencia: c.vigencia,
        firmadoEn: c.firmado_en ? c.firmado_en.toISOString().slice(0, 10) : null,
        registradoPor: c.registrado_correo ?? null,
        registradoEn: c.otorgado_en.toISOString(),
        revocadoPor: c.revocado_correo ?? null,
        revocadoEn: c.revocado_en?.toISOString() ?? null,
      }
    : null;
  const fecha = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
  const modalidadPrueba = p.modalidad_prueba_id
    ? {
        id: p.modalidad_prueba_id,
        nombre: p.prueba_nombre,
        // Activa y de la familia del rol actual (D10): una de otra familia no sirve para publicar.
        activa: p.prueba_activa && p.prueba_familia === p.familia_id,
        textoCliente: p.prueba_texto,
      }
    : null;
  const v = (
    await bd.query(
      `SELECT x.id, x.estado, x.resultado, x.evaluador, x.fecha::text AS fecha, x.criterios, x.enunciado_reto,
              x.entregables, x.creada_en, x.confirmada_en, u.correo AS confirmada_correo, m.nombre AS modalidad
         FROM inventario.validaciones x
         JOIN inventario.catalogo_modalidades_prueba m ON m.id = x.modalidad_prueba_id
         LEFT JOIN identidad_panel.usuarios_panel u ON u.id = x.confirmada_por
        WHERE x.perfil_id = $1
          AND (x.estado = 'borrador' OR (x.estado = 'confirmada' AND x.modalidad_prueba_id = $2))
        ORDER BY x.estado = 'borrador' DESC, x.confirmada_en DESC`,
      [p.id, p.modalidad_prueba_id],
    )
  ).rows;
  const confirmada = v.find((x) => x.estado === "confirmada");
  const pendiente = v.find((x) => x.estado === "borrador");
  const perfil: Omit<PerfilEditor, "evaluacion"> = {
    id: p.id,
    codigo: p.codigo,
    estado: p.estado,
    version: p.version,
    actualizadoEn: p.actualizado_en.toISOString(),
    nombre: p.nombre,
    primerApellido: p.primer_apellido,
    rol: roles[0] ?? null,
    familia: p.familia_id
      ? { id: p.familia_id, nombre: p.familia_nombre, modalidades: p.familia_modalidades }
      : null,
    tecnologias,
    sectores,
    seniority: p.seniority_id ? { id: p.seniority_id, nombre: p.seniority_nombre } : null,
    aniosExperiencia: p.anios_experiencia,
    ciudad: p.ciudad_id ? { id: p.ciudad_id, nombre: p.ciudad_nombre, pais: p.pais_nombre } : null,
    modalidadTrabajo: p.modalidad_id
      ? { id: p.modalidad_id, nombre: p.modalidad_nombre, textoCliente: p.modalidad_texto }
      : null,
    disponibilidadFecha: fecha(p.disponibilidad_fecha),
    disponibilidadActualizadaEn: p.disponibilidad_actualizada_en?.toISOString() ?? null,
    modalidadPrueba,
    capacidad: p.capacidad,
    anclaje: p.anclaje,
    resumen: p.resumen,
    vinculo: p.vinculo,
    formacion: p.formacion,
    idiomas: p.idiomas,
    selloPersonal: p.sello_personal,
    aporte: p.aporte,
    experiencias,
    consentimiento,
    reporte: confirmada
      ? {
          modalidad: confirmada.modalidad,
          resultado: confirmada.resultado,
          evaluador: confirmada.evaluador,
          fecha: confirmada.fecha,
          criterios: confirmada.criterios,
          enunciadoReto: confirmada.enunciado_reto,
          entregables: confirmada.entregables,
          confirmadaPor: confirmada.confirmada_correo ?? null,
          confirmadaEn: confirmada.confirmada_en.toISOString(),
        }
      : null,
    borradorValidacion: pendiente
      ? { id: pendiente.id, creadaEn: pendiente.creada_en.toISOString() }
      : null,
  };
  return { ...perfil, evaluacion: evaluar(perfil) };
}

function evaluar(p: Omit<PerfilEditor, "evaluacion">): EvaluacionPublicacion {
  return evaluarPublicacion({
    nombre: p.nombre ?? "",
    primerApellido: p.primerApellido ?? "",
    rol: Boolean(p.rol),
    tecnologias: p.tecnologias.length,
    seniority: Boolean(p.seniority),
    aniosExperiencia: p.aniosExperiencia,
    ciudad: Boolean(p.ciudad),
    modalidadTrabajo: Boolean(p.modalidadTrabajo),
    disponibilidadFecha: p.disponibilidadFecha,
    experiencias: p.experiencias.length,
    modalidadPrueba: {
      elegida: Boolean(p.modalidadPrueba),
      activa: Boolean(p.modalidadPrueba?.activa),
    },
    // Sin rol no hay familia que juzgar: lo que falta es el rol (y luego la modalidad).
    familiaConModalidades: !p.familia || p.familia.modalidades > 0,
    consentimiento: p.consentimiento
      ? { vigente: p.consentimiento.vigente, nominal: p.consentimiento.nominal }
      : null,
  });
}

export interface FilaInventario {
  codigo: string;
  nombre: string | null;
  primerApellido: string | null;
  estado: EstadoAlmacenado;
  rol: string | null;
  familia: string | null;
  seniority: string | null;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: string | null;
  actualizadoEn: string;
  consentimiento: boolean;
  faltan: number;
}

// Listado base del inventario (tarea 2.5): todos los perfiles (las pestañas filtran por estado), con lo
// que le falta a cada uno para publicarse.
export async function listarInventario(bd: Consultor): Promise<FilaInventario[]> {
  const r = await bd.query(
    `SELECT p.codigo FROM inventario.perfiles p ORDER BY p.actualizado_en DESC, p.codigo`,
  );
  const filas: FilaInventario[] = [];
  for (const { codigo } of r.rows) {
    const p = (await leerPerfil(bd, codigo))!;
    filas.push({
      codigo: p.codigo,
      nombre: p.nombre,
      primerApellido: p.primerApellido,
      estado: p.estado,
      rol: p.rol?.nombre ?? null,
      familia: p.familia?.nombre ?? null,
      seniority: p.seniority?.nombre ?? null,
      disponibilidadFecha: p.disponibilidadFecha,
      disponibilidadActualizadaEn: p.disponibilidadActualizadaEn,
      actualizadoEn: p.actualizadoEn,
      consentimiento: Boolean(p.consentimiento?.vigente),
      faltan:
        p.evaluacion.faltanDatos.length + p.evaluacion.condiciones.filter((c) => !c.cumple).length,
    });
  }
  return filas;
}

// Opciones de los selectores del editor: solo valores activos del catálogo (sin texto libre).
export interface OpcionValor {
  id: string;
  nombre: string;
}
export interface OpcionesEditor {
  roles: Array<OpcionValor & { familiaId: string; familia: string; modalidades: number }>;
  familias: Array<OpcionValor & { modalidades: number }>;
  seniorities: OpcionValor[];
  ciudades: Array<OpcionValor & { pais: string }>;
  modalidadesTrabajo: Array<OpcionValor & { textoCliente: string }>;
  modalidadesPrueba: Array<OpcionValor & { familiaId: string; textoCliente: string }>;
}
export async function opcionesEditor(bd: Consultor): Promise<OpcionesEditor> {
  const q = async (sql: string) => (await bd.query(sql)).rows;
  return {
    roles: await q(
      `SELECT r.id, r.nombre, r.familia_id AS "familiaId", f.nombre AS familia,
              (SELECT count(*)::int FROM inventario.catalogo_modalidades_prueba m WHERE m.familia_id = r.familia_id AND m.activo) AS modalidades
         FROM inventario.catalogo_roles r JOIN inventario.catalogo_familias f ON f.id = r.familia_id
        WHERE r.activo ORDER BY r.nombre`,
    ),
    familias: await q(
      `SELECT f.id, f.nombre,
              (SELECT count(*)::int FROM inventario.catalogo_modalidades_prueba m WHERE m.familia_id = f.id AND m.activo) AS modalidades
         FROM inventario.catalogo_familias f WHERE f.activo ORDER BY f.nombre`,
    ),
    seniorities: await q(
      `SELECT id, nombre FROM inventario.catalogo_seniorities WHERE activo ORDER BY orden`,
    ),
    ciudades: await q(
      `SELECT c.id, c.nombre, p.nombre AS pais FROM inventario.catalogo_ciudades c
         JOIN inventario.catalogo_paises p ON p.id = c.pais_id WHERE c.activo AND p.activo ORDER BY p.nombre, c.nombre`,
    ),
    modalidadesTrabajo: await q(
      `SELECT id, nombre, texto_cliente AS "textoCliente" FROM inventario.catalogo_modalidades WHERE activo
        ORDER BY array_position(ARRAY['remoto','hibrido','presencial'], nombre)`,
    ),
    modalidadesPrueba: await q(
      `SELECT id, nombre, familia_id AS "familiaId", texto_cliente AS "textoCliente"
         FROM inventario.catalogo_modalidades_prueba WHERE activo ORDER BY nombre`,
    ),
  };
}

// ─── escritura ──────────────────────────────────────────────────────────────────────────────

interface Resueltos {
  rol: { id: string; familia_id: string } | null;
  tecnologias: string[];
  sectores: string[];
  ciudad: { id: string; pais_id: string } | null;
}

// Cada id debe ser un valor ACTIVO de su catálogo: así nada entra como texto libre ni apunta a un
// valor retirado. La modalidad de prueba debe ser de la familia del rol (D10).
async function resolver(
  tx: Consultor,
  e: EntradaPerfil,
  familiaActual: string | null,
): Promise<Resueltos> {
  const activo = async (tabla: string, id: string, columnas = "id") => {
    const r = await tx.query(
      `SELECT ${columnas} FROM inventario.${tabla} WHERE id = $1 AND activo`,
      [id],
    );
    if (!r.rows[0]) throw new RechazoInventario("valor_no_disponible", { tabla, id });
    return r.rows[0];
  };
  const rol = e.rolId ? await activo("catalogo_roles", e.rolId, "id, familia_id") : null;
  const tecnologias = lista(e.tecnologiaIds);
  for (const t of tecnologias) await activo("catalogo_tecnologias", t);
  const sectores = lista(e.sectorIds);
  for (const s of sectores) await activo("catalogo_sectores", s);
  if (e.seniorityId) await activo("catalogo_seniorities", e.seniorityId);
  if (e.modalidadTrabajoId) await activo("catalogo_modalidades", e.modalidadTrabajoId);
  const ciudad = e.ciudadId ? await activo("catalogo_ciudades", e.ciudadId, "id, pais_id") : null;
  if (e.modalidadPruebaId) {
    const m = await activo("catalogo_modalidades_prueba", e.modalidadPruebaId, "id, familia_id");
    const familia = rol?.familia_id ?? (e.rolId === undefined ? familiaActual : null);
    if (m.familia_id !== familia) throw new RechazoInventario("modalidad_de_otra_familia");
  }
  for (const x of e.experiencias ?? [])
    if (clienteEnDescripcion(x.descripcion, texto(x.cliente)))
      throw new RechazoInventario("cliente_en_texto", { cargo: x.cargo, cliente: x.cliente });
  if ((e.selloPersonal?.length ?? 0) > 3) throw new RechazoInventario("sello_maximo_tres");
  return { rol, tecnologias, sectores, ciudad };
}

function fechaDisponibilidad(d: EntradaPerfil["disponibilidad"], ahora: Date): string | null {
  if (!d) return null;
  if ("fecha" in d) return d.fecha;
  return fechaDeOpcionDisponibilidad(d.opcion, ahora);
}

// Fotografía comparable del perfil para auditar solo lo que cambia (una fila por campo).
function foto(p: PerfilEditor | null): Record<string, string | null> {
  const j = (x: unknown) => (x === null || x === undefined ? null : JSON.stringify(x));
  return {
    nombre: p?.nombre ?? null,
    primer_apellido: p?.primerApellido ?? null,
    rol: p?.rol?.id ?? null,
    tecnologias: j(p?.tecnologias.map((t) => t.id)),
    sectores: j(p?.sectores.map((s) => s.id)),
    seniority: p?.seniority?.id ?? null,
    anios_experiencia: p?.aniosExperiencia?.toString() ?? null,
    ciudad: p?.ciudad?.id ?? null,
    modalidad_trabajo: p?.modalidadTrabajo?.id ?? null,
    disponibilidad_fecha: p?.disponibilidadFecha ?? null,
    modalidad_prueba: p?.modalidadPrueba?.id ?? null,
    capacidad: p?.capacidad ?? null,
    anclaje: p?.anclaje ?? null,
    resumen: p?.resumen ?? null,
    vinculo: p?.vinculo ?? null,
    formacion: p?.formacion ?? null,
    idiomas: j(p?.idiomas),
    sello_personal: j(p?.selloPersonal),
    aporte: p?.aporte ?? null,
    experiencias: j(
      p?.experiencias.map(({ cargo, cliente, desde, hasta, descripcion }) => ({
        cargo,
        cliente,
        desde,
        hasta,
        descripcion,
      })),
    ),
    estado: p?.estado ?? null,
  };
}

export function diferencias(
  antes: PerfilEditor | null,
  despues: PerfilEditor,
  autor: Autor,
  origen: CambioAuditado["origen"],
): CambioAuditado[] {
  const a = foto(antes);
  const d = foto(despues);
  return Object.keys(d)
    .filter((k) => a[k] !== d[k])
    .map((campo) => ({
      actor: autor.correo,
      entidad: "perfiles",
      entidadId: despues.id,
      campo,
      titular: despues.codigo,
      antes: a[campo]!,
      despues: d[campo]!,
      origen,
    }));
}

async function escribirCampos(
  tx: Consultor,
  id: string,
  e: EntradaPerfil,
  r: Resueltos,
  ahora: Date,
  anterior: PerfilEditor | null,
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [id];
  const fijar = (col: string, v: unknown) => {
    vals.push(v);
    sets.push(`${col} = $${vals.length}`);
  };
  if (e.nombre !== undefined) fijar("nombre", texto(e.nombre));
  if (e.primerApellido !== undefined) fijar("primer_apellido", texto(e.primerApellido));
  if (e.rolId !== undefined) fijar("familia_id", r.rol?.familia_id ?? null);
  if (e.seniorityId !== undefined) fijar("seniority_id", e.seniorityId);
  if (e.aniosExperiencia !== undefined) fijar("anios_experiencia", e.aniosExperiencia);
  if (e.ciudadId !== undefined) {
    fijar("ciudad_id", r.ciudad?.id ?? null);
    fijar("pais_id", r.ciudad?.pais_id ?? null);
  }
  if (e.modalidadTrabajoId !== undefined) fijar("modalidad_id", e.modalidadTrabajoId);
  if (e.disponibilidad !== undefined) {
    const f = fechaDisponibilidad(e.disponibilidad, ahora);
    if (f !== (anterior?.disponibilidadFecha ?? null)) {
      fijar("disponibilidad_fecha", f);
      fijar("disponibilidad_actualizada_en", f ? ahora : null);
    }
  }
  // Cambiar de rol a otra familia suelta la modalidad de prueba que ya no es de esa familia (D10).
  if (e.modalidadPruebaId !== undefined) fijar("modalidad_prueba_id", e.modalidadPruebaId);
  else if (e.rolId !== undefined && anterior?.familia?.id !== (r.rol?.familia_id ?? null))
    fijar("modalidad_prueba_id", null);
  for (const [k, col] of [
    ["capacidad", "capacidad"],
    ["anclaje", "anclaje"],
    ["resumen", "resumen"],
    ["formacion", "formacion"],
    ["aporte", "aporte"],
  ] as const)
    if (e[k] !== undefined) fijar(col, texto(e[k]));
  if (e.vinculo !== undefined) fijar("vinculo", e.vinculo);
  if (e.idiomas !== undefined) fijar("idiomas", lista(e.idiomas));
  if (e.selloPersonal !== undefined) fijar("sello_personal", lista(e.selloPersonal));
  if (sets.length)
    await tx.query(`UPDATE inventario.perfiles SET ${sets.join(", ")} WHERE id = $1`, vals);

  const hija = async (tabla: string, ids: string[]) => {
    const actuales = (
      await tx.query(
        `SELECT valor_id FROM inventario.${tabla} WHERE perfil_id = $1 ORDER BY orden`,
        [id],
      )
    ).rows.map((x) => x.valor_id as string);
    if (actuales.join() === ids.join()) return;
    // Las hijas se reescriben como dueño (ningún rol de conexión tiene DELETE, CON-11).
    await tx.query(`SELECT inventario.reemplazar_hijas($1, $2, $3::uuid[])`, [tabla, id, ids]);
  };
  if (e.rolId !== undefined) await hija("perfil_roles", r.rol ? [r.rol.id] : []);
  if (e.tecnologiaIds !== undefined) await hija("perfil_tecnologias", r.tecnologias);
  if (e.sectorIds !== undefined) await hija("perfil_sectores", r.sectores);

  if (e.experiencias !== undefined) {
    const vigentes = new Set(anterior?.experiencias.map((x) => x.id) ?? []);
    const conservadas = new Set(e.experiencias.map((x) => x.id).filter(Boolean) as string[]);
    for (const x of conservadas)
      if (!vigentes.has(x)) throw new RechazoInventario("experiencia_no_existe", { id: x });
    for (const v of vigentes)
      if (!conservadas.has(v))
        await tx.query(
          `UPDATE inventario.perfil_experiencias SET vigente = false, retirada_en = now() WHERE id = $1`,
          [v],
        );
    for (const [i, x] of e.experiencias.entries()) {
      const fila = [
        i + 1,
        x.cargo.trim(),
        texto(x.cliente),
        x.desde ?? null,
        x.hasta ?? null,
        x.descripcion.trim(),
      ];
      if (x.id)
        await tx.query(
          `UPDATE inventario.perfil_experiencias
              SET orden = $2, cargo = $3, cliente_nombrado = $4, desde = $5, hasta = $6, descripcion = $7
            WHERE id = $1 AND (orden, cargo, cliente_nombrado, desde, hasta, descripcion)
                  IS DISTINCT FROM ($2, $3, $4, $5, $6, $7)`,
          [x.id, ...fila],
        );
      else
        await tx.query(
          `INSERT INTO inventario.perfil_experiencias (perfil_id, orden, cargo, cliente_nombrado, desde, hasta, descripcion)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, ...fila],
        );
    }
  }
}

// Alta dentro de una transacción ya abierta: el panel (un perfil) y la importación (varios, en una
// sola transacción, con el código que trae la fila) escriben por aquí. Nace en borrador.
export async function altaEnTransaccion(
  tx: pg.PoolClient,
  claves: ClavesAuditoria,
  autor: Autor,
  e: EntradaPerfil,
  o: { origen: "panel" | "importacion"; ahora: Date; codigo?: string },
): Promise<{ perfil: PerfilEditor; cambios: CambioAuditado[] }> {
  const r = await resolver(tx, e, null);
  let codigo = o.codigo;
  if (!codigo) {
    // El siguiente código bajo candado: dos altas a la vez no chocan.
    await tx.query(`SELECT pg_advisory_xact_lock(hashtext('inventario.perfil_codigo'))`);
    codigo = (
      await tx.query(
        `SELECT 'PS-' || lpad((COALESCE(max(substr(codigo, 4)::int), 0) + 1)::text, 4, '0') AS c FROM inventario.perfiles`,
      )
    ).rows[0].c as string;
  }
  const id = (
    await tx.query(
      `INSERT INTO inventario.perfiles (codigo, estado, origen_creacion, creado_por) VALUES ($1, $2, $3, $4) RETURNING id`,
      [codigo, ESTADO_INICIAL, o.origen, autor.usuarioId],
    )
  ).rows[0].id as string;
  // Clave propia del profesional: su auditoría se cifra con ella y se puede suprimir aparte (H42).
  await tx.query(`INSERT INTO identidad.claves_titular (titular, clave_envuelta) VALUES ($1, $2)`, [
    codigo,
    envolverClave(claves.kek, randomBytes(32)),
  ]);
  await escribirCampos(tx, id, e, r, o.ahora, null);
  const perfil = (await leerPerfil(tx, codigo))!;
  return { perfil, cambios: diferencias(null, perfil, autor, o.origen) };
}

// Edición dentro de una transacción ya abierta, con el perfil ya bloqueado por quien llama y su
// estado anterior leído (`antes`): solo escribe lo que trae la entrada.
export async function edicionEnTransaccion(
  tx: pg.PoolClient,
  autor: Autor,
  antes: PerfilEditor,
  e: EntradaPerfil,
  o: { origen: "panel" | "importacion"; ahora: Date },
): Promise<{ perfil: PerfilEditor; cambios: CambioAuditado[] }> {
  const r = await resolver(tx, e, antes.familia?.id ?? null);
  await escribirCampos(tx, antes.id, e, r, o.ahora, antes);
  const perfil = (await leerPerfil(tx, antes.codigo))!;
  return { perfil, cambios: diferencias(antes, perfil, autor, o.origen) };
}

export async function crearPerfil(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  e: EntradaPerfil,
  ahora = new Date(),
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const { perfil, cambios } = await altaEnTransaccion(tx, claves, autor, e, {
      origen: "panel",
      ahora,
    });
    return { resultado: perfil, cambios, visible: false };
  });
}

export async function guardarPerfil(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  versionAbierta: number,
  e: EntradaPerfil,
  ahora = new Date(),
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const fila = (
      await tx.query(
        `SELECT id, version, estado FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`,
        [codigo],
      )
    ).rows[0];
    if (!fila) throw new RechazoInventario("no_existe");
    const antes = (await leerPerfil(tx, codigo))!;
    if (fila.version !== versionAbierta)
      throw new RechazoInventario("version_distinta", { version: fila.version, perfil: antes });
    // Un publicado se edita en dos pasos con su impacto a la vista (HU-126): no por esta vía.
    if (fila.estado !== "borrador")
      throw new RechazoInventario("editar_publicado", { estado: fila.estado });
    const { perfil, cambios } = await edicionEnTransaccion(tx, autor, antes, e, {
      origen: "panel",
      ahora,
    });
    return { resultado: perfil, cambios, visible: false };
  });
}

// Editar un publicado (HU-126, D1, D3; diseño §2): en dos pasos y con la versión que se abrió.
//  - `previsualizar`: aplica el cambio en una transacción que siempre se deshace y devuelve el perfil
//    vigente y el propuesto (el panel calcula con ellos qué ve el cliente): nada se escribe ni se audita.
//  - confirmar: aplica, audita cada campo y sube la versión del inventario (lo ve el cliente).
//  - Si el cambio deja el perfil sin algo que la publicación exige, ninguno de los dos escribe: la
//    respuesta es `deja_incompleto` con la pregunta de D1. `resolucion = descartar` no toca nada (ni
//    auditoría); `a_borrador` guarda el cambio y pasa a borrador en la misma transacción, auditado
//    con el motivo. El panel pregunta; nunca decide solo.
export type ResolucionIncompleto = "descartar" | "a_borrador";

// Lo que se guarda pero el cliente no ve (motivación, vínculo, capacidad, anclaje): se declara aparte.
const CAMPOS_INTERNOS = new Set(["capacidad", "anclaje", "vinculo", "aporte"]);

export type EdicionPublicado =
  | {
      resultado: "impacto" | "deja_incompleto";
      antes: PerfilEditor;
      propuesto: PerfilEditor;
      internos: string[];
    }
  | { resultado: "aplicado" | "a_borrador"; perfil: PerfilEditor }
  | { resultado: "descartado"; perfil: PerfilEditor };

async function publicadoBloqueado(tx: Consultor, codigo: string, versionAbierta: number) {
  const fila = (
    await tx.query(
      `SELECT id, version, estado FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`,
      [codigo],
    )
  ).rows[0];
  if (!fila) throw new RechazoInventario("no_existe");
  const antes = (await leerPerfil(tx, codigo))!;
  if (fila.version !== versionAbierta)
    throw new RechazoInventario("version_distinta", { version: fila.version, perfil: antes });
  if (!transicion(fila.estado, "a_borrador").ok)
    throw new RechazoInventario("no_es_publicado", { estado: fila.estado });
  return { fila, antes };
}

export async function editarPublicado(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  versionAbierta: number,
  e: EntradaPerfil,
  o: { previsualizar?: boolean; resolucion?: ResolucionIncompleto } = {},
  ahora = new Date(),
): Promise<EdicionPublicado> {
  if (o.resolucion === "descartar") {
    const { antes } = await publicadoBloqueado(bd, codigo, versionAbierta);
    return { resultado: "descartado", perfil: antes };
  }
  if (o.previsualizar) {
    const tx = await bd.connect();
    try {
      await tx.query("BEGIN");
      const { antes } = await publicadoBloqueado(tx, codigo, versionAbierta);
      const { perfil, cambios } = await edicionEnTransaccion(tx, autor, antes, e, {
        origen: "panel",
        ahora,
      });
      return {
        resultado: perfil.evaluacion.publicable ? "impacto" : "deja_incompleto",
        antes,
        propuesto: perfil,
        internos: cambios.map((c) => c.campo).filter((c) => CAMPOS_INTERNOS.has(c)),
      };
    } finally {
      await tx.query("ROLLBACK").catch(() => {});
      tx.release();
    }
  }
  try {
    return await conUnidadInventario<EdicionPublicado>(bd, claves, async (tx) => {
      const { fila, antes } = await publicadoBloqueado(tx, codigo, versionAbierta);
      const { perfil, cambios } = await edicionEnTransaccion(tx, autor, antes, e, {
        origen: "panel",
        ahora,
      });
      if (o.resolucion !== "a_borrador") {
        if (!perfil.evaluacion.publicable)
          throw new RechazoInventario("deja_incompleto", {
            antes,
            propuesto: perfil,
            internos: cambios.map((c) => c.campo).filter((c) => CAMPOS_INTERNOS.has(c)),
          });
        return { resultado: { resultado: "aplicado", perfil } as const, cambios, visible: true };
      }
      const t = transicion(fila.estado, "a_borrador") as { ok: true; a: EstadoAlmacenado };
      await tx.query(`UPDATE inventario.perfiles SET estado = $2 WHERE id = $1`, [fila.id, t.a]);
      const borrador = (await leerPerfil(tx, codigo))!;
      const salida = (campo: string, antes: string | null, despues: string) => ({
        actor: autor.correo,
        entidad: "perfiles",
        entidadId: fila.id as string,
        campo,
        titular: codigo,
        antes,
        despues,
        origen: "panel" as const,
      });
      return {
        resultado: { resultado: "a_borrador", perfil: borrador } as const,
        cambios: [
          ...cambios,
          salida("estado", fila.estado, t.a),
          salida("motivo_estado", null, "edicion_deja_incompleto"),
        ],
        visible: true,
      };
    });
  } catch (err) {
    // Sin respuesta a la pregunta de D1 no se escribe nada: el rechazo deshizo la transacción.
    if (err instanceof RechazoInventario && err.motivo === "deja_incompleto")
      return {
        resultado: "deja_incompleto",
        ...(err.detalle as { antes: PerfilEditor; propuesto: PerfilEditor; internos: string[] }),
      };
    throw err;
  }
}

// Publicar (HU-128, HU-130; diseño §2): borrador o pausado → publicado solo si `evaluarPublicacion`
// lo permite —consentimiento nominal vigente, modalidad de prueba activa de su familia (la familia
// con modalidades), datos obligatorios—. Si no, nada se escribe y el rechazo lleva la evaluación para
// decir exactamente qué falta. El Nivel 0 sale de la modalidad elegida: nadie redacta nada. El
// disparador de la 0017 repite la guarda para cualquier otra vía.
export async function publicarPerfil(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  versionAbierta?: number,
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const fila = (
      await tx.query(
        `SELECT id, version, estado FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`,
        [codigo],
      )
    ).rows[0];
    if (!fila) throw new RechazoInventario("no_existe");
    const antes = (await leerPerfil(tx, codigo))!;
    if (versionAbierta !== undefined && fila.version !== versionAbierta)
      throw new RechazoInventario("version_distinta", { version: fila.version, perfil: antes });
    const t = transicion(fila.estado, "publicar");
    if (!t.ok) throw new RechazoInventario("transicion_invalida", { estado: fila.estado });
    if (!antes.evaluacion.publicable)
      throw new RechazoInventario("no_publicable", {
        evaluacion: antes.evaluacion,
        familia: antes.familia,
      });
    await tx.query(`UPDATE inventario.perfiles SET estado = $2 WHERE id = $1`, [fila.id, t.a]);
    const despues = (await leerPerfil(tx, codigo))!;
    return {
      resultado: despues,
      cambios: [
        {
          actor: autor.correo,
          entidad: "perfiles",
          entidadId: fila.id,
          campo: "estado",
          titular: codigo,
          antes: fila.estado,
          despues: t.a,
          origen: "panel",
        },
      ],
      visible: true,
    };
  });
}

export const TOPE_PUBLICACION_MASIVA = 200;

export type ResultadoPublicacion =
  | { codigo: string; ok: true; perfil: PerfilEditor }
  | {
      codigo: string;
      ok: false;
      // Claves de condición o de dato que faltan (`consentimiento`, `modalidad_prueba`,
      // `tecnologias`…) o el rechazo de estado (`transicion_invalida`, `no_existe`).
      motivos: string[];
      evaluacion?: EvaluacionPublicacion;
      familia?: PerfilEditor["familia"];
      estado?: string;
    };

// Publicación masiva (HU-128 edge): cada perfil en su propia unidad de trabajo, para que uno que no
// cumple no aborte a los demás; el resultado dice, por perfil, si quedó publicado o por qué no.
export async function publicarVarios(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigos: string[],
): Promise<ResultadoPublicacion[]> {
  const unicos = [...new Set(codigos)];
  if (unicos.length > TOPE_PUBLICACION_MASIVA)
    throw new RechazoInventario("lote_demasiado_grande", { tope: TOPE_PUBLICACION_MASIVA });
  const resultados: ResultadoPublicacion[] = [];
  for (const codigo of unicos) {
    try {
      resultados.push({
        codigo,
        ok: true,
        perfil: await publicarPerfil(bd, claves, autor, codigo),
      });
    } catch (e) {
      if (!(e instanceof RechazoInventario)) throw e;
      const ev = e.detalle.evaluacion as EvaluacionPublicacion | undefined;
      resultados.push({
        codigo,
        ok: false,
        motivos: ev
          ? [
              ...ev.condiciones.filter((c) => !c.cumple).map((c) => c.clave as string),
              ...ev.faltanDatos.map((f) => f.campo as string),
            ].filter((m, i, xs) => xs.indexOf(m) === i)
          : [e.motivo],
        ...(ev ? { evaluacion: ev, familia: e.detalle.familia as PerfilEditor["familia"] } : {}),
        ...(typeof e.detalle.estado === "string" ? { estado: e.detalle.estado } : {}),
      });
    }
  }
  return resultados;
}

export interface AlcanceConsentimiento {
  nombreApellido: boolean;
  trayectoria: boolean;
  clientes: boolean;
  // Fecha en que el profesional lo firmó (AAAA-MM-DD); no puede ser futura.
  fechaFirma?: string | null;
}

// Registrar el consentimiento nominal (HU-127). Uno nuevo reemplaza al vigente (cambio de alcance):
// el anterior queda no vigente con su fecha; el perfil no cambia de estado.
export async function registrarConsentimiento(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
  alcance: AlcanceConsentimiento,
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const fila = (
      await tx.query(`SELECT id, estado FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`, [
        codigo,
      ])
    ).rows[0];
    if (!fila) throw new RechazoInventario("no_existe");
    if (fila.estado === "archivado") throw new RechazoInventario("archivado");
    const v = validarConsentimiento(alcance);
    if (!v.ok) throw new RechazoInventario("no_nominal");
    if (alcance.fechaFirma && alcance.fechaFirma > new Date().toISOString().slice(0, 10))
      throw new RechazoInventario("firma_futura");
    const antes = (await leerPerfil(tx, codigo))!;
    const previo = antes.consentimiento?.vigente ? antes.consentimiento : null;
    if (previo)
      await tx.query(
        `UPDATE inventario.consentimientos SET vigente = false, revocado_en = now() WHERE perfil_id = $1 AND vigente`,
        [fila.id],
      );
    const descripcion = v.incluyeClientes
      ? "nombre y primer apellido, trayectoria y clientes nombrados"
      : "nombre y primer apellido y trayectoria, sin clientes nombrados";
    await tx.query(
      `INSERT INTO inventario.consentimientos (perfil_id, alcance, nominal, incluye_clientes, firmado_en, registrado_por)
       VALUES ($1, $2, true, $3, $4, $5)`,
      [fila.id, descripcion, v.incluyeClientes, alcance.fechaFirma ?? null, autor.usuarioId],
    );
    const despues = (await leerPerfil(tx, codigo))!;
    const val = (c: ConsentimientoPerfil | null) =>
      c ? JSON.stringify({ nominal: c.nominal, incluyeClientes: c.incluyeClientes }) : null;
    return {
      resultado: despues,
      cambios: [
        {
          actor: autor.correo,
          entidad: "perfiles",
          entidadId: fila.id,
          campo: "consentimiento",
          titular: codigo,
          antes: val(previo),
          despues: val(despues.consentimiento),
          origen: "panel",
        },
      ],
      // Cambiar el alcance de un publicado cambia lo que ve el cliente (clientes nombrados).
      visible: fila.estado === "publicado" || fila.estado === "colocado",
    };
  });
}

// Revocar (HU-127): el consentimiento deja de estar vigente y, si el perfil estaba a la vista o
// pausado, pasa a borrador en la misma transacción. Un enlace curado lo muestra «no disponible».
export async function revocarConsentimiento(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  codigo: string,
): Promise<PerfilEditor> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const fila = (
      await tx.query(`SELECT id, estado FROM inventario.perfiles WHERE codigo = $1 FOR UPDATE`, [
        codigo,
      ])
    ).rows[0];
    if (!fila) throw new RechazoInventario("no_existe");
    const r = await tx.query(
      `UPDATE inventario.consentimientos SET vigente = false, revocado_en = now(), revocado_por = $2
        WHERE perfil_id = $1 AND vigente RETURNING id`,
      [fila.id, autor.usuarioId],
    );
    if (!r.rowCount) throw new RechazoInventario("sin_consentimiento");
    const t = transicion(fila.estado, "revocar_consentimiento");
    const cambios: CambioAuditado[] = [
      {
        actor: autor.correo,
        entidad: "perfiles",
        entidadId: fila.id,
        campo: "consentimiento",
        titular: codigo,
        antes: "vigente",
        despues: "revocado",
        origen: "revocacion",
      },
    ];
    if (t.ok && t.cambia) {
      await tx.query(
        `UPDATE inventario.perfiles SET estado = $2, fecha_liberacion = NULL WHERE id = $1`,
        [fila.id, t.a],
      );
      cambios.push({
        actor: autor.correo,
        entidad: "perfiles",
        entidadId: fila.id,
        campo: "estado",
        titular: codigo,
        antes: fila.estado,
        despues: t.a,
        origen: "revocacion",
      });
    }
    const despues = (await leerPerfil(tx, codigo))!;
    return { resultado: despues, cambios, visible: fila.estado !== "borrador" };
  });
}
