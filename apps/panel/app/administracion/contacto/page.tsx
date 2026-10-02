// Contacto de Trycore (HU-147; prototipos admin-contacto, --correo-externo y --observador): a quién escribe
// el cliente cuando tiene dudas, un solo contacto para todo el portal. La administradora lo edita; la
// observadora lo ve en lectura, sin controles (y si llegó por la dirección de Accesos, se le dice que el
// intento quedó registrado). Al lado, cómo lo verá el cliente y los cambios auditados. Protegida: la
// guarda va en la primera línea.
import { textoContacto, type ContactoTrycore as Contacto } from "@ps/dominio/contacto/contacto";
import { puede } from "@ps/dominio/acceso/permisos";
import { momentoCortoDeColombia, momentoDeColombia } from "@ps/dominio/fecha/colombia";
import { listarAccesos } from "@ps/infra/postgres/accesos-panel";
import { historialContacto, leerContactoPanel } from "@ps/infra/postgres/contacto";
import { poolDe } from "@ps/infra/postgres/pool";
import { ContactoTrycore } from "@ps/ui/ContactoTrycore";
import { FormularioContacto } from "../../../src/administracion/Contacto";
import { PestanasAdministracion } from "../../../src/administracion/Pestanas";
import { clavesAuditoria } from "../../../src/inventario/api";
import { AvisoDecision } from "../../../src/marco/Hoja";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import "../../../src/marco/marco.css";
import "../administracion.css";

export const dynamic = "force-dynamic";

const PANTALLAS = [
  "Invitación rechazada",
  "Enlace revocado",
  "«Abre tu enlace»",
  "Intentos agotados en la puerta",
  "«Recibimos tu petición»",
];

// «Eida Tinjacá, Coordinación de Servicio» o el correo en monoespaciado «sin nombre ni cargo» (prototipo).
function Describir({ c }: { c: Contacto }) {
  const quien = [c.nombre, c.cargo].filter(Boolean).join(", ");
  return quien ? (
    <>
      {`${quien} · `}
      <span className="pp-mono">{c.direccion}</span>
    </>
  ) : (
    <>
      <span className="pp-mono">{c.direccion}</span> sin nombre ni cargo
    </>
  );
}

