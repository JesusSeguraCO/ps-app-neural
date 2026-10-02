// Evidencia ✓/– por criterio (HU-119; RF-13.10, RF-13.10.1, RF-13.10.2, RF-16.1, D96; diseño §5).
// Recibe criterios YA resueltos (`CriterioResuelto[]`) y los convierte en líneas con una plantilla fija
// por tipo: no calcula coincidencias, no redacta nada sobre la persona (sin modelo) y nunca da un
// porcentaje. Lo que no cumple también se muestra. Un dato ausente es «no cumplido», nunca «cumplido
// por omisión»: en los tipos de la tabla, `cumple` sin el dato que lo sustenta no se afirma (RF-3.4).
// Un tipo sin plantilla usa el texto genérico de D96 y se marca `sinPlantilla` para que el servidor lo
// registre (`{evento: "criterio_sin_plantilla", tipo}`): la línea nunca queda en blanco.
//
// Fuente productiva en EP-003: el filtro activo del banco (`criteriosDelFiltro`), con la misma
// comparación que `aplicarFiltro`. HU-174 (EP-009) sustituye la fuente por el motor único de criterios
// sin cambiar este contrato. Copy de las plantillas marcado para revisión con Mercadeo (D73).
import { cumpleFiltro, type FiltroBanco } from "./encuadre";

export interface CriterioResuelto {
  tipo: string;
  valor: string;
  cumple: boolean;
  // El dato del perfil que sustenta la línea: el valor registrado (rol, seniority, modalidad, país,
  // categoría, idioma, tecnología) o, para un sector, los años declarados en él. `null` = sin dato.
  dato: string | null;
}

export interface LineaEvidencia {
  tipo: string;
  cumple: boolean;
  marca: "✓" | "–";
  texto: string;
  sinPlantilla: boolean;
}

type Plantilla = {
  cumple: (valor: string, dato: string) => string;
  distinto: (valor: string, dato: string) => string;
  sinDato: (valor: string) => string;
};

const anios = (n: string) => `${n} ${n === "1" ? "año declarado" : "años declarados"}`;

// Tabla fija de HU-119 (validación 2026-10-02) + categoría del encuadre (design.md · SS4).
export const PLANTILLAS: Readonly<Record<string, Plantilla>> = {
  rol: {
    cumple: (v) => `Rol: ${v}`,
    distinto: (_v, d) => `Rol registrado: ${d}`,
    sinDato: (v) => `Sin rol declarado: ${v}`,
  },
  seniority: {
    cumple: (v) => `Seniority: ${v}`,
    distinto: (_v, d) => `Seniority registrada: ${d}`,
    sinDato: (v) => `Sin seniority declarada: ${v}`,
  },
  tecnologia: {
    cumple: (v) => `${v} en su stack declarado`,
    distinto: (v) => `Sin ${v} en su stack declarado`,
    sinDato: (v) => `Sin ${v} en su stack declarado`,
  },
  sector: {
    cumple: (v, d) => `${v} · ${anios(d)}`,
    distinto: (v) => `Sin experiencia declarada en ${v}`,
    sinDato: (v) => `Sin experiencia declarada en ${v}`,
  },
  idioma: {
    cumple: (v) => `${v} registrado`,
    distinto: (v) => `Sin idioma declarado: ${v}`,
    sinDato: (v) => `Sin idioma declarado: ${v}`,
  },
  modalidad: {
    cumple: (v) => `Modalidad: ${v}`,
    distinto: (_v, d) => `Modalidad registrada: ${d}`,
    sinDato: (v) => `Sin modalidad declarada: ${v}`,
  },
  pais: {
    cumple: (v) => `País: ${v}`,
    distinto: (_v, d) => `País registrado: ${d}`,
    sinDato: (v) => `Sin país declarado: ${v}`,
  },
  categoria: {
    cumple: (v) => `Categoría: ${v}`,
    distinto: (_v, d) => `Categoría registrada: ${d}`,
    sinDato: (v) => `Sin categoría declarada: ${v}`,
  },
};

const limpio = (s: string | null) => {
  const t = s?.trim();
  return t ? t : null;
};

export function lineaDeEvidencia(c: CriterioResuelto): LineaEvidencia {
  const valor = c.valor.trim() || c.tipo;
  const plantilla = Object.hasOwn(PLANTILLAS, c.tipo) ? PLANTILLAS[c.tipo] : undefined;
  if (!plantilla) {
    return {
      tipo: c.tipo,
      cumple: c.cumple,
      marca: c.cumple ? "✓" : "–",
      texto: c.cumple ? `Cumple ${valor}` : `No cumple ${valor}`,
      sinPlantilla: true,
    };
  }
  const dato = limpio(c.dato);
  const cumple = c.cumple && dato !== null;
  const texto = cumple
    ? plantilla.cumple(valor, dato)
    : dato === null
      ? plantilla.sinDato(valor)
      : plantilla.distinto(valor, dato);
  return { tipo: c.tipo, cumple, marca: cumple ? "✓" : "–", texto, sinPlantilla: false };
}

// Una línea por criterio, en el orden de los criterios: el mismo texto y orden en la tarjeta y en
// «Frente a tu búsqueda» de la ficha, porque las dos superficies llaman a esta misma función.
export function lineasDeEvidencia(criterios: readonly CriterioResuelto[]): LineaEvidencia[] {
  return criterios.map(lineaDeEvidencia);
}

export const textoDeLinea = (l: LineaEvidencia) => `${l.marca} ${l.texto}`;

interface Clasificable {
  codigo: string;
  familia: string | null;
  roles: string[];
}

const oLista = (xs: readonly string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} o ${xs.at(-1)}`;

// Los criterios activos del banco resueltos para un perfil, con la misma regla que filtra la lista.
export function criteriosDelFiltro(
  p: Clasificable,
  filtro: FiltroBanco,
  categoriasContexto: readonly string[],
): CriterioResuelto[] {
  const cumple = cumpleFiltro(p, filtro, categoriasContexto);
  switch (filtro.tipo) {
    case "todo":
      return [];
    case "categoria":
      return [{ tipo: "categoria", valor: filtro.valor, cumple, dato: p.familia }];
    case "rol":
      return [
        {
          tipo: "rol",
          valor: filtro.valor,
          cumple,
          dato: cumple ? filtro.valor : (p.roles[0] ?? null),
        },
      ];
    case "contexto":
      return [
        {
          tipo: "categoria",
          valor: cumple ? p.familia! : oLista(categoriasContexto),
          cumple,
          dato: p.familia,
        },
      ];
  }
}
