// Inicio del panel. Protegida: la guarda va en la primera línea (ADR-0002 H5).
import { exigirSesion } from "../src/sesion/exigirSesion";
import { MarcoPanel } from "../src/marco/MarcoPanel";
import "../src/marco/marco.css";

export default async function Inicio() {
  const sesion = await exigirSesion();
  return (
    <MarcoPanel sesion={sesion} migas={["Inicio"]}>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Panel de People Service</h1>
          <p className="pp-encabezado__meta">
            Cada destino del menú se activa cuando su parte del panel está lista.
          </p>
        </div>
      </div>
    </MarcoPanel>
  );
}
