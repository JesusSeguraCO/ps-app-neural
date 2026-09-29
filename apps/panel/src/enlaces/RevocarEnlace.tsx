"use client";
// «Revocar enlace» del detalle (prototipo enlaces-acceso, tarea 4.4): nadie vuelve a entrar, ni quien
// lo tiene abierto; el registro se conserva con el motivo, la autora y la fecha.
import { useState } from "react";
import { enviarJson } from "../acceso/cliente";

export function RevocarEnlace({ codigo }: { codigo: string }) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  return (
    <form
      className="pp-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setEnviando(true);
        setFallo(null);
        const r = await enviarJson(`/api/v1/enlaces/${codigo}/revocar`, motivo.trim() ? { motivo } : {}).catch(() => null);
        if (r && (r.status === 200 || r.status === 409)) {
          window.location.assign(`/enlaces?enlace=${codigo}`);
          return;
        }
        setEnviando(false);
        setFallo(r?.status === 403 ? "No tienes permiso para revocar enlaces." : "No se pudo revocar. Inténtalo de nuevo.");
      }}
    >
      <div className="pp-campo">
        <label className="pp-label" htmlFor="ea-motivo">
          Motivo
        </label>
        <textarea
          className="pp-input pp-input--area"
          id="ea-motivo"
          name="motivo"
          aria-describedby="ea-motivo-ayuda"
          placeholder="La cuenta pausó el proyecto"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <p className="pp-ayuda" id="ea-motivo-ayuda">
          Queda en el registro con tu nombre y la fecha.
        </p>
      </div>
      {fallo && (
        <p className="pp-error" role="alert">
          {fallo}
        </p>
      )}
      <div className="pp-form__acciones">
        <button type="submit" className="pp-btn pp-btn--destructivo" disabled={enviando}>
          Revocar enlace
        </button>
      </div>
    </form>
  );
}
