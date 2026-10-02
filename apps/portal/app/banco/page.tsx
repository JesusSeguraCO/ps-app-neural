// «Buscar»: el banco completo publicado (HU-094, HU-093; prototipo app-shell--sin-seleccion y
// encuadre-sin-seleccion--opcion-sin-perfiles). Protegida: la guarda va en la primera línea (H5).
// Filtra por UNA opción (categoría, rol o las categorías de la selección); si la opción no tiene
// perfiles hoy, vuelve al encuadre con el aviso y la salida de ampliar. «Volver a la selección» solo si
// el enlace trae selección. El buscador de texto es de EP-002.
import { aplicarFiltro, filtroDeConsulta } from "@ps/dominio/catalogo/encuadre";
import { categoriasDeSeleccion } from "@ps/dominio/enlaces/seleccion";
import { conFicha, recorrido } from "@ps/dominio/catalogo/recorrido";
import { datosDelBanco, datosDelEnlace, fichaDe } from "../../src/banco/datos";
import { Encuadre } from "../../src/banco/Encuadre";
import { PanelFicha } from "../../src/ficha/PanelFicha";
import { MarcoPortal } from "../../src/marco/MarcoPortal";
import { TarjetaPerfil } from "../../src/seleccion/TarjetaPerfil";
import { exigirSesion } from "../../src/sesion/exigirSesion";
import "../aterrizaje.css";
import "../banco.css";
import "@ps/ui/ficha.css";
import "../ficha.css";

export default async function Banco({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await exigirSesion();
  const [{ aterrizaje: a, equipo }, banco, consulta] = await Promise.all([
    datosDelEnlace(sesion),
    datosDelBanco(sesion),
    searchParams,
  ]);
  const conSeleccion = a.seleccion.items.length > 0;
  const filtro = filtroDeConsulta(consulta);
  const contexto = filtro.tipo === "contexto" ? categoriasDeSeleccion(a.seleccion.items) : [];
  const perfiles = aplicarFiltro(banco.perfiles, filtro, contexto);
  const marco = {
    cuenta: a.cuenta,
    proyecto: a.proyecto,
    accesoHasta: a.vigenteHasta,
    enEquipo: equipo.perfiles.length,
    conSeleccion,
    activo: "buscar" as const,
  };

  if (filtro.tipo !== "todo" && perfiles.length === 0) {
    const nombre = filtro.tipo === "contexto" ? "las categorías de tu selección" : filtro.valor;
    return (
      <MarcoPortal {...marco}>
        <Encuadre taxonomia={banco.taxonomia} total={banco.perfiles.length} sinPerfiles={nombre} />
      </MarcoPortal>
    );
  }

  const familias = banco.taxonomia.filter((c) => c.n > 0);
  // La ficha abierta (HU-120): solo de un perfil de esta lista filtrada, recorrida en su orden.
  const href = (c: string | null) => conFicha("/banco", consulta, c);
  const pedida = typeof consulta.ficha === "string" ? consulta.ficha : undefined;
  const paso = recorrido(
    perfiles.map((x) => x.codigo),
    pedida,
  );
  const ficha = paso ? await fichaDe(sesion, pedida!) : null;
  const pagina = (
    <MarcoPortal {...marco}>
      <header className="as-cabecera">
        <div className="as-cabecera__texto">
          <h1>Buscar perfiles</h1>
          <p className="as-firma">
            <span className="pp-mono">{banco.perfiles.length}</span> perfiles publicados en el banco de People Service
          </p>
          {filtro.tipo !== "todo" && (
            <div className="as-filtro">
              <ul className="pp-chips" aria-label="Filtro aplicado">
                {(filtro.tipo === "contexto" ? contexto : [filtro.valor]).map((v) => (
                  <li className="pp-chip pp-chip--deseable" key={v}>
                    <span className="pp-chip__valor">{v}</span>
                    <span className="pp-chip__modo">{filtro.tipo === "rol" ? "rol" : "categoría"}</span>
                  </li>
                ))}
              </ul>
              <a className="pp-enlace" href="/banco">
                Ver el banco completo
              </a>
            </div>
          )}
        </div>
        {conSeleccion && (
          <div className="as-cabecera__acciones">
            <a className="pp-btn pp-btn--contorno" href="/">
              Volver a la selección
            </a>
          </div>
        )}
      </header>
      <div className="as-contexto pp-con-lateral">
        <section className="as-lista" aria-labelledby="as-lista-t">
          <div className="pp-seccion__cabecera">
            <h2 className="as-subtitulo" id="as-lista-t">
              {filtro.tipo === "todo" ? `Los ${perfiles.length} perfiles` : `${perfiles.length} de ${banco.perfiles.length} perfiles`}
            </h2>
          </div>
          <ul className="pp-rejilla-perfiles pp-lista" aria-label="Perfiles publicados">
            {perfiles.map((perfil) => (
              <li key={perfil.codigo}>
                <TarjetaPerfil
                  item={{ codigo: perfil.codigo, tipo: "disponible", perfil }}
                  ficha={{ href: href(perfil.codigo), abierta: Boolean(ficha) && perfil.codigo === pedida }}
                />
              </li>
            ))}
          </ul>
        </section>
        <aside aria-labelledby="as-familias-t">
          <h2 className="as-subtitulo" id="as-familias-t">
            En el banco
          </h2>
          <dl className="as-familias">
            {familias.map((c) => (
              <div className="as-familias__fila" key={c.categoria}>
                <dt>
                  <a className="pp-enlace pp-enlace--sutil" href={`/banco?categoria=${encodeURIComponent(c.categoria)}`}>
                    {c.categoria}
                  </a>
                </dt>
                <dd>{c.n}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </MarcoPortal>
  );
  if (!paso || !ficha) return pagina;
  const lista = filtro.tipo === "todo" ? "banco de perfiles" : `banco · ${filtro.tipo === "contexto" ? "tu selección" : filtro.valor}`;
  return (
    <>
      <div inert>{pagina}</div>
      <PanelFicha ficha={ficha} recorrido={paso} lista={lista} href={href} />
    </>
  );
}
