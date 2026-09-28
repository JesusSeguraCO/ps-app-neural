// Inicio del panel. Protegida: la guarda va en la primera línea (ADR-0002 H5).
import { exigirSesion } from "../src/sesion/exigirSesion";

export default async function Inicio() {
  const sesion = await exigirSesion();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-h2 font-semibold text-text-h">Panel de People Service</h1>
      <p className="text-small text-text-m">{sesion.correo}</p>
    </main>
  );
}
