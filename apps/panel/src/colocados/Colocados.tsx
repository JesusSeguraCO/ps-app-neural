"use client";
// Pestaña de colocados (HU-137; prototipos colocados--registrar, --sin-fecha-liberacion y --en-el-portal).
// «Registrar colocado» abre la hoja con el perfil, el cliente y las dos fechas: la de liberación es
// obligatoria y pasa a ser la disponibilidad (el perfil sigue publicado). El nombre de cada fila abre la
// asignación con lo que ve el cliente en el portal.
import { useState } from "react";
import { bandaDeDisponibilidad, ROTULO_BANDA } from "@ps/dominio/catalogo/banda";
import { fechaCivil } from "@ps/dominio/fecha/colombia";
import { liberacionValida } from "@ps/dominio/inventario/colocados";
import { enviarJson } from "../acceso/cliente";
import { Hoja, recargarConAviso } from "../marco/Hoja";

export interface CandidatoEnHoja {
  codigo: string;
  nombre: string;
  // «Disponible ahora», «En 1 mes»…: lo que conserva si el registro no se guarda.
  bandaPanel: string;
}

const MENSAJE: Record<string, { campo: "cuenta" | "liberacion" | null; texto: string }> = {
  sin_cuenta: { campo: "cuenta", texto: "Escribe el cliente al que quedó asignado." },
  liberacion_pasada: {
    campo: "liberacion",
    texto: "La fecha de liberación tiene que ser posterior a hoy.",
  },
  liberacion_antes_de_inicio: {
    campo: "liberacion",
    texto: "La fecha de liberación tiene que ser posterior a la de inicio.",
  },
  fecha_invalida: { campo: null, texto: "Revisa las fechas: alguna no existe en el calendario." },
  ya_colocado: { campo: null, texto: "Ese perfil ya está colocado: aparece en esta pestaña." },
  no_es_publicado: {
    campo: null,
    texto: "Solo un perfil publicado se registra como colocado. Recarga la página.",
  },
};

function ErrorCampo(p: { id: string; texto: string }) {
  return (
    <p className="pp-error" id={p.id} role="alert">
      <span aria-hidden="true">!</span>
      {p.texto}
    </p>
  );
}

