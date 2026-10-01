// Plan de una importación (docs/10-specs/importacion-masiva.md §4–§6, paso 3; HU-086). Puro y
// determinista: dadas las filas ya emparejadas, el modo, el banco actual (en la misma forma que la
// exportación) y los catálogos, decide qué pasaría con cada fila sin escribir nada. Lo aplica el
// worker en el sub-slice 4 (HU-141) a partir de este mismo resultado.
//  - El código es la llave; dos filas con el mismo código son error y bloquean (§4.3).
//  - Fusión: celda ausente o vacía no toca; `[vaciar]` vacía (§5.1).
//  - Nunca publica: `estado: publicado` se rechaza con aviso; los nuevos nacen en borrador (§3).
//  - Rol, tecnología o sector que no existen se destacan como valor nuevo, sin bloquear (§6).
import { clasificarNombre, masCercanos, normalizar } from "../catalogo/parecidos";
import { OPCIONES_DISPONIBILIDAD, clienteEnDescripcion } from "../inventario/perfil";
import { CAMPOS_LISTA, CLAVES_CAMPO, VINCULO_FORMATO, type ClaveCampo } from "./campos";
import { VACIAR, formatearExperiencia, leerExperiencia, partirLista } from "./celdas";
import type { ColumnaEmparejada } from "./emparejar";

export type Valor = string | string[] | number | null;
export type FilaBanco = Partial<Record<ClaveCampo, Valor>>;

export interface Catalogos {
  roles: ReadonlyArray<{ nombre: string; familia: string }>;
  familias: readonly string[];
  tecnologias: readonly string[];
  sectores: readonly string[];
  seniorities: readonly string[];
  ciudades: readonly string[];
  modalidades: readonly string[];
  modalidadesPrueba: ReadonlyArray<{ nombre: string; familia: string }>;
  motivosPausa: readonly string[];
}

export type Modo = "crear_y_actualizar" | "solo_actualizar" | "solo_crear";

export interface FilaMapeada {
  numero: number;
  celdas: Partial<Record<ClaveCampo, string>>;
  // Columnas rechazadas (consentimiento, validación) que traían algo en esta fila.
  rechazadas?: Array<{ columna: string; detalle: string }>;
}

export type Grupo = "nuevo" | "actualizado" | "archivado" | "sin_cambios" | "omitido" | "con_error";

export interface Cambio {
  campo: ClaveCampo;
  antes: Valor;
  despues: Valor;
}
export interface Problema {
  campo: ClaveCampo | null;
  mensaje: string;
  opciones?: string[];
}

export interface FilaPlan {
  numero: number;
  codigo: string | null;
  grupo: Grupo;
  incluida: boolean;
  cambios: Cambio[];
  errores: Problema[];
  avisos: Problema[];
  motivoOmision?: string;
  // Ficha resultante completa de un perfil nuevo.
  ficha?: FilaBanco;
}

export interface ValorNuevo {
  tipo: "rol" | "tecnologia" | "sector";
  valor: string;
  veces: number;
  sugerencias: string[];
}

export interface Plan {
  filas: FilaPlan[];
  conteos: Record<
    "nuevos" | "actualizados" | "archivados" | "sin_cambios" | "omitidos" | "con_error",
    number
  >;
  // Lo que se aplicará al confirmar: solo las tarjetas incluidas.
  resumen: Record<"crear" | "actualizar" | "archivar" | "omitir" | "error" | "excluidas", number>;
  valoresNuevos: ValorNuevo[];
  // Hay un código repetido entre las filas incluidas: no se puede confirmar.
  bloqueado: boolean;
}

export interface EntradaPlan {
  filas: readonly FilaMapeada[];
  modo: Modo;
  banco: ReadonlyMap<string, FilaBanco>;
  catalogos: Catalogos;
  // Fecha civil de hoy en Bogotá (AAAA-MM-DD): traduce las bandas a fecha.
  hoy: string;
  excluidas?: ReadonlySet<number>;
}

