// Peticiones de invitación (HU-145; prototipo peticiones-invitacion y variantes). Protegida: la guarda va
// en la primera línea. Pendientes con quién pide, en qué enlace y para qué; aviso de dominio distinto;
// marcadas y sin «Aprobar» si el enlace venció o se revocó; «ya tiene acceso» si el correo ya está
// invitado. A la derecha, las últimas decisiones; la pestaña «Resueltas» las lista todas. El registro de
// auditoría completo es pantalla de EP-006: «Ver auditoría» se ve deshabilitado hasta entonces.
import { puede } from "@ps/dominio/acceso/permisos";
import {
  diaCortoDeColombia,
  momentoCortoDeColombia,
  momentoDeColombia,
} from "@ps/dominio/fecha/colombia";
import {
  listarDecisiones,
  listarPeticiones,
  type DecisionPanel,
  type PeticionPanel,
} from "@ps/infra/postgres/invitaciones-panel";
import { poolDe } from "@ps/infra/postgres/pool";
import { MarcoPanel } from "../../src/marco/MarcoPanel";
import {
  AvisoDecision,
  FilaPeticion,
  type FilaPeticionDatos,
} from "../../src/peticiones/DecidirPeticion";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../../src/marco/marco.css";
import "./peticiones.css";

const tituloEnlace = (e: { cuenta: string; proyecto: string | null }) =>
  e.proyecto ? `${e.cuenta} · ${e.proyecto}` : e.cuenta;
const conPunto = (t: string) => (/[.!?…]$/.test(t) ? t : `${t}.`);

function datosFila(p: PeticionPanel, ahora: Date): FilaPeticionDatos {
  const este = p.correo.trim().toLowerCase();
  const propio = p.invitados?.find((i) => i.correo.trim().toLowerCase() === este);
  return {
    id: p.id,
    persona: p.nombre ?? p.correo,
    nombre: p.nombre,
    correo: p.correo,
    pide: p.pideCorreo,
    enlace: { codigo: p.enlace.codigo, titulo: tituloEnlace(p.enlace), cuenta: p.enlace.cuenta },
    pedida: momentoDeColombia(p.pedidaEn, ahora),
    paraQue: p.paraQue,
    dominioDistinto: p.dominioDistinto,
    marca: p.marca,
    enlaceNoVigenteDesde: p.enlace.desde ? diaCortoDeColombia(p.enlace.desde) : null,
    puedeAprobar: p.puedeAprobar,
    puedeRechazar: p.puedeRechazar,
    yaInvitado: p.invitados
      ? {
          desde: propio ? diaCortoDeColombia(propio.desde) : null,
          invitados: p.invitados.map((i) => ({
            correo: i.correo,
            detalle:
              i.origen === "invitacion_aprobada"
                ? `Aprobado el ${diaCortoDeColombia(i.desde)}`
                : "Añadido al generar el enlace",
            esEste: i === propio,
          })),
        }
      : null,
  };
}

function quienDecidio(d: DecisionPanel, usuarioId: string): string {
  const propia = d.resueltaPor.id === usuarioId;
  if (d.estado === "aprobada") return propia ? "Aprobaste" : `Aprobó ${d.resueltaPor.correo}`;
  return propia ? "Rechazaste" : `Rechazó ${d.resueltaPor.correo}`;
}

