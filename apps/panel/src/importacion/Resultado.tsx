"use client";
// Paso 3 de la importación y lo que viene después (prototipos importar-perfiles--filas-con-error,
// --revertir y --revertir-no-ultima; HU-141, HU-142, HU-087; spec §6 paso 5 y §7):
//  - Resultado: mientras el worker aplica, «Aplicando»; después, qué se hizo, las filas que no se
//    aplicaron con su motivo (descargar o ver para copiar), el reporte, lo siguiente y deshacer.
//  - Historial: cada importación confirmada con quién, cuándo, modo y resultado; solo la última
//    aplicada se deshace (si se intenta otra, se dice cuáles hay después).
//  - Deshacer: qué va a pasar y, por cada perfil cambiado a mano después, cómo queda hoy frente a si
//    se incluye; la persona elige.
import { useEffect, useState } from "react";
import { horaDeColombia } from "@ps/dominio/fecha/colombia";
import type { FaseLote, LoteHistorial, LoteLeido } from "@ps/infra/postgres/importacion";
import type { DetalleReversion, LotePosterior } from "@ps/infra/postgres/revertir-importacion";
import { enviarJson, pedir } from "../acceso/cliente";

export interface ResumenErrores {
  filas: number;
  todas: boolean;
  causaComun: string | null;
}

const NOMBRE_MODO = {
  crear_y_actualizar: "Crear y actualizar",
  solo_actualizar: "Solo actualizar",
  solo_crear: "Solo crear",
} as const;

// Por qué no se aplicó o no se revirtió, en palabras de quien importa.
const MOTIVO: Record<string, string> = {
  banco_cambiado:
    "El banco cambió desde la vista previa: alguien editó un perfil o se aplicó otra importación. No se aplicó nada; vuelve a pegar la hoja para ver la vista previa de ahora.",
  tope_de_tiempo:
    "Tardó más de 5 minutos y se detuvo sin aplicar nada. Divide la hoja en partes más pequeñas.",
  interrumpido:
    "El proceso se interrumpió antes de terminar. No se aplicó nada; vuelve a intentarlo.",
  codigo_repetido: "Hay filas con el mismo código marcadas. No se aplicó nada.",
  valor_no_disponible:
    "Un valor del catálogo se desactivó o se fusionó desde la vista previa. No se aplicó nada; vuelve a pegar la hoja.",
  rol_nuevo_sin_familia: "Un rol nuevo no trae su familia. No se aplicó nada.",
  no_es_la_ultima: "Después se aplicó otra importación: solo se deshace la última.",
  no_se_pudo_restaurar:
    "Un perfil no puede volver a como estaba (por ejemplo, a publicado sin consentimiento vigente). No se deshizo nada.",
};
const motivo = (m: string | null) =>
  (m && MOTIVO[m]) ?? "Algo falló y no se aplicó nada. Vuelve a intentarlo.";

const cuando = (iso: string | null) => (iso ? horaDeColombia(new Date(iso)) : "—");
const nombreLote = (archivo: string | null) => archivo ?? "Hoja pegada";
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

// Sigue la fase del lote mientras el worker trabaja (aplicar o revertir).
function useLoteVivo(inicial: { lote: LoteLeido; errores: ResumenErrores }) {
  const [estado, setEstado] = useState(inicial);
  const enCurso = estado.lote.fase === "aplicando" || estado.lote.revirtiendo;
  useEffect(() => {
    if (!enCurso) return;
    const t = setInterval(async () => {
      const r = await pedir(`/api/v1/importacion/lotes/${estado.lote.id}`, {
        credentials: "same-origin",
      }).catch(() => null);
      if (r?.ok) setEstado(await r.json());
    }, 1_500);
    return () => clearInterval(t);
  }, [enCurso, estado.lote.id]);
  return estado;
}

function Meta(p: { archivo: string | null; partes: Array<string | null> }) {
  return (
    <p className="pp-encabezado__meta">
      <span className="pp-mono">{nombreLote(p.archivo)}</span>
      {p.partes.filter(Boolean).map((x) => ` · ${x}`)}
    </p>
  );
}