// ─── de la tabla emparejada a celdas por campo ───────────────────────────────────────────────

export function mapearFilas(
  tabla: {
    encabezados: readonly string[];
    filas: ReadonlyArray<{ numero: number; celdas: readonly string[] }>;
  },
  emparejamiento: readonly ColumnaEmparejada[],
): FilaMapeada[] {
  return tabla.filas.map((f) => {
    const celdas: Partial<Record<ClaveCampo, string>> = {};
    const rechazadas: Array<{ columna: string; detalle: string }> = [];
    for (const c of emparejamiento) {
      const v = (f.celdas[c.indice] ?? "").trim();
      if (!v) continue;
      if (c.destino.tipo === "campo") celdas[c.destino.clave] = v;
      else if (c.destino.motivo === "rechazada")
        rechazadas.push({ columna: c.columna, detalle: c.destino.detalle ?? "" });
      // Las columnas B.4 no viajan: su valor no sale de aquí ni en un aviso.
    }
    return rechazadas.length
      ? { numero: f.numero, celdas, rechazadas }
      : { numero: f.numero, celdas };
  });
}

// ─── reglas por campo ────────────────────────────────────────────────────────────────────────

const RE_CODIGO = /^PS-\d{4}$/;
const ESTADOS_IMPORTABLES = ["borrador", "pausado", "archivado"];
const VINCULOS = Object.values(VINCULO_FORMATO);
// Las mismas opciones rápidas del editor (RF-3.13): la banda se guarda como fecha contra hoy.
const BANDAS: ReadonlyMap<string, number> = new Map(
  Object.values(OPCIONES_DISPONIBILIDAD).map((o) => [normalizar(o.etiqueta), o.dias]),
);
const OPCIONES_FECHA = [
  "AAAA-MM-DD",
  ...Object.values(OPCIONES_DISPONIBILIDAD).map((o) => o.etiqueta),
];
const NO_VACIABLES: ReadonlySet<ClaveCampo> = new Set([
  "codigo",
  "nombre",
  "primerApellido",
  "estado",
]);
const LARGO_MAXIMO: Partial<Record<ClaveCampo, number>> = {
  nombre: 80,
  primerApellido: 80,
  capacidad: 120,
  anclaje: 120,
  resumen: 1200,
  formacion: 160,
};
// Los mismos topes que acepta el editor del panel (entradaPerfil).
const TOPE_LISTA: Partial<Record<ClaveCampo, number>> = {
  tecnologias: 8,
  idiomas: 8,
  selloPersonal: 3,
  experiencias: 12,
};
const LARGO_ELEMENTO: Partial<Record<ClaveCampo, number>> = { idiomas: 60, selloPersonal: 80 };
const ETIQUETA_TIPO_NUEVO = { rol: "rol", tecnologia: "tecnología", sector: "sector" } as const;

function sumarDias(fecha: string, dias: number): string {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10);
}
function fechaValida(t: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
  const ms = Date.parse(`${t}T00:00:00Z`);
  return !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === t;
}
const buscar = (valor: string, lista: readonly string[]) =>
  lista.find((x) => normalizar(x) === normalizar(valor));

const iguales = (a: Valor | undefined, b: Valor | undefined): boolean => {
  const forma = (v: Valor | undefined) =>
    v === undefined || v === null || v === ""
      ? null
      : Array.isArray(v)
        ? v.length
          ? v
          : null
        : String(v);
  return JSON.stringify(forma(a)) === JSON.stringify(forma(b));
};

interface Contexto {
  catalogos: Catalogos;
  hoy: string;
  errores: Problema[];
  avisos: Problema[];
  nuevos: Array<{ tipo: ValorNuevo["tipo"]; valor: string }>;
}