export function RegistrarColocado(p: { candidatos: CandidatoEnHoja[]; hoy: string }) {
  const [abierta, setAbierta] = useState(false);
  const [codigo, setCodigo] = useState(p.candidatos[0]?.codigo ?? "");
  const [cuenta, setCuenta] = useState("");
  const [inicio, setInicio] = useState(p.hoy);
  const [liberacion, setLiberacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<{ campo: string | null; texto: string } | null>(null);
  const elegido = p.candidatos.find((c) => c.codigo === codigo);

  function abrir() {
    setError(null);
    setAbierta(true);
  }

  const sinLiberacion = () => ({
    campo: "liberacion",
    texto: `Un colocado siempre lleva su fecha de liberación. No se guardó: ${elegido!.nombre} sigue publicado con «${elegido!.bandaPanel}».`,
  });

  async function guardar() {
    if (!elegido) return;
    // Los obligatorios se avisan sin enviar; el servidor aplica la misma regla (RF-8.13.2).
    if (!cuenta.trim()) return setError(MENSAJE.sin_cuenta!);
    if (!liberacion) return setError(sinLiberacion());
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson("/api/v1/colocados", { codigo, cuenta, inicio, liberacion });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        const banda =
          ROTULO_BANDA[
            bandaDeDisponibilidad(
              {
                fecha: d.perfil.disponibilidadFecha,
                actualizadaEn: new Date(d.perfil.disponibilidadActualizadaEn),
              },
              new Date(),
            )
          ];
        return recargarConAviso(
          `${elegido.nombre} quedó colocado en ${cuenta.trim()} hasta el ${fechaCivil(liberacion)}. Sigue publicado y el cliente ve «${banda}».`,
        );
      }
      if (d.motivo === "sin_liberacion") return setError(sinLiberacion());
      setError(
        MENSAJE[d.motivo] ?? { campo: null, texto: "No se pudo guardar. Inténtalo de nuevo." },
      );
    } finally {
      setEnviando(false);
    }
  }

  const invalido = (campo: string) => (error?.campo === campo ? true : undefined);
  return (
    <>
      <button
        type="button"
        className="pp-btn pp-btn--primario"
        aria-haspopup="dialog"
        disabled={p.candidatos.length === 0}
        title={p.candidatos.length === 0 ? "No hay perfiles publicados sin colocar" : undefined}
        onClick={abrir}
      >
        Registrar colocado
      </button>
      {abierta && (
        <Hoja
          titulo="Registrar colocado"
          sub="Queda a tu nombre como fuente del dato."
          cerrarEtiqueta="Cerrar"
          alCerrar={() => setAbierta(false)}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setAbierta(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="cl-registrar"
                className="pp-btn pp-btn--primario"
                disabled={enviando}
              >
                Guardar colocado
              </button>
            </>
          }
        >
          <form
            id="cl-registrar"
            className="pp-hoja__cuerpo"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void guardar();
            }}
          >
            <div className="pp-form">
              <div className="pp-campo">
                <label className="pp-label" htmlFor="cl-perfil">
                  Perfil
                </label>
                <div className="pp-select">
                  <select
                    className="pp-input"
                    id="cl-perfil"
                    data-foco=""
                    value={codigo}
                    aria-describedby="cl-perfil-a"
                    onChange={(e) => setCodigo(e.target.value)}
                  >
                    {p.candidatos.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        {`${c.nombre} · ${c.codigo} · Publicado`}
                      </option>
                    ))}
                  </select>
                </div>
                {elegido && (
                  <p className="pp-ayuda" id="cl-perfil-a">{`Hoy: «${elegido.bandaPanel}».`}</p>
                )}
              </div>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="cl-cliente">
                  Cliente
                </label>
                <input
                  className="pp-input"
                  id="cl-cliente"
                  type="text"
                  maxLength={200}
                  value={cuenta}
                  aria-invalid={invalido("cuenta")}
                  aria-describedby={invalido("cuenta") ? "cl-cliente-error" : undefined}
                  onChange={(e) => setCuenta(e.target.value)}
                />
                {error?.campo === "cuenta" && (
                  <ErrorCampo id="cl-cliente-error" texto={error.texto} />
                )}
              </div>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="cl-inicio">
                  Fecha de inicio
                </label>
                <input
                  className="pp-input"
                  id="cl-inicio"
                  type="date"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                />
              </div>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="cl-lib">
                  Fecha de liberación
                </label>
                <input
                  className="pp-input"
                  id="cl-lib"
                  type="date"
                  min={p.hoy}
                  value={liberacion}
                  aria-invalid={invalido("liberacion")}
                  aria-describedby={`cl-lib-a${invalido("liberacion") ? " cl-lib-error" : ""}`}
                  onChange={(e) => {
                    setLiberacion(e.target.value);
                    // El error de la liberación se va en cuanto la fecha escrita es válida.
                    if (
                      error?.campo === "liberacion" &&
                      liberacionValida({ inicio, liberacion: e.target.value }, p.hoy)
                    )
                      setError(null);
                  }}
                />
                <p className="pp-ayuda" id="cl-lib-a">
                  Obligatoria. Pasa a ser su disponibilidad: sigue publicado y el cliente ve la
                  banda, no la fecha.
                </p>
                {error?.campo === "liberacion" && (
                  <ErrorCampo id="cl-lib-error" texto={error.texto} />
                )}
              </div>
              {error && error.campo === null && <ErrorCampo id="cl-error" texto={error.texto} />}
            </div>
          </form>
        </Hoja>
      )}
    </>
  );
}

export interface ColocadoEnHoja {
  codigo: string;
  nombre: string;
  rolSeniority: string;
  rol: string | null;
  cuenta: string;
  inicio: string | null;
  liberacion: string;
  faltan: number;
  pronto: boolean;
  // «Registrada en el panel por karen@… · 1 abr 2026», «Cargada de Operaciones · corte 29 sep»…
  origen: string;
  estado: string;
  disponibilidadFecha: string | null;
  bandaPortal: string;
  // Cuándo cambia lo que ve el cliente, si cambia antes de la liberación.
  despues: { desde: string; banda: string } | null;
}

const corta = (aaaammdd: string) => fechaCivil(aaaammdd).replace(/ \d{4}$/, "");

