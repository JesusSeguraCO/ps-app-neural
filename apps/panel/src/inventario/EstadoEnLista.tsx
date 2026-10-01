"use client";
// Disponibilidad y pausa desde el listado (HU-132, HU-133; prototipos inventario-perfiles--lote y
// --pausar-motivo). En la fila: elegir la disponibilidad la guarda sin abrir la ficha (dos clics) y
// dice qué banda verá el cliente. «Pausar» abre la hoja con los motivos del catálogo y el desvío
// «¿Está ocupada hasta una fecha?», que lleva a poner la fecha en la misma fila: eso no es una pausa.
// «Archivar» (HU-135; prototipo inventario-perfiles--archivar) va en el mismo menú, con confirmación
// anclada a la fila: se archiva, no se borra. A un pausado se le puede poner fecha en su fila: queda la
// contradicción señalada con su salida (HU-134, D6).
import { useEffect, useRef, useState } from "react";
import { bandaDeDisponibilidad, ROTULO_BANDA } from "@ps/dominio/catalogo/banda";
import {
  ETIQUETA_BANDA_PANEL,
  OPCIONES_DISPONIBILIDAD,
  fechaDeOpcionDisponibilidad,
  type OpcionDisponibilidad,
} from "@ps/dominio/inventario/perfil";
import type { MotivoPausa } from "@ps/infra/postgres/estado-perfil";
import { enviarJson } from "../acceso/cliente";
import { Hoja, recargarConAviso } from "../marco/Hoja";

export const EVENTO_FECHA = "ip-disp-fecha";
const OPCIONES = Object.entries(OPCIONES_DISPONIBILIDAD) as Array<
  [OpcionDisponibilidad, { etiqueta: string; dias: number }]
>;

export type EleccionDisponibilidad = OpcionDisponibilidad | "fecha" | "";

// Lo que verá el cliente con esa elección (la fecha se queda en el panel).
export function bandaCliente(eleccion: EleccionDisponibilidad, fecha: string): string | null {
  const ahora = new Date();
  const f =
    eleccion === "fecha" ? fecha : eleccion ? fechaDeOpcionDisponibilidad(eleccion, ahora) : "";
  if (!f) return null;
  return ROTULO_BANDA[bandaDeDisponibilidad({ fecha: f, actualizadaEn: ahora }, ahora)];
}

export const cuerpoDisponibilidad = (eleccion: EleccionDisponibilidad, fecha: string) =>
  eleccion === "fecha" ? { fecha } : { opcion: eleccion as OpcionDisponibilidad };

