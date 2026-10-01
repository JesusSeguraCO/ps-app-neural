// Pestañas de Administración (prototipos admin-contacto y admin-accesos): la observadora solo ve el contacto.
export function PestanasAdministracion(p: {
  activa: "contacto" | "accesos";
  accesos: number | null;
}) {
  return (
    <nav className="pp-pestanas ad-pestanas" aria-label="Secciones de Administración">
      <a
        className="pp-pestana"
        href="/administracion/contacto"
        aria-current={p.activa === "contacto" ? "page" : undefined}
      >
        Contacto de Trycore
      </a>
      {p.accesos !== null && (
        <a
          className="pp-pestana"
          href="/administracion/accesos"
          aria-current={p.activa === "accesos" ? "page" : undefined}
        >
          Accesos al panel <span className="pp-pestana__conteo">{p.accesos}</span>
        </a>
      )}
    </nav>
  );
}
