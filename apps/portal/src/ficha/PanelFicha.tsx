// Ficha del perfil en panel lateral sobre la lista (prototipo ficha-perfil--sin-criterios; HU-120, D47).
// La dibuja el mismo componente que la vista previa del panel (HU-129): lo que el cliente ve es lo que
// Talento Humano previsualizó. Con un filtro activo del banco, «Frente a tu búsqueda» lleva las mismas
// líneas ✓/– que la tarjeta; sin criterios (la selección del correo) no hay bloque (HU-119 · edge).
// Anterior, siguiente y cerrar son enlaces: la lista de detrás no se pierde ni se recarga distinta.
import type { FichaPerfil as Ficha } from "@ps/contratos/ficha";
import type { LineaEvidencia } from "@ps/dominio/catalogo/evidencia";
import type { ContactoTrycore } from "@ps/dominio/contacto/contacto";
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
  // `null`: el perfil está en la lista pero su ficha no puede mostrarse (dato heredado incompleto o
  // dejó de publicarse): el panel se abre igual y lo dice, nunca una recarga muda (Release Gate R0).
  ficha: Ficha | null;
  recorrido: Recorrido;
  lista: string;
  href: (codigo: string | null) => string;
  // Cerrar vuelve a la misma lista, con su filtro, en la posición del perfil abierto (HU-120).
  cerrar: string;
  evidencia?: readonly LineaEvidencia[];
  contacto?: ContactoTrycore;
}) {
  const { posicion, total, anterior, siguiente } = p.recorrido;
  const cerrar = p.cerrar;
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
      {p.ficha ? (
        <FichaPerfil ficha={p.ficha} barra={barra} dialogo evidencia={p.evidencia} contacto={p.contacto} />
      ) : (
        <article className="pp-hoja fp-ficha" aria-labelledby="fp-titulo" role="dialog" aria-modal id="ficha">
          {barra}
          <header className="pp-hoja__cabecera">
            <h2 id="fp-titulo">Esta ficha se está actualizando</h2>
            <p>Talento Humano está completando los datos de este perfil.</p>
          </header>
          <div className="pp-hoja__cuerpo">
            <p>Puedes seguir con los demás perfiles de la lista y volver a abrirla más tarde.</p>
          </div>
        </article>
      )}
      <AtajosFicha anterior={enlaceDe(anterior)} siguiente={enlaceDe(siguiente)} cerrar={cerrar} />
    </>
  );
}
