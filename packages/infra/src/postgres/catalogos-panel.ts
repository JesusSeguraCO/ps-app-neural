// Catálogos del panel (HU-089, HU-143; diseño §6): listar con uso, crear y editar sin duplicar
// (idéntico → bloqueo; parecido → confirmación explícita), desactivar y reactivar con el conteo de
// fichas dependientes, y fusionar con vista de impacto previa. Toda escritura pasa por la unidad de
// trabajo del inventario (versión global + auditoría con actor). Nunca se borra un valor (RF-8.16.5).
import "server-only";
import type pg from "pg";
import { clasificarNombre } from "@ps/dominio/catalogo/parecidos";
import type { TipoCatalogo } from "@ps/dominio/catalogo/tipos";
import type { CambioAuditado, ClavesAuditoria } from "./auditoria";
import { RechazoInventario, conUnidadInventario } from "./unidad-inventario";

type Consultor = Pick<pg.PoolClient, "query">;

const TABLA: Record<TipoCatalogo, string> = {
  rol: "catalogo_roles",
  familia: "catalogo_familias",
  tecnologia: "catalogo_tecnologias",
  sector: "catalogo_sectores",
  modalidad_prueba: "catalogo_modalidades_prueba",
  motivo_pausa: "catalogo_motivos_pausa",
};

// Perfiles que usan cada valor (archivados fuera: ya no están en el banco).
const USO: Record<TipoCatalogo, string> = {
  rol: `SELECT h.valor_id AS id, p.id AS perfil_id, p.estado FROM inventario.perfil_roles h JOIN inventario.perfiles p ON p.id = h.perfil_id`,
  tecnologia: `SELECT h.valor_id AS id, p.id AS perfil_id, p.estado FROM inventario.perfil_tecnologias h JOIN inventario.perfiles p ON p.id = h.perfil_id`,
  sector: `SELECT h.valor_id AS id, p.id AS perfil_id, p.estado FROM inventario.perfil_sectores h JOIN inventario.perfiles p ON p.id = h.perfil_id`,
  familia: `SELECT p.familia_id AS id, p.id AS perfil_id, p.estado FROM inventario.perfiles p WHERE p.familia_id IS NOT NULL`,
  modalidad_prueba: `SELECT p.modalidad_prueba_id AS id, p.id AS perfil_id, p.estado FROM inventario.perfiles p WHERE p.modalidad_prueba_id IS NOT NULL`,
  motivo_pausa: `SELECT p.motivo_pausa_id AS id, p.id AS perfil_id, p.estado FROM inventario.perfiles p WHERE p.motivo_pausa_id IS NOT NULL`,
};

export interface ValorListado {
  id: string;
  nombre: string;
  activo: boolean;
  fusionadoEn: string | null;
  // Rol y modalidad: su familia; tecnología: su grupo.
  grupo: string | null;
  familiaId: string | null;
  perfiles: number;
  publicados: number;
  // Familia: modalidades de prueba activas; modalidad: su texto de cara al cliente y plantilla.
  modalidades?: number;
  textoCliente?: string | null;
  enunciadoReto?: string | null;
  entregables?: string | null;
  criterios?: string | null;
  // Motivo de pausa: la ayuda que se ve al elegirlo.
  descripcion?: string | null;
}

