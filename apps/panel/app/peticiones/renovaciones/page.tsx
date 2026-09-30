// Renovaciones de enlace (HU-146): cada vez que alguien pide un enlace nuevo porque el suyo venció, con
// quién (el correo que escribió, esté o no invitado), de qué enlace, cuándo y en qué quedó. Protegida: la
// guarda va en la primera línea. Vive bajo «Peticiones» sin tocar el menú canónico de doce destinos.
import { puede } from "@ps/dominio/acceso/permisos";
import { momentoDeColombia } from "@ps/dominio/fecha/colombia";
import { poolDe } from "@ps/infra/postgres/pool";
import { listarRenovaciones } from "@ps/infra/postgres/renovaciones-panel";
import { AvisoDecision } from "../../../src/marco/Hoja";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { FilaRenovacion } from "../../../src/peticiones/FilaRenovacion";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import "../../../src/marco/marco.css";
import "../peticiones.css";

export default async function Renovaciones() {
  const sesion = await exigirSesion();
  const ahora = new Date();
  const filas = await listarRenovaciones(poolDe("panel"));
  const revoca = puede(sesion.rol, "enlaces.revocar");
  const noInvitados = filas.filter((f) => f.estado === "no_invitado").length;
  return (
    <MarcoPanel
      sesion={sesion}
      activo="peticiones"
      migas={["Clientes", { texto: "Peticiones", href: "/peticiones" }, "Renovaciones de enlace"]}
    >
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Renovaciones de enlace</h1>
          <p className="pp-encabezado__meta">
            {filas.length === 0
              ? "Nadie ha pedido un enlace nuevo todavía"
              : `${filas.length} ${filas.length === 1 ? "petición" : "peticiones"} · la última, ${momentoDeColombia(filas[0]!.pedidaEn, ahora)}${noInvitados ? ` · ${noInvitados} de alguien no invitado` : ""}`}
          </p>
        </div>
        <div className="pp-encabezado__acciones">
          <a className="pp-btn pp-btn--contorno" href="/peticiones">
            Peticiones de invitación
          </a>
        </div>
      </div>
      <p className="pi-texto pi-cuerpo">
        Cuando un enlace vence, quien estaba invitado puede pedir uno nuevo y le llega solo a su
        buzón. Cada petición llega también por correo a Talento Humano. Si esa persona ya no debería
        ver la selección, revoca el enlace nuevo.
      </p>
      <div className="pi-cuerpo">
        {filas.length === 0 ? (
          <div className="pp-vacio">
            <h2>No hay renovaciones</h2>
            <p>
              Cuando alguien pida un enlace nuevo desde un enlace vencido, la petición aparece aquí.
            </p>
          </div>
        ) : (
          <ul className="pp-filas" aria-label="Renovaciones de enlace">
            {filas.map((f) => (
              <FilaRenovacion
                key={f.id}
                revoca={revoca}
                r={{
                  id: f.id,
                  correo: f.correo,
                  pedida: momentoDeColombia(f.pedidaEn, ahora),
                  cuenta: f.cuenta,
                  enlaceTitulo: f.proyecto ? `${f.cuenta} · ${f.proyecto}` : f.cuenta,
                  enlaceVencido: f.enlaceVencido,
                  enlaceNuevo: f.enlaceNuevo,
                  estado: f.estado,
                }}
              />
            ))}
          </ul>
        )}
      </div>
      <AvisoDecision />
    </MarcoPanel>
  );
}
