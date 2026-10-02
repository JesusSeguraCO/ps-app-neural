// Recorrer fichas sin perder la lista (HU-120; D47). La ficha se abre sobre la lista que el cliente
// tiene delante —la selección del correo o el banco con su filtro— y se recorre en ese mismo orden. Un
// código fuera de esa lista no abre nada: la ficha nunca muestra un perfil que la lista no muestra.
export interface Recorrido {
  posicion: number;
  total: number;
  anterior: string | null;
  siguiente: string | null;
}

export function recorrido(codigos: readonly string[], abierto: string | undefined): Recorrido | null {
  const i = abierto ? codigos.indexOf(abierto) : -1;
  if (i < 0) return null;
  return {
    posicion: i + 1,
    total: codigos.length,
    anterior: codigos[i - 1] ?? null,
    siguiente: codigos[i + 1] ?? null,
  };
}

// La dirección de una ficha (o de la lista, con `null`) conservando el resto de la consulta.
export function conFicha(
  ruta: string,
  consulta: Readonly<Record<string, string | string[] | undefined>>,
  codigo: string | null,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(consulta)) {
    const valor = Array.isArray(v) ? v[0] : v;
    if (k !== "ficha" && valor !== undefined) q.set(k, valor);
  }
  if (codigo) q.set("ficha", codigo);
  const texto = q.toString();
  return texto ? `${ruta}?${texto}` : ruta;
}
