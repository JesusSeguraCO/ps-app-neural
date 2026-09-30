// Marco del portal (PP:topbar del prototipo app-shell / aterrizaje-curado): marca, cuenta y proyecto
// del enlace, vigencia del acceso, navegación y «Mi equipo» con su conteo. «Selección para ti» solo
// existe si el enlace trae selección (HU-094: sin selección no hay a dónde volver). La página de Mi
// equipo (EP-004) se ve con su conteo y va deshabilitada hasta que exista.
import type { ReactNode } from "react";
import { fechaDeColombia } from "@ps/dominio/fecha/colombia";
import { PiezasMarca } from "./Marca";
import { TemaToggle } from "./TemaToggle";

export function MarcoPortal(props: {
  cuenta: string;
  proyecto: string | null;
  accesoHasta: Date;
  conSeleccion: boolean;
  activo: "seleccion" | "buscar" | "invitar";
  enEquipo: number;
  children: ReactNode;
}) {
  const actual = (a: "seleccion" | "buscar" | "invitar") => (props.activo === a ? ("page" as const) : undefined);
  return (
    <>
      <header className="pp-topbar">
        <a className="pp-marca" href="#contenido" aria-label="Trycore · Portal de perfiles">
          <PiezasMarca producto="Portal de perfiles" />
        </a>
        <div className="pp-cuenta">
          <p className="pp-cuenta__nombre">{props.proyecto ? `${props.cuenta} · ${props.proyecto}` : props.cuenta}</p>
          <p className="pp-cuenta__meta">{`Acceso hasta el ${fechaDeColombia(props.accesoHasta)}`}</p>
        </div>
        <nav className="pp-topbar__nav" aria-label="Portal">
          {props.conSeleccion && (
            <a className="pp-navlink" href="/" aria-current={actual("seleccion")}>
              Selección para ti
            </a>
          )}
          <a className="pp-navlink" href="/banco" aria-current={actual("buscar")}>
            Buscar
          </a>
          <a className="pp-navlink" href="/invitar" aria-current={actual("invitar")}>
            Invitar a un colega
          </a>
        </nav>
        <span className="pp-equipo" aria-disabled="true">
          {"Mi equipo "}
          <span className={`pp-equipo__conteo${props.enEquipo === 0 ? " pp-equipo__conteo--cero" : ""}`} aria-hidden="true">
            {props.enEquipo}
          </span>
          <span className="pp-sr">
            {props.enEquipo === 0 ? ", sin perfiles todavía" : `${props.enEquipo} perfiles en el equipo`}
          </span>
        </span>
        <TemaToggle />
      </header>
      <main className="ac-main" id="contenido">
        {props.children}
      </main>
    </>
  );
}
