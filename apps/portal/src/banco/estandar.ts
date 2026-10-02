// La frase del estándar Neural-Grid para el encabezado (HU-159; D80, D97; diseño §4): el conteo de
// publicados incompletos se lee en el servidor con tiempo acotado (500 ms) y la misma guarda del panel;
// si no está disponible, la versión descriptiva, la página carga normal y queda el registro técnico
// (ADR-0006) sin datos personales. El portal nunca muestra el número.
import "server-only";
import { fraseDelEstandar } from "@ps/dominio/catalogo/estandar";
import { contarIncompletosConTiempo } from "@ps/infra/postgres/indicadores";
import { poolDe } from "@ps/infra/postgres/pool";

export const LIMITE_CONTEO_MS = 500;

export async function fraseDelPortal(): Promise<string> {
  try {
    return fraseDelEstandar(await contarIncompletosConTiempo(poolDe("portal"), LIMITE_CONTEO_MS));
  } catch (e) {
    const motivo = e instanceof Error && /timeout|cancel/i.test(e.message) ? "tiempo_agotado" : "consulta_fallida";
    console.error(JSON.stringify({ evento: "conteo_incompletos_no_disponible", motivo }));
    return fraseDelEstandar(null);
  }
}
