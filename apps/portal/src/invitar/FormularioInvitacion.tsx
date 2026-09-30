"use client";
// Formulario de «Invitar a un colega» (HU-095; prototipo invitar-colega): correo obligatorio, nombre y
// «para qué» opcionales. Tras pedirla, la página se recarga con la petición pendiente en la lista.
import { useEffect, useState, type FormEvent } from "react";
import { horaDesbloqueoDeColombia } from "@ps/dominio/fecha/colombia";
import { enviarJson } from "../acceso/cliente";

const ERRORES: Record<string, string> = {
  correo_invalido: "Escribe un correo válido.",
  es_tu_correo: "Ese es tu correo: escribe el de tu colega.",
};

export function FormularioInvitacion() {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function pedir(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);
    const r = await enviarJson("/api/v1/invitaciones", {
      correo: String(f.get("colega") ?? ""),
      nombre: String(f.get("nombre") ?? ""),
      para_que: String(f.get("para_que") ?? ""),
    }).catch(() => null);
    setEnviando(false);
    if (r?.status === 201) {
      const quien = String(f.get("nombre") ?? "").trim() || String(f.get("colega") ?? "").trim();
      try {
        sessionStorage.setItem("ps-invitacion-pedida", quien);
      } catch {}
      window.location.reload();
      return;
    }
    const cuerpo = r ? await r.json().catch(() => ({})) : {};
    if (cuerpo.motivo === "en_espera" && cuerpo.hasta) {
      setError(`Ya pediste varias invitaciones en la última hora. Podrás pedir otra desde las ${horaDesbloqueoDeColombia(new Date(cuerpo.hasta))}.`);
      return;
    }
    setError(ERRORES[cuerpo.motivo] ?? "No pudimos pedir la invitación. Inténtalo de nuevo en unos segundos.");
  }

  return (
    <form className="pp-form ic-form" onSubmit={pedir}>
      <div className="ic-dos">
        <div className="pp-campo">
          <label className="pp-label" htmlFor="ic-correo">
            Correo de tu colega
          </label>
          <input className="pp-input" id="ic-correo" name="colega" type="email" required autoComplete="off" placeholder="nombre@empresa.com" aria-describedby="ic-correo-ayuda" />
          <p className="pp-ayuda" id="ic-correo-ayuda">
            Entrará con su propio correo y verá esta selección, con su propio «Mi equipo».
          </p>
        </div>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="ic-nombre">
            Nombre <span className="pp-label__opcional">(opcional)</span>
          </label>
          <input className="pp-input" id="ic-nombre" name="nombre" type="text" autoComplete="off" placeholder="Nombre y apellido" />
        </div>
      </div>
      <div className="pp-campo">
        <label className="pp-label" htmlFor="ic-motivo">
          Para qué lo invitas <span className="pp-label__opcional">(opcional)</span>
        </label>
        <textarea className="pp-input pp-input--area" id="ic-motivo" name="para_que" placeholder="Es quien revisará conmigo los perfiles" />
      </div>
      {error && (
        <p className="pp-error" role="alert">
          {error}
        </p>
      )}
      <div className="pp-form__acciones">
        <p className="ic-form__nota">Tu colega entra cuando Talento Humano lo apruebe.</p>
        <button type="submit" className="pp-btn pp-btn--primario" disabled={enviando}>
          Pedir la invitación
        </button>
      </div>
    </form>
  );
}

// Confirmación tras pedir (prototipo invitar-colega--pendiente, PP:toast): el nombre viaja en
// sessionStorage de esta pestaña, nunca en la URL.
export function AvisoPedida() {
  const [quien, setQuien] = useState<string | null>(null);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("ps-invitacion-pedida");
      sessionStorage.removeItem("ps-invitacion-pedida");
      if (v) setQuien(v);
    } catch {}
  }, []);
  if (!quien) return null;
  return (
    <div className="pp-toast" role="status">
      <span className="pp-toast__marca" aria-hidden="true">
        ✓
      </span>
      <p className="pp-toast__texto">{`Pediste la invitación de ${quien}. Te avisamos cuando Talento Humano decida.`}</p>
    </div>
  );
}
