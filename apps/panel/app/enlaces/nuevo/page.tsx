// Generar un enlace curado (HU-122). Protegida: la guarda va en la primera línea (ADR-0002 H5). Solo la
// administración de inventario genera (MatrizPermisos «enlaces.generar»); el observador ve que su rol es
// de consulta y el intento queda registrado (HU-124).
import { puede } from "@ps/dominio/acceso/permisos";
import { publicablesParaPanel } from "@ps/infra/postgres/catalogo";
import { poolDe } from "@ps/infra/postgres/pool";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { GeneradorEnlace } from "../../../src/enlaces/GeneradorEnlace";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import { registrarRechazoDePagina } from "../../../src/sesion/rechazo";
import "../../../src/marco/marco.css";
import "../enlaces.css";

export default async function NuevoEnlace() {
  const sesion = await exigirSesion();
  const migas = ["Clientes", { texto: "Enlaces de acceso", href: "/enlaces" }, "Nuevo enlace"];
  if (!puede(sesion.rol, "enlaces.generar")) {
    await registrarRechazoDePagina(sesion, "enlaces.generar", "/enlaces/nuevo");
    return (
      <MarcoPanel sesion={sesion} activo="enlaces" migas={migas}>
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">Nuevo enlace</h1>
            <p className="pp-encabezado__meta">
              Solo la administración de inventario puede generar enlaces.
            </p>
          </div>
        </div>
        <div className="pp-aviso pp-aviso--info" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            i
          </span>
          <p>
            <span className="pp-aviso__titulo">Tu rol es de consulta.</span>
            Llegaste por la dirección para generar un enlace: no se generó nada y el intento quedó
            en la auditoría. Los enlaces generados se ven en «Enlaces».
          </p>
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
