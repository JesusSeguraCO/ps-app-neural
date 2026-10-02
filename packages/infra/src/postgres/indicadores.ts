// Conteo de publicados incompletos para el portal (HU-178 · D80; diseño §4): lee la vista 0029 (solo
// booleanos y enteros, sin datos personales) y cuenta con la misma guarda de publicar del dominio
// (`contarIncompletos` → `evaluarPublicacion`), así la frase del estándar y la marca «Incompleto» del
// panel no pueden discrepar. La degradación por tiempo (`statement_timeout`, D97) es del portal (HU-159).
import "server-only";
import type pg from "pg";
import { contarIncompletos, type IndicadoresPublicacion } from "@ps/dominio/inventario/entrada";

type Consultor = Pick<pg.PoolClient, "query">;

export async function leerIndicadores(bd: Consultor): Promise<IndicadoresPublicacion[]> {
  const r = await bd.query(`SELECT * FROM operacion.indicadores_publicacion`);
  return r.rows.map((f) => ({
    tieneNombre: f.tiene_nombre,
    tienePrimerApellido: f.tiene_primer_apellido,
    tieneRol: f.tiene_rol,
    tecnologias: f.tecnologias,
    tieneSeniority: f.tiene_seniority,
    tieneAniosExperiencia: f.tiene_anios_experiencia,
    tieneCiudad: f.tiene_ciudad,
    tieneModalidadTrabajo: f.tiene_modalidad_trabajo,
    tieneDisponibilidad: f.tiene_disponibilidad,
    experiencias: f.experiencias,
    pruebaElegida: f.prueba_elegida,
    pruebaActiva: f.prueba_activa,
    familiaConModalidades: f.familia_con_modalidades,
    consentimientoRegistrado: f.consentimiento_registrado,
    consentimientoVigente: f.consentimiento_vigente,
    consentimientoNominal: f.consentimiento_nominal,
    saroAlcance: f.saro_alcance,
    saroFecha: f.saro_fecha,
    discFecha: f.disc_fecha,
  }));
}

export async function contarIncompletosPublicados(bd: Consultor): Promise<number> {
  return contarIncompletos(await leerIndicadores(bd));
}
