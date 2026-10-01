// Registro de auditoría por perfil (HU-138; RF-8.9, diseño §8): cómo se lee cada fila de la cadena en el
// panel. Puro y determinista: la etiqueta y el grupo de cada campo (los cambios de consentimiento y de
// estado se ven igual que los de contenido), el valor en lenguaje llano (los identificadores de catálogo
// por su nombre; los catálogos no se borran, así que el nombre siempre existe) y quién lo hizo: la
// persona o el proceso con la persona detrás. Ningún cambio se muestra como «sistema» a secas.
import "server-only";
import { fechaCivil, horaDeColombia } from "../fecha/colombia";

export type GrupoRegistro =
  "contenido" | "consentimiento" | "disponibilidad" | "estado" | "validacion";

export const ETIQUETA_GRUPO: Record<GrupoRegistro, string> = {
  contenido: "Contenido",
  consentimiento: "Consentimiento",
  disponibilidad: "Disponibilidad",
  estado: "Estado y publicación",
  validacion: "Validación técnica",
};

type Forma =
  | "texto"
  | "catalogo"
  | "catalogos"
  | "lista"
  | "experiencias"
  | "fecha"
  | "momento"
  | "estado"
  | "consentimiento"
  | "motivo";

interface Definicion {
  etiqueta: string;
  grupo: GrupoRegistro;
  forma: Forma;
}

const d = (etiqueta: string, grupo: GrupoRegistro, forma: Forma = "texto"): Definicion => ({
  etiqueta,
  grupo,
  forma,
});

const CAMPOS: Record<string, Definicion> = {
  "perfiles.nombre": d("Nombre", "contenido"),
  "perfiles.primer_apellido": d("Primer apellido", "contenido"),
  "perfiles.rol": d("Rol", "contenido", "catalogo"),
  "perfiles.seniority": d("Seniority", "contenido", "catalogo"),
  "perfiles.anios_experiencia": d("Años de experiencia", "contenido"),
  "perfiles.ciudad": d("Ciudad", "contenido", "catalogo"),
  "perfiles.modalidad_trabajo": d("Modalidad de trabajo", "contenido", "catalogo"),
  "perfiles.tecnologias": d("Tecnologías", "contenido", "catalogos"),
  "perfiles.sectores": d("Sectores", "contenido", "catalogos"),
  "perfiles.sector": d("Sector", "contenido", "catalogo"),
  "perfiles.experiencias": d("Trayectoria", "contenido", "experiencias"),
  "perfiles.idiomas": d("Idiomas", "contenido", "lista"),
  "perfiles.sello_personal": d("Sello personal", "contenido", "lista"),
  "perfiles.capacidad": d("Capacidad", "contenido"),
  "perfiles.anclaje": d("Anclaje de experiencia", "contenido"),
  "perfiles.aporte": d("Qué le interesa aportar", "contenido"),
  "perfiles.consentimiento": d("Consentimiento", "consentimiento", "consentimiento"),
  "perfiles.estado": d("Publicación", "estado", "estado"),
  "perfiles.motivo_estado": d("Motivo del cambio de estado", "estado", "motivo"),
  "perfiles.motivo_pausa": d("Motivo de la pausa", "estado"),
  "perfiles.disponibilidad_fecha": d("Disponibilidad", "disponibilidad", "fecha"),
  "perfiles.disponibilidad_actualizada_en": d(
    "Disponibilidad confirmada",
    "disponibilidad",
    "momento",
  ),
  "perfiles.colocacion": d("Colocación", "disponibilidad"),
  "perfiles.modalidad_prueba": d("Modalidad de prueba", "validacion", "catalogo"),
  "validaciones.estado": d("Reporte de validación", "validacion", "estado"),
  "validaciones.evaluador": d("Validación · evaluador", "validacion"),
  "validaciones.fecha": d("Validación · fecha", "validacion", "fecha"),
  "validaciones.resultado": d("Validación · resultado", "validacion"),
  "validaciones.origen": d("Validación · modalidad", "validacion"),
  "validaciones.enunciado_reto": d("Validación · enunciado del reto", "validacion"),
  "validaciones.entregables": d("Validación · entregables", "validacion"),
  "validaciones.criterios": d("Validación · criterios", "validacion", "lista"),
};

