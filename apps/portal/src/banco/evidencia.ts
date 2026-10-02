// Evidencia ✓/– del banco (HU-119; diseño §5). Fuente productiva de EP-003: el filtro activo (categoría,
// rol o el contexto de la selección), resuelto por perfil con `criteriosDelFiltro` —la misma comparación
// que `aplicarFiltro`— y convertido en líneas con `lineasDeEvidencia`. La tarjeta y «Frente a tu
// búsqueda» de la ficha reciben exactamente las mismas líneas. Un tipo sin plantilla (D96) deja el
// registro técnico con el tipo, sin datos del perfil. HU-174 (EP-009) cambia la fuente, no el contrato.
import { criteriosDelFiltro, lineasDeEvidencia, type LineaEvidencia } from "@ps/dominio/catalogo/evidencia";
import type { FiltroBanco } from "@ps/dominio/catalogo/encuadre";

interface Clasificable {
  codigo: string;
  familia: string | null;
  roles: string[];
}

export function registrarSinPlantilla(
  lineas: readonly LineaEvidencia[],
  registrar: (linea: string) => void = (l) => console.error(l),
): void {
  const tipos = new Set(lineas.filter((l) => l.sinPlantilla).map((l) => l.tipo));
  for (const tipo of tipos) registrar(JSON.stringify({ evento: "criterio_sin_plantilla", tipo }));
}

export function evidenciaDelBanco(
  perfiles: readonly Clasificable[],
  filtro: FiltroBanco,
  categoriasContexto: readonly string[],
): Map<string, LineaEvidencia[]> {
  const porPerfil = new Map(
    perfiles.map((p) => [p.codigo, lineasDeEvidencia(criteriosDelFiltro(p, filtro, categoriasContexto))]),
  );
  registrarSinPlantilla([...porPerfil.values()].flat());
  return porPerfil;
}
