// Banco completo y encuadre (HU-093, HU-094): la taxonomía activa del catálogo, sin datos de perfiles.
// Los perfiles salen solo por `proyeccionCatalogo` (contrato estricto, sin B.4).
import "server-only";
import type pg from "pg";
import type { EntradaTaxonomia } from "@ps/dominio/catalogo/encuadre";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";

// Exigir la sesión obliga a haber pasado por la guarda (como `proyeccionCatalogo`); no se lee.
export async function taxonomiaDelBanco(bd: pg.Pool, sesion: SesionPortalVerificada): Promise<EntradaTaxonomia[]> {
  void sesion;
  const r = await bd.query<EntradaTaxonomia>(`SELECT categoria, rol FROM operacion.taxonomia_banco ORDER BY categoria, rol`);
  return r.rows;
}