function cerrado(
  ctx: Contexto,
  campo: ClaveCampo,
  valor: string,
  lista: readonly string[],
  nombre: string,
): Valor | undefined {
  const c = buscar(valor, lista);
  if (c) return c;
  ctx.errores.push({
    campo,
    mensaje: `«${valor}» no es un valor de ${nombre}`,
    opciones: masCercanos(
      valor,
      lista.map((n) => ({ id: n, nombre: n })),
    ).map((v) => v.nombre),
  });
  return undefined;
}

function abierto(
  ctx: Contexto,
  campo: ClaveCampo,
  tipo: ValorNuevo["tipo"],
  valor: string,
  lista: readonly string[],
) {
  const c = buscar(valor, lista);
  if (c) return c;
  ctx.nuevos.push({ tipo, valor });
  ctx.avisos.push({
    campo,
    mensaje: `«${valor}» es un valor nuevo en la taxonomía (${ETIQUETA_TIPO_NUEVO[tipo]})`,
  });
  return valor;
}

// Lee una celda y devuelve el valor canónico (`null` = vaciar; `undefined` = no se toca o error).
function leerCampo(ctx: Contexto, campo: ClaveCampo, celda: string): Valor | undefined {
  const { catalogos: k } = ctx;
  if (celda === VACIAR) {
    if (NO_VACIABLES.has(campo)) {
      ctx.errores.push({ campo, mensaje: "Este campo no se puede vaciar" });
      return undefined;
    }
    return CAMPOS_LISTA.has(campo) ? [] : null;
  }
  if (CAMPOS_LISTA.has(campo)) {
    const lista = partirLista(celda);
    const tope = TOPE_LISTA[campo];
    if (tope && lista.length > tope) {
      ctx.errores.push({ campo, mensaje: `Máximo ${tope} (trae ${lista.length})` });
      return undefined;
    }
    const largoElemento = LARGO_ELEMENTO[campo];
    const largo = largoElemento && lista.find((x) => x.length > largoElemento);
    if (largo) {
      ctx.errores.push({
        campo,
        mensaje: `Máximo ${largoElemento} caracteres por elemento: «${largo.slice(0, 40)}…»`,
      });
      return undefined;
    }
  }
  const largo = LARGO_MAXIMO[campo];
  if (largo && celda.length > largo) {
    ctx.errores.push({ campo, mensaje: `Máximo ${largo} caracteres (trae ${celda.length})` });
    return undefined;
  }
  switch (campo) {
    case "aniosExperiencia": {
      const n = Number(celda);
      if (!/^\d+$/.test(celda) || n > 60) {
        ctx.errores.push({ campo, mensaje: `«${celda}» no es un número de años entre 0 y 60` });
        return undefined;
      }
      return n;
    }
    case "disponibilidad": {
      const banda = BANDAS.get(normalizar(celda));
      if (banda !== undefined) return sumarDias(ctx.hoy, banda);
      if (fechaValida(celda)) return celda;
      ctx.errores.push({
        campo,
        mensaje: `«${celda}» no es una fecha ni una banda de disponibilidad`,
        opciones: OPCIONES_FECHA,
      });
      return undefined;
    }
    case "seniority":
      return cerrado(ctx, campo, celda, k.seniorities, "seniority");
    case "ciudad":
      return cerrado(ctx, campo, celda, k.ciudades, "ciudad");
    case "modalidad":
      return cerrado(ctx, campo, celda, k.modalidades, "modalidad de trabajo");
    case "motivoPausa":
      return cerrado(ctx, campo, celda, k.motivosPausa, "motivo de pausa");
    case "vinculo":
      return cerrado(ctx, campo, celda, VINCULOS, "vínculo con Trycore");
    case "modalidadPrueba":
      return cerrado(
        ctx,
        campo,
        celda,
        k.modalidadesPrueba.map((m) => m.nombre),
        "modalidad de prueba",
      );
    case "familia":
      return cerrado(ctx, campo, celda, k.familias, "familia");
    case "tecnologias":
      return partirLista(celda).map((v) => abierto(ctx, campo, "tecnologia", v, k.tecnologias));
    case "sectores":
      return partirLista(celda).map((v) => abierto(ctx, campo, "sector", v, k.sectores));
    case "idiomas":
    case "selloPersonal":
      return partirLista(celda);
    case "experiencias": {
      const salida: string[] = [];
      for (const t of partirLista(celda)) {
        const e = leerExperiencia(t);
        if (!e) {
          ctx.errores.push({
            campo,
            mensaje: `Experiencia ilegible: «${t}» (Cargo · Cliente · 2021-2026: qué hizo)`,
          });
          continue;
        }
        const fueraDeRango = [e.desde, e.hasta].some((a) => a !== null && (a < 1970 || a > 2100));
        if (fueraDeRango || (e.desde !== null && e.hasta !== null && e.hasta < e.desde)) {
          ctx.errores.push({ campo, mensaje: `Periodo inválido en «${t}»` });
          continue;
        }
        if (clienteEnDescripcion(e.descripcion, e.cliente)) {
          ctx.errores.push({
            campo,
            mensaje: `La descripción nombra al cliente «${e.cliente}»: va solo en su lugar, para poder ocultarlo sin consentimiento`,
          });
          continue;
        }
        salida.push(formatearExperiencia(e));
      }
      return salida;
    }
    default:
      return celda;
  }
}