export async function listarCatalogo(bd: Consultor, tipo: TipoCatalogo): Promise<ValorListado[]> {
  const extra =
    tipo === "rol" || tipo === "modalidad_prueba"
      ? `f.nombre AS grupo, v.familia_id AS familia_id`
      : tipo === "tecnologia"
        ? `v.grupo AS grupo, NULL::uuid AS familia_id`
        : `NULL::text AS grupo, NULL::uuid AS familia_id`;
  const union =
    tipo === "rol" || tipo === "modalidad_prueba"
      ? `LEFT JOIN inventario.catalogo_familias f ON f.id = v.familia_id`
      : "";
  const r = await bd.query(
    `WITH uso AS (${USO[tipo]})
     SELECT v.id, v.nombre, v.activo, v.fusionado_en_id, ${extra},
            (SELECT count(*)::int FROM uso WHERE uso.id = v.id AND uso.estado <> 'archivado') AS perfiles,
            (SELECT count(*)::int FROM uso WHERE uso.id = v.id AND uso.estado = 'publicado') AS publicados
            ${tipo === "familia" ? `, (SELECT count(*)::int FROM inventario.catalogo_modalidades_prueba m WHERE m.familia_id = v.id AND m.activo) AS modalidades` : ""}
            ${tipo === "modalidad_prueba" ? `, v.texto_cliente, v.enunciado_reto, v.entregables, v.criterios` : ""}
            ${tipo === "motivo_pausa" ? `, v.descripcion` : ""}
       FROM inventario.${TABLA[tipo]} v ${union}
      ORDER BY v.activo DESC, perfiles DESC, v.nombre`,
  );
  return r.rows.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    activo: f.activo,
    fusionadoEn: f.fusionado_en_id ?? null,
    grupo: f.grupo,
    familiaId: f.familia_id,
    perfiles: f.perfiles,
    publicados: f.publicados,
    ...(tipo === "familia" ? { modalidades: f.modalidades } : {}),
    ...(tipo === "modalidad_prueba"
      ? {
          textoCliente: f.texto_cliente,
          enunciadoReto: f.enunciado_reto,
          entregables: f.entregables,
          criterios: f.criterios,
        }
      : {}),
    ...(tipo === "motivo_pausa" ? { descripcion: f.descripcion } : {}),
  }));
}

export async function conteosCatalogos(bd: Consultor): Promise<Record<TipoCatalogo, number>> {
  const r = await bd.query(
    `SELECT (SELECT count(*) FROM inventario.catalogo_roles WHERE fusionado_en_id IS NULL)::int AS rol,
            (SELECT count(*) FROM inventario.catalogo_familias WHERE fusionado_en_id IS NULL)::int AS familia,
            (SELECT count(*) FROM inventario.catalogo_tecnologias WHERE fusionado_en_id IS NULL)::int AS tecnologia,
            (SELECT count(*) FROM inventario.catalogo_sectores WHERE fusionado_en_id IS NULL)::int AS sector,
            (SELECT count(*) FROM inventario.catalogo_modalidades_prueba WHERE fusionado_en_id IS NULL)::int AS modalidad_prueba,
            (SELECT count(*) FROM inventario.catalogo_motivos_pausa WHERE fusionado_en_id IS NULL)::int AS motivo_pausa`,
  );
  return r.rows[0];
}

// Valores activos para elegir en un editor (sin texto libre) o para ofrecer como alternativa.
export async function valoresActivos(
  bd: Consultor,
  tipo: TipoCatalogo,
  familiaId?: string,
): Promise<Array<{ id: string; nombre: string }>> {
  const r = await bd.query(
    `SELECT id, nombre FROM inventario.${TABLA[tipo]}
      WHERE activo ${familiaId && tipo === "modalidad_prueba" ? "AND familia_id = $1" : ""} ORDER BY nombre`,
    familiaId && tipo === "modalidad_prueba" ? [familiaId] : [],
  );
  return r.rows;
}

export interface ValorComparable {
  id: string;
  nombre: string;
  activo: boolean;
  perfiles: number;
  grupo: string | null;
}

// Candidatos contra los que se compara un nombre nuevo: todos los no fusionados del catálogo (un
// desactivado también bloquea: el índice único lo incluye) y, en modalidades, solo los de su familia.
async function comparables(
  bd: Consultor,
  tipo: TipoCatalogo,
  familiaId: string | null,
  excepto?: string,
): Promise<ValorComparable[]> {
  const todos = await listarCatalogo(bd, tipo);
  return todos
    .filter((v) => !v.fusionadoEn && v.id !== excepto)
    .filter((v) => tipo !== "modalidad_prueba" || v.familiaId === familiaId)
    .map((v) => ({
      id: v.id,
      nombre: v.nombre,
      activo: v.activo,
      perfiles: v.perfiles,
      grupo: v.grupo,
    }));
}

