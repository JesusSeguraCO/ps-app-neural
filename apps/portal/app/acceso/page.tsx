// Pública (ADR-0002 H5): pantalla sin datos. Explica cada motivo en lenguaje llano; las pantallas
// definitivas de vencido, revocado y renovación llegan en el sub-slice 5 de EP-001.
const MENSAJES: Record<string, string> = {
  enlace_revocado: "Este enlace ya no está disponible. Pide uno nuevo a tu contacto en Trycore.",
  enlace_vencido: "Este enlace venció. Pide uno nuevo desde el enlace que recibiste en tu correo.",
  sesion_expirada: "Tu sesión terminó. Abre de nuevo el enlace que recibiste en tu correo.",
};

export default async function Acceso({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const mensaje = (motivo && MENSAJES[motivo]) ?? "Abre el enlace que recibiste en tu correo para ver tu selección de perfiles.";
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-h2 font-semibold text-text-h">Portal de Perfiles People Service</h1>
      <p className="text-body text-text-b">{mensaje}</p>
    </main>
  );
}
