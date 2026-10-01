// Marco del panel (prototipo admin-shell, patrón PP:panel): barra lateral navy con el menú canónico,
// barra superior con migas, correo de la sesión (identidad de auditoría) y «Cerrar sesión», y el pie
// con rol y fin de la jornada. Sin enlace al portal del cliente (HU-123, edge case). Los destinos con
// trabajo pendiente llevan su conteo: peticiones de invitación sin decidir y perfiles por revisar en la
// bandeja de vigencia (HU-136). El pie lleva a Administración (contacto de Trycore y accesos, HU-147 y
// HU-151; prototipo admin-contacto); en móvil es un destino más de la barra horizontal.
import type { ReactNode } from "react";
import { horaCortaDeColombia } from "@ps/dominio/fecha/colombia";
import { listarVigencia } from "@ps/infra/postgres/estado-perfil";
import { contarPeticionesPendientes } from "@ps/infra/postgres/invitaciones-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import type { SesionVerificada } from "../sesion/exigirSesion";
import { BotonSalir } from "./BotonSalir";
import { MENU_PANEL, ROL_ETIQUETA, iniciales } from "./menu";

function Icono({ d }: { d: string }) {
  return (
    <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export async function MarcoPanel({
  sesion,
  activo,
  migas,
  children,
}: {
  sesion: SesionVerificada;
  activo?: string;
  migas: Array<string | { texto: string; href: string }>;
  children: ReactNode;
}) {
  const bd = poolDe("panel");
  const [peticiones, vigencia] = await Promise.all([contarPeticionesPendientes(bd), listarVigencia(bd)]);
  const conteos: Record<string, number> = {
    peticiones,
    vigencia: vigencia.porConfirmar.length + vigencia.porRevisar.length + vigencia.pausados.length,
  };
  return (
    <div className="pp-panel">
      <nav className="pp-sidebar" aria-label="Panel de People Service">
        <div className="pp-sidebar__marca">
          <svg className="pp-simbolo" viewBox="0 0 32 32" aria-hidden="true">
            <circle className="pp-simbolo__base" cx="16" cy="16" r="14" />
            <path className="pp-simbolo__linea" d="M7.5 20c4-9 11 3 17-8" />
            <circle className="pp-simbolo__nodo" cx="7.5" cy="20" r="2.4" />
            <circle className="pp-simbolo__nodo" cx="24.5" cy="12" r="2.4" />
          </svg>
          <span>
            <span className="pp-sidebar__titulo">Panel de People Service</span>
            <span className="pp-sidebar__sub">Talento Humano</span>
          </span>
        </div>
        {MENU_PANEL.map((seccion) => (
          <div key={seccion.titulo} className="mp-seccion">
            <p className="pp-sidebar__seccion">{seccion.titulo}</p>
            {seccion.destinos.map((d) =>
              d.ruta ? (
                <a
                  key={d.clave}
                  className="pp-sidelink"
                  href={d.ruta}
                  aria-current={d.clave === activo ? "page" : undefined}
                >
                  <Icono d={d.icono} />
                  {d.etiqueta}
                  {conteos[d.clave] ? (
                    <span className="pp-sidelink__conteo">
                      {conteos[d.clave]}
                      <span className="pp-sr"> pendientes</span>
                    </span>
                  ) : null}
                </a>
              ) : (
                <a key={d.clave} className="pp-sidelink mp-sidelink--inactivo" aria-disabled="true">
                  <Icono d={d.icono} />
                  {d.etiqueta}
                  <span className="pp-sr"> (aún no disponible)</span>
                </a>
              ),
            )}
          </div>
        ))}
        <a
          className="pp-sidebar__pie pp-sidebar__pie--enlace"
          href="/administracion"
          aria-current={activo === "administracion" ? "page" : undefined}
          aria-label={`Administración · ${ROL_ETIQUETA[sesion.rol]} · sesión hasta las ${horaCortaDeColombia(sesion.hasta)}`}
        >
          <span className="pp-avatar" aria-hidden="true">
            {iniciales(sesion.correo)}
          </span>
          <span className="pp-persona">
            <span className="pp-persona__nombre">{ROL_ETIQUETA[sesion.rol]}</span>
            <span className="pp-persona__area">{`Sesión hasta las ${horaCortaDeColombia(sesion.hasta)}`}</span>
          </span>
        </a>
      </nav>
      <div className="pp-panel__cuerpo">
        <header className="pp-panel__topbar">
          <ol className="pp-migas">
            {migas.map((m, i) => {
              const texto = typeof m === "string" ? m : m.texto;
              return (
                <li key={texto} aria-current={i === migas.length - 1 ? "page" : undefined}>
                  {typeof m === "string" || i === migas.length - 1 ? texto : <a href={m.href}>{texto}</a>}
                </li>
              );
            })}
          </ol>
          <div className="pp-panel__herramientas">
            <span className="pp-meta">{sesion.correo}</span>
            <BotonSalir />
          </div>
        </header>
        <main className="pp-panel__contenido" id="contenido">
          {children}
        </main>
      </div>
    </div>
  );
}
