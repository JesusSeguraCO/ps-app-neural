// Contacto de Trycore en las pantallas de contacto del portal y en la vista previa del panel (HU-147;
// diseño §10): un solo componente compone «Nombre, Cargo: correo» o «People Service: correo».
import { quienAtiende, type ContactoTrycore as Contacto } from "@ps/dominio/contacto/contacto";

export function ContactoTrycore({
  contacto,
  enlace = true,
  claseCorreo = "pp-enlace",
}: {
  contacto: Contacto;
  enlace?: boolean;
  claseCorreo?: string;
}) {
  return (
    <>
      {`${quienAtiende(contacto)}: `}
      {enlace ? (
        <a className={claseCorreo} href={`mailto:${contacto.direccion}`}>
          {contacto.direccion}
        </a>
      ) : (
        <span className={claseCorreo}>{contacto.direccion}</span>
      )}
    </>
  );
}
