// Accesos al panel (HU-151; prototipo admin-accesos y variantes): inscritos activos con su rol, cuándo
// entraron y si tienen una sesión abierta; los dados de baja aparte (no reciben código). Solo la
// administradora: la observadora vuelve al contacto con el aviso de consulta y el intento queda
// registrado (HU-124). Protegida: la guarda va en la primera línea.
import { redirect } from "next/navigation";
import { ETIQUETA_ROL } from "@ps/dominio/acceso/accesos";
import { puede } from "@ps/dominio/acceso/permisos";
import { fechaCivil, momentoDeColombia } from "@ps/dominio/fecha/colombia";
import { listarAccesos, type InscritoPanel } from "@ps/infra/postgres/accesos-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { AccionesAcceso, InscribirCorreo } from "../../../src/administracion/Accesos";
import { PestanasAdministracion } from "../../../src/administracion/Pestanas";
import { AvisoDecision } from "../../../src/marco/Hoja";
import { MarcoPanel } from "../../../src/marco/MarcoPanel";
import { exigirSesion } from "../../../src/sesion/exigirSesion";
import { registrarRechazoDePagina } from "../../../src/sesion/rechazo";
import "../../../src/marco/marco.css";
import "../administracion.css";

function meta(i: InscritoPanel, ahora: Date): string {
  const entrada = i.ultimaEntrada
    ? `Entró ${momentoDeColombia(new Date(i.ultimaEntrada), ahora)}${i.sesionAbierta ? " · sesión abierta" : ""}`
    : i.creadoPor
      ? `inscrito por ${i.creadoPor} · aún no ha entrado`
      : "sin entradas recientes";
  return `${ETIQUETA_ROL[i.rol]} · ${entrada}`;
}

export default async function Accesos() {
  const sesion = await exigirSesion();
  if (!puede(sesion.rol, "accesos.administrar")) {
    await registrarRechazoDePagina(sesion, "accesos.administrar", "/administracion/accesos");
    redirect("/administracion/contacto?rechazado=accesos");
  }
  const ahora = new Date();
  const lista = await listarAccesos(poolDe("panel"));
  const activos = lista.filter((i) => i.activo);
  const bajas = lista.filter((i) => !i.activo);
  const admins = activos.filter((i) => i.rol === "administrador").length;
  const hoyDe = (iso: string) => momentoDeColombia(new Date(iso), ahora).startsWith("hoy");

  return (
    <MarcoPanel
      sesion={sesion}
      activo="administracion"
      migas={["Administración", "Accesos al panel"]}
    >
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Administración</h1>
          <p className="pp-encabezado__meta">
            {`${activos.length} ${activos.length === 1 ? "correo inscrito" : "correos inscritos"} · ${admins} ${admins === 1 ? "administradora" : "administradoras"} de inventario`}
          </p>
        </div>
        <div className="pp-encabezado__acciones">
          <InscribirCorreo />
        </div>
      </div>
      <PestanasAdministracion activa="accesos" accesos={activos.length} />
      <p className="ad-texto">
        Solo entran los correos @trycore.com de esta lista, con un código de un uso. Dar de baja o
        bajar a observador corta la sesión en la siguiente petición.
      </p>
      <section className="ad-grupo" aria-labelledby="ad-activos">
        <div className="pp-seccion__cabecera">
          <h2 className="pp-seccion__titulo" id="ad-activos">
            Inscritos activos
          </h2>
        </div>
        <ul className="pp-filas" aria-labelledby="ad-activos">
          {activos.map((i) => {
            const propio = i.id === sesion.usuarioId;
            return (
              <li className="pp-fila" key={i.id}>
                <div className="pp-fila__principal">
                  <p className="pp-fila__titulo ad-fila-titulo">
                    <span>{i.correo}</span>
                    {propio && <span className="ad-tu">Tú</span>}
                    {!propio && hoyDe(i.creadoEn) && i.creadoPor && (
                      <span className="pp-estado pp-estado--ok">Inscrito hoy</span>
                    )}
                  </p>
                  <p className="pp-fila__meta">{meta(i, ahora)}</p>
                </div>
                <AccionesAcceso
                  inscrito={{
                    id: i.id,
                    correo: i.correo,
                    rol: i.rol,
                    meta: meta(i, ahora),
                    sesionAbierta: i.sesionAbierta,
                    propio,
                    unicaAdministradora: i.rol === "administrador" && admins === 1,
                  }}
                />
              </li>
            );
          })}
        </ul>
      </section>
      {bajas.length > 0 && (
        <section className="ad-grupo" aria-labelledby="ad-bajas">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="ad-bajas">
              Dados de baja
            </h2>
            <span className="pp-meta">
              no reciben código · se les responde como a un correo no inscrito
            </span>
          </div>
          <ul className="pp-filas" aria-labelledby="ad-bajas">
            {bajas.map((i) => (
              <li className="pp-fila" key={i.id}>
                <div className="pp-fila__principal">
                  <p className="pp-fila__titulo ad-fila-titulo">
                    <span>{i.correo}</span>
                  </p>
                  <p className="pp-fila__meta">
                    {`Era ${ETIQUETA_ROL[i.rol].toLowerCase()}${i.dadoDeBajaEn ? ` · baja el ${fechaCivil(new Date(new Date(i.dadoDeBajaEn).getTime() - 5 * 3_600_000).toISOString().slice(0, 10)).replace(/ \d{4}$/, "")}` : ""}${i.actualizadoPor ? ` por ${i.actualizadoPor}` : ""}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      <AvisoDecision />
    </MarcoPanel>
  );
}