export function DisponibilidadFila(p: {
  codigo: string;
  nombre: string;
  fecha: string | null;
  actualizadaEn: string | null;
  hoy: string;
  // La disponibilidad contradice el estado (HU-134): el selector se marca y lo dice.
  contradice?: string;
  // Tras guardar se recarga la página para mostrar o quitar la señal de la fila (pausado).
  recargar?: boolean;
}) {
  const [fecha, setFecha] = useState(p.fecha);
  const [actualizadaEn, setActualizadaEn] = useState(p.actualizadaEn);
  const [modoFecha, setModoFecha] = useState(false);
  const [dia, setDia] = useState(p.fecha ?? "");
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);
  const refFecha = useRef<HTMLInputElement>(null);
  const actual = fecha
    ? ETIQUETA_BANDA_PANEL[
        bandaDeDisponibilidad(
          { fecha, actualizadaEn: actualizadaEn ? new Date(actualizadaEn) : null },
          new Date(),
        )
      ]
    : "Sin disponibilidad";

  // El desvío de la hoja de pausa abre aquí la fecha (HU-133 «el motivo es una fecha»).
  useEffect(() => {
    const abrir = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== p.codigo) return;
      setModoFecha(true);
      setTimeout(() => {
        refFecha.current?.scrollIntoView({ block: "center" });
        refFecha.current?.focus();
      }, 0);
    };
    document.addEventListener(EVENTO_FECHA, abrir);
    return () => document.removeEventListener(EVENTO_FECHA, abrir);
  }, [p.codigo]);

  async function guardar(eleccion: EleccionDisponibilidad, f: string) {
    setGuardando(true);
    setEstado(null);
    try {
      const r = await enviarJson("/api/v1/perfiles/disponibilidad", {
        codigos: [p.codigo],
        disponibilidad: cuerpoDisponibilidad(eleccion, f),
      });
      const d = await r.json().catch(() => ({}));
      const res = d.resultados?.[0];
      if (!r.ok || !res?.ok) {
        setEstado(
          res?.motivo === "no_aplica"
            ? "Este perfil ya no admite disponibilidad. Recarga para ver su estado."
            : "No se guardó. Inténtalo de nuevo.",
        );
        return;
      }
      if (p.recargar)
        return recargarConAviso(
          `Guardada. ${p.nombre} sigue pausado: resuelve la contradicción en su fila.`,
        );
      setFecha(res.fecha);
      setActualizadaEn(new Date().toISOString());
      setModoFecha(false);
      setEstado(`Guardada. El cliente ve «${bandaCliente(eleccion, f)}».`);
    } finally {
      setGuardando(false);
    }
  }

  const id = `ip-disp-${p.codigo}`;
  return (
    <div className="ip-disp">
      <div className="pp-select ip-select">
        <select
          className="pp-input"
          id={id}
          aria-label={`Disponibilidad de ${p.nombre}`}
          aria-invalid={p.contradice ? true : undefined}
          value=""
          disabled={guardando}
          onChange={(e) => {
            const v = e.target.value as EleccionDisponibilidad;
            if (v === "fecha") {
              setModoFecha(true);
              setTimeout(() => refFecha.current?.focus(), 0);
            } else if (v) void guardar(v, "");
          }}
        >
          <option value="" disabled>
            {actual}
          </option>
          {OPCIONES.map(([k, o]) => (
            <option key={k} value={k}>
              {o.etiqueta}
            </option>
          ))}
          <option value="fecha">Elegir la fecha en que queda libre…</option>
        </select>
      </div>
      {modoFecha && (
        <form
          className="ip-disp__fecha"
          onSubmit={(e) => {
            e.preventDefault();
            if (dia) void guardar("fecha", dia);
          }}
        >
          <label
            className="pp-sr"
            htmlFor={`${id}-fecha`}
          >{`Fecha en que queda libre ${p.nombre}`}</label>
          <input
            ref={refFecha}
            className="pp-input"
            id={`${id}-fecha`}
            type="date"
            min={p.hoy}
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          />
          <button
            type="submit"
            className="pp-btn pp-btn--primario pp-btn--sm"
            disabled={!dia || guardando}
          >
            Guardar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--fantasma pp-btn--sm"
            onClick={() => setModoFecha(false)}
          >
            Cancelar
          </button>
        </form>
      )}
      <span className="pp-tabla__sub ip-trunc ip-meta-disp" role="status">
        {estado ??
          p.contradice ??
          (actualizadaEn ? `Actualizada ${momento(actualizadaEn)}` : "Sin fecha de actualización")}
      </span>
    </div>
  );
}

function momento(iso: string): string {
  const dias = Math.round((Date.now() - Date.parse(iso)) / 86_400_000);
  return dias <= 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;
}

