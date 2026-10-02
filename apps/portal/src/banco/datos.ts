// Datos de las páginas con sesión del portal: el enlace (cuenta, proyecto, razón y selección
// reevaluada), el «Mi equipo» del invitado, si se pide, el banco publicado con su taxonomía y la ficha.
import "server-only";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { taxonomiaConConteos } from "@ps/dominio/catalogo/encuadre";
import { taxonomiaDelBanco } from "@ps/infra/postgres/banco";
import { fichaDelPortal, proyeccionCatalogo } from "@ps/infra/postgres/catalogo";
import { leerContacto } from "@ps/infra/postgres/contacto";
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

// La ficha de un perfil que la lista del cliente muestra (HU-120, D47); `null` si ya no está publicado.
// Un publicado que no cumple el contrato estricto (dato heredado incompleto) no tumba la página: la
// ficha no se abre y queda en el registro del servidor, sin datos del perfil.
export async function fichaDe(sesion: SesionPortalVerificada, codigo: string) {
  try {
    return await fichaDelPortal(poolDe("portal"), sesion, codigo);
  } catch (e) {
    if (!(e instanceof Error) || e.name !== "ZodError") throw e;
    const campos = (e as Error & { issues: Array<{ path: PropertyKey[] }> }).issues.map((i) => i.path.join("."));
    console.error(JSON.stringify({ evento: "ficha_fuera_de_contrato", codigo, campos }));
    return null;
  }
}

// Contacto vigente de Trycore para el bloque de conversación de la ficha (HU-157): se lee en cada
// apertura, así un cambio en el panel se ve en la siguiente carga.
export function contactoDeFicha() {
  return leerContacto(poolDe("portal"));
}
