// Marca «trycore / Portal de perfiles» (PP:marca del prototipo), la misma que en el panel.
export function PiezasMarca({ producto }: { producto: string }) {
  return (
    <>
      <svg className="pp-simbolo" viewBox="0 0 32 32" aria-hidden="true">
        <circle className="pp-simbolo__base" cx="16" cy="16" r="14" />
        <path className="pp-simbolo__linea" d="M7.5 20c4-9 11 3 17-8" />
        <circle className="pp-simbolo__nodo" cx="7.5" cy="20" r="2.4" />
        <circle className="pp-simbolo__nodo" cx="24.5" cy="12" r="2.4" />
      </svg>
      <span className="pp-marca__palabra">trycore</span>
      <span className="pp-marca__sep" aria-hidden="true">
        /
      </span>
      <span className="pp-marca__producto">{producto}</span>
    </>
  );
}

export function Marca({ producto }: { producto: string }) {
  return (
    <div className="pp-puerta__cabecera">
      <PiezasMarca producto={producto} />
    </div>
  );
}
