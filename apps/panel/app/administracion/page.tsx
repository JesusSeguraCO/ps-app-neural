// Administración (HU-147, HU-151): la primera sección es el contacto de Trycore (prototipo admin-contacto).
import { redirect } from "next/navigation";
import { exigirSesion } from "../../src/sesion/exigirSesion";

export default async function Administracion() {
  await exigirSesion();
  redirect("/administracion/contacto");
}
