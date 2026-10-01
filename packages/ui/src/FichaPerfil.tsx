// Ficha del perfil (patrón PP:hoja del prototipo ficha-perfil / vista-previa-ficha; RF-3.2, RF-3.12;
// HU-129, HU-130). Un solo componente para el portal y la vista previa del panel: dibuja lo que
// `armarFicha` deja y nada más. Lo verificado por Trycore va en su bloque teñido; lo declarado, sin
// caja (RF-3.12). Un bloque opcional sin datos no se dibuja —ni título ni hueco—. La validación es
// el enunciado de Nivel 0 de la modalidad de prueba mientras no haya reporte detallado.
//
// `marcas` solo lo pasa la vista previa: numera cada bloque obligatorio incompleto y nombra el dato
// que falta. El portal nunca lo pasa (un publicado está completo).
import type { ReactNode } from "react";
import type { BloqueFicha, FichaEnEdicion } from "@ps/contratos/ficha";
import { DISPONIBILIDAD_CLIENTE } from "@ps/dominio/enlaces/textos-seleccion";

export type MarcasFicha = Partial<Record<BloqueFicha, { numero: number; datos: string[] }>>;

const enMinusculas = (xs: string[]) => xs.map((x) => x.toLowerCase());
const yLista = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}`;
const periodo = (desde: number | null, hasta: number | null) =>
  desde && hasta
    ? desde === hasta
      ? `${desde}`
      : `${desde}–${hasta}`
    : desde
      ? `desde ${desde}`
      : hasta
        ? `hasta ${hasta}`
        : "";

function Falta({ marca }: { marca: { numero: number; datos: string[] } | undefined }) {
  if (!marca) return null;
  return (
    <>
      <span className="vp-num vp-num--bloquea" aria-hidden="true">
        {marca.numero}
      </span>
      <span className="pp-sr">{`Marca ${marca.numero} del panel, impide publicar: `}</span>
      <span className="fp-ausente">{`Falta: ${marca.datos.join(", ").toLowerCase()}`}</span>
    </>
  );
}

function Fila({
  titulo,
  marca,
  id,
  children,
}: {
  titulo: string;
  marca?: { numero: number; datos: string[] };
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`pp-datos__fila${marca ? " vp-marca vp-marca--bloquea" : ""}`} id={id}>
      <dt>{titulo}</dt>
      <dd>{marca ? <Falta marca={marca} /> : children}</dd>
    </div>
  );
}

export function FichaPerfil({
  ficha: f,
  marcas = {},
  cerrar,
  pie,
}: {
  ficha: FichaEnEdicion;
  marcas?: MarcasFicha;
  cerrar?: ReactNode;
  pie?: ReactNode;
}) {
  const persona = [f.nombre, f.primerApellido].filter(Boolean).join(" ");
  const experiencia =
    f.aniosExperiencia === null
      ? null
      : `${f.aniosExperiencia} ${f.aniosExperiencia === 1 ? "año" : "años"} de experiencia${
          f.sectores.length ? `, en ${yLista(enMinusculas(f.sectores))}` : ""
        }`;
  const lugar = [f.modalidad, f.pais, f.ciudad].filter(Boolean).join(" · ");
  return (
    <article className="pp-hoja fp-ficha" aria-labelledby="fp-titulo">
      <header className="pp-hoja__cabecera">
        <h2 id="fp-titulo">{f.rol ?? <Falta marca={marcas.cabecera} />}</h2>
        <p className={`fp-persona${marcas.persona ? " vp-marca vp-marca--bloquea" : ""}`}>
          {marcas.persona ? (
            <Falta marca={marcas.persona} />
          ) : (
            [persona, experiencia].filter(Boolean).join(" · ")
          )}
        </p>
        <div className="fp-linea">
          {marcas.disponibilidad ? (
            <span className="vp-marca vp-marca--bloquea">
              <Falta marca={marcas.disponibilidad} />
            </span>
          ) : (
            <span className="pp-badge pp-badge--banda">
              {DISPONIBILIDAD_CLIENTE[f.disponibilidad]}
            </span>
          )}
          <ul className="pp-perfil__meta" aria-label="Datos del perfil">
            {f.seniority && <li>{f.seniority}</li>}
            {f.modalidad && <li>{f.modalidad}</li>}
            {f.pais && <li>{f.pais}</li>}
            <li className="pp-mono">{f.codigo}</li>
          </ul>
        </div>
        {cerrar}
      </header>
      <div className="pp-hoja__cuerpo">
        {f.resumen && <p className="fp-resumen">{f.resumen}</p>}
        <section className="fp-seccion" aria-labelledby="fp-verificado">
          <div className="pp-seccion__cabecera">
            <h3
              className="pp-seccion__titulo fp-seccion__titulo fp-seccion__titulo--verificado"
              id="fp-verificado"
            >
              Verificado por Trycore
            </h3>
          </div>
          <div className="pp-bloque pp-bloque--verificado">
            <dl className="pp-datos">
              {f.selloPersonal.length > 0 && (
                <Fila titulo="Sello Personal">
                  <span className="fp-sello">{f.selloPersonal.join(" · ")}</span>
                </Fila>
              )}
              <Fila titulo="Validación técnica" marca={marcas.validacion} id="vp-fila-validacion">
                {f.validacion?.enunciado}
              </Fila>
            </dl>
          </div>
        </section>
        <section className="fp-seccion" aria-labelledby="fp-declarado">
          <div className="pp-seccion__cabecera">
            <h3 className="pp-seccion__titulo" id="fp-declarado">
              Declarado por la persona
            </h3>
          </div>
          <dl className="pp-datos">
            <Fila titulo="Trayectoria" marca={marcas.trayectoria} id="vp-fila-trayectoria">
              <ul className="fp-trayectoria">
                {f.trayectoria.map((e, i) => {
                  const sub = [e.cliente, periodo(e.desde, e.hasta)].filter(Boolean).join(" · ");
                  return (
                    <li key={i}>
                      <span className="fp-cargo">{e.cargo}</span>
                      {sub && <span className="fp-sub">{sub}</span>}
                      {e.descripcion}
                    </li>
                  );
                })}
              </ul>
            </Fila>
            <Fila titulo="Stack" marca={marcas.stack} id="vp-fila-stack">
              {f.tecnologias.join(" · ")}
            </Fila>
            {f.formacion && <Fila titulo="Formación">{f.formacion}</Fila>}
            {f.idiomas.length > 0 && <Fila titulo="Idiomas">{f.idiomas.join(" · ")}</Fila>}
            {f.sectores.length > 0 && <Fila titulo="Sectores">{f.sectores.join(" · ")}</Fila>}
            <Fila titulo="Modalidad" marca={marcas.modalidad} id="vp-fila-modalidad">
              {lugar}
            </Fila>
          </dl>
        </section>
      </div>
      {pie && <footer className="pp-hoja__pie">{pie}</footer>}
    </article>
  );
}
