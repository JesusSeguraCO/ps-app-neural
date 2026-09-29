// Reevaluación de la selección de un enlace curado al abrirse (RF-19.2, design §4; HU-144, HU-091).
// Pura: recibe los códigos del enlace en el orden del correo, los perfiles hoy publicados y el estado
// de los que no lo están, y devuelve un item por código. Ninguno se omite; no se filtra por nada
// deducido de la selección (RF-19.7).

export type EstadoSeleccion = "pausado" | "colocado" | "archivado" | "no_publicado";

// Datos mínimos de un perfil que dejó de estar publicado, solo si su consentimiento sigue vigente
// (pausado o colocado); archivados y no publicados van sin datos (Ley 1581, minimización).
export interface ResumenPerfil {
  nombre: string;
  primerApellido: string;
  familia: string | null;
  roles: string[];
  sectores: string[];
  modalidad: string | null;
}

export interface EstadoNoPublicado {
  codigo: string;
  estado: EstadoSeleccion;
  liberaEn: string | null; // AAAA-MM-DD, solo colocado
  resumen: ResumenPerfil | null;
}

export type ItemSeleccion<P> =
  { codigo: string; tipo: "disponible"; perfil: P } | ({ tipo: "cambio" } & EstadoNoPublicado);

export interface SeleccionReevaluada<P> {
  items: ItemSeleccion<P>[];
  cambiaron: number;
  ningunoPublicado: boolean;
}

export function reevaluarSeleccion<P extends { codigo: string }>(
  codigos: readonly string[],
  publicados: readonly P[],
  estados: readonly EstadoNoPublicado[],
): SeleccionReevaluada<P> {
  const porCodigo = new Map(publicados.map((p) => [p.codigo, p]));
  const estadoDe = new Map(estados.map((e) => [e.codigo, e]));
  const items = codigos.map((codigo): ItemSeleccion<P> => {
    const perfil = porCodigo.get(codigo);
    if (perfil) return { codigo, tipo: "disponible", perfil };
    const e = estadoDe.get(codigo);
    return e
      ? { tipo: "cambio", ...e }
      : { codigo, tipo: "cambio", estado: "no_publicado", liberaEn: null, resumen: null };
  });
  const cambiaron = items.filter((i) => i.tipo === "cambio").length;
  return { items, cambiaron, ningunoPublicado: items.length > 0 && cambiaron === items.length };
}