export default async function Peticiones({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const sesion = await exigirSesion();
  const vista = (await searchParams).vista === "resueltas" ? "resueltas" : "pendientes";
  const ahora = new Date();
  const bd = poolDe("panel");
  const { pendientes, resueltas, recientes } = await listarPeticiones(bd, ahora);
  const decisiones = vista === "resueltas" ? await listarDecisiones(bd) : [];
  const decide = puede(sesion.rol, "invitaciones.decidir");
  const antigua = pendientes.at(-1);
  return (
    <MarcoPanel
      sesion={sesion}
      activo="peticiones"
      migas={["Clientes", "Peticiones de invitación"]}
    >
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Peticiones de invitación</h1>
          <p className="pp-encabezado__meta">
            {pendientes.length === 0
              ? "Sin peticiones pendientes"
              : `${pendientes.length} ${pendientes.length === 1 ? "pendiente" : "pendientes"} · la más antigua, ${diaCortoDeColombia(antigua!.pedidaEn)}`}
          </p>
        </div>
        <div className="pp-encabezado__acciones">
          <a className="pp-btn pp-btn--contorno" aria-disabled="true">
            Ver auditoría<span className="pp-sr"> (aún no disponible)</span>
          </a>
        </div>
      </div>
      <nav className="pp-pestanas" aria-label="Estado de las peticiones">
        <a
          className="pp-pestana"
          href="/peticiones"
          aria-current={vista === "pendientes" ? "page" : undefined}
        >
          Pendientes <span className="pp-pestana__conteo">{pendientes.length}</span>
        </a>
        <a
          className="pp-pestana"
          href="/peticiones?vista=resueltas"
          aria-current={vista === "resueltas" ? "page" : undefined}
        >
          Resueltas <span className="pp-pestana__conteo">{resueltas}</span>
        </a>
      </nav>
      <div className="pp-con-lateral pi-cuerpo">
        {vista === "pendientes" ? (
          pendientes.length === 0 ? (
            <div className="pp-vacio">
              <h2>No hay peticiones pendientes</h2>
              <p>Cuando alguien invitado pida sumar a un colega, su petición aparece aquí.</p>
            </div>
          ) : (
            <ul className="pp-filas" aria-label="Peticiones pendientes">
              {pendientes.map((p) => (
                <FilaPeticion key={p.id} p={datosFila(p, ahora)} decide={decide} />
              ))}
            </ul>
          )
        ) : decisiones.length === 0 ? (
          <div className="pp-vacio">
            <h2>Todavía no hay peticiones resueltas</h2>
            <p>Las que apruebes o rechaces quedan aquí, con quién decidió y cuándo.</p>
          </div>
        ) : (
          <ul className="pp-filas" aria-label="Peticiones resueltas">
            {decisiones.map((d) => (
              <li className="pp-fila" key={d.id}>
                <div className="pp-fila__principal">
                  <p className="pp-fila__titulo">
                    <span>{d.nombre ?? d.correo}</span>{" "}
                    {d.nombre && <span className="pp-fila__sub">{d.correo}</span>}
                  </p>
                  <p className="pp-fila__meta">
                    {`Pide ${d.pideCorreo} · `}
                    <a className="pi-enlace" href={`/enlaces?enlace=${d.enlace.codigo}`}>
                      {tituloEnlace(d.enlace)}
                    </a>
                    {" · "}
                    <span className="pi-hora">{momentoDeColombia(d.pedidaEn, ahora)}</span>
                  </p>
                  {d.paraQue && (
                    <p className="pp-fila__nota">
                      <q className="pi-cita">{d.paraQue}</q>
                    </p>
                  )}
                  <p className="pp-fila__meta">
                    <span
                      className={`pp-estado ${d.estado === "aprobada" ? "pp-estado--ok" : "pp-estado--danger"}`}
                    >
                      {d.estado === "aprobada" ? "Aprobada" : "Rechazada"}
                    </span>
                    {` · por ${d.resueltaPor.id === sesion.usuarioId ? "ti" : d.resueltaPor.correo} · ${momentoDeColombia(d.resueltaEn, ahora)}`}
                  </p>
                  {d.motivo && <p className="pp-fila__nota">{`Motivo: ${conPunto(d.motivo)}`}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <aside className="pp-seccion" aria-labelledby="pi-ult">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="pi-ult">
              Últimas decisiones
            </h2>
            {recientes.length > 0 && (
              <a className="pp-enlace pp-meta" href="/peticiones?vista=resueltas">
                Ver todas
              </a>
            )}
          </div>
          {recientes.length === 0 ? (
            <p className="pi-texto">Aún no has aprobado ni rechazado ninguna petición.</p>
          ) : (
            <ol className="pp-actividad">
              {recientes.map((d) => (
                <li className="pp-actividad__item" key={d.id}>
                  <time className="pp-meta pi-hora" dateTime={d.resueltaEn.toISOString()}>
                    {momentoCortoDeColombia(d.resueltaEn, ahora)}
                  </time>
                  <p className="pp-actividad__texto">
                    <strong>{quienDecidio(d, sesion.usuarioId)}</strong>
                    {` a ${d.nombre ?? d.correo} en ${tituloEnlace(d.enlace)}${d.motivo ? `. Motivo: ${conPunto(d.motivo)}` : ""}`}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
      <AvisoDecision />
    </MarcoPanel>
  );
}
