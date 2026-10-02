"use client";
// Fila de la bandeja de vigencia (HU-136, HU-133; prototipos bandeja-vigencia y
// --pausado-reactivar). Un publicado se resuelve en la fila, sin abrir la ficha: «Confirmar sin
// cambios» renueva cuándo se revisó y «Actualizar» abre la disponibilidad (dos clics). Un pausado se
// reactiva con la disponibilidad que tendrá en el portal o se archiva (no se borra).
import { useState, type ReactNode } from "react";
import { OPCIONES_DISPONIBILIDAD } from "@ps/dominio/inventario/perfil";
import { enviarJson } from "../acceso/cliente";
import {
  bandaCliente,
  cuerpoDisponibilidad,
  type EleccionDisponibilidad,
} from "../inventario/EstadoEnLista";
import { recargarConAviso } from "../marco/Hoja";

type Tipo = "publicado" | "dato_incompleto" | "por_confirmar" | "pausado";

function Disponibilidad(p: {
  id: string;
  etiqueta: string;
  eleccion: EleccionDisponibilidad;
  dia: string;
  hoy: string;
  alElegir: (e: EleccionDisponibilidad) => void;
  alDia: (d: string) => void;
}) {
  const banda = bandaCliente(p.eleccion, p.dia);
  return (
    <>
      <div className="pp-campo">
        <label className="pp-label" htmlFor={`${p.id}-m`}>
          {p.etiqueta}
        </label>
        <div className="pp-select">
          <select
            className="pp-input"
            id={`${p.id}-m`}
            value={p.eleccion}
            data-foco=""
            onChange={(e) => p.alElegir(e.target.value as EleccionDisponibilidad)}
          >
            <option value="">Elegir…</option>
            {Object.entries(OPCIONES_DISPONIBILIDAD).map(([k, o]) => (
              <option key={k} value={k}>
                {o.etiqueta}
              </option>
            ))}
            <option value="fecha">Elegir una fecha…</option>
          </select>
        </div>
      </div>
      {p.eleccion === "fecha" && (
        <div className="pp-campo">
          <label className="pp-label" htmlFor={`${p.id}-f`}>
            Fecha en que queda libre
          </label>
          <input
            className="pp-input"
            type="date"
            id={`${p.id}-f`}
            min={p.hoy}
            value={p.dia}
            aria-describedby={`${p.id}-a`}
            onChange={(e) => p.alDia(e.target.value)}
          />
        </div>
      )}
      <p className="pp-ayuda" id={`${p.id}-a`}>
        {banda
          ? `La fecha se queda en el panel. El cliente verá «${banda}».`
          : "El cliente verá la banda, no la fecha."}
      </p>
    </>
  );
}

