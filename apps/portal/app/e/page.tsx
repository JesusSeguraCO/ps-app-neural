// Pública (ADR-0002 H5): `/e/#t=…`. Su HTML solo contiene la puerta; el token vive en el fragmento, lo
// lee el navegador y nunca llega al servidor en la URL. Sin inventario ni datos de la cuenta; solo el
// contacto de Trycore (HU-147), leído en cada carga.
import { leerContacto } from "@ps/infra/postgres/contacto";
import { poolDe } from "@ps/infra/postgres/pool";
import { PuertaCliente } from "../../src/acceso/PuertaCliente";
import { Tarjeta } from "../../src/acceso/Pantallas";
import "../acceso.css";

export const dynamic = "force-dynamic";

export default async function Enlace() {
  const contacto = await leerContacto(poolDe("portal"));
  return (
    <Tarjeta>
      <PuertaCliente contacto={contacto} />
    </Tarjeta>
  );
}