export function NombreColocado(p: { colocado: ColocadoEnHoja }) {
  const [abierta, setAbierta] = useState(false);
  const c = p.colocado;
  return (
    <>
      <button
        type="button"
        className="cl-nombre"
        aria-haspopup="dialog"
        onClick={() => setAbierta(true)}
      >
        {c.nombre}
      </button>
      {abierta && (
        <Hoja
          titulo={c.nombre}
          sub={`${c.rolSeniority} · ${c.codigo}`}
          cerrarEtiqueta="Cerrar"
          alCerrar={() => setAbierta(false)}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setAbierta(false)}
              >
                Cerrar
              </button>
              <a className="pp-btn pp-btn--primario" href={`/inventario/${c.codigo}`}>
                Abrir en el inventario
              </a>
            </>
          }
        >
          <div className="pp-hoja__cuerpo">
            <section className="cl-hoja-seccion" aria-labelledby="cl-s1">
              <div className="pp-seccion__cabecera">
                <h3 className="pp-seccion__titulo" id="cl-s1">
                  Asignación
                </h3>
                <span className="pp-meta">{c.origen}</span>
              </div>
              <dl className="pp-datos">
                <div className="pp-datos__fila">
                  <dt>Cuenta</dt>
                  <dd>{c.cuenta}</dd>
                </div>
                <div className="pp-datos__fila">
                  <dt>Inicio</dt>
                  <dd className="pp-tabla__num">
                    {c.inicio ? (
                      <time dateTime={c.inicio}>{fechaCivil(c.inicio)}</time>
                    ) : (
                      "Sin registrar"
                    )}
                  </dd>
                </div>
                <div className="pp-datos__fila">
                  <dt>Vence</dt>
                  <dd className="pp-tabla__num">
                    <time dateTime={c.liberacion}>{fechaCivil(c.liberacion)}</time>
                    {" · "}
                    <span className={`cl-faltan${c.pronto ? " cl-faltan--pronto" : ""}`}>
                      {`faltan ${c.faltan} ${c.faltan === 1 ? "día" : "días"}`}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>
            <section className="cl-hoja-seccion" aria-labelledby="cl-s2">
              <div className="pp-seccion__cabecera">
                <h3 className="pp-seccion__titulo" id="cl-s2">
                  En el inventario
                </h3>
              </div>
              <dl className="pp-datos">
                <div className="pp-datos__fila">
                  <dt>Estado</dt>
                  <dd>
                    <span className="pp-estado pp-estado--ok">{c.estado}</span>
                  </dd>
                </div>
                <div className="pp-datos__fila">
                  <dt>Disponible desde</dt>
                  <dd className="pp-tabla__num">
                    {c.disponibilidadFecha ? (
                      <>
                        <time dateTime={c.disponibilidadFecha}>
                          {fechaCivil(c.disponibilidadFecha)}
                        </time>
                        {c.disponibilidadFecha === c.liberacion && (
                          <span className="cl-banda"> · fin de la asignación</span>
                        )}
                      </>
                    ) : (
                      "Sin disponibilidad"
                    )}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="cl-hoja-seccion" aria-labelledby="cl-s3">
              <div className="pp-seccion__cabecera">
                <h3 className="pp-seccion__titulo" id="cl-s3">
                  Lo que ve el cliente
                </h3>
              </div>
              <div className="cl-vista" aria-label="Vista del cliente en el portal">
                <p className="cl-vista__rol">{c.rol ?? "Sin rol"}</p>
                <p className="cl-vista__nombre">{c.nombre}</p>
                <p className="cl-vista__meta">
                  <span className="pp-estado pp-estado--neutro">{c.bandaPortal}</span>
                </p>
              </div>
              {c.despues && (
                <dl className="pp-datos cl-despues">
                  <div className="pp-datos__fila">
                    <dt>{`Desde el ${corta(c.despues.desde)}`}</dt>
                    <dd>{c.despues.banda}</dd>
                  </div>
                </dl>
              )}
              <p>
                En el banco el cliente ve la banda, nunca la fecha ni la cuenta; en la selección de su
                correo, la fecha en que se libera.
              </p>
            </section>
          </div>
        </Hoja>
      )}
    </>
  );
}