export function AccionesFila(p: {
  codigo: string;
  nombre: string;
  rol: string | null;
  motivos: MotivoPausa[];
  // Solo lo que está a la vista se pausa; todo lo que no está archivado se archiva.
  pausar: boolean;
}) {
  const [abierta, setAbierta] = useState(false);
  const [menu, setMenu] = useState(false);
  const [archivar, setArchivar] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  // El menú y la confirmación flotan anclados al botón (fijos en la ventana): dentro del marco
  // desplazable de la tabla quedarían recortados cuando hay pocas filas.
  const refBoton = useRef<HTMLButtonElement>(null);
  const [ancla, setAncla] = useState<{ top: number; right: number } | null>(null);
  const anclar = () => {
    const r = refBoton.current?.getBoundingClientRect();
    if (r) setAncla({ top: r.bottom + 4, right: window.innerWidth - r.right });
  };
  useEffect(() => {
    if (!menu && !archivar) return;
    const cerrar = () => {
      setMenu(false);
      setArchivar(false);
    };
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    return () => {
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [menu, archivar]);
  const flota = ancla
    ? { position: "fixed" as const, top: ancla.top, right: ancla.right }
    : undefined;
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmarArchivo() {
    setEnviando(true);
    setErrorArchivo(null);
    try {
      const r = await enviarJson(`/api/v1/perfiles/${p.codigo}/archivar`, {});
      const d = await r.json().catch(() => ({}));
      if (r.ok)
        return recargarConAviso(
          d.yaArchivado
            ? `${p.nombre} ya estaba archivado: no se cambió nada.`
            : `${p.nombre} quedó archivado: no se borró y los clientes con enlace lo ven «Fuera del banco».`,
        );
      setErrorArchivo("No se pudo archivar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function pausar() {
    if (!motivo) return setError("Elige el motivo de la pausa.");
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(`/api/v1/perfiles/${p.codigo}/pausar`, { motivoId: motivo });
      const d = await r.json().catch(() => ({}));
      if (r.ok) return recargarConAviso(`${p.nombre} quedó pausado y salió del portal.`);
      setError(
        d.motivo === "motivo_no_disponible"
          ? "Ese motivo ya no está activo en el catálogo. Elige otro."
          : d.motivo === "transicion_invalida"
            ? "Este perfil ya no está publicado. Recarga para ver su estado."
            : "No se pudo pausar. Inténtalo de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <span className="ip-menu">
        <button
          type="button"
          className="pp-btn pp-btn--fantasma pp-btn--sm pp-btn--icono"
          aria-haspopup="menu"
          aria-expanded={menu}
          aria-label={`Más acciones para ${p.nombre}`}
          ref={refBoton}
          onClick={() => {
            anclar();
            setMenu((x) => !x);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMenu(false);
          }}
        >
          <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3" />
          </svg>
        </button>
        {menu && (
          <ul
            className="ip-menu__lista"
            role="menu"
            aria-label={`Acciones para ${p.nombre}`}
            style={flota}
          >
            {p.pausar && (
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="ip-menu__item"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setMenu(false);
                  }}
                  onClick={() => {
                    setMenu(false);
                    setAbierta(true);
                  }}
                >
                  {`Pausar a ${p.nombre}`}
                </button>
              </li>
            )}
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="ip-menu__item"
                autoFocus={!p.pausar}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMenu(false);
                }}
                onClick={() => {
                  setMenu(false);
                  setArchivar(true);
                }}
              >
                {`Archivar a ${p.nombre}`}
              </button>
            </li>
          </ul>
        )}
        {archivar && (
          <div
            className="ip-pop"
            style={flota}
            role="dialog"
            aria-labelledby={`ip-pop-${p.codigo}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") setArchivar(false);
            }}
          >
            <p className="ip-pop__titulo" id={`ip-pop-${p.codigo}`}>
              {`¿Archivar a ${p.nombre}?`}
            </p>
            <p className="ip-pop__texto">
              Se archiva, no se borra. Los clientes con enlace lo verán como «Fuera del banco».
            </p>
            {errorArchivo && (
              <p className="pp-error" role="alert">
                <span aria-hidden="true">!</span>
                {errorArchivo}
              </p>
            )}
            <div className="ip-pop__acciones">
              <button
                type="button"
                className="pp-btn pp-btn--fantasma pp-btn--sm"
                onClick={() => setArchivar(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--contorno pp-btn--sm"
                autoFocus
                disabled={enviando}
                onClick={() => void confirmarArchivo()}
              >
                Archivar perfil
              </button>
            </div>
          </div>
        )}
      </span>
      {abierta && (
        <Hoja
          titulo={`Pausar a ${p.nombre}`}
          sub={`${p.rol ? `${p.rol} · ` : ""}${p.codigo}`}
          cerrarEtiqueta="Cerrar sin pausar"
          alCerrar={() => setAbierta(false)}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setAbierta(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--primario"
                disabled={enviando || p.motivos.length === 0}
                onClick={pausar}
              >
                Pausar y ocultar del portal
              </button>
            </>
          }
        >
          <div className="pp-hoja__cuerpo">
            {p.motivos.length === 0 ? (
              <p>
                No hay motivos de pausa en el catálogo.{" "}
                <a className="pp-enlace" href="/catalogos?tipo=motivo_pausa">
                  Créalos en Catálogos
                </a>
                .
              </p>
            ) : (
              <fieldset className="ip-motivos">
                <legend>Motivo</legend>
                <div className="ip-motivos__lista">
                  {p.motivos.map((m, i) => (
                    <label className="ip-motivo" key={m.id}>
                      <input
                        type="radio"
                        name={`motivo-${p.codigo}`}
                        value={m.id}
                        checked={motivo === m.id}
                        data-foco={i === 0 ? "" : undefined}
                        onChange={() => setMotivo(m.id)}
                      />
                      <span className="ip-motivo__texto">
                        {m.nombre}
                        {m.descripcion && <span className="ip-motivo__ayuda">{m.descripcion}</span>}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="pp-ayuda ip-motivos__nota">
                  Si pasa de 30 días pausado, aparece en Vigencia con su motivo para reactivarlo o
                  archivarlo.
                </p>
              </fieldset>
            )}
            <p className="ip-desvio">
              <strong>¿Está ocupada hasta una fecha?</strong> Eso no es una pausa, es
              disponibilidad: el perfil sigue publicado como inventario para después.{" "}
              <button
                type="button"
                className="pp-enlace ip-desvio__accion"
                onClick={() => {
                  setAbierta(false);
                  document.dispatchEvent(new CustomEvent(EVENTO_FECHA, { detail: p.codigo }));
                }}
              >
                Poner la fecha en que queda libre
              </button>
            </p>
            {error && (
              <p className="pp-error" role="alert">
                <span aria-hidden="true">!</span>
                {error}
              </p>
            )}
          </div>
        </Hoja>
      )}
    </>
  );
}