export type RevisionNombre =
  | { tipo: "vacio" }
  | { tipo: "identico"; existente: ValorComparable }
  | { tipo: "parecido"; parecidos: ValorComparable[] }
  | { tipo: "nuevo" };

// Lo que el formulario muestra mientras se escribe (sin escribir nada).
export async function revisarNombre(
  bd: Consultor,
  tipo: TipoCatalogo,
  nombre: string,
  opciones: { familiaId?: string | null; excepto?: string } = {},
): Promise<RevisionNombre> {
  return clasificarNombre(
    nombre,
    await comparables(bd, tipo, opciones.familiaId ?? null, opciones.excepto),
  );
}

async function familiaSinModalidades(bd: Consultor, familiaId: string): Promise<boolean> {
  const r = await bd.query(
    `SELECT NOT EXISTS (SELECT 1 FROM inventario.catalogo_modalidades_prueba WHERE familia_id = $1 AND activo) AS sin`,
    [familiaId],
  );
  return r.rows[0].sin;
}

export interface DatosValor {
  nombre: string;
  familiaId?: string | null;
  grupo?: string | null;
  textoCliente?: string | null;
  enunciadoReto?: string | null;
  entregables?: string | null;
  criterios?: string | null;
  // Confirmación explícita de que el nombre parecido es un valor distinto (HU-089).
  confirmarDistinto?: boolean;
  // Motivo de pausa: ayuda breve que se ve al elegirlo (HU-133).
  descripcion?: string | null;
}

export type MotivoRechazoValor =
  | "vacio"
  | "duplicado"
  | "parecido"
  | "familia_requerida"
  | "familia_invalida"
  | "texto_cliente_requerido"
  | "no_existe";

export interface Autor {
  usuarioId: string;
  correo: string;
}

export interface ValorCreado {
  id: string;
  nombre: string;
  // HU-089 edge: el rol queda creado, pero su familia no tiene modalidades de prueba.
  advertencia: "familia_sin_modalidades" | null;
  familia: string | null;
}

const recortar = (s: string | null | undefined) => {
  const t = s?.replace(/\s+/g, " ").trim();
  return t ? t : null;
};

async function validar(
  tx: Consultor,
  tipo: TipoCatalogo,
  d: DatosValor,
  excepto?: string,
): Promise<{ nombre: string; familia: { id: string; nombre: string } | null }> {
  const nombre = recortar(d.nombre);
  if (!nombre) throw new RechazoInventario<MotivoRechazoValor>("vacio");
  let familia: { id: string; nombre: string } | null = null;
  if (tipo === "rol" || tipo === "modalidad_prueba") {
    if (!d.familiaId) throw new RechazoInventario<MotivoRechazoValor>("familia_requerida");
    const f = await tx.query(
      `SELECT id, nombre FROM inventario.catalogo_familias WHERE id = $1 AND activo`,
      [d.familiaId],
    );
    if (!f.rows[0]) throw new RechazoInventario<MotivoRechazoValor>("familia_invalida");
    familia = f.rows[0];
  }
  if (tipo === "modalidad_prueba" && !recortar(d.textoCliente))
    throw new RechazoInventario<MotivoRechazoValor>("texto_cliente_requerido");
  const revision = await revisarNombre(tx, tipo, nombre, {
    familiaId: familia?.id ?? null,
    excepto,
  });
  if (revision.tipo === "identico")
    throw new RechazoInventario<MotivoRechazoValor>("duplicado", { existente: revision.existente });
  if (revision.tipo === "parecido" && !d.confirmarDistinto)
    throw new RechazoInventario<MotivoRechazoValor>("parecido", { parecidos: revision.parecidos });
  return { nombre, familia };
}

