// «Invitar a un colega» (HU-095; prototipo invitar-colega y variantes). Protegida: la guarda va en la
// primera línea (H5). Muestra el formulario y las peticiones de este invitado con su estado; si alguna
// se rechazó, el motivo y el contacto de Trycore. El colega no entra hasta que se apruebe.
import { fechaDeColombia } from "@ps/dominio/fecha/colombia";
import { peticionesDelInvitado } from "@ps/infra/postgres/invitaciones-cliente";
import { poolDe } from "@ps/infra/postgres/pool";
import { CONTACTO } from "../../src/acceso/Pantallas";
import { datosDelEnlace } from "../../src/banco/datos";
import { FormularioInvitacion } from "../../src/invitar/FormularioInvitacion";
import { MarcoPortal } from "../../src/marco/MarcoPortal";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../acceso.css";
import "../aterrizaje.css";
import "./invitar.css";

const corta = (d: Date) => fechaDeColombia(d).replace(/ \d{4}$/, "");

export default async function Invitar() {
  const sesion = await exigirSesion();
  const [{ aterrizaje: a, equipo }, peticiones] = await Promise.all([
    datosDelEnlace(sesion),
    peticionesDelInvitado(poolDe("portal"), sesion),
  ]);
  const rechazada = peticiones.find((p) => p.estado === "rechazada");
  return (
    <MarcoPortal
      cuenta={a.cuenta}
      proyecto={a.proyecto}
      accesoHasta={a.vigenteHasta}
      enEquipo={equipo.perfiles.length}
      conSeleccion={a.seleccion.items.length > 0}
      activo="invitar"
    >
      <div className="ic-columna">
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">Invitar a un colega</h1>
          </div>
        </div>
        {rechazada && (
          <div className="pp-aviso pp-aviso--danger" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              ×
            </span>
            <p>
              <span className="pp-aviso__titulo">{`Talento Humano no aprobó la invitación de ${rechazada.nombre ?? rechazada.correo}.`}</span>
              {`Esa persona sigue sin acceso. Motivo: «${rechazada.motivo}»`}
              <span className="ic-aviso__linea">
                {"Si tienes dudas, escribe a People Service: "}
                <span className="ic-aviso__correo">{CONTACTO}</span>
              </span>
            </p>
          </div>
        )}
        <section className="pp-tarjeta" aria-labelledby="ic-form-titulo">
          <h2 className="pp-sr" id="ic-form-titulo">
            Datos de tu colega
          </h2>
          <FormularioInvitacion />
        </section>
        {peticiones.length > 0 && (
          <section className="ic-peticiones" aria-labelledby="ic-peticiones-titulo">
            <div className="pp-seccion__cabecera">
              <h2 className="pp-seccion__titulo" id="ic-peticiones-titulo">
                Tus peticiones
              </h2>
              <span className="pp-meta">{peticiones.length}</span>
            </div>
            <ul className="pp-filas">
              {peticiones.map((p) => (
                <li className="pp-fila" key={p.id}>
                  <div className="pp-fila__principal">
                    <p className="pp-fila__titulo">{p.nombre ?? p.correo}</p>
                    {p.nombre && (
                      <p className="pp-fila__sub" title={p.correo}>
                        {p.correo}
                      </p>
                    )}
                    <p className="pp-fila__meta">{`Pedida el ${fechaDeColombia(p.pedidaEn)}`}</p>
                  </div>
                  <div className="pp-fila__acciones">
                    {p.estado === "pendiente" && <span className="pp-estado pp-estado--neutro">Pendiente</span>}
                    {p.estado === "aprobada" && <span className="pp-estado pp-estado--ok">{`Aprobada · ${corta(p.resueltaEn!)}`}</span>}
                    {p.estado === "rechazada" && <span className="pp-estado pp-estado--danger">{`No aprobada · ${corta(p.resueltaEn!)}`}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </MarcoPortal>
  );
}
