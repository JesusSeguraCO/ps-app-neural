// Generar un enlace curado (HU-122). Protegida: la guarda va en la primera línea (ADR-0002 H5). Solo la
// administración de inventario genera (MatrizPermisos «enlaces.generar»); el observador ve el motivo.
import { puede } from "@ps/dominio/acceso/permisos";
import { publicablesParaPanel } from "@ps/infra/postgres/catalogo";
import { poolDe } from "@ps/infra/postgres/pool";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { GeneradorEnlace } from "../../../src/enlaces/GeneradorEnlace";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import "../../../src/marco/marco.css";
import "../enlaces.css";

export default async function NuevoEnlace() {
  const sesion = await exigirSesion();
  const migas = ["Clientes", "Enlaces", "Nuevo enlace"];
  if (!puede(sesion.rol, "enlaces.generar")) {
    return (
      <MarcoPanel sesion={sesion} activo="enlaces" migas={migas}>
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">Nuevo enlace</h1>
            <p className="pp-encabezado__meta">Solo la administración de inventario puede generar enlaces.</p>
          </div>
        </div>
      </MarcoPanel>
    );
  }
  const publicables = await publicablesParaPanel(poolDe("panel"));
  return (
    <MarcoPanel sesion={sesion} activo="enlaces" migas={migas}>
      <GeneradorEnlace publicables={publicables} autora={sesion.correo} />
    </MarcoPanel>
  );
}
