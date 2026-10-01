"use client";
// Asistente de importación (prototipo importar-perfiles y variantes; HU-088, HU-086, HU-148). Paso 1:
// exportar o descargar la plantilla (con respaldo para copiar si la descarga no arranca), pegar o
// cargar la hoja, emparejar columnas (o aplicar un emparejamiento guardado y guardarlo), elegir el
// modo. Paso 2: la vista previa por grupos, con tarjetas que se desmarcan; el servidor recalcula.
// Confirmar (HU-141) encola la aplicación en el worker y lleva al resultado (paso 3, Resultado.tsx):
// el panel nunca escribe en `perfiles`.
import { useEffect, useRef, useState } from "react";
import { ETIQUETA_CAMPO_IMPORTACION, type ClaveCampo } from "@ps/dominio/importacion/campos";
import type { ColumnaEmparejada, ColumnaPlantilla } from "@ps/dominio/importacion/emparejar";
import type { FilaPlan, Grupo, Modo, Plan, Valor } from "@ps/dominio/importacion/plan";
import { enviarJson } from "../acceso/cliente";

interface Plantilla {
  id: string;
  nombre: string;
  columnas: ColumnaPlantilla[];
  autor: string;
  actualizadaEn: string;
}

interface Emparejado {
  formato: "csv" | "tsv" | "json";
  encabezados: string[];
  totalFilas: number;
  ejemplo: string[];
  emparejamiento: ColumnaEmparejada[];
  faltantes?: ColumnaPlantilla[];
  nuevas?: string[];
  plantilla?: { id: string; nombre: string };
}

interface VistaPrevia {
  loteId: string;
  modo: Modo;
  plan: Plan;
}

const NOMBRE_FORMATO = { csv: "CSV", tsv: "Hoja de cálculo", json: "JSON" } as const;
const MODOS: Array<{ clave: Modo; titulo: string; ayuda: string }> = [
  {
    clave: "crear_y_actualizar",
    titulo: "Crear y actualizar",
    ayuda: "Código existente: actualiza. Código nuevo: crea el perfil en borrador.",
  },
  {
    clave: "solo_actualizar",
    titulo: "Solo actualizar",
    ayuda: "Un código que no existe se omite. Nunca crea perfiles.",
  },
  {
    clave: "solo_crear",
    titulo: "Solo crear",
    ayuda: "Un código que ya existe se omite. No toca perfiles actuales.",
  },
];
const MOTIVO_LECTURA: Record<string, string> = {
  vacio: "Pega las celdas copiadas de tu hoja, con la fila de títulos.",
  json_invalido: "No es un JSON válido.",
  sin_filas: "Solo vemos la fila de títulos: faltan las filas de los perfiles.",
  demasiadas_filas: "Son demasiadas filas para una importación.",
};

const etiquetaCampo = (c: ClaveCampo) =>
  c === "codigo" ? "Código (llave)" : ETIQUETA_CAMPO_IMPORTACION[c];

// ─── descarga con respaldo para copiar (HU-088 · el navegador bloquea la descarga) ─────────

