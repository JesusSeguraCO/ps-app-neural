"use client";
// Acciones de una petición de invitación (HU-145; prototipo peticiones-invitacion y --rechazo-motivo):
// aprobar, o rechazar escribiendo el motivo (obligatorio). Tras decidir, recarga la lista.
import { useState } from "react";
import { enviarJson } from "../acceso/cliente";

export function DecidirPeticion(p: { id: string; persona: string; puedeAprobar: boolean; puedeRechazar: boolean; soloCerrar: boolean }) {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function decidir(ruta: "aprobar" | "rechazar") {
    setError(null);
    const r = await enviarJson(`/api/v1/invitaciones/${p.id}/${ruta}`, ruta === "rechazar" ? { motivo } : {}).catch(() => null);
    if (r?.status === 200) window.location.reload();
    else setError(r?.status === 400 ? "Escribe el motivo del rechazo." : "No se pudo guardar la decisión. Recarga la página.");
  }

  if (rechazando)
    return (
      <form
        className="pi-rechazo"
        onSubmit={(e) => {
          e.preventDefault();
          void decidir("rechazar");
        }}
      >
        <label className="pp-label" htmlFor={`motivo-${p.id}`}>
          {`Motivo del rechazo de ${p.persona}`}
        </label>
        <textarea className="pp-input pp-input--area" id={`motivo-${p.id}`} required value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <p className="pp-ayuda">Quien lo pidió verá este motivo en el portal.</p>
        {error && (
          <p className="pp-error" role="alert">
            {error}
          </p>
        )}
        <div className="pi-rechazo__acciones">
          <button type="button" className="pp-btn pp-btn--fantasma pp-btn--sm" onClick={() => setRechazando(false)}>
            Cancelar
          </button>
          <button type="submit" className="pp-btn pp-btn--destructivo pp-btn--sm">
            Rechazar
          </button>
        </div>
      </form>
    );

  return (
    <div className="pp-fila__acciones">
      {p.puedeRechazar && (
        <button type="button" className="pp-btn pp-btn--fantasma pp-btn--sm" onClick={() => setRechazando(true)}>
          Rechazar
        </button>
      )}
      {p.puedeAprobar && (
        <button type="button" className="pp-btn pp-btn--contorno pp-btn--sm" onClick={() => void decidir("aprobar")}>
          {p.soloCerrar ? "Cerrar la petición" : "Aprobar"}
        </button>
      )}
      {error && (
        <p className="pp-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
