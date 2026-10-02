"use client";
// «Avisar a Talento Humano» (HU-124 edge; prototipos inventario-perfiles--observador y
// perfil-editor--observador): la salida del observador cuando ve un dato desactualizado. El aviso va con
// el perfil ya identificado y una nota opcional; no recarga la página.
import { useState } from "react";
import { TOPE_NOTA_AVISO } from "@ps/dominio/inventario/observador";
import { enviarJson } from "../acceso/cliente";
import { Hoja } from "../marco/Hoja";

export function AvisarTalentoHumano(p: {
  codigo: string;
  nombre: string;
  // En la fila del listado es «Avisar»; en el perfil, «Avisar a Talento Humano».
  corto?: boolean;
}) {
  const [abierta, setAbierta] = useState(false);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState(false);

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(`/api/v1/perfiles/${p.codigo}/avisar`, {
        nota: nota.trim() || null,
      });
      if (r.status === 202) {
        setAbierta(false);
        setNota("");
        setHecho(true);
        setTimeout(() => setHecho(false), 8000);
        return;
      }
      setError("No se pudo enviar el aviso. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={p.corto ? "pp-btn pp-btn--fantasma pp-btn--sm" : "pp-btn pp-btn--contorno"}
        aria-haspopup="dialog"
        aria-label={p.corto ? `Avisar a Talento Humano sobre el perfil de ${p.nombre}` : undefined}
        onClick={() => setAbierta(true)}
      >
        {p.corto ? "Avisar" : "Avisar a Talento Humano"}
      </button>
      {abierta && (
        <Hoja
          titulo="Avisar a Talento Humano"
          sub={`${p.nombre} · ${p.codigo}`}
          cerrarEtiqueta="Cerrar"
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
                type="submit"
                form="pp-avisar"
                className="pp-btn pp-btn--primario"
                disabled={enviando}
              >
                Enviar aviso
              </button>
            </>
          }
        >
          <form
            id="pp-avisar"
            className="pp-hoja__cuerpo"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
          >
            <p className="pp-ayuda">
              {`Le llega a quien administra el inventario con el perfil ya identificado (${p.codigo}). Tu rol es de consulta: el cambio lo hace Talento Humano.`}
            </p>
            <div className="pp-campo">
              <label className="pp-label" htmlFor="pp-avisar-nota">
                ¿Qué está desactualizado? <span className="pp-meta">(opcional)</span>
              </label>
              <textarea
                className="pp-input"
                id="pp-avisar-nota"
                rows={3}
                maxLength={TOPE_NOTA_AVISO}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>
            {error && (
              <p className="pp-error" role="alert">
                <span aria-hidden="true">!</span>
                {error}
              </p>
            )}
          </form>
        </Hoja>
      )}
      {hecho && (
        <div className="pp-toast" role="status">
          <span className="pp-toast__marca" aria-hidden="true">
            ✓
          </span>
          <p className="pp-toast__texto">{`Aviso enviado a Talento Humano sobre ${p.nombre} (${p.codigo}).`}</p>
        </div>
      )}
    </>
  );
}
