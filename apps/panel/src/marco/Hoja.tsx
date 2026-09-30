"use client";
// Hoja lateral modal del panel (patrón PP:hoja del prototipo) y aviso flotante tras una decisión
// (patrón PP:toast). Los usan las peticiones de invitación (HU-145) y las renovaciones (HU-146).
import { useEffect, useRef, useState, type ReactNode } from "react";

const CLAVE_AVISO = "pp-aviso";

export function recargarConAviso(texto: string) {
  try {
    sessionStorage.setItem(CLAVE_AVISO, texto);
  } catch {
    // Sin almacenamiento la decisión ya quedó guardada; solo se pierde el aviso.
  }
  window.location.reload();
}

function IconoCerrar() {
  return (
    <svg className="pp-icono" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Hoja lateral modal: Escape y el velo la cierran; el foco entra al abrir y vuelve al botón que la abrió.
export function Hoja(p: {
  titulo: string;
  sub: string;
  cerrarEtiqueta: string;
  alCerrar: () => void;
  pie: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const alCerrar = useRef(p.alCerrar);
  alCerrar.current = p.alCerrar;
  // Solo al montar: si dependiera de las props, cada tecla en el motivo devolvería el foco al inicio.
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    document.body.classList.add("pi-con-hoja");
    (ref.current?.querySelector<HTMLElement>("textarea, [data-foco]") ?? ref.current)?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar.current();
    };
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.classList.remove("pi-con-hoja");
      previo?.focus();
    };
  }, []);
  return (
    <>
      <div className="pp-hoja-velo" aria-hidden="true" onClick={p.alCerrar} />
      <aside
        className="pp-hoja"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pi-hoja-titulo"
        ref={ref}
        tabIndex={-1}
      >
        <header className="pp-hoja__cabecera">
          <h2 id="pi-hoja-titulo">{p.titulo}</h2>
          <p>{p.sub}</p>
          <button
            type="button"
            className="pp-btn pp-btn--fantasma pp-btn--icono pp-hoja__cerrar"
            aria-label={p.cerrarEtiqueta}
            onClick={p.alCerrar}
          >
            <IconoCerrar />
          </button>
        </header>
        {p.children}
        <footer className="pp-hoja__pie">{p.pie}</footer>
      </aside>
    </>
  );
}

// Confirmación flotante tras decidir (prototipo: región toast). La deja la fila antes de recargar.
export function AvisoDecision() {
  const [texto, setTexto] = useState<string | null>(null);
  useEffect(() => {
    let t: string | null = null;
    try {
      t = sessionStorage.getItem(CLAVE_AVISO);
      sessionStorage.removeItem(CLAVE_AVISO);
    } catch {
      t = null;
    }
    if (!t) return;
    setTexto(t);
    const temporizador = setTimeout(() => setTexto(null), 8000);
    return () => clearTimeout(temporizador);
  }, []);
  if (!texto) return null;
  return (
    <div className="pp-toast" role="status">
      <span className="pp-toast__marca" aria-hidden="true">
        ✓
      </span>
      <p className="pp-toast__texto">{texto}</p>
    </div>
  );
}
