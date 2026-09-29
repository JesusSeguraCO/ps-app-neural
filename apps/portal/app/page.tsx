// Aterrizaje del cliente (HU-144, HU-090; prototipo aterrizaje-curado y variantes). Protegida: la guarda
// va en la primera línea (ADR-0002 H5). En cada apertura se reevalúa el estado de cada perfil del enlace
// (RF-19.2): ninguno se omite y no se deduce ningún filtro de la selección (RF-19.7).
import { enLetras, avisoCambios, resumenFamilias, tituloSeleccion } from "@ps/dominio/enlaces/textos-seleccion";
import { fechaDeColombia } from "@ps/dominio/fecha/colombia";
import { poolDe } from "@ps/infra/postgres/pool";
import { aterrizajeDelEnlace } from "@ps/infra/postgres/seleccion";
import { MarcoPortal } from "../src/marco/MarcoPortal";
import { TarjetaPerfil } from "../src/seleccion/TarjetaPerfil";
import { exigirSesion } from "../src/sesion/exigirSesion";
import "./aterrizaje.css";

export default async function Inicio() {
  const sesion = await exigirSesion();
  const a = await aterrizajeDelEnlace(poolDe("portal"), sesion);
  const { items, cambiaron, ningunoPublicado } = a.seleccion;
  const desde = fechaDeColombia(a.generadoEn);
  const aviso = avisoCambios(cambiaron, items.length, desde);
  const familias = resumenFamilias(
    items.map((i) => (i.tipo === "disponible" ? i.perfil.familia : (i.resumen?.familia ?? null))),
  );

  return (
    <MarcoPortal cuenta={a.cuenta} proyecto={a.proyecto} accesoHasta={a.vigenteHasta}>
      <section className="pp-franja ac-franja" aria-labelledby="ac-titulo">
        <h1 className="pp-franja__titulo" id="ac-titulo">
          {tituloSeleccion(items.length, a.cuenta, a.proyecto)}
        </h1>
        <p className="pp-franja__texto">{a.razon}</p>
        <p className="pp-franja__firma">{`Seleccionados el ${desde}`}</p>
      </section>

      {ningunoPublicado && (
        <section className="pp-vacio ac-explorar" aria-labelledby="ac-explorar-t">
          <h2 className="pp-vacio__titulo" id="ac-explorar-t">
            {`Ninguno de los ${enLetras(items.length)} sigue publicado`}
          </h2>
          <p className="pp-vacio__texto">La necesidad sigue en pie. Abre el banco completo para ver quién está disponible hoy.</p>
          <div className="pp-vacio__acciones">
            <a className="pp-btn pp-btn--primario" href="/banco">
              Explorar el banco
            </a>
          </div>
        </section>
      )}

      <section id="seleccion" aria-labelledby="seleccion-t">
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h2 className="pp-encabezado__titulo" id="seleccion-t">
              {`Los ${items.length} perfiles del correo`}
            </h2>
            <p className="pp-encabezado__meta">
              {ningunoPublicado
                ? `En el orden del correo del ${desde}, cada uno con su estado de hoy`
                : [familias, `en el orden del correo del ${desde}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          {!ningunoPublicado && (
            <div className="pp-encabezado__acciones">
              <a className="pp-btn pp-btn--contorno" href="/banco">
                Ampliar la búsqueda al banco
              </a>
            </div>
          )}
        </div>
        {aviso && (
          <div className="pp-aviso pp-aviso--warn ac-aviso" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              !
            </span>
            <p>
              <span className="pp-aviso__titulo">{aviso.titulo}</span>
              {aviso.texto}
            </p>
          </div>
        )}
        <ol className="pp-rejilla-perfiles pp-lista" aria-label="Perfiles de la selección, en el orden del correo">
          {items.map((item) => (
            <li key={item.codigo}>
              <TarjetaPerfil item={item} />
            </li>
          ))}
        </ol>
      </section>
    </MarcoPortal>
  );
}
