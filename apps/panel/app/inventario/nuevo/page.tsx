// Nuevo perfil (HU-125; prototipo perfil-editor): el editor vacío. Guardar lo crea siempre en borrador
// y lleva a su ficha en el panel. Solo la administradora crea perfiles (la observadora vuelve al
// inventario; el servidor además responde 403). Protegida: la guarda va en la primera línea.
import { redirect } from "next/navigation";
import { puede } from "@ps/dominio/acceso/permisos";
import { opcionesEditor } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { EditorPerfil } from "../../../src/inventario/EditorPerfil";
import { AvisoDecision } from "../../../src/marco/Hoja";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import { hoyEnColombia } from "../hoy";
import "../../../src/marco/marco.css";
import "@ps/ui/ficha.css";
import "../editor.css";
import "../vista-previa.css";

export default async function NuevoPerfil() {
  const sesion = await exigirSesion();
  if (!puede(sesion.rol, "perfil.escribir")) redirect("/inventario");
  const opciones = await opcionesEditor(poolDe("panel"));
  return (
    <MarcoPanel sesion={sesion} activo="inventario" migas={[{ texto: "Inventario", href: "/inventario" }, "Nuevo perfil"]}>
      <EditorPerfil perfil={null} opciones={opciones} escribe registraConsentimiento hoy={hoyEnColombia()} />
      <AvisoDecision />
    </MarcoPanel>
  );
}
