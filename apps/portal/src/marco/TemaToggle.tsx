"use client";
// Conmutador de tema (PP:topbar del prototipo): `class="dark"` en <html> (tokens.css), recordado en
// este navegador. Sin datos personales; sin preferencia guardada, sigue al sistema.
import { useEffect, useState } from "react";

const CLAVE = "ps-tema";

export function TemaToggle() {
  const [oscuro, setOscuro] = useState(false);

  useEffect(() => {
    let guardado: string | null = null;
    try {
      guardado = localStorage.getItem(CLAVE);
    } catch {}
    const inicial = guardado ? guardado === "oscuro" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", inicial);
    setOscuro(inicial);
  }, []);

  function cambiar() {
    const siguiente = !oscuro;
    document.documentElement.classList.toggle("dark", siguiente);
    try {
      localStorage.setItem(CLAVE, siguiente ? "oscuro" : "claro");
    } catch {}
    setOscuro(siguiente);
  }

  return (
    <button
      type="button"
      className="pp-btn pp-btn--fantasma pp-btn--icono cl-tema"
      aria-pressed={oscuro}
      aria-label={oscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={oscuro ? "Tema claro" : "Tema oscuro"}
      onClick={cambiar}
    >
      <svg className="pp-icono" viewBox="0 0 24 24" aria-hidden="true">
        {oscuro ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  );
}