function Formato(p: { totalBanco: number }) {
  const [copiar, setCopiar] = useState<{ titulo: string; texto: string } | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function bajar(ruta: string, titulo: string) {
    setError(null);
    const r = await fetch(ruta, { credentials: "same-origin" }).catch(() => null);
    if (!r || !r.ok) return setError("No pudimos preparar el archivo. Inténtalo de nuevo.");
    const texto = await r.text();
    setCopiar({ titulo, texto });
    const nombre = /filename="([^"]+)"/.exec(r.headers.get("content-disposition") ?? "")?.[1];
    // En una vista incrustada la descarga suele bloquearse sin aviso: se muestra para copiar.
    let incrustada = true;
    try {
      incrustada = window.self !== window.top;
    } catch {
      incrustada = true;
    }
    if (incrustada) return setAbierto(true);
    try {
      const url = URL.createObjectURL(
        new Blob([texto], { type: r.headers.get("content-type") ?? "text/plain" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre ?? "importacion.txt";
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setAbierto(true);
    }
  }

  async function verParaCopiar(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const abre = e.currentTarget.open;
    setAbierto(abre);
    if (abre && !copiar) {
      const r = await fetch("/api/v1/importacion/plantilla?formato=csv", {
        credentials: "same-origin",
      }).catch(() => null);
      if (r?.ok) setCopiar({ titulo: "la plantilla de muestra", texto: await r.text() });
    }
  }

  return (
    <section className="pp-seccion" aria-labelledby="t-formato">
      <div className="pp-seccion__cabecera">
        <h2 className="pp-seccion__titulo" id="t-formato">
          Parte del formato
        </h2>
        <span className="ip-seccion-meta">Mismo formato que acepta la importación</span>
      </div>
      <p className="ip-texto">
        Exporta el banco o descarga la plantilla de muestra, edítala donde te resulte cómodo y
        pégala abajo. Una fila por perfil; las listas van en una celda separadas por punto y coma.
        Una celda vacía no cambia nada; <code className="ip-codigo">[vaciar]</code> borra el campo a
        propósito. Los campos que no se publican van marcados «interno» y el consentimiento nunca
        viaja en el archivo.
      </p>
      <div className="ip-formato">
        <button
          type="button"
          className="pp-btn pp-btn--contorno pp-btn--sm"
          onClick={() =>
            bajar("/api/v1/importacion/exportar?formato=csv", "el banco en hoja de cálculo")
          }
        >
          Exportar banco · hoja de cálculo <span className="pp-meta">{p.totalBanco}</span>
        </button>
        <button
          type="button"
          className="pp-btn pp-btn--contorno pp-btn--sm"
          onClick={() => bajar("/api/v1/importacion/exportar?formato=json", "el banco en JSON")}
        >
          Exportar banco · JSON <span className="pp-meta">{p.totalBanco}</span>
        </button>
        <button
          type="button"
          className="pp-btn pp-btn--fantasma pp-btn--sm"
          onClick={() =>
            bajar("/api/v1/importacion/plantilla?formato=csv", "la plantilla de muestra")
          }
        >
          Plantilla de muestra
        </button>
        <details className="ip-copiar" open={abierto} onToggle={verParaCopiar}>
          <summary className="pp-enlace">¿No arranca la descarga? Ver para copiar</summary>
          <label className="pp-sr" htmlFor="copiar-plantilla">
            {`Contenido de ${copiar?.titulo ?? "la plantilla de muestra"}`}
          </label>
          <textarea
            className="pp-input"
            id="copiar-plantilla"
            readOnly
            wrap="off"
            value={copiar?.texto ?? ""}
            onFocus={(e) => e.currentTarget.select()}
          />
        </details>
      </div>
      {error && (
        <p className="pp-error" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </section>
  );
}

// ─── paso 1: pegar y emparejar ───────────────────────────────────────────────────────────────

function notaColumna(
  c: ColumnaEmparejada,
  conPlantilla: boolean,
): { clase: string; texto: string } | null {
  const d = c.destino;
  if (d.tipo === "campo") return null;
  if (d.motivo === "lista_negra" || d.motivo === "rechazada")
    return { clase: "pp-estado--danger", texto: d.detalle ?? "No se importa" };
  if (d.motivo === "decision")
    return {
      clase: "pp-estado--neutro",
      texto: conPlantilla
        ? "Como en la plantilla: no se importa"
        : "Cambiada por ti: no se importa",
    };
  if (d.motivo === "campo_repetido")
    return { clase: "pp-estado--warn", texto: "Otra columna ya llena ese campo: no se importa" };
  return {
    clase: "pp-estado--warn",
    texto: conPlantilla ? "Nueva: la plantilla no la conoce" : "Sin emparejar: no se importa",
  };
}

function metaColumnas(e: Emparejado): string {
  const a = e.emparejamiento.filter((c) => c.destino.tipo === "campo").length;
  const no = e.emparejamiento.length - a;
  const partes = [e.plantilla ? `${a} como en la plantilla` : `${a} emparejadas por nombre`];
  if (e.faltantes?.length)
    partes.push(
      `${e.faltantes.length} ${e.faltantes.length === 1 ? "falta" : "faltan"} en la hoja`,
    );
  partes.push(`${no} no se ${no === 1 ? "importa" : "importan"}`);
  return partes.join(" · ");
}

function PasoPegar(p: {
  campos: ClaveCampo[];
  plantillas: Plantilla[];
  limiteFilas: number;
  estado: EstadoPaso1;
  cambiar: (e: Partial<EstadoPaso1>) => void;
  alVer: () => void;
  enviando: boolean;
  error: string | null;
  guardadaAhora: string | null;
}) {
  const { estado: s, cambiar } = p;
  const [leyendo, setLeyendo] = useState(false);
  const pedido = useRef(0);

  // Leer y emparejar al pegar (con una pausa breve para no pedir en cada tecla).
  useEffect(() => {
    if (!s.texto.trim()) {
      cambiar({ emparejado: null, lectura: null });
      return;
    }
    const n = ++pedido.current;
    const t = setTimeout(async () => {
      setLeyendo(true);
      const r = await enviarJson("/api/v1/importacion/emparejar", {
        texto: s.texto,
        ...(s.formatoElegido ? { formato: s.formatoElegido } : {}),
        ...(s.plantillaId ? { plantillaId: s.plantillaId } : {}),
      }).catch(() => null);
      if (n !== pedido.current) return;
      setLeyendo(false);
      if (r?.status === 200)
        return cambiar({ emparejado: (await r.json()) as Emparejado, lectura: null });
      const cuerpo = r
        ? ((await r.json().catch(() => ({}))) as { motivo?: string; detalle?: string })
        : {};
      cambiar({ emparejado: null, lectura: cuerpo.motivo ?? "sin_conexion" });
    }, 350);
    return () => clearTimeout(t);
    // `cambiar` es estable (setState funcional del padre).
  }, [s.texto, s.formatoElegido, s.plantillaId]);

  async function cargar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.currentTarget.files?.[0];
    if (!f) return;
    cambiar({ texto: await f.text(), archivo: f.name, formatoElegido: null });
    e.currentTarget.value = "";
  }

  function elegirCampo(indice: number, valor: string) {
    if (!s.emparejado) return;
    const clave = valor === "" ? null : (valor as ClaveCampo);
    const emparejamiento = s.emparejado.emparejamiento.map((c) => {
      if (c.indice === indice)
        return {
          ...c,
          destino: clave
            ? ({ tipo: "campo", clave } as const)
            : ({ tipo: "no_importar", motivo: "decision" } as const),
        };
      if (clave && c.destino.tipo === "campo" && c.destino.clave === clave)
        return { ...c, destino: { tipo: "no_importar", motivo: "decision" } as const };
      return c;
    });
    cambiar({ emparejado: { ...s.emparejado, emparejamiento } });
  }

  const e = s.emparejado;
  const ambiguo = s.lectura === "ambiguo";
  return (
    <>
      <section className="pp-seccion" aria-labelledby="t-origen">
        <div className="pp-seccion__cabecera">
          <h2 className="pp-seccion__titulo" id="t-origen">
            Pega tu hoja
          </h2>
          <label className="pp-btn pp-btn--contorno pp-btn--sm" htmlFor="archivo">
            Cargar archivo
            <input
              className="pp-sr"
              id="archivo"
              type="file"
              accept=".csv,.json,.tsv,.txt"
              onChange={cargar}
            />
          </label>
        </div>
        <label className="pp-label pp-sr" htmlFor="pegado">
          Celdas copiadas de la hoja de cálculo, con la fila de títulos
        </label>
        <textarea
          className="pp-input pp-input--area ip-pegado"
          id="pegado"
          wrap="off"
          spellCheck={false}
          aria-describedby="deteccion"
          placeholder="Pega aquí las celdas copiadas de tu hoja, con la fila de títulos"
          value={s.texto}
          onChange={(x) =>
            cambiar({ texto: x.currentTarget.value, archivo: null, formatoElegido: null })
          }
        />
        <div className="ip-bajo-campo">
          <span id="deteccion" role="status">
            {leyendo ? (
              <span>Leyendo…</span>
            ) : e ? (
              <>
                <span className="pp-estado pp-estado--ok">{`${NOMBRE_FORMATO[e.formato]} ${e.formato === "tsv" ? "reconocida" : "reconocido"}`}</span>
                <span>{`${e.totalFilas} ${e.totalFilas === 1 ? "fila" : "filas"} · ${e.encabezados.length} columnas`}</span>
              </>
            ) : s.lectura && !ambiguo ? (
              <span className="pp-estado pp-estado--danger">
                {s.lectura === "demasiadas_filas"
                  ? `Son más de ${p.limiteFilas} filas: divide el archivo en partes de ${p.limiteFilas} o menos.`
                  : (MOTIVO_LECTURA[s.lectura] ?? "No pudimos leer lo pegado. Inténtalo de nuevo.")}
              </span>
            ) : null}
          </span>
          <span>{`Hasta ${p.limiteFilas} filas por importación`}</span>
        </div>
        {ambiguo && (
          <fieldset className="ip-ambiguo">
            <legend className="pp-label">
              No sabemos con certeza cómo separar las columnas. ¿Qué pegaste?
            </legend>
            {(["tsv", "csv", "json"] as const).map((f) => (
              <label key={f} className="pp-check">
                <input
                  type="radio"
                  name="formato"
                  onChange={() => cambiar({ formatoElegido: f })}
                />
                <span className="pp-check__texto">
                  {f === "tsv"
                    ? "Celdas de una hoja de cálculo"
                    : f === "csv"
                      ? "CSV separado por comas"
                      : "JSON"}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </section>

      {e && (
        <section className="pp-seccion" aria-labelledby="t-columnas">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="t-columnas">
              Columnas
            </h2>
            <span className="ip-seccion-meta">{metaColumnas(e)}</span>
          </div>
          <div className="ip-guardado">
            <label className="pp-label" htmlFor="plantilla-guardada">
              Emparejamiento guardado
            </label>
            <div className="pp-select">
              <select
                className="pp-input"
                id="plantilla-guardada"
                value={s.plantillaId ?? ""}
                onChange={(x) => cambiar({ plantillaId: x.currentTarget.value || null })}
              >
                <option value="">Ninguno: emparejar por nombre</option>
                {p.plantillas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {e.plantilla && e.faltantes && e.faltantes.length > 0 && (
            <div className="pp-aviso pp-aviso--warn ip-aviso" role="status">
              <span className="pp-aviso__icono" aria-hidden="true">
                !
              </span>
              <p>
                <span className="pp-aviso__titulo">
                  {`A la hoja le ${e.faltantes.length === 1 ? "falta 1 columna" : `faltan ${e.faltantes.length} columnas`} de la plantilla: ${e.faltantes.map((f) => `«${f.columna}»`).join(", ")}.`}
                </span>
                {`${e.faltantes.length === 1 ? "El campo" : "Los campos"} ${e.faltantes.map((f) => etiquetaCampo(f.clave!)).join(", ")} no se ${e.faltantes.length === 1 ? "tocará" : "tocarán"} en ningún perfil. Si querías actualizarlo, añade la columna a tu hoja y vuelve a pegarla.`}
              </p>
            </div>
          )}
          {e.plantilla && !e.faltantes?.length && (
            <div className="pp-aviso pp-aviso--info ip-aviso" role="status">
              <span className="pp-aviso__icono" aria-hidden="true">
                i
              </span>
              <p>
                <span className="pp-aviso__titulo">{`Plantilla «${e.plantilla.nombre}» aplicada.`}</span>
                {e.nuevas?.length
                  ? `La hoja trae ${e.nuevas.length === 1 ? "una columna nueva" : `${e.nuevas.length} columnas nuevas`}, ${e.nuevas.map((n) => `«${n}»`).join(", ")}, que la plantilla no conoce: queda sin emparejar y no se importa. `
                  : ""}
                Puedes corregir cualquier columna antes de la vista previa.
              </p>
            </div>
          )}
          <div
            className="pp-tabla-marco ip-mapa"
            tabIndex={0}
            role="region"
            aria-label="Emparejamiento de columnas"
          >
            <table className="pp-tabla">
              <caption className="pp-sr">
                Cada columna de tu hoja y el campo del perfil que llenará
              </caption>
              <thead>
                <tr>
                  <th scope="col">Columna de tu hoja</th>
                  <th scope="col">Fila 2</th>
                  <th scope="col">Campo del perfil</th>
                  <th scope="col">
                    <span className="pp-sr">Nota</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {e.emparejamiento.map((c) => {
                  const nota = notaColumna(c, Boolean(e.plantilla));
                  return (
                    <tr key={c.indice}>
                      <th scope="row">{c.columna || `(columna ${c.indice + 1})`}</th>
                      <td className="ip-ejemplo">{e.ejemplo[c.indice] || "(vacía)"}</td>
                      <td>
                        <div className="pp-select">
                          <select
                            className="pp-input"
                            id={`map-${c.indice}`}
                            aria-label={`Campo del perfil para la columna ${c.columna}`}
                            value={c.destino.tipo === "campo" ? c.destino.clave : ""}
                            disabled={c.bloqueada}
                            onChange={(x) => elegirCampo(c.indice, x.currentTarget.value)}
                          >
                            {p.campos.map((k) => (
                              <option key={k} value={k}>
                                {etiquetaCampo(k)}
                              </option>
                            ))}
                            <option value="">No importar</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        {nota && <span className={`pp-estado ${nota.clase}`}>{nota.texto}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ip-plantilla">
            <label className="pp-check">
              <input
                type="checkbox"
                checked={s.guardar}
                onChange={(x) => cambiar({ guardar: x.currentTarget.checked })}
              />
              <span className="pp-check__texto">Guardar este emparejamiento como plantilla</span>
            </label>
            <input
              className="pp-input"
              id="nombre-plantilla"
              type="text"
              maxLength={80}
              placeholder="Nombre de la plantilla"
              aria-label="Nombre de la plantilla"
              value={s.nombrePlantilla}
              onChange={(x) => cambiar({ nombrePlantilla: x.currentTarget.value, guardar: true })}
            />
          </div>
        </section>
      )}

      {p.guardadaAhora && (
        <section className="pp-seccion" aria-labelledby="t-guardados">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="t-guardados">
              Emparejamientos guardados
            </h2>
            <span className="ip-seccion-meta">{p.plantillas.length}</span>
          </div>
          <ul className="pp-filas" aria-labelledby="t-guardados">
            {p.plantillas.map((t) => {
              const a = t.columnas.filter((c) => c.clave).length;
              const no = t.columnas.filter((c) => !c.clave).map((c) => c.columna);
              return (
                <li key={t.id} className="pp-fila">
                  <div className="pp-fila__principal">
                    <p className="pp-fila__titulo">
                      <span>{t.nombre}</span>
                      {t.id === p.guardadaAhora && (
                        <span className="pp-estado pp-estado--ok">Guardada ahora</span>
                      )}
                    </p>
                    <p className="pp-fila__meta">
                      {`${a} ${a === 1 ? "columna" : "columnas"} a campos · ${no.length} en «no importar»${no.length ? ` (${no.join(", ")})` : ""} · ${t.autor}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="pp-seccion" aria-labelledby="t-modo">
        <div className="pp-seccion__cabecera">
          <h2 className="pp-seccion__titulo" id="t-modo">
            Modo
          </h2>
          <span className="ip-seccion-meta">
            El código de cada fila decide a qué perfil corresponde
          </span>
        </div>
        <fieldset className="ip-modos">
          <legend className="pp-sr">Modo de importación</legend>
          {MODOS.map((m) => (
            <label key={m.clave} className="ip-modo">
              <input
                type="radio"
                name="modo"
                checked={s.modo === m.clave}
                onChange={() => cambiar({ modo: m.clave })}
              />
              <span className="ip-modo__texto">
                <span className="ip-modo__titulo">{m.titulo}</span>
                <span className="ip-modo__ayuda">{m.ayuda}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <div className="ip-pie">
        <div className="ip-pie__texto">
          <p style={{ margin: 0 }}>
            Nada cambia en el banco hasta que confirmes en la vista previa.
          </p>
          {p.error && (
            <p className="pp-error" role="alert">
              <span aria-hidden="true">!</span>
              {p.error}
            </p>
          )}
        </div>
        <div className="ip-pie__acciones">
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            disabled={!e || p.enviando || (s.guardar && !s.nombrePlantilla.trim())}
            onClick={p.alVer}
          >
            {p.enviando ? "Calculando…" : "Ver la vista previa"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── paso 2: vista previa ────────────────────────────────────────────────────────────────────

const GRUPOS: Array<{ grupo: Grupo; id: string; titulo: string; meta: string; resumen: string }> = [
  {
    grupo: "actualizado",
    id: "g-act",
    titulo: "Actualizados",
    meta: "Solo los campos que cambian",
    resumen: "actualizados",
  },
  {
    grupo: "nuevo",
    id: "g-nuevos",
    titulo: "Nuevos",
    meta: "Se crean en borrador",
    resumen: "nuevos",
  },
  {
    grupo: "archivado",
    id: "g-arch",
    titulo: "Archivados",
    meta: "Salen del banco; no se borran",
    resumen: "archivados",
  },
  {
    grupo: "con_error",
    id: "g-error",
    titulo: "Con error",
    meta: "No se importan",
    resumen: "con error",
  },
  {
    grupo: "sin_cambios",
    id: "g-sin",
    titulo: "Sin cambios",
    meta: "Idénticas a lo que ya hay",
    resumen: "sin cambios",
  },
  {
    grupo: "omitido",
    id: "g-omit",
    titulo: "Omitidos",
    meta: "Excluidos por el modo",
    resumen: "omitidos",
  },
];
const VISIBLES = 5;

function texto(v: Valor): string {
  if (v === null || v === "" || (Array.isArray(v) && v.length === 0)) return "";
  return Array.isArray(v) ? v.join("; ") : String(v);
}

function etiquetaError(f: FilaPlan): string {
  const e = f.errores[0];
  if (!e?.campo) return "Error";
  if (e.campo === "codigo")
    return e.mensaje.startsWith("Falta")
      ? "Falta el código"
      : e.mensaje.includes("repetido")
        ? "Código repetido"
        : "Código no válido";
  if (e.campo === "aniosExperiencia") return "Años no numéricos";
  if (e.campo === "disponibilidad") return "Disponibilidad no válida";
  return `${etiquetaCampo(e.campo)}: no válido`;
}

const listaO = (xs: string[]) =>
  xs.length > 1 ? `${xs.slice(0, -1).join(", ")} o ${xs[xs.length - 1]}` : (xs[0] ?? "");

// El valor de una lista con los que no existen en el banco marcados (spec §6: valores nuevos).
function ValorConNuevos(p: { valor: Valor; nuevos: Plan["valoresNuevos"] }) {
  const lista = Array.isArray(p.valor) ? p.valor : [String(p.valor)];
  const esNuevo = (x: string) => p.nuevos.some((n) => n.valor.toLowerCase() === x.toLowerCase());
  if (!lista.some(esNuevo)) return <>{texto(p.valor)}</>;
  return (
    <>
      {lista.map((x, i) => (
        <span key={i}>
          {i > 0 && "; "}
          {esNuevo(x) ? <mark className="ip-nuevo">{x}</mark> : x}
        </span>
      ))}{" "}
      <span className="pp-meta">nuevo en la taxonomía</span>
    </>
  );
}

// Columnas rechazadas (consentimiento, validación) y el estado «publicado»: el plan las deja como
// avisos; la tarjeta las muestra como campos rechazados (prototipo importar-perfiles--campos-rechazados).
const esRechazo = (m: string) => /^Columna «.+» rechazada|^Estado «publicado» rechazado/.test(m);
function rechazosDe(f: FilaPlan): Array<{ campo: string; valor: string | null }> {
  return f.avisos.flatMap((a): Array<{ campo: string; valor: string | null }> => {
    const columna = /^Columna «(.+)» rechazada/.exec(a.mensaje)?.[1];
    if (columna) return [{ campo: columna, valor: null }];
    if (/^Estado «publicado» rechazado/.test(a.mensaje))
      return [{ campo: "Estado", valor: "publicado" }];
    return [];
  });
}

function Tarjeta(p: {
  f: FilaPlan;
  nuevos: Plan["valoresNuevos"];
  alIncluir: (numero: number, incluir: boolean) => void;
  ocupado: boolean;
  primera: boolean;
}) {
  const { f } = p;
  const titulo = f.persona.nombre ?? "Sin nombre";
  const valorNuevo = f.avisos.some((a) => a.mensaje.includes("valor nuevo"));
  const rechazos = rechazosDe(f);
  const avisos = f.avisos.filter((a) => !esRechazo(a.mensaje));
  const cambios =
    f.grupo === "nuevo" && f.ficha
      ? (Object.entries(f.ficha) as Array<[ClaveCampo, Valor]>)
          .filter(
            ([k, v]) =>
              !["codigo", "estado", "nombre", "primerApellido", "familia"].includes(k) && texto(v),
          )
          .map(([campo, despues]) => ({ campo, antes: null as Valor, despues }))
      : f.cambios;
  const conCuerpo =
    cambios.length > 0 || f.errores.length > 0 || f.avisos.length > 0 || f.motivoOmision;
  const nCambian =
    f.grupo === "actualizado"
      ? `${f.cambios.length} ${f.cambios.length === 1 ? "campo cambia" : "campos cambian"}`
      : null;
  const repetido = f.grupo === "con_error" && f.errores[0]?.mensaje.includes("repetido");
  const marcable = f.grupo !== "con_error";
  return (
    <li
      className={`ip-fila${!f.incluida ? " ip-fila--excluida" : ""}${repetido ? " ip-fila--marcada" : ""}`}
    >
      {marcable ? (
        <label className="ip-fila__incluir">
          <input
            type="checkbox"
            checked={f.incluida}
            disabled={p.ocupado}
            onChange={(x) => p.alIncluir(f.numero, x.currentTarget.checked)}
          />
          <span className="pp-sr">{`Incluir ${f.codigo ?? `la fila ${f.numero}`} en la importación`}</span>
        </label>
      ) : (
        <span className="ip-fila__incluir" aria-hidden="true" />
      )}
      <details
        className="ip-fila__det"
        open={
          f.incluida &&
          (f.grupo === "con_error" ||
            ((f.grupo === "actualizado" || f.grupo === "nuevo") &&
              (p.primera || valorNuevo || rechazos.length > 0)))
            ? true
            : undefined
        }
      >
        <summary className={`ip-fila__resumen${conCuerpo ? "" : " ip-fila__resumen--fija"}`}>
          <span className="ip-fila__codigo">{f.codigo ?? "—"}</span>
          <span className="ip-fila__principal">
            <span className="ip-fila__nombre">{titulo}</span>
            {f.persona.rol && <span className="ip-fila__rol">{f.persona.rol}</span>}
          </span>
          <span className="ip-fila__meta">
            {f.grupo === "con_error" && (
              <span className="pp-estado pp-estado--danger">{etiquetaError(f)}</span>
            )}
            {valorNuevo && f.incluida && (
              <span className="pp-estado pp-estado--warn">Valor nuevo</span>
            )}
            {!f.incluida
              ? "Excluida por ti"
              : rechazos.length
                ? [
                    nCambian,
                    `${rechazos.length} ${rechazos.length === 1 ? "rechazado" : "rechazados"}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : f.grupo === "actualizado"
                  ? `${f.cambios.length} ${f.cambios.length === 1 ? "campo" : "campos"}`
                  : null}
            <span>{`fila ${f.numero}`}</span>
          </span>
        </summary>
        {conCuerpo && (
          <div className="ip-fila__cuerpo">
            {(cambios.length > 0 || rechazos.length > 0) && (
              <dl className="ip-cambios">
                {cambios.map((c) => (
                  <div key={c.campo} className="ip-cambio">
                    <dt>{etiquetaCampo(c.campo)}</dt>
                    <dd>
                      {f.grupo !== "nuevo" && (
                        <>
                          <span className="ip-antes">
                            <span className="pp-sr">Antes: </span>
                            {texto(c.antes) || <span className="ip-vacio">Vacío</span>}
                          </span>
                          <span className="ip-flecha" aria-hidden="true">
                            →
                          </span>
                        </>
                      )}
                      <span>
                        <span className="pp-sr">Después: </span>
                        {texto(c.despues) ? (
                          <ValorConNuevos valor={c.despues} nuevos={p.nuevos} />
                        ) : (
                          <>
                            <span className="ip-vacio">Vacío</span>{" "}
                            <span className="pp-meta">
                              la celda dice <code className="ip-codigo">[vaciar]</code>
                            </span>
                          </>
                        )}
                      </span>
                    </dd>
                  </div>
                ))}
                {rechazos.map((r) => (
                  <div key={r.campo} className="ip-cambio">
                    <dt>{r.campo}</dt>
                    <dd>
                      {r.valor && <span>{r.valor}</span>}
                      <span className="pp-estado pp-estado--danger">rechazado</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {rechazos.length > 0 && (
              <p className="ip-nota">
                {f.grupo === "nuevo"
                  ? "Nace en borrador y sin consentimiento: se publica desde su ficha."
                  : "El perfil no cambia de publicación por esta importación: el consentimiento se registra y se publica desde su ficha."}
              </p>
            )}
            {f.errores.map((e, i) => (
              <p key={i} className="ip-motivo">
                {e.mensaje.endsWith(".") ? e.mensaje : `${e.mensaje}.`}
                {e.opciones?.length ? ` Usa ${listaO(e.opciones)}.` : ""}
              </p>
            ))}
            {f.motivoOmision && <p className="ip-motivo">{f.motivoOmision}</p>}
            {avisos.map((a, i) => {
              const valor = /^«(.+)» es un valor nuevo/.exec(a.mensaje)?.[1];
              const sugerencia =
                valor &&
                p.nuevos.find((n) => n.valor.toLowerCase() === valor.toLowerCase())?.sugerencias[0];
              const contradiccion = /^Contradicción alta: (.+)$/.exec(a.mensaje)?.[1];
              if (contradiccion)
                return (
                  <p key={i} className="ip-nota">
                    <span className="pp-estado pp-estado--danger">Contradicción alta</span>{" "}
                    {`${contradiccion} Al aplicar se señalará en su fila del inventario; corrígelo en tu hoja o desmarca la fila.`}
                  </p>
                );
              return (
                <p key={i} className="ip-nota">
                  {valor
                    ? `«${valor}» no existe en el banco.${sugerencia ? ` ¿Quisiste decir «${sugerencia}»?` : ""} Corrígelo en tu hoja o desmarca la fila.`
                    : a.mensaje}
                </p>
              );
            })}
            {f.grupo === "nuevo" && rechazos.length === 0 && (
              <p className="ip-nota">Sin consentimiento registrado: se publica desde su ficha.</p>
            )}
            {f.grupo === "actualizado" && (
              <p className="ip-nota">Los otros campos traen la celda vacía o igual: no cambian.</p>
            )}
            {f.cruda && <p className="ip-cruda">{f.cruda}</p>}
          </div>
        )}
      </details>
    </li>
  );
}

function SeccionGrupo(p: {
  def: (typeof GRUPOS)[number];
  filas: FilaPlan[];
  nuevos: Plan["valoresNuevos"];
  alIncluir: (numero: number, incluir: boolean) => void;
  ocupado: boolean;
}) {
  const [todas, setTodas] = useState(false);
  if (!p.filas.length) return null;
  const visibles = todas ? p.filas : p.filas.slice(0, VISIBLES);
  const resto = p.filas.length - visibles.length;
  return (
    <section className="pp-seccion" id={p.def.id} aria-labelledby={`${p.def.id}-t`}>
      <div className="pp-seccion__cabecera">
        <h2 className="pp-seccion__titulo" id={`${p.def.id}-t`}>
          {p.def.titulo}
          <span className="ip-grupo-n">{p.filas.length}</span>
        </h2>
        <span className="ip-seccion-meta">{p.def.meta}</span>
      </div>
      <ul className="ip-lista">
        {visibles.map((f) => (
          <Tarjeta
            key={f.numero}
            f={f}
            nuevos={p.nuevos}
            alIncluir={p.alIncluir}
            ocupado={p.ocupado}
            primera={f === visibles[0]}
          />
        ))}
      </ul>
      {resto > 0 && (
        <button
          type="button"
          className="pp-btn pp-btn--fantasma pp-btn--sm ip-mas"
          onClick={() => setTodas(true)}
        >
          {`Mostrar ${resto === 1 ? "la restante" : `las ${resto} restantes`}`}
        </button>
      )}
    </section>
  );
}

function PasoVistaPrevia(p: {
  vista: VistaPrevia;
  archivo: string | null;
  alVolver: () => void;
  alRecalcular: (excluidas: number[]) => void;
  alConfirmar: () => void;
  ocupado: boolean;
  error: string | null;
}) {
  const { plan } = p.vista;
  const excluidas = plan.filas.filter((f) => !f.incluida).map((f) => f.numero);
  const alIncluir = (numero: number, incluir: boolean) =>
    p.alRecalcular(incluir ? excluidas.filter((n) => n !== numero) : [...excluidas, numero]);
  const repetidas = plan.filas.filter(
    (f) => f.incluida && f.grupo === "con_error" && f.errores[0]?.mensaje.includes("repetido"),
  );
  const porCodigo = new Map<string, number[]>();
  for (const f of repetidas)
    porCodigo.set(f.codigo!, [...(porCodigo.get(f.codigo!) ?? []), f.numero]);
  const modo = MODOS.find((m) => m.clave === p.vista.modo)!.titulo;
  const r = plan.resumen;
  const aplicar = r.crear + r.actualizar + r.archivar;
  const conRechazos = plan.filas.filter(
    (f) => f.incluida && f.grupo !== "con_error" && rechazosDe(f).length > 0,
  ).length;
  return (
    <>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Vista previa</h1>
          <p className="pp-encabezado__meta">
            {p.archivo && <span className="pp-mono">{p.archivo}</span>}
            {`${p.archivo ? " · " : ""}${plan.filas.length} ${plan.filas.length === 1 ? "fila" : "filas"} · ${modo} · Nada ha cambiado todavía en el banco`}
          </p>
        </div>
        <div className="pp-encabezado__acciones">
          <button type="button" className="pp-btn pp-btn--contorno" onClick={p.alVolver}>
            Cambiar modo o columnas
          </button>
        </div>
      </div>
      {[...porCodigo].map(([codigo, filas]) => (
        <div key={codigo} className="pp-aviso pp-aviso--danger ip-bloque" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">{`${codigo} está en ${filas.length} filas (${filas.join(" y ")}).`}</span>
            Corrige tu hoja y vuelve a pegar, o desmarca las filas para importar el resto sin ellas.
          </p>
          <button
            type="button"
            className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
            disabled={p.ocupado}
            onClick={() => p.alRecalcular([...excluidas, ...filas])}
          >
            {filas.length === 2 ? "Desmarcar las dos" : "Desmarcarlas"}
          </button>
        </div>
      ))}
      {conRechazos > 0 && (
        <div className="pp-aviso pp-aviso--warn ip-bloque" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">
              {conRechazos === 1
                ? "1 fila intenta conceder consentimiento o publicar."
                : `${conRechazos} filas intentan conceder consentimiento o publicar.`}
            </span>{" "}
            Rechazamos esos campos; el resto de cada fila se importa. Ningún perfil queda publicado
            por esta importación.
          </p>
        </div>
      )}
      <div className="ip-bloque">
        <ul className="ip-resumen" aria-label="Filas por grupo">
          {GRUPOS.map((g) => {
            const n = plan.filas.filter((f) => f.grupo === g.grupo).length;
            const cifra = (
              <>
                <span
                  className={`ip-resumen__n${g.grupo === "con_error" && n ? " ip-resumen__n--error" : ""}${n ? "" : " ip-resumen__n--cero"}`}
                >
                  {n}
                </span>
                <span className="ip-resumen__l">{g.resumen}</span>
              </>
            );
            return (
              <li key={g.grupo}>
                {n ? (
                  <a href={`#${g.id}`}>{cifra}</a>
                ) : (
                  <span className="ip-resumen__nolink">{cifra}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {plan.valoresNuevos.length > 0 && (
        <div className="pp-aviso pp-aviso--warn ip-aviso" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">Valores nuevos en la taxonomía</span>
            {plan.valoresNuevos
              .map(
                (v) =>
                  `«${v.valor}» (${v.tipo === "tecnologia" ? "tecnología" : v.tipo}, ${v.veces} ${v.veces === 1 ? "vez" : "veces"}${v.sugerencias[0] ? `; ¿«${v.sugerencias[0]}»?` : ""})`,
              )
              .join(" · ")}
            . No bloquean la importación; revísalos antes de confirmar.
          </p>
        </div>
      )}
      {GRUPOS.map((g) => (
        <SeccionGrupo
          key={g.grupo}
          def={g}
          filas={plan.filas.filter((f) => f.grupo === g.grupo)}
          nuevos={plan.valoresNuevos}
          alIncluir={alIncluir}
          ocupado={p.ocupado}
        />
      ))}
      <div className="ip-pie">
        <div className="ip-pie__texto">
          {plan.bloqueado ? (
            <>
              <p style={{ margin: 0 }}>
                Mientras haya filas con el mismo código marcadas no se aplica nada.
              </p>
              <p className="pp-error">
                <span aria-hidden="true">!</span>
                Desmarca o corrige las filas con el mismo código para continuar.
              </p>
            </>
          ) : (
            <p style={{ margin: 0 }}>
              Se crearán <span className="ip-cifra">{r.crear}</span> en borrador, se actualizarán{" "}
              <span className="ip-cifra">{r.actualizar}</span> y se archivarán{" "}
              <span className="ip-cifra">{r.archivar}</span>. Quedan fuera{" "}
              <span className="ip-cifra">{r.error}</span> con error
              {r.omitir ? (
                <>
                  , <span className="ip-cifra">{r.omitir}</span> omitidos por el modo
                </>
              ) : null}{" "}
              y <span className="ip-cifra">{r.excluidas}</span> que desmarcaste.{" "}
              <span className="ip-cifra">0</span> perfiles quedan publicados por esta importación.
            </p>
          )}
          {p.error && (
            <p className="pp-error" role="alert">
              <span aria-hidden="true">!</span>
              {p.error}
            </p>
          )}
        </div>
        <div className="ip-pie__acciones">
          <button type="button" className="pp-btn pp-btn--fantasma" onClick={p.alVolver}>
            Volver a pegar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            disabled={plan.bloqueado || aplicar === 0 || p.ocupado}
            onClick={p.alConfirmar}
          >
            {aplicar === 1 ? "Importar 1 perfil" : `Importar ${aplicar} perfiles`}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── el asistente ────────────────────────────────────────────────────────────────────────────

interface EstadoPaso1 {
  texto: string;
  archivo: string | null;
  formatoElegido: "csv" | "tsv" | "json" | null;
  plantillaId: string | null;
  emparejado: Emparejado | null;
  lectura: string | null;
  modo: Modo;
  guardar: boolean;
  nombrePlantilla: string;
}

export function Asistente(p: {
  totalBanco: number;
  limiteFilas: number;
  plantillas: Plantilla[];
  campos: ClaveCampo[];
}) {
  const [s, setS] = useState<EstadoPaso1>({
    texto: "",
    archivo: null,
    formatoElegido: null,
    plantillaId: null,
    emparejado: null,
    lectura: null,
    modo: "crear_y_actualizar",
    guardar: false,
    nombrePlantilla: "",
  });
  const [plantillas, setPlantillas] = useState(p.plantillas);
  const [guardadaAhora, setGuardadaAhora] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaPrevia | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cambiar = useRef((c: Partial<EstadoPaso1>) => setS((x) => ({ ...x, ...c }))).current;

  async function verVistaPrevia() {
    if (!s.emparejado) return;
    setEnviando(true);
    setError(null);
    const columnas = s.emparejado.emparejamiento.map((c) => ({
      columna: c.columna,
      clave: c.destino.tipo === "campo" ? c.destino.clave : null,
    }));
    if (s.guardar && s.nombrePlantilla.trim()) {
      const g = await enviarJson("/api/v1/importacion/plantillas", {
        nombre: s.nombrePlantilla.trim(),
        columnas,
      }).catch(() => null);
      if (g?.status === 409) {
        setEnviando(false);
        return setError(
          `Ya hay un emparejamiento guardado con el nombre «${s.nombrePlantilla.trim()}». Usa otro nombre.`,
        );
      }
      if (g?.status !== 201) {
        setEnviando(false);
        return setError("No pudimos guardar el emparejamiento. Inténtalo de nuevo.");
      }
      const { plantilla } = (await g.json()) as { plantilla: Plantilla };
      setPlantillas((xs) =>
        [...xs, plantilla].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
      );
      setGuardadaAhora(plantilla.id);
      cambiar({ guardar: false, nombrePlantilla: "", plantillaId: plantilla.id });
    }
    const r = await enviarJson("/api/v1/importacion/lotes", {
      texto: s.texto,
      formato: s.emparejado.formato,
      modo: s.modo,
      columnas,
      ...(s.archivo ? { archivo: s.archivo } : {}),
    }).catch(() => null);
    setEnviando(false);
    if (r?.status !== 201)
      return setError("No pudimos calcular la vista previa. Inténtalo de nuevo.");
    setVista((await r.json()) as VistaPrevia);
    window.scrollTo({ top: 0 });
  }

  async function recalcular(excluidas: number[]) {
    if (!vista) return;
    setEnviando(true);
    setError(null);
    const r = await enviarJson(
      `/api/v1/importacion/lotes/${vista.loteId}`,
      { excluidas: [...new Set(excluidas)] },
      "PATCH",
    ).catch(() => null);
    setEnviando(false);
    if (r?.status !== 200)
      return setError("No pudimos actualizar la vista previa. Inténtalo de nuevo.");
    setVista((await r.json()) as VistaPrevia);
  }

  // Confirmar (HU-141): el worker aplica; el resultado se sigue en el paso 3.
  async function confirmar() {
    if (!vista) return;
    setEnviando(true);
    setError(null);
    const r = await enviarJson(`/api/v1/importacion/lotes/${vista.loteId}/aplicar`, {}).catch(
      () => null,
    );
    if (r?.status === 202) {
      window.location.assign(`/importar?lote=${vista.loteId}`);
      return;
    }
    setEnviando(false);
    const d = await r?.json().catch(() => ({}));
    setError(
      d?.motivo === "codigo_repetido"
        ? "Desmarca o corrige las filas con el mismo código para continuar."
        : d?.motivo === "nada_que_aplicar"
          ? "No hay nada que aplicar: todas las filas están sin cambios, omitidas, con error o desmarcadas."
          : "No pudimos confirmar la importación. Inténtalo de nuevo.",
    );
  }

  return (
    <div className="ip-ancho">
      <ol className="ip-pasos" aria-label="Pasos de la importación">
        <li
          className={`ip-paso${vista ? " ip-paso--hecho" : ""}`}
          aria-current={vista ? undefined : "step"}
        >
          <span className="ip-paso__n" aria-hidden="true">
            {vista ? "✓" : "1"}
          </span>
          <span className="ip-paso__t">
            {vista ? (
              <a
                href="#contenido"
                onClick={(e) => {
                  e.preventDefault();
                  setVista(null);
                }}
              >
                Pegar y emparejar
              </a>
            ) : (
              "Pegar y emparejar"
            )}
          </span>
          {vista && <span className="pp-sr"> (hecho)</span>}
        </li>
        <li className="ip-paso" aria-current={vista ? "step" : undefined}>
          <span className="ip-paso__n" aria-hidden="true">
            2
          </span>
          <span className="ip-paso__t">Revisar y confirmar</span>
        </li>
        <li className="ip-paso">
          <span className="ip-paso__n" aria-hidden="true">
            3
          </span>
          <span className="ip-paso__t">Resultado</span>
        </li>
      </ol>
      {vista ? (
        <PasoVistaPrevia
          vista={vista}
          archivo={s.archivo}
          alVolver={() => setVista(null)}
          alRecalcular={recalcular}
          alConfirmar={confirmar}
          ocupado={enviando}
          error={error}
        />
      ) : (
        <>
          <div className="pp-encabezado">
            <div className="pp-encabezado__texto">
              <h1 className="pp-encabezado__titulo">Importar perfiles</h1>
              <p className="pp-encabezado__meta">
                Los perfiles nuevos entran en borrador. La importación nunca publica ni concede
                consentimiento.
              </p>
            </div>
          </div>
          <Formato totalBanco={p.totalBanco} />
          <PasoPegar
            campos={p.campos}
            plantillas={plantillas}
            limiteFilas={p.limiteFilas}
            estado={s}
            cambiar={cambiar}
            alVer={verVistaPrevia}
            enviando={enviando}
            error={error}
            guardadaAhora={guardadaAhora}
          />
        </>
      )}
    </div>
  );
}
