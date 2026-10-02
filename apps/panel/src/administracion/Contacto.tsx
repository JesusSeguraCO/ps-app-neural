"use client";
// Contacto de Trycore (HU-147; prototipos admin-contacto y admin-contacto--correo-externo): nombre y cargo
// opcionales y correo @trycore.com. El servidor decide; un correo externo no se guarda y el portal sigue
// con el contacto anterior. «Descartar» vuelve al vigente sin enviar nada.
import { useState } from "react";
import type { ContactoTrycore } from "@ps/dominio/contacto/contacto";
import { enviarJson } from "../acceso/cliente";
import { recargarConAviso } from "../marco/Hoja";

const ERROR: Record<string, string> = {
  correo_externo:
    "El correo de contacto debe ser @trycore.com. No se guardó: el portal sigue mostrando el contacto anterior.",
  correo_invalido:
    "Escribe el correo completo, como nombre.apellido@trycore.com. No se guardó: el portal sigue mostrando el contacto anterior.",
  texto_largo: "El nombre y el cargo admiten hasta 80 caracteres. No se guardó.",
};

export function FormularioContacto({ vigente }: { vigente: ContactoTrycore }) {
  const [nombre, setNombre] = useState(vigente.nombre ?? "");
  const [cargo, setCargo] = useState(vigente.cargo ?? "");
  const [correo, setCorreo] = useState(vigente.direccion);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson("/api/v1/contacto", { correo, nombre, cargo });
      const d = await r.json().catch(() => ({}));
      if (r.status === 200)
        return recargarConAviso(
          d.cambio
            ? "Contacto guardado. Las pantallas de contacto del portal lo muestran desde su siguiente carga."
            : "No había cambios: el contacto sigue igual.",
        );
      setError(ERROR[d.motivo] ?? "No se pudo guardar el contacto. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className="pp-tarjeta pp-form pp-form--alineado"
      aria-label="Contacto de Trycore"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <div className="pp-form-fila">
        <div className="pp-form-fila__etiqueta">
          <label className="pp-label" htmlFor="ad-nombre">
            Nombre <span className="pp-label__opcional">(opcional)</span>
          </label>
        </div>
        <div className="pp-form-fila__control">
          <input
            className="pp-input"
            id="ad-nombre"
            type="text"
            maxLength={80}
            value={nombre}
            placeholder="Nombre y apellido"
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
      </div>
      <div className="pp-form-fila">
        <div className="pp-form-fila__etiqueta">
          <label className="pp-label" htmlFor="ad-cargo">
            Cargo <span className="pp-label__opcional">(opcional)</span>
          </label>
        </div>
        <div className="pp-form-fila__control">
          <input
            className="pp-input"
            id="ad-cargo"
            type="text"
            maxLength={80}
            value={cargo}
            placeholder="Área o cargo"
            onChange={(e) => setCargo(e.target.value)}
          />
        </div>
      </div>
      <div className="pp-form-fila">
        <div className="pp-form-fila__etiqueta">
          <label className="pp-label" htmlFor="ad-correo">
            Correo
          </label>
          <p className="pp-ayuda">Solo @trycore.com.</p>
        </div>
        <div className="pp-form-fila__control">
          <input
            className="pp-input"
            id="ad-correo"
            type="email"
            required
            value={correo}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "ad-correo-ayuda ad-correo-error" : "ad-correo-ayuda"}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <p className="pp-ayuda" id="ad-correo-ayuda">
            Sin nombre ni cargo, el portal dice «escribe a People Service» con este correo.
          </p>
          {error && (
            <p className="pp-error" id="ad-correo-error" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="pp-form__acciones">
        <button
          type="button"
          className="pp-btn pp-btn--fantasma"
          onClick={() => {
            setNombre(vigente.nombre ?? "");
            setCargo(vigente.cargo ?? "");
            setCorreo(vigente.direccion);
            setError(null);
          }}
        >
          Descartar
        </button>
        <button type="submit" className="pp-btn pp-btn--primario" disabled={enviando}>
          Guardar contacto
        </button>
      </div>
    </form>
  );
}
