// Aterrizaje curado (RF-19.2, design §4; HU-144, HU-091): el enlace de la sesión con su razón y la
// selección reevaluada en cada apertura. Lee con `ps_portal` solo `identidad.enlaces`, la vista
// `catalogo_publicable` (por la proyección estricta) y `estado_seleccion_perfil`; nunca `inventario`.
import "server-only";
import type pg from "pg";
import type { PerfilCatalogo } from "@ps/contratos/catalogo";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import {
  reevaluarSeleccion,
  type EstadoNoPublicado,
  type EstadoSeleccion,
  type SeleccionReevaluada,
} from "@ps/dominio/enlaces/seleccion";
import { proyectar } from "./catalogo";

export interface Aterrizaje {
  cuenta: string;
  proyecto: string | null;
  razon: string;
  vigenteHasta: Date;
  generadoEn: Date; // desde cuándo vale el enlace = fecha del correo
  seleccion: SeleccionReevaluada<PerfilCatalogo>;
}

export async function aterrizajeDelEnlace(
  bd: pg.Pool,
  sesion: SesionPortalVerificada,
  ahora: Date = new Date(),
): Promise<Aterrizaje> {
  const e = await bd.query(
    `SELECT cuenta_nombre, proyecto, razon, codigos_perfil, vigente_desde, vigente_hasta
       FROM identidad.enlaces WHERE id = $1`,
    [sesion.enlaceId],
  );
  const enlace = e.rows[0];
  if (!enlace) throw new Error("enlace de la sesión inexistente");
  const codigos: string[] = enlace.codigos_perfil;
  const publicados = await bd.query(
    `SELECT codigo, nombre, primer_apellido, familia, roles, seniority, anios_experiencia, tecnologias,
            sectores, modalidad, pais, disponibilidad_fecha::text AS disponibilidad_fecha,
            disponibilidad_actualizada_en
       FROM operacion.catalogo_publicable WHERE codigo = ANY($1)`,
    [codigos],
  );
  const otros = await bd.query(
    `SELECT codigo, estado, libera_en::text AS libera_en, nombre, primer_apellido, familia, roles, sectores, modalidad
       FROM operacion.estado_seleccion_perfil WHERE codigo = ANY($1) AND estado <> 'disponible'`,
    [codigos],
  );
  const estados: EstadoNoPublicado[] = otros.rows.map((f) => ({
    codigo: f.codigo,
    estado: f.estado as EstadoSeleccion,
    liberaEn: f.libera_en,
    categoria: f.familia,
    resumen: f.nombre
      ? {
          nombre: f.nombre,
          primerApellido: f.primer_apellido,
          familia: f.familia,
          roles: f.roles ?? [],
          sectores: f.sectores ?? [],
          modalidad: f.modalidad,
        }
      : null,
  }));
  return {
    cuenta: enlace.cuenta_nombre,
    proyecto: enlace.proyecto,
    razon: enlace.razon,
    vigenteHasta: enlace.vigente_hasta,
    generadoEn: enlace.vigente_desde,
    seleccion: reevaluarSeleccion(codigos, proyectar(publicados.rows, ahora), estados),
  };
}