function VistaCliente({ contacto }: { contacto: Contacto }) {
  return (
    <section aria-labelledby="ad-vista-t">
      <div className="pp-seccion__cabecera">
        <h2 className="pp-seccion__titulo" id="ad-vista-t">
          Así lo verá el cliente
        </h2>
      </div>
      <div className="ad-vista">
        <p className="pp-meta">¿Dudas sobre tu enlace?</p>
        <p className="ad-vista__frase" aria-label={textoContacto(contacto)}>
          {!contacto.nombre && !contacto.cargo && "escribe a "}
          <ContactoTrycore contacto={contacto} claseCorreo="" />
        </p>
      </div>
      <p className="pp-ayuda">Sale en las pantallas de contacto del portal:</p>
      <ul className="ad-lista">
        {PANTALLAS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function ContactoAdministracion({
  searchParams,
}: {
  searchParams: Promise<{ rechazado?: string }>;
}) {
  const sesion = await exigirSesion();
  const { rechazado } = await searchParams;
  const escribe = puede(sesion.rol, "contacto.escribir");
  const bd = poolDe("panel");
  const ahora = new Date();
  const [vigente, historial, accesos] = await Promise.all([
    leerContactoPanel(bd),
    historialContacto(bd, clavesAuditoria().kek),
    puede(sesion.rol, "accesos.administrar") ? listarAccesos(bd) : Promise.resolve(null),
  ]);
  const contacto: Contacto = {
    direccion: vigente.direccion,
    nombre: vigente.nombre,
    cargo: vigente.cargo,
  };

  return (
    <MarcoPanel
      sesion={sesion}
      activo="administracion"
      migas={["Administración", "Contacto de Trycore"]}
    >
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Administración</h1>
          <p className="pp-encabezado__meta">
            {escribe
              ? "Lo que el portal muestra y quién entra al panel, sin cambiar código"
              : "Contacto que ve el cliente · solo consulta"}
          </p>
        </div>
      </div>
      <PestanasAdministracion
        activa="contacto"
        accesos={accesos ? accesos.filter((i) => i.activo).length : null}
      />
      {escribe ? (
        <p className="ad-texto">
          A quién escribe el cliente cuando tiene dudas. Hay un solo contacto para todo el portal.
        </p>
      ) : (
        <div className="pp-aviso pp-aviso--info ad-avisos" role="status">
          <span className="pp-aviso__icono" aria-hidden="true">
            i
          </span>
          <p>
            <span className="pp-aviso__titulo">Tu rol es de consulta.</span>
            {rechazado === "accesos"
              ? "Llegaste por la dirección de Accesos al panel: no se cambió nada y el intento quedó en la auditoría. Ves el contacto vigente; lo cambia la administradora de inventario."
              : "Ves el contacto vigente; lo cambia la administradora de inventario."}
          </p>
        </div>
      )}
      <div className="pp-con-lateral">
        {escribe ? (
          <FormularioContacto vigente={contacto} />
        ) : (
          <section className="pp-tarjeta" aria-labelledby="ad-vig-t">
            <div className="pp-seccion__cabecera">
              <h2 className="pp-seccion__titulo" id="ad-vig-t">
                Contacto vigente
              </h2>
            </div>
            <dl className="pp-datos">
              <div className="pp-datos__fila">
                <dt>Nombre</dt>
                <dd>{contacto.nombre ?? "Sin nombre"}</dd>
              </div>
              <div className="pp-datos__fila">
                <dt>Cargo</dt>
                <dd>{contacto.cargo ?? "Sin cargo"}</dd>
              </div>
              <div className="pp-datos__fila">
                <dt>Correo</dt>
                <dd className="pp-mono">{contacto.direccion}</dd>
              </div>
              <div className="pp-datos__fila">
                <dt>Último cambio</dt>
                <dd>
                  {vigente.actualizadoPor && vigente.actualizadoEn
                    ? `${vigente.actualizadoPor} · ${momentoDeColombia(new Date(vigente.actualizadoEn), ahora)}`
                    : "Contacto inicial, sin cambios"}
                </dd>
              </div>
            </dl>
          </section>
        )}
        <aside
          className="ad-lateral"
          aria-label={escribe ? "Vista del cliente y cambios" : "Vista del cliente"}
        >
          <VistaCliente contacto={contacto} />
          {escribe && (
            <section aria-labelledby="ad-hist-t">
              <div className="pp-seccion__cabecera">
                <h2 className="pp-seccion__titulo" id="ad-hist-t">
                  Cambios del contacto
                </h2>
              </div>
              <ul className="pp-actividad">
                {historial.map((c) => (
                  <li className="pp-actividad__item" key={`${c.cuando}|${c.actor}`}>
                    <span className="pp-actividad__hora">
                      {momentoCortoDeColombia(new Date(c.cuando), ahora)}
                    </span>
                    <p className="pp-actividad__texto">
                      <strong>{c.actor}</strong> cambió el contacto: antes{" "}
                      <Describir c={c.antes} />; ahora <Describir c={c.despues} />.
                    </p>
                  </li>
                ))}
                <li className="pp-actividad__item">
                  <span className="pp-actividad__hora">al instalar</span>
                  <p className="pp-actividad__texto">
                    Contacto inicial: <span className="pp-mono">people.service@trycore.com</span>{" "}
                    sin nombre ni cargo.
                  </p>
                </li>
              </ul>
            </section>
          )}
        </aside>
      </div>
      {escribe && <AvisoDecision />}
    </MarcoPanel>
  );
}
