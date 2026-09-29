// Pública (ADR-0002 H5): `/e/#t=…`. Su HTML solo contiene la puerta; el token vive en el fragmento, lo
// lee el navegador y nunca llega al servidor en la URL. Sin inventario ni datos de la cuenta.
import { PuertaCliente } from "../../src/acceso/PuertaCliente";
import { Tarjeta } from "../../src/acceso/Pantallas";
import "../acceso.css";

export default function Enlace() {
  return (
    <Tarjeta>
      <PuertaCliente />
    </Tarjeta>
  );
}
