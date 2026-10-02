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

// El conteo con tiempo acotado para el portal (HU-159 · error, D97): `statement_timeout` local de una
// transacción de solo lectura; si vence o la consulta falla, rechaza y el portal degrada a la frase
// descriptiva (nunca cuelga ni rompe la página).
export async function contarIncompletosConTiempo(pool: pg.Pool, ms: number): Promise<number> {
  const c = await pool.connect();
  try {
    await c.query("BEGIN READ ONLY");
    await c.query(`SET LOCAL statement_timeout = ${Math.max(1, Math.trunc(ms))}`);
    const n = await contarIncompletosPublicados(c);
    await c.query("COMMIT");
    return n;
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
