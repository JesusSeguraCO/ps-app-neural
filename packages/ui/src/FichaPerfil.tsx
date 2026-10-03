// Ficha del perfil (patrón PP:hoja del prototipo ficha-perfil / vista-previa-ficha; RF-3.2, RF-3.12;
// HU-129, HU-130). Un solo componente para el portal y la vista previa del panel: dibuja lo que
// `armarFicha` deja y nada más. Lo verificado por Trycore va en su bloque teñido; lo declarado, sin
// caja (RF-3.12). Un bloque opcional sin datos no se dibuja —ni título ni hueco—. La validación es
// el enunciado de Nivel 0 de la modalidad de prueba mientras no haya reporte detallado. La verificación
// SARO (texto del alcance y mes) y la evaluación DISC (mes, con las competencias del Sello Personal que
// salen de ella) van en lo verificado como contenido y se omiten sin marca si faltan (HU-156, D62, D63).
// Cierra con las condiciones de trabajo, el servicio de Trycore (SLA en el tamaño del texto y garantía
// Neural Speed, iguales para todos) y la referencia al pie: el código solo ahí, nunca en la cabecera
// (HU-158, RF-3.5).
//
// `marcas` solo lo pasa la vista previa: numera cada bloque obligatorio incompleto y nombra el dato
// que falta. El portal nunca lo pasa (un publicado está completo).
import type { ReactNode } from "react";
import type { BloqueFicha, FichaEnEdicion } from "@ps/contratos/ficha";
import type { LineaEvidencia } from "@ps/dominio/catalogo/evidencia";
import { DISPONIBILIDAD_CLIENTE } from "@ps/dominio/enlaces/textos-seleccion";
import type { ContactoTrycore as Contacto } from "@ps/dominio/contacto/contacto";
import { mesDeAnio } from "@ps/dominio/fecha/colombia";
import { ContactoTrycore } from "./ContactoTrycore";
import { COPY_FICHA } from "./copy";
import { EvidenciaFicha } from "./Evidencia";

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

