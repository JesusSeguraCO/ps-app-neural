// Peticiones de invitación (HU-145; prototipo peticiones-invitacion y variantes). Protegida: la guarda va
// en la primera línea. Pendientes con quién pide, en qué enlace y para qué; aviso de dominio distinto;
// marcadas y sin «Aprobar» si el enlace venció o se revocó; «ya tiene acceso» si el correo ya está
// invitado. A la derecha, las últimas decisiones. La auditoría completa llega con su épica.
import { puede } from "@ps/dominio/acceso/permisos";
import { horaDeColombia } from "@ps/dominio/fecha/colombia";
import { listarPeticiones } from "@ps/infra/postgres/invitaciones-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import { DecidirPeticion } from "../../src/peticiones/DecidirPeticion";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./peticiones.css";

const dia = (d: Date) => horaDeColombia(d).split(", ")[0]!.replace(/ \d{4}$/, "");

export default async function Peticiones() {
  const sesion = await exigirSesion();
  const { pendientes, resueltas, recientes } = await listarPeticiones(poolDe("panel"));
  const decide = puede(sesion.rol, "invitaciones.decidir");
  const antigua = pendientes.at(-1);
  return (
    <MarcoPanel sesion={sesion} activo="peticiones" migas={["Clientes", "Peticiones de invitación"]}>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Peticiones de invitación</h1>
          <p className="pp-encabezado__meta">
            {pendientes.length === 0
              ? "Sin peticiones pendientes"
              : `${pendientes.length} ${pendientes.length === 1 ? "pendiente" : "pendientes"} · la más antigua, ${dia(antigua!.pedidaEn)}`}
          </p>
        </div>
      </div>
      <div className="pp-pestanas" role="tablist" aria-label="Estado de las peticiones">
        <span className="pp-pestana" role="tab" aria-selected="true">
          Pendientes <span className="pp-pestana__conteo">{pendientes.length}</span>
        </span>
        <span className="pp-pestana" role="tab" aria-selected="false">
          Resueltas <span className="pp-pestana__conteo">{resueltas}</span>
        </span>
      </div>
      <div className="pp-con-lateral pi-cuerpo">
        <ul className="pp-filas" aria-label="Peticiones pendientes">
          {pendientes.length === 0 && <li className="pp-vacio">No hay peticiones pendientes.</li>}
          {pendientes.map((p) => (
            <li className="pp-fila" key={p.id}>
              <div className="pp-fila__principal">
                <p className="pp-fila__titulo">
                  <span>{p.nombre ?? p.correo}</span> {p.nombre && <span className="pp-fila__sub">{p.correo}</span>}
                </p>
                <p className="pp-fila__meta">
                  {`Pide ${p.pideCorreo} · `}
                  <a className="pp-enlace pp-enlace--sutil" href={`/enlaces?enlace=${p.enlace.codigo}`}>
                    {p.enlace.proyecto ? `${p.enlace.cuenta} · ${p.enlace.proyecto}` : p.enlace.cuenta}
                  </a>
                  {` · ${horaDeColombia(p.pedidaEn)}`}
                </p>
                {p.paraQue && (
                  <p className="pp-fila__nota">
                    <q className="pi-cita">{p.paraQue}</q>
                  </p>
                )}
                {p.dominioDistinto && p.marca === null && (
                  <p className="pp-fila__meta">
                    <span className="pp-estado pp-estado--warn">Dominio distinto al de quien pide</span>
                  </p>
                )}
                {(p.marca === "enlace_vencido" || p.marca === "enlace_revocado") && (
                  <p className="pp-fila__meta">
                    <span className={`pp-estado ${p.marca === "enlace_revocado" ? "pp-estado--danger" : "pp-estado--warn"}`}>
                      {`${p.marca === "enlace_revocado" ? "Enlace revocado el" : "Enlace vencido el"} ${dia(p.enlace.desde!)}`}
                    </span>
                    {" · No se puede aprobar mientras el enlace no esté vigente."}
                  </p>
                )}
                {p.marca === "ya_invitado" && (
                  <p className="pp-fila__meta">
                    <span className="pp-estado pp-estado--ok">Ya tiene acceso a este enlace</span>
                  </p>
                )}
              </div>
              {decide && (
                <DecidirPeticion
                  id={p.id}
                  persona={p.nombre ?? p.correo}
                  puedeAprobar={p.puedeAprobar}
                  puedeRechazar={p.puedeRechazar}
                  soloCerrar={p.marca === "ya_invitado"}
                />
              )}
            </li>
          ))}
        </ul>
        <aside aria-labelledby="pi-recientes-t">
          <h2 className="pp-seccion__titulo" id="pi-recientes-t">
            Últimas decisiones
          </h2>
          <ul className="pi-recientes">
            {recientes.map((d, i) => (
              <li key={i} className="pi-texto">
                <span className="pp-meta">{horaDeColombia(d.resueltaEn)}</span>
                <br />
                <strong>{d.estado === "aprobada" ? "Aprobada" : "Rechazada"}</strong>
                {` · ${d.correo} en ${d.enlace}${d.motivo ? `. Motivo: ${d.motivo}` : ""}`}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </MarcoPanel>
  );
}