// ─── una fila ────────────────────────────────────────────────────────────────────────────────

function evaluarFila(
  f: FilaMapeada,
  codigo: string,
  actual: FilaBanco | undefined,
  catalogos: Catalogos,
  hoy: string,
): Omit<FilaPlan, "numero" | "codigo" | "incluida"> & { nuevos: Contexto["nuevos"] } {
  const ctx: Contexto = { catalogos, hoy, errores: [], avisos: [], nuevos: [] };
  for (const r of f.rechazadas ?? [])
    ctx.avisos.push({ campo: null, mensaje: `Columna «${r.columna}» rechazada: ${r.detalle}` });

  const leidos: FilaBanco = {};
  for (const campo of CLAVES_CAMPO) {
    const celda = f.celdas[campo]?.trim();
    if (!celda || campo === "codigo" || campo === "estado" || campo === "familia") continue;
    const v = leerCampo(ctx, campo, celda);
    if (v !== undefined) leidos[campo] = v;
  }

  // Estado: nunca publica; archivar es su propio grupo; los nuevos nacen en borrador.
  const celdaEstado = f.celdas.estado?.trim();
  let estado: string | undefined;
  if (celdaEstado === VACIAR)
    ctx.errores.push({ campo: "estado", mensaje: "Este campo no se puede vaciar" });
  else if (celdaEstado) {
    const e = normalizar(celdaEstado);
    if (actual && e === normalizar(String(actual.estado ?? ""))) estado = String(actual.estado);
    else if (e === "publicado")
      ctx.avisos.push({
        campo: "estado",
        mensaje:
          "Estado «publicado» rechazado: la importación no publica; se publica desde la ficha",
      });
    else if (!ESTADOS_IMPORTABLES.includes(e))
      ctx.errores.push({
        campo: "estado",
        mensaje: `«${celdaEstado}» no es un estado importable`,
        opciones: ESTADOS_IMPORTABLES,
      });
    else if (!actual && e === "archivado")
      ctx.errores.push({ campo: "estado", mensaje: `No existe un perfil ${codigo} para archivar` });
    else if (!actual && e !== "borrador")
      ctx.avisos.push({
        campo: "estado",
        mensaje: `Un perfil nuevo nace en borrador (la fila decía «${celdaEstado}»)`,
      });
    else estado = e;
  }

  // Rol y familia: la familia la define el rol; un rol nuevo exige una familia existente.
  const celdaRol = f.celdas.rol?.trim();
  const celdaFamilia = f.celdas.familia?.trim();
  let familia: Valor | undefined = actual?.familia;
  if (celdaRol === VACIAR) {
    leidos.rol = null;
    familia = null;
  } else if (celdaRol) {
    const existente = catalogos.roles.find((r) => normalizar(r.nombre) === normalizar(celdaRol));
    if (existente) {
      leidos.rol = existente.nombre;
      familia = existente.familia;
      if (
        celdaFamilia &&
        celdaFamilia !== VACIAR &&
        normalizar(celdaFamilia) !== normalizar(existente.familia)
      )
        ctx.avisos.push({
          campo: "familia",
          mensaje: `La familia la define el rol: ${existente.familia}`,
        });
    } else if (!celdaFamilia || celdaFamilia === VACIAR) {
      ctx.errores.push({
        campo: "rol",
        mensaje: `«${celdaRol}» es un rol nuevo: indica su familia`,
      });
    } else {
      const fam = leerCampo(ctx, "familia", celdaFamilia);
      if (fam !== undefined) {
        leidos.rol = abierto(ctx, "rol", "rol", celdaRol, []);
        familia = fam;
      }
    }
  }
  if (familia !== undefined) leidos.familia = familia;

  // Modalidad de prueba: de la familia del rol resultante.
  const prueba = leidos.modalidadPrueba;
  if (typeof prueba === "string") {
    const fam = leidos.familia ?? actual?.familia;
    const m = catalogos.modalidadesPrueba.find((x) => x.nombre === prueba)!;
    if (!fam)
      ctx.errores.push({
        campo: "modalidadPrueba",
        mensaje: "Elige primero el rol: la modalidad de prueba depende de su familia",
      });
    else if (normalizar(m.familia) !== normalizar(String(fam)))
      ctx.errores.push({
        campo: "modalidadPrueba",
        mensaje: `«${prueba}» no es de la familia ${fam}`,
      });
  }

  if (estado !== undefined) leidos.estado = estado;
  const resultante: FilaBanco = { ...(actual ?? {}), ...leidos, codigo };
  if (!actual) resultante.estado = "borrador";

  if (resultante.estado === "pausado" && actual?.estado !== "pausado" && !resultante.motivoPausa)
    ctx.errores.push({
      campo: "motivoPausa",
      mensaje: "Para pausar hace falta el motivo de pausa",
    });
  if (!actual)
    for (const campo of ["nombre", "primerApellido"] as const)
      if (!resultante[campo])
        ctx.errores.push({ campo, mensaje: "Obligatorio para crear un perfil" });

  const cambios: Cambio[] = actual
    ? CLAVES_CAMPO.filter(
        (c) => c !== "codigo" && c in leidos && !iguales(actual[c], leidos[c]),
      ).map((c) => ({
        campo: c,
        antes: actual[c] ?? null,
        despues: leidos[c] ?? null,
      }))
    : [];

  const base = { cambios, errores: ctx.errores, avisos: ctx.avisos, nuevos: ctx.nuevos };
  if (ctx.errores.length) return { ...base, cambios: [], grupo: "con_error" };
  if (!actual) return { ...base, grupo: "nuevo", ficha: resultante };
  if (leidos.estado === "archivado" && actual.estado !== "archivado")
    return { ...base, grupo: "archivado" };
  return { ...base, grupo: cambios.length ? "actualizado" : "sin_cambios" };
}

