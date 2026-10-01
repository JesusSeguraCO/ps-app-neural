// Perfil en el panel (HU-125, HU-127, HU-128, HU-129; prototipo perfil-editor y variantes): el editor
// con lo que le falta para publicar, su consentimiento nominal, «Publicar» y la vista previa de la
// ficha. La observadora lo ve sin controles de escritura.
// Protegida: la guarda va en la primera línea.
import { notFound } from "next/navigation";
import { puede } from "@ps/dominio/acceso/permisos";
import { leerPerfil, opcionesEditor } from "@ps/infra/postgres/perfiles-panel";
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

export default async function Perfil({ params }: { params: Promise<{ codigo: string }> }) {
  const sesion = await exigirSesion();
  const { codigo } = await params;
  if (!/^PS-\d{4}$/.test(codigo)) notFound();
  const bd = poolDe("panel");
  const [perfil, opciones] = await Promise.all([leerPerfil(bd, codigo), opcionesEditor(bd)]);
  if (!perfil) notFound();
  const nombre = [perfil.nombre, perfil.primerApellido].filter(Boolean).join(" ") || perfil.codigo;
  return (
    <MarcoPanel sesion={sesion} activo="inventario" migas={[{ texto: "Inventario", href: "/inventario" }, nombre]}>
      <EditorPerfil
        perfil={perfil}
        opciones={opciones}
        escribe={puede(sesion.rol, "perfil.escribir")}
        registraConsentimiento={puede(sesion.rol, "consentimiento.registrar")}
        hoy={hoyEnColombia()}
      />
      <AvisoDecision />
    </MarcoPanel>
  );
}