const cambio = (
  autor: Autor,
  tipo: TipoCatalogo,
  id: string,
  campo: string,
  antes: string | null,
  despues: string | null,
): CambioAuditado => ({
  actor: autor.correo,
  entidad: TABLA[tipo],
  entidadId: id,
  campo,
  antes,
  despues,
  origen: "panel",
});

// Una violación del índice único que se cuela por carrera se traduce al mismo rechazo.
function traducirUnico(e: unknown): never {
  if ((e as { code?: string }).code === "23505")
    throw new RechazoInventario<MotivoRechazoValor>("duplicado");
  throw e;
}

export async function crearValor(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  tipo: TipoCatalogo,
  d: DatosValor,
): Promise<ValorCreado> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const { nombre, familia } = await validar(tx, tipo, d);
    const columnas: Record<string, string | null> = { nombre };
    if (familia) columnas.familia_id = familia.id;
    if (tipo === "tecnologia") columnas.grupo = recortar(d.grupo);
    if (tipo === "motivo_pausa") columnas.descripcion = recortar(d.descripcion);
    if (tipo === "modalidad_prueba") {
      columnas.texto_cliente = recortar(d.textoCliente);
      columnas.enunciado_reto = recortar(d.enunciadoReto);
      columnas.entregables = recortar(d.entregables);
      columnas.criterios = recortar(d.criterios);
    }
    const nombres = Object.keys(columnas);
    const r = await tx
      .query(
        `INSERT INTO inventario.${TABLA[tipo]} (${nombres.join(", ")})
         VALUES (${nombres.map((_, k) => `$${k + 1}`).join(", ")}) RETURNING id`,
        Object.values(columnas),
      )
      .catch(traducirUnico);
    const id = r.rows[0].id as string;
    const advertencia =
      tipo === "rol" && familia && (await familiaSinModalidades(tx, familia.id))
        ? ("familia_sin_modalidades" as const)
        : null;
    const cambios = Object.entries(columnas)
      .filter(([, v]) => v !== null)
      .map(([campo, v]) => cambio(autor, tipo, id, campo, null, v));
    if (d.confirmarDistinto)
      cambios.push(cambio(autor, tipo, id, "confirmado_distinto", null, "true"));
    return {
      resultado: { id, nombre, advertencia, familia: familia?.nombre ?? null },
      cambios,
      visible: true,
    };
  });
}

export async function editarValor(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  tipo: TipoCatalogo,
  id: string,
  d: DatosValor,
): Promise<ValorCreado> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const previo = (
      await tx.query(
        `SELECT * FROM inventario.${TABLA[tipo]} WHERE id = $1 AND fusionado_en_id IS NULL FOR UPDATE`,
        [id],
      )
    ).rows[0];
    if (!previo) throw new RechazoInventario<MotivoRechazoValor>("no_existe");
    const { nombre, familia } = await validar(tx, tipo, d, id);
    const nuevos: Record<string, string | null> = { nombre };
    if (familia) nuevos.familia_id = familia.id;
    if (tipo === "tecnologia") nuevos.grupo = recortar(d.grupo);
    if (tipo === "motivo_pausa") nuevos.descripcion = recortar(d.descripcion);
    if (tipo === "modalidad_prueba") {
      nuevos.texto_cliente = recortar(d.textoCliente);
      nuevos.enunciado_reto = recortar(d.enunciadoReto);
      nuevos.entregables = recortar(d.entregables);
      nuevos.criterios = recortar(d.criterios);
    }
    const distintos = Object.entries(nuevos).filter(([k, v]) => (previo[k] ?? null) !== v);
    if (distintos.length) {
      await tx
        .query(
          `UPDATE inventario.${TABLA[tipo]} SET ${distintos.map(([k], i) => `${k} = $${i + 2}`).join(", ")} WHERE id = $1`,
          [id, ...distintos.map(([, v]) => v)],
        )
        .catch(traducirUnico);
    }
    const advertencia =
      tipo === "rol" && familia && (await familiaSinModalidades(tx, familia.id))
        ? ("familia_sin_modalidades" as const)
        : null;
    return {
      resultado: { id, nombre, advertencia, familia: familia?.nombre ?? null },
      cambios: distintos.map(([k, v]) => cambio(autor, tipo, id, k, previo[k] ?? null, v)),
      visible: distintos.length > 0,
    };
  });
}