// ─── el plan ─────────────────────────────────────────────────────────────────────────────────

export function calcularPlan(e: EntradaPlan): Plan {
  const excluidas = e.excluidas ?? new Set<number>();
  const codigoDe = (f: FilaMapeada) => {
    const c = f.celdas.codigo?.trim().toUpperCase() ?? "";
    return RE_CODIGO.test(c) ? c : null;
  };

  // Códigos repetidos entre las filas incluidas.
  const porCodigo = new Map<string, number[]>();
  for (const f of e.filas) {
    const c = codigoDe(f);
    if (c && !excluidas.has(f.numero)) porCodigo.set(c, [...(porCodigo.get(c) ?? []), f.numero]);
  }

  const nuevosVistos: Array<{ tipo: ValorNuevo["tipo"]; valor: string }> = [];
  const filas: FilaPlan[] = e.filas.map((f) => {
    const incluida = !excluidas.has(f.numero);
    const crudo = f.celdas.codigo?.trim() ?? "";
    const codigo = codigoDe(f);
    const comun = { numero: f.numero, codigo, incluida, cambios: [], avisos: [] };
    if (!codigo)
      return {
        ...comun,
        grupo: "con_error" as const,
        errores: [
          {
            campo: "codigo" as const,
            mensaje: crudo
              ? `«${crudo}» no tiene la forma PS-0000`
              : "Falta el código: es obligatorio en toda fila",
          },
        ],
      };
    const repetidas = (porCodigo.get(codigo) ?? []).filter((n) => n !== f.numero);
    if (incluida && repetidas.length)
      return {
        ...comun,
        grupo: "con_error" as const,
        errores: [
          {
            campo: "codigo" as const,
            mensaje: `El código ${codigo} está repetido en la fila ${repetidas.join(", ")}: resuélvelo para poder importar`,
          },
        ],
      };
    const actual = e.banco.get(codigo);
    if (actual && e.modo === "solo_crear")
      return {
        ...comun,
        grupo: "omitido" as const,
        errores: [],
        motivoOmision: `El código ${codigo} ya existe y el modo es solo crear`,
      };
    if (!actual && e.modo === "solo_actualizar")
      return {
        ...comun,
        grupo: "omitido" as const,
        errores: [],
        motivoOmision: `El código ${codigo} no existe y el modo es solo actualizar`,
      };
    const { nuevos, ...r } = evaluarFila(f, codigo, actual, e.catalogos, e.hoy);
    if (incluida && r.grupo !== "con_error") nuevosVistos.push(...nuevos);
    return { ...comun, ...r };
  });

  const valoresNuevos: ValorNuevo[] = [];
  for (const n of nuevosVistos) {
    const ya = valoresNuevos.find(
      (v) => v.tipo === n.tipo && normalizar(v.valor) === normalizar(n.valor),
    );
    if (ya) {
      ya.veces++;
      continue;
    }
    const lista =
      n.tipo === "rol"
        ? e.catalogos.roles.map((r) => r.nombre)
        : n.tipo === "tecnologia"
          ? e.catalogos.tecnologias
          : e.catalogos.sectores;
    const c = clasificarNombre(
      n.valor,
      lista.map((x) => ({ id: x, nombre: x })),
    );
    valoresNuevos.push({
      ...n,
      veces: 1,
      sugerencias: c.tipo === "parecido" ? c.parecidos.map((p) => p.nombre) : [],
    });
  }

  const cuenta = (g: Grupo, soloIncluidas = false) =>
    filas.filter((f) => f.grupo === g && (!soloIncluidas || f.incluida)).length;
  return {
    filas,
    conteos: {
      nuevos: cuenta("nuevo"),
      actualizados: cuenta("actualizado"),
      archivados: cuenta("archivado"),
      sin_cambios: cuenta("sin_cambios"),
      omitidos: cuenta("omitido"),
      con_error: cuenta("con_error"),
    },
    resumen: {
      crear: cuenta("nuevo", true),
      actualizar: cuenta("actualizado", true),
      archivar: cuenta("archivado", true),
      omitir: cuenta("omitido", true),
      error: cuenta("con_error", true),
      excluidas: filas.filter((f) => !f.incluida).length,
    },
    valoresNuevos,
    bloqueado: [...porCodigo.values()].some((ns) => ns.length > 1),
  };
}