export function AccionesVigencia(p: {
  tipo: Tipo;
  codigo: string;
  nombre: string;
  hoy: string;
  fila: ReactNode;
  // Lo que el cliente ve hoy (para el aviso de «Confirmar sin cambios»).
  bandaActual: string | null;
}) {
  const [abierta, setAbierta] = useState(false);
  const [eleccion, setEleccion] = useState<EleccionDisponibilidad>("");
  const [dia, setDia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = `bv-${p.codigo}`;
  const lista = Boolean(eleccion) && (eleccion !== "fecha" || Boolean(dia));

  async function enviar(ruta: string, cuerpo: unknown, aviso: string) {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(ruta, cuerpo);
      const d = await r.json().catch(() => ({}));
      const fallo = d.resultados?.find((x: { ok: boolean }) => !x.ok);
      if (r.ok && !fallo) return recargarConAviso(aviso);
      setError(
        d.motivo === "no_publicable"
          ? "No se puede reactivar: le falta algo para publicarse. Ábrelo para ver qué."
          : fallo?.motivo === "sin_fecha"
            ? "No tiene una fecha que confirmar: actualízala."
            : "No se pudo guardar. Inténtalo de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  const disp = (codigos: string[], c: unknown) => ({ codigos, disponibilidad: c });
  const salio = `${p.nombre} salió de la bandeja.`;
  const pausado = p.tipo === "pausado";

  return (
    <li className={`bv-fila${abierta ? " bv-fila--abierta" : ""}`} aria-labelledby={`${id}-n`}>
      <div className="bv-rejilla">
        {p.fila}
        {!abierta && (
          <div className="bv-acciones">
            {pausado ? (
              <>
                <button
                  type="button"
                  className="pp-btn pp-btn--fantasma pp-btn--sm"
                  aria-label={`Archivar a ${p.nombre}`}
                  disabled={enviando}
                  onClick={() =>
                    enviar(
                      `/api/v1/perfiles/${p.codigo}/archivar`,
                      {},
                      `${salio} Quedó archivado: no se borró.`,
                    )
                  }
                >
                  Archivar
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn--contorno pp-btn--sm"
                  aria-expanded="false"
                  aria-label={`Reactivar a ${p.nombre}`}
                  onClick={() => setAbierta(true)}
                >
                  Reactivar
                </button>
              </>
            ) : (
              <>
                {p.tipo !== "por_confirmar" && (
                  <button
                    type="button"
                    className="pp-btn pp-btn--fantasma pp-btn--sm"
                    aria-label={`Confirmar sin cambios la disponibilidad de ${p.nombre}`}
                    disabled={enviando}
                    onClick={() =>
                      enviar(
                        "/api/v1/perfiles/disponibilidad",
                        disp([p.codigo], { confirmar: true }),
                        `${salio}${p.bandaActual ? ` El portal sigue mostrando «${p.bandaActual}».` : ""}`,
                      )
                    }
                  >
                    Confirmar sin cambios
                  </button>
                )}
                <button
                  type="button"
                  className="pp-btn pp-btn--contorno pp-btn--sm"
                  aria-expanded="false"
                  aria-label={`Actualizar la disponibilidad de ${p.nombre}`}
                  onClick={() => setAbierta(true)}
                >
                  Actualizar
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {abierta && (
        <form
          className="bv-editor"
          aria-label={
            pausado
              ? `Reactivar o archivar a ${p.nombre}`
              : `Actualizar la disponibilidad de ${p.nombre}`
          }
          onSubmit={(e) => {
            e.preventDefault();
            if (!lista) return setError("Elige la disponibilidad.");
            const banda = bandaCliente(eleccion, dia);
            const c = cuerpoDisponibilidad(eleccion, dia);
            if (pausado)
              void enviar(
                `/api/v1/perfiles/${p.codigo}/reactivar`,
                { disponibilidad: c },
                `${salio} Volvió al portal con «${banda}».`,
              );
            else
              void enviar(
                "/api/v1/perfiles/disponibilidad",
                disp([p.codigo], c),
                `${salio} El portal muestra «${banda}».`,
              );
          }}
        >
          <Disponibilidad
            id={id}
            etiqueta={pausado ? "Disponibilidad al reactivar" : "Disponibilidad"}
            eleccion={eleccion}
            dia={dia}
            hoy={p.hoy}
            alElegir={setEleccion}
            alDia={setDia}
          />
          {pausado && (
            <p className="pp-ayuda">
              Al reactivar vuelve a publicado y el cliente lo ve con esa banda. Si ya no está en el
              banco, archívalo: no se borra.
            </p>
          )}
          {error && (
            <p className="pp-error" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          )}
          <div className="bv-editor__acciones">
            <button
              type="button"
              className="pp-btn pp-btn--fantasma"
              onClick={() => setAbierta(false)}
            >
              Cancelar
            </button>
            {pausado && (
              <button
                type="button"
                className="pp-btn pp-btn--contorno"
                disabled={enviando}
                onClick={() =>
                  enviar(
                    `/api/v1/perfiles/${p.codigo}/archivar`,
                    {},
                    `${salio} Quedó archivado: no se borró.`,
                  )
                }
              >
                Archivar
              </button>
            )}
            <button type="submit" className="pp-btn pp-btn--primario" disabled={enviando}>
              {pausado ? "Reactivar" : "Guardar disponibilidad"}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
