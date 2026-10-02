// Perfil en el panel (HU-125, HU-127, HU-128, HU-129; prototipo perfil-editor y variantes): el editor
// con lo que le falta para publicar, su consentimiento nominal, «Publicar» y la vista previa de la
// ficha. La observadora lo consulta en la vista de la ficha (`?vista=ficha`); si llega por la dirección
// de edición, ve el formulario inerte con «tu rol es de consulta», el intento queda registrado y puede
// avisar a Talento Humano con el perfil identificado (HU-124).
// Protegida: la guarda va en la primera línea.
import { notFound } from "next/navigation";
import { puede } from "@ps/dominio/acceso/permisos";
import { leerContacto } from "@ps/infra/postgres/contacto";
import { leerPerfil, opcionesEditor } from "@ps/infra/postgres/perfiles-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { EditorPerfil } from "../../../src/inventario/EditorPerfil";
import { AvisoDecision } from "../../../src/marco/Hoja";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import { registrarRechazoDePagina } from "../../../src/sesion/rechazo";
import { hoyEnColombia } from "../hoy";
import "../../../src/marco/marco.css";
import "@ps/ui/ficha.css";
import "../editor.css";
import "../vista-previa.css";

export default async function Perfil({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ vista?: string }>;
}) {
  const sesion = await exigirSesion();
  const { codigo } = await params;
  const { vista } = await searchParams;
  if (!/^PS-\d{4}$/.test(codigo)) notFound();
  const bd = poolDe("panel");
  const [perfil, opciones, contacto] = await Promise.all([leerPerfil(bd, codigo), opcionesEditor(bd), leerContacto(bd)]);
  if (!perfil) notFound();
  const nombre = [perfil.nombre, perfil.primerApellido].filter(Boolean).join(" ") || perfil.codigo;
  const escribe = puede(sesion.rol, "perfil.escribir");
  const ficha = vista === "ficha";
  if (!escribe && !ficha)
    await registrarRechazoDePagina(sesion, "perfil.escribir", `/inventario/${codigo}`);
  return (
    <MarcoPanel
      sesion={sesion}
      activo="inventario"
      migas={[{ texto: "Inventario", href: "/inventario" }, nombre]}
    >
      <EditorPerfil
        perfil={perfil}
        opciones={opciones}
        escribe={escribe}
        modoInicial={ficha ? "previa" : "editar"}
        consulta={escribe ? undefined : { porDireccionDeEdicion: !ficha }}
        registraConsentimiento={puede(sesion.rol, "consentimiento.registrar")}
        hoy={hoyEnColombia()}
        autor={sesion.correo}
        contacto={contacto}
      />
      <AvisoDecision />
    </MarcoPanel>
  );
}
