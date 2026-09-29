// Marco del portal (PP:topbar del prototipo aterrizaje-curado): marca, cuenta y proyecto del enlace,
// vigencia del acceso y navegación. Los destinos de sub-slices posteriores (Buscar, Invitar a un
// colega, Mi equipo) se ven y van deshabilitados hasta que existan, como el menú del panel.
import type { ReactNode } from "react";
import { fechaDeColombia } from "@ps/dominio/fecha/colombia";
import { PiezasMarca } from "./Marca";

export function MarcoPortal(props: {
  cuenta: string;
  proyecto: string | null;
  accesoHasta: Date;
  children: ReactNode;
}) {
  return (
    <>
      <header className="pp-topbar">
        <a className="pp-marca" href="#contenido" aria-label="Trycore · Portal de perfiles">
          <PiezasMarca producto="Portal de perfiles" />
        </a>
        <div className="pp-cuenta">
          <p className="pp-cuenta__nombre">
            {props.proyecto ? `${props.cuenta} · ${props.proyecto}` : props.cuenta}
          </p>
          <p className="pp-cuenta__meta">{`Acceso hasta el ${fechaDeColombia(props.accesoHasta)}`}</p>
        </div>
        <nav className="pp-topbar__nav" aria-label="Portal">
          <a className="pp-navlink" href="/" aria-current="page">
            Selección para ti
          </a>
          <span className="pp-navlink" aria-disabled="true">
            Buscar
          </span>
          <span className="pp-navlink" aria-disabled="true">
            Invitar a un colega
          </span>
        </nav>
        <span className="pp-equipo" aria-disabled="true">
          Mi equipo <span className="pp-equipo__conteo" aria-hidden="true">0</span>
          <span className="pp-sr">0 perfiles en el equipo</span>
        </span>
      </header>
      <main className="ac-main" id="contenido">
        {props.children}
      </main>
    </>
  );
}
