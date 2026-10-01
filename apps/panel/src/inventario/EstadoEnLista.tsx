"use client";
// Disponibilidad y pausa desde el listado (HU-132, HU-133; prototipos inventario-perfiles--lote y
// --pausar-motivo). En la fila: elegir la disponibilidad la guarda sin abrir la ficha (dos clics) y
// dice qué banda verá el cliente. «Pausar» abre la hoja con los motivos del catálogo y el desvío
// «¿Está ocupada hasta una fecha?», que lleva a poner la fecha en la misma fila: eso no es una pausa.
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
          (actualizadaEn ? `Actualizada ${momento(actualizadaEn)}` : "Sin fecha de actualización")}
      </span>
    </div>
  );
}

function momento(iso: string): string {
  const dias = Math.round((Date.now() - Date.parse(iso)) / 86_400_000);
  return dias <= 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;
}

export function PausarPerfil(p: {
  codigo: string;
  nombre: string;
  rol: string | null;
  motivos: MotivoPausa[];
}) {
  const [abierta, setAbierta] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <button
        type="button"
        className="pp-btn pp-btn--fantasma pp-btn--sm"
        aria-label={`Pausar a ${p.nombre}`}
        onClick={() => setAbierta(true)}
      >
        Pausar
      </button>
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