const definicion = (entidad: string, campo: string): Definicion =>
  CAMPOS[`${entidad}.${campo}`] ?? d(campo, "contenido");

export function campoDelRegistro(
  entidad: string,
  campo: string,
): { etiqueta: string; grupo: GrupoRegistro } {
  const { etiqueta, grupo } = definicion(entidad, campo);
  return { etiqueta, grupo };
}

const ESTADOS: Record<string, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  pausado: "Pausado",
  archivado: "Archivado",
  // Estado anterior a la 0021 (sub-slice 9): sigue en el historial de los perfiles migrados.
  colocado: "Colocado",
  confirmada: "Confirmado",
  descartada: "Descartado",
  vigente: "Vigente",
  revocado: "Revocado",
};

const MOTIVOS: Record<string, string> = {
  edicion_deja_incompleto: "La edición dejó datos obligatorios sin completar",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(valor: string): unknown {
  try {
    return JSON.parse(valor);
  } catch {
    return undefined;
  }
}

const deCatalogo = (v: string, nombre: (id: string) => string | undefined) =>
  UUID.test(v) ? (nombre(v) ?? `Valor de catálogo ${v.slice(0, 8)}`) : v;

interface Experiencia {
  cargo?: string | null;
  cliente?: string | null;
  desde?: number | null;
  hasta?: number | null;
}

// Valor de una fila en lenguaje llano; `null` es «sin valor» (la página lo muestra como tal).
export function presentarValor(
  entidad: string,
  campo: string,
  valor: string | null,
  nombre: (id: string) => string | undefined,
): string | null {
  if (valor === null) return null;
  const { forma } = definicion(entidad, campo);
  switch (forma) {
    case "catalogo":
      return deCatalogo(valor, nombre);
    case "catalogos":
    case "lista": {
      const lista = json(valor);
      if (!Array.isArray(lista)) return forma === "catalogos" ? deCatalogo(valor, nombre) : valor;
      if (!lista.length) return "Ninguna";
      return lista
        .map((x) => (forma === "catalogos" ? deCatalogo(String(x), nombre) : String(x)))
        .join(" · ");
    }
    case "experiencias": {
      const lista = json(valor);
      if (!Array.isArray(lista)) return valor;
      if (!lista.length) return "Ninguna";
      return (lista as Experiencia[])
        .map((e) =>
          [e.cargo, e.cliente, e.desde ? `${e.desde}–${e.hasta ?? "hoy"}` : null]
            .filter(Boolean)
            .join(" · "),
        )
        .join("; ");
    }
    case "fecha":
      return /^\d{4}-\d{2}-\d{2}$/.test(valor) ? fechaCivil(valor) : valor;
    case "momento": {
      const t = Date.parse(valor);
      return Number.isNaN(t) ? valor : horaDeColombia(new Date(t));
    }
    case "estado":
      return ESTADOS[valor] ?? valor;
    case "consentimiento": {
      const c = json(valor) as { nominal?: boolean; incluyeClientes?: boolean } | undefined;
      if (c && typeof c === "object" && "nominal" in c)
        return c.incluyeClientes
          ? "Nominal, con clientes nombrados"
          : "Nominal, sin nombrar clientes";
      return ESTADOS[valor] ?? valor;
    }
    case "motivo":
      return MOTIVOS[valor] ?? valor;
    default:
      return valor;
  }
}

export type OrigenRegistro =
  | "panel"
  | "importacion"
  | "reversion"
  | "sincronizacion"
  | "fusion"
  | "revocacion"
  | "migracion"
  | "worker"
  | "restauracion"
  | "rotacion"
  | "supresion";

export interface QuienCambio {
  tipo: "persona" | "importacion" | "carga" | "proceso";
  titulo: string;
  detalle?: string;
  enlace?: string;
}

// Quién: la persona del panel, o el proceso con su autor y su referencia (lote o carga, con la fecha de
// corte de la carga). El actor del worker de migración es el despliegue, y así se dice.
export function quienDelCambio(f: {
  origen: OrigenRegistro;
  actor: string;
  lote?: { id: string; archivo: string | null } | null;
  carga?: { id: string; archivo: string; corte: string } | null;
}): QuienCambio {
  const archivo = (a: string | null | undefined) => (a ? ` «${a}»` : "");
  switch (f.origen) {
    case "importacion":
    case "reversion":
      return {
        tipo: "importacion",
        titulo: `${f.origen === "importacion" ? "Importación" : "Importación deshecha"}${archivo(f.lote?.archivo)}`,
        detalle: `${f.origen === "importacion" ? "confirmó" : "deshizo"} ${f.actor}`,
        ...(f.lote ? { enlace: `/importar?lote=${f.lote.id}` } : {}),
      };
    case "sincronizacion":
      return {
        tipo: "carga",
        titulo: `Carga de Operaciones${archivo(f.carga?.archivo)}`,
        detalle: f.carga
          ? `corte ${horaDeColombia(new Date(f.carga.corte))} · cargó ${f.actor}`
          : `cargó ${f.actor}`,
        ...(f.carga ? { enlace: `/colocados?carga=${f.carga.id}` } : {}),
      };
    case "migracion":
      return {
        tipo: "proceso",
        titulo: "Migración de datos",
        detalle: "al desplegar la versión que retiró «colocado» como estado",
      };
    case "fusion":
      return {
        tipo: "proceso",
        titulo: "Fusión de valores del catálogo",
        detalle: `fusionó ${f.actor}`,
      };
    case "revocacion":
      return {
        tipo: "proceso",
        titulo: "Revocación del consentimiento",
        detalle: `registró ${f.actor}`,
      };
    case "panel":
      return { tipo: "persona", titulo: f.actor };
    default:
      return { tipo: "proceso", titulo: f.actor };
  }
}

// Filtros del registro (prototipo auditoria-perfil): grupo de campo, quién (personas o cada tipo de
// proceso) y periodo. Valores desconocidos en la dirección no filtran.
export const FILTRO_QUIEN = {
  todos: "Personas y procesos",
  personas: "Solo personas",
  importaciones: "Importaciones",
  cargas: "Cargas de Operaciones",
  procesos: "Otros procesos",
} as const;
export type FiltroQuien = keyof typeof FILTRO_QUIEN;
export const FILTRO_PERIODO = { todo: null, "30": 30, "90": 90 } as const;
export type FiltroPeriodo = keyof typeof FILTRO_PERIODO;

export interface FiltrosRegistro {
  grupo: GrupoRegistro | null;
  quien: FiltroQuien;
  periodo: FiltroPeriodo;
}

export function leerFiltros(q: { campo?: string; quien?: string; periodo?: string }): FiltrosRegistro {
  return {
    grupo: q.campo && q.campo in ETIQUETA_GRUPO ? (q.campo as GrupoRegistro) : null,
    quien: q.quien && q.quien in FILTRO_QUIEN ? (q.quien as FiltroQuien) : "todos",
    periodo: q.periodo && q.periodo in FILTRO_PERIODO ? (q.periodo as FiltroPeriodo) : "todo",
  };
}

const TIPO_QUIEN: Record<Exclude<FiltroQuien, "todos">, QuienCambio["tipo"]> = {
  personas: "persona",
  importaciones: "importacion",
  cargas: "carga",
  procesos: "proceso",
};

export function filtrarRegistro<T extends { grupo: GrupoRegistro; quien: QuienCambio; cuando: string }>(
  filas: T[],
  f: FiltrosRegistro,
  ahora: Date,
): T[] {
  const dias = FILTRO_PERIODO[f.periodo];
  const desde = dias === null ? null : ahora.getTime() - dias * 86_400_000;
  return filas.filter(
    (x) =>
      (f.grupo === null || x.grupo === f.grupo) &&
      (f.quien === "todos" || x.quien.tipo === TIPO_QUIEN[f.quien]) &&
      (desde === null || Date.parse(x.cuando) >= desde),
  );
}

export const POR_PAGINA_REGISTRO = 25;

export function paginar<T>(filas: T[], pagina: number): { filas: T[]; pagina: number; paginas: number; desde: number } {
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA_REGISTRO));
  const p = Math.min(Math.max(1, Math.trunc(pagina) || 1), paginas);
  const desde = (p - 1) * POR_PAGINA_REGISTRO;
  return { filas: filas.slice(desde, desde + POR_PAGINA_REGISTRO), pagina: p, paginas, desde };
}