// Validación técnica (HU-155; prototipo validacion-tecnica, D59): bloque desplegable dentro de lo
// verificado, por clic o toque (nativo, sin hover), abierto por omisión como el prototipo. Nivel 1: los
// cinco campos en orden fijo —prueba aplicada, qué se evaluó, resultado («Cumple el estándar», nunca un
// puntaje: B.8.2), evaluador y fecha (mes de año)— y la línea de la sesión de alineación; ningún enlace al
// artefacto (B.8.4, D29). Nivel 0: solo la prueba con el texto de cara al cliente, sin fecha (D73) ni
// promesa de un detalle que no existe. La trayectoria nunca se cita aquí (RF-3.9).
function Validacion({ f, marca }: { f: FichaEnEdicion; marca?: { numero: number; datos: string[] } }) {
  const v = f.validacion;
  const campos: Array<[string, string]> = !v
    ? []
    : v.nivel === 1
      ? [
          ["Prueba aplicada", v.modalidad],
          ["Qué se evaluó", v.criterios.join(" · ")],
          ["Resultado", COPY_FICHA.validacionResultado],
          ["Evaluador", v.evaluador],
          ["Fecha", mesDeAnio(v.fecha)],
        ]
      : [["Prueba aplicada", v.enunciado]];
  return (
    <details className={`fp-validacion${marca ? " vp-marca vp-marca--bloquea" : ""}`} open id="vp-fila-validacion">
      <summary className="fp-validacion__titulo">Validación técnica</summary>
      {marca ? (
        <p className="fp-validacion__falta">
          <Falta marca={marca} />
        </p>
      ) : (
        <>
          <dl className="fp-validacion__campos">
            {campos.map(([dt, dd]) => (
              <div className="fp-validacion__campo" key={dt}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
          {v?.nivel === 1 && <p className="fp-validacion__nota">{COPY_FICHA.validacionAlineacion}</p>}
        </>
      )}
    </details>
  );
}

export function FichaPerfil({
  ficha: f,
  marcas = {},
  cerrar,
  pie,
  barra,
  dialogo = false,
  evidencia = [],
  contacto,
}: {
  ficha: FichaEnEdicion;
  marcas?: MarcasFicha;
  cerrar?: ReactNode;
  pie?: ReactNode;
  // Portal (HU-120): la barra de recorrido va encima de la cabecera y la hoja es un diálogo modal.
  barra?: ReactNode;
  dialogo?: boolean;
  // «Frente a tu búsqueda» (HU-119): las líneas de los criterios activos, las mismas de la tarjeta. Solo
  // el banco con un filtro las pasa; la selección del correo y la vista previa del panel, nunca.
  evidencia?: readonly LineaEvidencia[];
  // Contacto vigente de Trycore (HU-157): la conversación va por Trycore, nunca hacia la persona.
  contacto?: Contacto;
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
    <article
      className="pp-hoja fp-ficha"
      aria-labelledby="fp-titulo"
      {...(dialogo ? { role: "dialog", "aria-modal": true, id: "ficha" } : {})}
    >
      {barra}
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
          </ul>
        </div>
        {cerrar}
      </header>
      {/* Con contenido largo el cuerpo se desplaza: enfocable para recorrerlo con el teclado (WCAG
          2.1.1, regla axe scrollable-region-focusable). */}
      <div className="pp-hoja__cuerpo" tabIndex={0}>
        <EvidenciaFicha lineas={evidencia} />
        {f.resumen && <p className="fp-resumen">{f.resumen}</p>}
        <section className="fp-seccion" aria-labelledby="fp-verificado">
          <div className="pp-seccion__cabecera">
            <h3
              className="pp-seccion__titulo fp-seccion__titulo fp-seccion__titulo--verificado"
              id="fp-verificado"
            >
              <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Verificado por Trycore
            </h3>
          </div>
          <div className="pp-bloque pp-bloque--verificado">
            <dl className="pp-datos">
              {/* Sin fecha DISC (heredado, D62) el Sello Personal registrado sigue a la vista por sí solo. */}
              {!f.disc && f.selloPersonal.length > 0 && (
                <Fila titulo="Sello Personal">
                  <span className="fp-sello">{f.selloPersonal.join(" · ")}</span>
                </Fila>
              )}
              {f.seguridad && (
                <Fila titulo="Verificación de seguridad SARO" id="vp-fila-seguridad">
                  {`${f.seguridad.alcance} · ${f.seguridad.fecha}`}
                </Fila>
              )}
              {f.disc && (
                <Fila titulo="Evaluación DISC" id="vp-fila-disc">
                  {f.disc.fecha}
                  {f.selloPersonal.length > 0 && (
                    <span className="fp-sub">
                      {`${COPY_FICHA.discCompetencias}: `}
                      <span className="fp-sello">{f.selloPersonal.join(" · ")}</span>
                    </span>
                  )}
                </Fila>
              )}
            </dl>
            <Validacion f={f} marca={marcas.validacion} />
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
            {f.sectores.length > 0 && <Fila titulo="Sectores">{f.sectores.join(" · ")}</Fila>}
          </dl>
        </section>
        {contacto && (
          <section className="fp-seccion fp-contacto" aria-labelledby="fp-contacto">
            <div className="pp-seccion__cabecera">
              <h3 className="pp-seccion__titulo" id="fp-contacto">
                {COPY_FICHA.contactoTitulo}
              </h3>
            </div>
            <p className="fp-contacto__texto">
              {`${COPY_FICHA.contactoConversacion} ${COPY_FICHA.contactoRespaldo} ${COPY_FICHA.contactoSinViaDirecta}`}
            </p>
            <p className="fp-contacto__quien">
              <ContactoTrycore contacto={contacto} />
            </p>
          </section>
        )}
        <section className="fp-seccion fp-condiciones" aria-labelledby="fp-condiciones">
          <div className="pp-seccion__cabecera">
            <h3 className="pp-seccion__titulo" id="fp-condiciones">
              {COPY_FICHA.condicionesTitulo}
            </h3>
          </div>
          <dl className="pp-datos">
            <Fila titulo="Modalidad" marca={marcas.modalidad} id="vp-fila-modalidad">
              {lugar}
            </Fila>
            {!marcas.disponibilidad && (
              <Fila titulo="Disponibilidad">{DISPONIBILIDAD_CLIENTE[f.disponibilidad]}</Fila>
            )}
            {f.idiomas.length > 0 && <Fila titulo="Idiomas">{f.idiomas.join(" · ")}</Fila>}
          </dl>
        </section>
        <section className="fp-seccion fp-servicio" aria-labelledby="fp-servicio">
          <div className="pp-seccion__cabecera">
            <h3 className="pp-seccion__titulo" id="fp-servicio">
              {COPY_FICHA.servicioTitulo}
            </h3>
          </div>
          <p className="fp-servicio__sla">{COPY_FICHA.servicioSla}</p>
          <p className="fp-servicio__garantia">{COPY_FICHA.servicioGarantia}</p>
        </section>
        <p className="fp-referencia">{COPY_FICHA.referencia(f.codigo)}</p>
      </div>
      {pie && <footer className="pp-hoja__pie">{pie}</footer>}
    </article>
  );
}