export interface Dependientes {
  nombre: string;
  familia: string | null;
  publicados: Array<{ codigo: string; nombre: string }>;
  borradores: number;
  otros: number;
}

// Cuántas fichas dependen de un valor antes de desactivarlo (HU-143).
export async function dependientes(
  bd: Consultor,
  tipo: TipoCatalogo,
  id: string,
): Promise<Dependientes | null> {
  const v = (
    await bd.query(
      `SELECT v.nombre, ${tipo === "rol" || tipo === "modalidad_prueba" ? "f.nombre" : "NULL"} AS familia
         FROM inventario.${TABLA[tipo]} v
         ${tipo === "rol" || tipo === "modalidad_prueba" ? "LEFT JOIN inventario.catalogo_familias f ON f.id = v.familia_id" : ""}
        WHERE v.id = $1 AND v.fusionado_en_id IS NULL`,
      [id],
    )
  ).rows[0];
  if (!v) return null;
  const r = await bd.query(
    `WITH uso AS (${USO[tipo]})
     SELECT p.codigo, p.nombre || ' ' || p.primer_apellido AS nombre, p.estado
       FROM uso JOIN inventario.perfiles p ON p.id = uso.perfil_id
      WHERE uso.id = $1 AND p.estado <> 'archivado' ORDER BY p.codigo`,
    [id],
  );
  return {
    nombre: v.nombre,
    familia: v.familia,
    publicados: r.rows
      .filter((f) => f.estado === "publicado")
      .map(({ codigo, nombre }) => ({ codigo, nombre })),
    borradores: r.rows.filter((f) => f.estado === "borrador").length,
    otros: r.rows.filter((f) => f.estado !== "publicado" && f.estado !== "borrador").length,
  };
}

// Desactivar: deja de poder elegirse; las fichas que lo tienen lo conservan. Reactivar lo devuelve.
export async function cambiarActivo(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  tipo: TipoCatalogo,
  id: string,
  activo: boolean,
): Promise<{ id: string; activo: boolean; dependientes: number }> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const previo = (
      await tx.query(
        `SELECT activo FROM inventario.${TABLA[tipo]} WHERE id = $1 AND fusionado_en_id IS NULL FOR UPDATE`,
        [id],
      )
    ).rows[0];
    if (!previo) throw new RechazoInventario<MotivoRechazoValor>("no_existe");
    const dep = await dependientes(tx, tipo, id);
    const total = dep ? dep.publicados.length + dep.borradores + dep.otros : 0;
    if (previo.activo === activo)
      return { resultado: { id, activo, dependientes: total }, cambios: [], visible: false };
    await tx.query(`UPDATE inventario.${TABLA[tipo]} SET activo = $2 WHERE id = $1`, [id, activo]);
    return {
      resultado: { id, activo, dependientes: total },
      cambios: [cambio(autor, tipo, id, "activo", String(previo.activo), String(activo))],
      visible: true,
    };
  });
}

export type MotivoRechazoFusion =
  "mismo_valor" | "distinto_catalogo" | "distinta_familia" | "modalidad_repetida";

export interface ImpactoFusion {
  origen: { id: string; nombre: string; perfiles: number };
  destino: { id: string; nombre: string; perfiles: number };
  perfiles: Array<{ codigo: string; nombre: string; estado: string }>;
}