function Pasos() {
  return (
    <ol className="ip-pasos" aria-label="Pasos de la importación">
      <li className="ip-paso ip-paso--hecho">
        <span className="ip-paso__n" aria-hidden="true">
          ✓
        </span>
        <span className="ip-paso__t">Pegar y emparejar</span>
        <span className="pp-sr"> (hecho)</span>
      </li>
      <li className="ip-paso ip-paso--hecho">
        <span className="ip-paso__n" aria-hidden="true">
          ✓
        </span>
        <span className="ip-paso__t">Revisar y confirmar</span>
        <span className="pp-sr"> (hecho)</span>
      </li>
      <li className="ip-paso" aria-current="step">
        <span className="ip-paso__n" aria-hidden="true">
          3
        </span>
        <span className="ip-paso__t">Resultado</span>
      </li>
    </ol>
  );
}

// ─── resultado ───────────────────────────────────────────────────────────────────────────────

export function ResultadoImportacion(p: {
  inicial: { lote: LoteLeido; errores: ResumenErrores };
  esUltima: boolean;
  puedeDeshacer: boolean;
  // La observadora consulta el resultado (HU-124) pero no descarga las filas ni las vuelve a pegar.
  puedeImportar: boolean;
}) {
  const { lote, errores } = useLoteVivo(p.inicial);
  // Si se abrió mientras se aplicaba, al terminar es la última aplicada.
  const esUltima = p.puedeDeshacer && (p.esUltima || p.inicial.lote.fase === "aplicando");
  const [copiar, setCopiar] = useState<string | null>(null);
  const [aviso, setAviso] = useState(true);
  const incluidas = lote.filas.filter((f) => f.incluida);
  const n = (g: string) => incluidas.filter((f) => f.grupo === g).length;
  const conError = lote.filas.filter((f) => f.grupo === "con_error");
  const excluidas = lote.filas.filter((f) => !f.incluida && f.grupo !== "con_error").length;
  const creados = incluidas.filter((f) => f.grupo === "nuevo");
  const aplicadas = lote.filas.length - conError.length - excluidas - n("omitido");
  const meta = [
    cuando(lote.aplicadoEn ?? lote.confirmadoEn),
    lote.confirmadoPor,
    NOMBRE_MODO[lote.modo],
  ];
  const archivoErrores = `/api/v1/importacion/lotes/${lote.id}/errores`;

  async function verParaCopiar() {
    const r = await pedir(archivoErrores, { credentials: "same-origin" }).catch(() => null);
    setCopiar(r?.ok ? (await r.text()).replace(/^﻿/, "") : "");
  }

  if (lote.fase === "aplicando")
    return (
      <div className="ip-ancho">
        <Pasos />
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">Aplicando la importación…</h1>
            <Meta
              archivo={lote.archivo}
              partes={[plural(lote.filas.length, "fila", "filas"), NOMBRE_MODO[lote.modo]]}
            />
          </div>
        </div>
        <div className="pp-aviso pp-aviso--info" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            i
          </span>
          <p>
            <span className="pp-aviso__titulo">Se aplica todo junto o nada.</span>
            Puedes seguir trabajando: esta página se actualiza sola cuando termine.
          </p>
        </div>
      </div>
    );

  if (lote.fase === "abortado" || lote.fase === "calculado")
    return (
      <div className="ip-ancho">
        <Pasos />
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">No se aplicó la importación</h1>
            <Meta archivo={lote.archivo} partes={meta} />
          </div>
          <div className="pp-encabezado__acciones">
            <a className="pp-btn pp-btn--fantasma" href="/importar?vista=historial">
              Historial
            </a>
          </div>
        </div>
        <div className="pp-aviso pp-aviso--danger" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">Ningún perfil cambió.</span>
            {lote.fase === "calculado"
              ? "Esta importación no se confirmó."
              : motivo(lote.motivoAborto)}
          </p>
          {p.puedeImportar && (
            <a className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion" href="/importar">
              Volver a pegar
            </a>
          )}
        </div>
      </div>
    );

  const revertida = lote.fase === "revertido";
  return (
    <div className="ip-ancho">
      <Pasos />
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">
            {revertida ? "Importación revertida" : "Importación aplicada"}
          </h1>
          <Meta archivo={lote.archivo} partes={meta} />
        </div>
        <div className="pp-encabezado__acciones">
          <a
            className="pp-btn pp-btn--fantasma"
            href={`/api/v1/importacion/lotes/${lote.id}/reporte`}
            download
          >
            Descargar reporte
          </a>
          <a className="pp-btn pp-btn--fantasma" href="/importar?vista=historial">
            Historial
          </a>
        </div>
      </div>
      {revertida && (
        <div className="pp-aviso pp-aviso--info ip-aviso" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            i
          </span>
          <p>
            <span className="pp-aviso__titulo">{`Revertida el ${cuando(lote.revertidoEn)}`}</span>
            Los perfiles actualizados volvieron a como estaban y los creados quedaron archivados.
          </p>
        </div>
      )}
      <div className="ip-bloque">
        <ul className="ip-resumen" aria-label="Resultado por grupo">
          {[
            [n("nuevo"), "creados en borrador"],
            [n("actualizado"), "actualizados"],
            [n("archivado"), "archivados"],
            [n("sin_cambios"), "sin cambios"],
            [n("omitido"), "omitidos"],
            [excluidas, excluidas === 1 ? "excluida por ti" : "excluidas por ti"],
            [conError.length, "con error"],
          ]
            .filter(
              ([x, l]) =>
                x || !["omitidos", "excluida por ti", "excluidas por ti"].includes(l as string),
            )
            .map(([x, l]) => (
              <li key={l as string}>
                <span className="ip-resumen__nolink">
                  <span
                    className={`ip-resumen__n${l === "con error" && x ? " ip-resumen__n--error" : ""}${x ? "" : " ip-resumen__n--cero"}`}
                  >
                    {x}
                  </span>
                  <span className="ip-resumen__l">{l}</span>
                </span>
              </li>
            ))}
        </ul>
      </div>

      {conError.length > 0 && (
        <section className="pp-seccion" aria-labelledby="ip-no-aplicadas">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="ip-no-aplicadas">
              {conError.length === 1
                ? "1 fila no se aplicó"
                : `${conError.length} filas no se aplicaron`}
            </h2>
            <span className="ip-seccion-meta">
              {errores.todas
                ? "Ninguna fila se pudo procesar"
                : `Las otras ${aplicadas} ya están en el banco`}
            </span>
          </div>
          {errores.todas && errores.causaComun && (
            <div className="pp-aviso pp-aviso--danger ip-aviso" role="alert">
              <span className="pp-aviso__icono" aria-hidden="true">
                !
              </span>
              <p>
                <span className="pp-aviso__titulo">
                  El problema es del archivo entero, no de cada fila.
                </span>
                {errores.causaComun}
              </p>
            </div>
          )}
          <div className="pp-tabla-marco ip-tabla-hist">
            <table className="pp-tabla">
              <thead>
                <tr>
                  <th scope="col">Fila</th>
                  <th scope="col">Código</th>
                  <th scope="col">Profesional</th>
                  <th scope="col">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {conError.map((f) => (
                  <tr key={f.numero}>
                    <td className="pp-tabla__num">{f.numero}</td>
                    <td className="pp-mono">{f.codigo ?? "—"}</td>
                    <td>
                      <span className="pp-tabla__perfil">{f.persona.nombre ?? "Sin nombre"}</span>
                      {f.persona.rol && <span className="pp-tabla__sub">{f.persona.rol}</span>}
                    </td>
                    <td className="ip-resultado">
                      {f.errores.map((e) => e.mensaje).join(". ")}
                      {f.errores.length ? "." : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {p.puedeImportar && (
            <div className="ip-pie">
              <div className="ip-pie__texto">
                <p style={{ margin: 0 }}>Incluye una columna «motivo».</p>
              </div>
              <div className="ip-pie__acciones">
                <button type="button" className="pp-btn pp-btn--contorno" onClick={verParaCopiar}>
                  Ver para copiar
                </button>
                <a className="pp-btn pp-btn--primario" href={archivoErrores} download>
                  {conError.length === 1
                    ? "Descargar la fila"
                    : `Descargar las ${conError.length} filas`}
                </a>
              </div>
            </div>
          )}
          {copiar !== null && (
            <div className="ip-copiar">
              <label className="pp-label" htmlFor="copiar-errores">
                Filas con error, para copiar
              </label>
              <textarea
                className="pp-input"
                id="copiar-errores"
                readOnly
                wrap="off"
                value={copiar}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          )}
        </section>
      )}

      {!revertida && ((p.puedeImportar && conError.length > 0) || creados.length > 0) && (
        <section className="pp-seccion" aria-labelledby="ip-siguiente">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="ip-siguiente">
              Siguiente
            </h2>
          </div>
          <div className="pp-tarjeta ip-tarjeta-lista">
            {p.puedeImportar && conError.length > 0 && (
              <div className="ip-sig">
                <div>
                  <p className="ip-sig__titulo">Pegar las filas corregidas</p>
                  <p className="ip-sig__texto">
                    Actualizan el perfil de su código. Lo que ya entró no se duplica: cae en «sin
                    cambios».
                  </p>
                </div>
                <a className="pp-btn pp-btn--contorno pp-btn--sm" href="/importar">
                  Pegar filas
                </a>
              </div>
            )}
            {creados.length > 0 && (
              <div className="ip-sig">
                <div>
                  <p className="ip-sig__titulo">
                    {creados.length === 1
                      ? "1 borrador espera revisión"
                      : `${creados.length} borradores esperan revisión`}
                  </p>
                  <p className="ip-sig__texto">
                    {`${creados
                      .slice(0, 2)
                      .map((f) => f.persona.nombre ?? f.codigo)
                      .join(
                        ", ",
                      )}${creados.length > 2 ? ` y ${creados.length - 2} más` : ""}. Regístrales el consentimiento para poder publicarlos.`}
                  </p>
                </div>
                <a
                  className="pp-btn pp-btn--contorno pp-btn--sm"
                  href="/inventario?estado=borrador"
                >
                  Ver borradores
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {lote.motivoReversion && !revertida && (
        <div className="pp-aviso pp-aviso--danger ip-aviso" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>
            <span className="pp-aviso__titulo">No se deshizo.</span>
            {motivo(lote.motivoReversion)}
          </p>
        </div>
      )}

      {!revertida && aviso && (
        <div className="pp-toast" role="status">
          <span className="pp-toast__marca" aria-hidden="true">
            ✓
          </span>
          <p className="pp-toast__texto">
            {lote.revirtiendo
              ? "Deshaciendo la importación…"
              : `Importación aplicada: ${aplicadas} de ${lote.filas.length} filas.`}
          </p>
          {esUltima && !lote.revirtiendo && (
            <a className="pp-toast__accion ip-toast-accion" href={`/importar?deshacer=${lote.id}`}>
              Deshacer
            </a>
          )}
          <button
            type="button"
            className="pp-toast__accion"
            aria-label="Cerrar aviso"
            onClick={() => setAviso(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ─── historial ───────────────────────────────────────────────────────────────────────────────

const FASE: Record<FaseLote, string> = {
  calculado: "Sin confirmar",
  aplicando: "Aplicando…",
  aplicado: "Aplicada",
  abortado: "No se aplicó",
  revertido: "Revertida",
};

function resultadoDe(l: LoteHistorial): string {
  if (l.fase === "abortado")
    return `No se aplicó · ${motivo(l.motivoAborto).split(":")[0]!.split(".")[0]}`;
  if (l.fase === "aplicando") return "Aplicando…";
  const c = l.conteos;
  const partes = [
    c.nuevos
      ? `${c.nuevos} ${c.nuevos === 1 ? "creado" : "creados"}${c.actualizados || c.archivados ? "" : " en borrador"}`
      : null,
    c.actualizados
      ? `${c.actualizados} ${c.actualizados === 1 ? "actualizado" : "actualizados"}`
      : null,
    c.archivados ? `${c.archivados} ${c.archivados === 1 ? "archivado" : "archivados"}` : null,
    c.omitidos ? `${c.omitidos} ${c.omitidos === 1 ? "omitido" : "omitidos"}` : null,
    c.con_error ? `${c.con_error} con error` : null,
    l.excluidas
      ? `${l.excluidas} ${l.excluidas === 1 ? "excluida por ti" : "excluidas por ti"}`
      : null,
  ].filter(Boolean);
  const texto = partes.join(" · ") || "Sin cambios";
  return l.fase === "revertido" ? `Revertida · ${texto}` : texto;
}

export function HistorialImportaciones(p: {
  lotes: LoteHistorial[];
  puedeImportar: boolean;
  // Se pidió deshacer `id` sin ser la última: su fila queda resaltada en la tabla.
  noUltima?: { id: string; archivo: string | null; posteriores: LotePosterior[]; ultima: string };
}) {
  const ultima = p.lotes.find((l) => l.fase === "aplicado")?.id;
  return (
    <div className="ip-ancho">
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Historial de importaciones</h1>
          <p className="pp-encabezado__meta">
            {`${plural(p.lotes.length, "importación", "importaciones")} · la más reciente primero`}
          </p>
        </div>
        {p.puedeImportar && (
          <div className="pp-encabezado__acciones">
            <a className="pp-btn pp-btn--primario" href="/importar">
              Nueva importación
            </a>
          </div>
        )}
      </div>
      {p.noUltima && (
        <div className="pp-aviso pp-aviso--warn ip-aviso-sep" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <div className="ip-aviso-cuerpo">
            <p style={{ margin: 0 }}>
              <span className="pp-aviso__titulo">
                No se puede deshacer{" "}
                <span className="pp-mono">{nombreLote(p.noUltima.archivo)}</span>.
              </span>{" "}
              {`Solo se deshace la última importación, y después de esta hubo ${p.noUltima.posteriores.length === 1 ? "una" : p.noUltima.posteriores.length === 2 ? "dos" : p.noUltima.posteriores.length}:`}
            </p>
            <ul className="ip-aviso-lista">
              {p.noUltima.posteriores.map((x) => {
                const l = p.lotes.find((y) => y.id === x.id);
                return (
                  <li key={x.id}>
                    <span className="pp-mono">{nombreLote(l?.archivo ?? null)}</span>
                    <span>{`${cuando(x.aplicadoEn)} · ${plural(x.perfiles, "perfil", "perfiles")}`}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <a
            className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
            href={`/importar?deshacer=${p.noUltima.ultima}`}
          >
            Ir a la última
          </a>
        </div>
      )}
      {p.lotes.length === 0 ? (
        <p className="ip-grupo-vacio">Todavía no hay importaciones confirmadas.</p>
      ) : (
        <div className="pp-tabla-marco ip-tabla-hist">
          <table className="pp-tabla">
            <thead>
              <tr>
                <th scope="col">Importación</th>
                <th scope="col">Por</th>
                <th scope="col">Modo</th>
                <th scope="col">Resultado</th>
                <th scope="col" className="pp-tabla__acciones">
                  <span className="pp-sr">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {p.lotes.map((l) => (
                <tr
                  key={l.id}
                  className={l.id === p.noUltima?.id ? "ip-fila-pedida" : undefined}
                  aria-current={l.id === p.noUltima?.id ? "true" : undefined}
                >
                  <td>
                    <span className="pp-tabla__perfil pp-mono">{nombreLote(l.archivo)}</span>
                    <span className="pp-tabla__sub">{cuando(l.aplicadoEn ?? l.confirmadoEn)}</span>
                  </td>
                  <td>{l.confirmadoPor ?? "—"}</td>
                  <td>{NOMBRE_MODO[l.modo]}</td>
                  <td className="ip-resultado">
                    <span className="pp-sr">{`${FASE[l.fase]}: `}</span>
                    {resultadoDe(l)}
                  </td>
                  <td className="pp-tabla__acciones">
                    <a
                      className="pp-btn pp-btn--fantasma pp-btn--sm"
                      href={`/importar?lote=${l.id}`}
                    >
                      Ver perfiles
                    </a>
                    {p.puedeImportar && l.id === ultima && (
                      <a
                        className="pp-btn pp-btn--contorno pp-btn--sm"
                        href={`/importar?deshacer=${l.id}`}
                      >
                        Deshacer
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── deshacer la última importación ──────────────────────────────────────────────────────────

export function DeshacerImportacion(p: { loteId: string; detalle: DetalleReversion }) {
  const d = p.detalle;
  const [incluir, setIncluir] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deshacer() {
    setEnviando(true);
    setError(null);
    const r = await enviarJson(`/api/v1/importacion/lotes/${p.loteId}/revertir`, {
      incluir: [...incluir],
    }).catch(() => null);
    if (r?.status === 202) {
      window.location.assign(`/importar?lote=${p.loteId}`);
      return;
    }
    setEnviando(false);
    const cuerpo = await r?.json().catch(() => ({}));
    setError(
      cuerpo?.motivo === "no_es_la_ultima"
        ? MOTIVO.no_es_la_ultima!
        : "No pudimos deshacer la importación. Inténtalo de nuevo.",
    );
  }

  const efectos: Array<[number, string, string]> = [
    [
      d.vuelven.actualizados,
      "Actualizados",
      "vuelven al estado que tenían antes, campo por campo.",
    ],
    [
      d.vuelven.creados,
      "Creados",
      "quedan archivados, no borrados. Estaban en borrador y ningún cliente los vio.",
    ],
    [d.vuelven.archivados, "Archivados", "vuelven al estado anterior."],
    [d.cambiadosDespues.length, "Cambiados a mano después", "decides abajo."],
  ];
  return (
    <div className="ip-ancho">
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Deshacer la última importación</h1>
          <Meta
            archivo={d.archivo}
            partes={[
              cuando(d.aplicadoEn),
              d.confirmadoPor,
              `${plural(d.perfiles, "perfil tocado", "perfiles tocados")}`,
            ]}
          />
        </div>
      </div>
      <section className="pp-seccion" aria-labelledby="ip-que-pasa">
        <div className="pp-seccion__cabecera">
          <h2 className="pp-seccion__titulo" id="ip-que-pasa">
            Qué va a pasar
          </h2>
          <span className="ip-seccion-meta">Nada se borra</span>
        </div>
        <div className="pp-tarjeta ip-tarjeta-lista">
          {efectos
            .filter(([x], i) => x || i === 0)
            .map(([x, titulo, texto]) => (
              <div key={titulo} className="ip-efecto">
                <span className="ip-efecto__n">{x}</span>
                <p>
                  <strong>{titulo}</strong>
                  {titulo === "Cambiados a mano después" ? ": " : " "}
                  {texto}
                </p>
              </div>
            ))}
        </div>
      </section>
      {d.cambiadosDespues.length > 0 && (
        <section className="pp-seccion" aria-labelledby="ip-manual">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="ip-manual">
              Cambiados a mano después
              <span className="ip-grupo-n">{d.cambiadosDespues.length}</span>
            </h2>
            <span className="ip-seccion-meta">Si los incluyes, se pierde la edición manual</span>
          </div>
          <div className="pp-tarjeta ip-tarjeta-lista">
            {d.cambiadosDespues.map((c) => (
              <div key={c.codigo} className="ip-manual">
                <p className="ip-manual__cab">
                  <span className="pp-mono">{c.codigo}</span>
                  <strong>{c.nombre ?? "Sin nombre"}</strong>
                  <span className="pp-meta">
                    {[
                      c.autor,
                      c.cuando ? cuando(c.cuando) : null,
                      c.campos.length ? `cambió ${c.campos.join(", ")}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </p>
                <dl className="ip-cambios">
                  <div className="ip-cambio">
                    <dt>Hoy</dt>
                    <dd>{c.hoy.join(" · ") || "—"}</dd>
                  </div>
                  <div className="ip-cambio">
                    <dt>Si lo incluyes</dt>
                    <dd>{c.siIncluyes.join(" · ") || "—"}</dd>
                  </div>
                </dl>
                <fieldset className="ip-eleccion">
                  <legend className="pp-sr">{`Qué hacer con ${c.codigo}`}</legend>
                  <label className="pp-check">
                    <input
                      type="radio"
                      name={`r-${c.codigo}`}
                      checked={!incluir.has(c.codigo)}
                      onChange={() =>
                        setIncluir((xs) => {
                          const y = new Set(xs);
                          y.delete(c.codigo);
                          return y;
                        })
                      }
                    />
                    <span className="pp-check__texto">Dejarlo como está</span>
                  </label>
                  <label className="pp-check">
                    <input
                      type="radio"
                      name={`r-${c.codigo}`}
                      checked={incluir.has(c.codigo)}
                      onChange={() => setIncluir((xs) => new Set(xs).add(c.codigo))}
                    />
                    <span className="pp-check__texto">Incluirlo en la reversión</span>
                  </label>
                </fieldset>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="ip-pie">
        <div className="ip-pie__texto">
          <p style={{ margin: 0 }}>
            La reversión queda en el historial como un evento a tu nombre; la importación aparece
            como «revertida».
          </p>
          {error && (
            <p className="pp-error" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          )}
        </div>
        <div className="ip-pie__acciones">
          <a className="pp-btn pp-btn--fantasma" href="/importar?vista=historial">
            Cancelar
          </a>
          <button
            type="button"
            className="pp-btn pp-btn--destructivo"
            disabled={enviando}
            onClick={deshacer}
          >
            {enviando ? "Deshaciendo…" : "Deshacer la importación"}
          </button>
        </div>
      </div>
    </div>
  );
}
