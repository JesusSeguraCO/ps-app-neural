// Pública (ADR-0002 H5): inicio con correo @trycore.com. El flujo de código llega en el sub-slice 2.
const MENSAJES: Record<string, string> = {
  sesion_expirada: "Tu sesión terminó. Vuelve a entrar con tu correo.",
};

export default async function Acceso({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const mensaje = (motivo && MENSAJES[motivo]) ?? "Entra con tu correo @trycore.com.";
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-h2 font-semibold text-text-h">Panel de People Service</h1>
      <p className="text-body text-text-b">{mensaje}</p>
    </main>
  );
}
