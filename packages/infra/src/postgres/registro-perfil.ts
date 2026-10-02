// Registro de auditoría de un perfil (HU-138; RF-8.9, diseño §8): todas las filas de la cadena cuyo titular
// es el perfil —contenido, consentimiento, estado, disponibilidad, colocaciones y reporte de validación—,
// descifradas aquí, en el servidor del panel, del más reciente al más antiguo. Cada fila sabe si la
// escribió una importación (o su reversión) o una carga de Operaciones por el tramo que esa operación
// registró (`referencias_auditoria`), y de ahí el archivo, el lote y la fecha de corte. Los
// identificadores de catálogo se traducen a su nombre (los catálogos no se borran).
import "server-only";
import type pg from "pg";
import {
  campoDelRegistro,
  presentarValor,
  quienDelCambio,
  type GrupoRegistro,
  type OrigenRegistro,
  type QuienCambio,
} from "@ps/dominio/auditoria/registro";
import type { EstadoAlmacenado } from "@ps/dominio/inventario/estados";
import { descifrador } from "./auditoria";

type Consultor = Pick<pg.PoolClient, "query">;

export interface CabeceraRegistro {
  codigo: string;
  nombre: string | null;
  primerApellido: string | null;
  rol: string | null;
  estado: EstadoAlmacenado;
  archivadoEn: string | null;
}

export interface FilaRegistro {
  seq: number;
  cuando: string;
  campo: string;
  etiqueta: string;
  grupo: GrupoRegistro;
  antes: string | null;
  despues: string | null;
  origen: OrigenRegistro;
  actor: string;
  quien: QuienCambio;
  suprimido: boolean;
}

const CATALOGOS = [
  "catalogo_roles",
  "catalogo_seniorities",
  "catalogo_ciudades",
  "catalogo_modalidades",
  "catalogo_modalidades_prueba",
  "catalogo_tecnologias",
  "catalogo_sectores",
];

const UUIDS = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

async function nombresDeCatalogo(bd: Consultor, ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const r = await bd.query(
    CATALOGOS.map(
      (t) => `SELECT id::text, nombre FROM inventario.${t} WHERE id = ANY($1::uuid[])`,
    ).join(" UNION ALL "),
    [ids],
  );
  return new Map(r.rows.map((f) => [f.id, f.nombre]));
}

export async function cabeceraRegistro(
  bd: Consultor,
  codigo: string,
): Promise<CabeceraRegistro | null> {
  const f = (
    await bd.query(
      `SELECT p.codigo, p.nombre, p.primer_apellido, p.estado, p.archivado_en,
              (SELECT r.nombre FROM inventario.perfil_roles pr JOIN inventario.catalogo_roles r ON r.id = pr.valor_id
                WHERE pr.perfil_id = p.id ORDER BY pr.orden LIMIT 1) AS rol
         FROM inventario.perfiles p WHERE p.codigo = $1`,
      [codigo],
    )
  ).rows[0];
  if (!f) return null;
  return {
    codigo: f.codigo,
    nombre: f.nombre,
    primerApellido: f.primer_apellido,
    rol: f.rol,
    estado: f.estado,
    archivadoEn: f.archivado_en?.toISOString() ?? null,
  };
}

export async function leerRegistroPerfil(
  bd: Consultor,
  kek: string,
  codigo: string,
): Promise<FilaRegistro[]> {
  const r = await bd.query(
    `SELECT a.seq, a.actor, a.entidad, a.campo, a.origen, a.cuando, a.titular,
            v.antes_cifrado, v.despues_cifrado, k.clave_envuelta,
            ref.tipo AS ref_tipo, ref.ref_id,
            l.archivo_nombre AS lote_archivo, c.archivo AS carga_archivo, c.cargado_en AS carga_corte
       FROM auditoria.auditoria a
       LEFT JOIN auditoria.auditoria_valores v ON v.seq = a.seq
       LEFT JOIN identidad.claves_titular k ON k.titular = a.titular
       LEFT JOIN LATERAL (
         SELECT x.tipo, x.ref_id FROM inventario.referencias_auditoria x
          WHERE x.seq_desde <= a.seq AND x.seq_hasta >= a.seq
          ORDER BY x.seq_desde DESC LIMIT 1) ref ON true
       LEFT JOIN inventario.lotes_importacion l ON ref.tipo IN ('lote', 'reversion') AND l.id = ref.ref_id
       LEFT JOIN inventario.cargas_operaciones c ON ref.tipo = 'carga' AND c.id = ref.ref_id
      WHERE a.titular = $1
      ORDER BY a.seq DESC`,
    [codigo],
  );
  const abrir = descifrador(kek);
  const crudas = r.rows.map((f) => {
    const { valor, suprimido } = abrir(f.titular, f.clave_envuelta);
    return { f, antes: valor(f.antes_cifrado), despues: valor(f.despues_cifrado), suprimido };
  });
  const ids = new Set<string>();
  for (const c of crudas)
    for (const v of [c.antes, c.despues]) for (const id of v?.match(UUIDS) ?? []) ids.add(id);
  const nombres = await nombresDeCatalogo(bd, [...ids]);
  const nombre = (id: string) => nombres.get(id);
  return crudas.map(({ f, antes, despues, suprimido }) => {
    const { etiqueta, grupo } = campoDelRegistro(f.entidad, f.campo);
    return {
      seq: Number(f.seq),
      cuando: f.cuando.toISOString(),
      campo: f.campo,
      etiqueta,
      grupo,
      antes: presentarValor(f.entidad, f.campo, antes, nombre),
      despues: presentarValor(f.entidad, f.campo, despues, nombre),
      origen: f.origen,
      actor: f.actor,
      quien: quienDelCambio({
        origen: f.origen,
        actor: f.actor,
        lote:
          f.ref_tipo === "lote" || f.ref_tipo === "reversion"
            ? { id: f.ref_id, archivo: f.lote_archivo }
            : null,
        carga:
          f.ref_tipo === "carga"
            ? { id: f.ref_id, archivo: f.carga_archivo, corte: f.carga_corte.toISOString() }
            : null,
      }),
      suprimido,
    };
  });
}
