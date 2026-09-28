// Aterrizaje del cliente. Protegida: la guarda va en la primera línea (ADR-0002 H5). El contenido de la
// selección llega en el sub-slice 5 de EP-001.
import { exigirSesion } from "../src/sesion/exigirSesion";

export default async function Inicio() {
  await exigirSesion();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-h2 font-semibold text-text-h">Tu selección de perfiles</h1>
    </main>
  );
}