// Vista previa de la fusión: nada se escribe (HU-143). Rechaza con motivo lo que la fusión rechazaría.
export async function impactoFusion(
  bd: Consultor,
  tipo: TipoCatalogo,
  origenId: string,
  destinoId: string,
): Promise<ImpactoFusion> {
  if (origenId === destinoId) throw new RechazoInventario<MotivoRechazoFusion>("mismo_valor");
  const lista = await listarCatalogo(bd, tipo);
  const origen = lista.find((v) => v.id === origenId && v.activo && !v.fusionadoEn);
  const destino = lista.find((v) => v.id === destinoId && v.activo && !v.fusionadoEn);
  if (!origen || !destino) throw new RechazoInventario<MotivoRechazoFusion>("distinto_catalogo");
  if (tipo === "modalidad_prueba" && origen.familiaId !== destino.familiaId)
    throw new RechazoInventario<MotivoRechazoFusion>("distinta_familia");
  const r = await bd.query(
    `WITH uso AS (${USO[tipo]})
     SELECT p.codigo, p.nombre || ' ' || p.primer_apellido AS nombre, p.estado
       FROM uso JOIN inventario.perfiles p ON p.id = uso.perfil_id
      WHERE uso.id = $1 ORDER BY (p.estado = 'publicado') DESC, p.codigo`,
    [origenId],
  );
  return {
    origen: { id: origen.id, nombre: origen.nombre, perfiles: origen.perfiles },
    destino: { id: destino.id, nombre: destino.nombre, perfiles: destino.perfiles },
    perfiles: r.rows,
  };
}

const CAMPO_PERFIL: Record<TipoCatalogo, string> = {
  rol: "roles",
  tecnologia: "tecnologias",
  sector: "sectores",
  familia: "familia",
  modalidad_prueba: "modalidad_prueba",
  motivo_pausa: "motivo_pausa",
};

// Fusión confirmada: una transacción reasigna, sube la versión de cada perfil (disparador) y la global,
// retira el origen y audita el catálogo y cada perfil con origen «fusion».
export async function fusionarValores(
  bd: pg.Pool,
  claves: ClavesAuditoria,
  autor: Autor,
  tipo: TipoCatalogo,
  origenId: string,
  destinoId: string,
): Promise<{ reasignados: number; destino: string }> {
  return conUnidadInventario(bd, claves, async (tx) => {
    const impacto = await impactoFusion(tx, tipo, origenId, destinoId);
    const r = await tx
      .query(`SELECT perfil_id FROM inventario.fusionar_valor($1, $2, $3)`, [
        tipo,
        origenId,
        destinoId,
      ])
      .catch((e: Error) => {
        const m = e.message.match(
          /fusion: (mismo_valor|distinto_catalogo|distinta_familia|modalidad_repetida)\s*(.*)/,
        );
        if (m)
          throw new RechazoInventario<MotivoRechazoFusion>(m[1] as MotivoRechazoFusion, {
            valor: m[2] || null,
          });
        throw e;
      });
    const ids = [...new Set(r.rows.map((f) => f.perfil_id as string))];
    const perfiles = ids.length
      ? (await tx.query(`SELECT id, codigo FROM inventario.perfiles WHERE id = ANY($1)`, [ids]))
          .rows
      : [];
    const cambios: CambioAuditado[] = [
      {
        ...cambio(autor, tipo, origenId, "fusionado_en", null, impacto.destino.nombre),
        origen: "fusion",
      },
      { ...cambio(autor, tipo, origenId, "activo", "true", "false"), origen: "fusion" },
      ...perfiles.map((p): CambioAuditado => ({
        actor: autor.correo,
        entidad: "perfiles",
        entidadId: p.id,
        campo: CAMPO_PERFIL[tipo],
        titular: p.codigo,
        antes: impacto.origen.nombre,
        despues: impacto.destino.nombre,
        origen: "fusion",
      })),
    ];
    return {
      resultado: { reasignados: perfiles.length, destino: impacto.destino.nombre },
      cambios,
      visible: true,
    };
  });
}
