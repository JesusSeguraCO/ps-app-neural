// Ficha del perfil en panel lateral sobre la lista (prototipo ficha-perfil--sin-criterios; HU-120, D47).
// La dibuja el mismo componente que la vista previa del panel (HU-129): lo que el cliente ve es lo que
// Talento Humano previsualizó. Sin criterios de búsqueda no hay bloque de evidencia (HU-119 · error).
// Anterior, siguiente y cerrar son enlaces: la lista de detrás no se pierde ni se recarga distinta.
import type { FichaPerfil as Ficha } from "@ps/contratos/ficha";
import type { Recorrido } from "@ps/dominio/catalogo/recorrido";
import { FichaPerfil } from "@ps/ui/FichaPerfil";
import { AtajosFicha } from "./AtajosFicha";

function Flecha(p: { href: string | null; etiqueta: string; atajo: string; d: string }) {
  const icono = (
    <svg className="pp-icono" viewBox="0 0 24 24" aria-hidden="true">
      <path d={p.d} />
    </svg>
  );
  const comun = {
    className: "pp-btn pp-btn--contorno pp-btn--sm pp-btn--icono",
    "aria-label": p.etiqueta,
    title: `${p.etiqueta} (${p.atajo === "ArrowLeft" ? "←" : "→"})`,
    "aria-keyshortcuts": p.atajo,
  };
  return p.href ? (
    <a {...comun} href={p.href}>
      {icono}
    </a>
  ) : (
    <button {...comun} type="button" disabled>
      {icono}
    </button>
  );
}

export function PanelFicha(p: {
  ficha: Ficha;
  recorrido: Recorrido;
  lista: string;
  href: (codigo: string | null) => string;
}) {
  const { posicion, total, anterior, siguiente } = p.recorrido;
  const cerrar = p.href(null);
  const enlaceDe = (c: string | null) => (c ? p.href(c) : null);
  const barra = (
    <div className="fp-barra">
      <nav className="fp-barra__nav" aria-label="Recorrer perfiles">
        <Flecha href={enlaceDe(anterior)} etiqueta="Perfil anterior" atajo="ArrowLeft" d="M15 6l-6 6 6 6" />
        <Flecha href={enlaceDe(siguiente)} etiqueta="Perfil siguiente" atajo="ArrowRight" d="M9 6l6 6-6 6" />
        <p className="fp-barra__pos" aria-live="polite">
          <b>{`${posicion} de ${total}`}</b>
          {` · ${p.lista}`}
        </p>
      </nav>
      <div className="fp-barra__fin">
        <span className="fp-atajos" aria-hidden="true">
          <span className="pp-kbd">←</span>
          <span className="pp-kbd">→</span> recorrer · <span className="pp-kbd">Esc</span> cerrar
        </span>
        <a
          className="pp-btn pp-btn--fantasma pp-btn--icono"
          id="fp-cerrar"
          href={cerrar}
          aria-label="Cerrar la ficha"
          title="Cerrar (Esc)"
          aria-keyshortcuts="Escape"
        >
          <svg className="pp-icono" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </a>
      </div>
    </div>
  );
  return (
    <>
      <a className="pp-hoja-velo" href={cerrar} aria-hidden="true" tabIndex={-1} />
      <FichaPerfil ficha={p.ficha} barra={barra} dialogo />
      <AtajosFicha anterior={enlaceDe(anterior)} siguiente={enlaceDe(siguiente)} cerrar={cerrar} />
    </>
  );
}
