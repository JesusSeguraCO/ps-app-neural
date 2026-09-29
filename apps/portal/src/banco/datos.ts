// Datos de las páginas con sesión del portal: el enlace (cuenta, proyecto, razón y selección
// reevaluada), el «Mi equipo» del invitado y, si se pide, el banco publicado con su taxonomía.
import "server-only";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { taxonomiaConConteos } from "@ps/dominio/catalogo/encuadre";
import { taxonomiaDelBanco } from "@ps/infra/postgres/banco";
import { proyeccionCatalogo } from "@ps/infra/postgres/catalogo";
import { asegurarEquipo } from "@ps/infra/postgres/equipo";
import { poolDe } from "@ps/infra/postgres/pool";
import { aterrizajeDelEnlace } from "@ps/infra/postgres/seleccion";

export async function datosDelEnlace(sesion: SesionPortalVerificada) {
  const bd = poolDe("portal");
  const [aterrizaje, equipo] = await Promise.all([aterrizajeDelEnlace(bd, sesion), asegurarEquipo(bd, sesion)]);
  return { aterrizaje, equipo };
}

export async function datosDelBanco(sesion: SesionPortalVerificada) {
  const bd = poolDe("portal");
  const [perfiles, catalogo] = await Promise.all([proyeccionCatalogo(bd, sesion), taxonomiaDelBanco(bd, sesion)]);
  return { perfiles, taxonomia: taxonomiaConConteos(catalogo, perfiles) };
}
