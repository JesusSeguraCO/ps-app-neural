// Aterrizaje del cliente (HU-144, HU-090; prototipo aterrizaje-curado y variantes). Protegida: la guarda
// va en la primera línea (ADR-0002 H5). En cada apertura se reevalúa el estado de cada perfil del enlace
// (RF-19.2): ninguno se omite y no se deduce ningún filtro de la selección (RF-19.7).
import { categoriasDeSeleccion } from "@ps/dominio/enlaces/seleccion";
import { enLetras, avisoCambios, resumenFamilias, tituloSeleccion } from "@ps/dominio/enlaces/textos-seleccion";
import { fechaDeColombia } from "@ps/dominio/fecha/colombia";
import { conFicha, recorrido } from "@ps/dominio/catalogo/recorrido";
import { datosDelBanco, datosDelEnlace, fichaDe } from "../src/banco/datos";
import { Encuadre } from "../src/banco/Encuadre";
import { PanelFicha } from "../src/ficha/PanelFicha";
import { MarcoPortal } from "../src/marco/MarcoPortal";
import { TarjetaPerfil } from "../src/seleccion/TarjetaPerfil";
import { exigirSesion } from "../src/sesion/exigirSesion";
import "./aterrizaje.css";
import "./banco.css";
import "@ps/ui/ficha.css";
import "./ficha.css";

export default async function Inicio({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await exigirSesion();
  const [{ aterrizaje: a, equipo }, consulta] = await Promise.all([datosDelEnlace(sesion), searchParams]);
  const { items, cambiaron, ningunoPublicado } = a.seleccion;
  const marco = { cuenta: a.cuenta, proyecto: a.proyecto, accesoHasta: a.vigenteHasta, enEquipo: equipo.perfiles.length };

  // Enlace sin selección: la pregunta de encuadre antes del listado (HU-093).
  if (items.length === 0) {
    const banco = await datosDelBanco(sesion);
    return (
      <MarcoPortal {...marco} conSeleccion={false} activo="buscar">
        <Encuadre taxonomia={banco.taxonomia} total={banco.perfiles.length} />
      </MarcoPortal>
    );
  }
  const enviado = fechaDeColombia(a.generadoEn);
  const desde = enviado.replace(/ \d{4}$/, ""); // «22 sep», como el prototipo
  const aviso = avisoCambios(cambiaron, items.length, desde);
  // La ficha abierta (HU-120): solo de un perfil disponible de esta selección, recorrida en su orden.
  const href = (c: string | null) => conFicha("/", consulta, c);
  const disponibles = items.flatMap((i) => (i.tipo === "disponible" ? [i.codigo] : []));
  const pedida = typeof consulta.ficha === "string" ? consulta.ficha : undefined;
  const paso = recorrido(disponibles, pedida);
  const ficha = paso ? await fichaDe(sesion, pedida!) : null;
  const familias = resumenFamilias(
    items.map((i) => (i.tipo === "disponible" ? i.perfil.familia : (i.resumen?.familia ?? null))),
  );

  const pagina = (
    <MarcoPortal {...marco} conSeleccion activo="seleccion">
      <section className="pp-franja ac-franja" aria-labelledby="ac-titulo">
        <h1 className="pp-franja__titulo" id="ac-titulo">
          {tituloSeleccion(items.length, a.cuenta, a.proyecto)}
        </h1>
        <p className="pp-franja__texto">{a.razon}</p>
        <p className="pp-franja__firma">{`Seleccionados el ${enviado}`}</p>
      </section>

      {ningunoPublicado && (
        <section className="pp-vacio ac-explorar" aria-labelledby="ac-explorar-t">
          <h2 className="pp-vacio__titulo" id="ac-explorar-t">
            {`Ninguno de los ${enLetras(items.length)} sigue publicado`}
          </h2>
          <p className="pp-vacio__texto">
            {`La necesidad sigue en pie. Abre el banco con lo que ya sabemos de ${a.proyecto ?? "tu selección"}:`}
          </p>
          <ul className="pp-chips" aria-label="Contexto que se aplica al explorar">
            {categoriasDeSeleccion(items).map((c) => (
              <li className="pp-chip pp-chip--deseable" key={c}>
                <span className="pp-chip__valor">{c}</span>
                <span className="pp-chip__modo">categoría</span>
              </li>
            ))}
          </ul>
          <div className="pp-vacio__acciones">
            <a className="pp-btn pp-btn--primario" href="/banco?contexto=seleccion">
              Explorar el banco con este contexto
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
              <TarjetaPerfil
                item={item}
                ficha={{ href: href(item.codigo), abierta: Boolean(paso) && item.codigo === pedida }}
              />
            </li>
          ))}
        </ol>
      </section>
    </MarcoPortal>
  );
  if (!paso) return pagina;
  return (
    <>
      <div inert>{pagina}</div>
      <PanelFicha ficha={ficha} recorrido={paso} lista="selección para ti" href={href} />
    </>
  );
}
