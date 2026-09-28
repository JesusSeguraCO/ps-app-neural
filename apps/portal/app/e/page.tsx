// Pública (ADR-0002 H5): `/e/#t=…`. Su HTML solo contiene la puerta; el token vive en el fragmento y
// lo lee el navegador. La puerta completa llega en el sub-slice 5 de EP-001.
export default function Enlace() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-h2 font-semibold text-text-h">Portal de Perfiles People Service</h1>
      <p className="text-body text-text-b">Estamos abriendo tu enlace.</p>
    </main>
  );
}
