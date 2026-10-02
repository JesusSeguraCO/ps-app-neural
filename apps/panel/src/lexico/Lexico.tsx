"use client";
// Léxico de búsqueda (HU-139; prototipo lexico-busqueda y variantes --propuestas, --candidatas y
// --equivalencia-invalida). Un solo formulario lateral para agregar un término, editar uno existente,
// editar una propuesta de Gemini antes de aprobarla o llevar una consulta sin coincidencia al léxico.
// El valor del catálogo se escribe y se valida en el servidor: si no existe, se ofrece lo más parecido.
import { useEffect, useRef, useState } from "react";
import { enviarJson } from "../acceso/cliente";
import { recargarConAviso } from "../marco/Hoja";

type Tipo = "rol" | "tecnologia" | "sector";
export interface EquivalenciaVista {
  tipo: Tipo;
  nombre: string;
}
export interface PropuestaVista {
  id: string;
  termino: string;
  sinonimos: string[];
  equivalencias: EquivalenciaVista[];
  meta: string;
  fecha: string;
  ejemplo: string;
  busquedas: number;
  cuentas: number;
}
export interface TerminoVista {
  id: string;
  termino: string;
  sinonimos: string[];
  equivalencias: EquivalenciaVista[];
}
export interface CandidataVista {
  id: string;
  consulta: string;
}

type Modo =
  | { tipo: "alta" }
  | { tipo: "termino"; termino: TerminoVista }
  | { tipo: "propuesta"; propuesta: PropuestaVista }
  | { tipo: "candidata"; candidata: CandidataVista; sugerido: string };

export const ETIQUETA: Record<Tipo, [string, string]> = {
  rol: ["Rol", "Roles"],
  tecnologia: ["Tecnología", "Tecnologías"],
  sector: ["Sector", "Sectores"],
};
const TIPOS: Tipo[] = ["rol", "tecnologia", "sector"];

// «Tecnología: Kafka · Sector: Banca», agrupado por tipo.
export function Equivalencias({ lista, bloque }: { lista: EquivalenciaVista[]; bloque?: boolean }) {
  const grupos = TIPOS.map(
    (t) => [t, lista.filter((e) => e.tipo === t).map((e) => e.nombre)] as const,
  ).filter(([, v]) => v.length);
  if (bloque)
    return (
      <>
        {grupos.map(([t, v]) => {
          const texto = `${ETIQUETA[t][v.length > 1 ? 1 : 0]}: ${v.join(", ")}`;
          return (
            <p key={t} className="lx-eq lx-eq--bloque" title={texto}>
              <span className="lx-eq__tipo">{`${ETIQUETA[t][v.length > 1 ? 1 : 0]}:`}</span>{" "}
              {v.join(", ")}
            </p>
          );
        })}
      </>
    );
  return (
    <p className="lx-eq">
      <span className="lx-flecha" aria-hidden="true">
        →
      </span>{" "}
      {grupos.map(([t, v], k) => (
        <span key={t}>
          {k > 0 && (
            <span className="lx-eq__sep" aria-hidden="true">
              ·
            </span>
          )}
          <span className="lx-eq__tipo">{`${ETIQUETA[t][v.length > 1 ? 1 : 0]}:`}</span>{" "}
          {v.join(", ")}
        </span>
      ))}
    </p>
  );
}

function Formulario({
  modo,
  alCancelar,
  valores,
}: {
  modo: Modo;
  alCancelar: (() => void) | null;
  valores: Record<Tipo, string[]>;
}) {
  const inicial = (() => {
    if (modo.tipo === "termino" || modo.tipo === "propuesta") {
      const f = modo.tipo === "termino" ? modo.termino : modo.propuesta;
      const tipo = f.equivalencias[0]?.tipo ?? "rol";
      return {
        termino: f.termino,
        sinonimos: f.sinonimos.join(", "),
        tipo,
        valor: f.equivalencias
          .filter((e) => e.tipo === tipo)
          .map((e) => e.nombre)
          .join(", "),
      };
    }
    if (modo.tipo === "candidata")
      return { termino: modo.sugerido, sinonimos: "", tipo: "rol" as Tipo, valor: "" };
    return { termino: "", sinonimos: "", tipo: "rol" as Tipo, valor: "" };
  })();
  const [termino, setTermino] = useState(inicial.termino);
  const [sinonimos, setSinonimos] = useState(inicial.sinonimos);
  const [tipo, setTipo] = useState<Tipo>(inicial.tipo);
  const [valor, setValor] = useState(inicial.valor);
  const [invalido, setInvalido] = useState<null | { valor: string; sugerencias: string[] }>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Al cambiar de tipo sobre un término existente, se cargan los valores que ya tiene de ese tipo.
  const equivalenciasPrevias =
    modo.tipo === "termino"
      ? modo.termino.equivalencias
      : modo.tipo === "propuesta"
        ? modo.propuesta.equivalencias
        : [];
  const cambiarTipo = (t: Tipo) => {
    setTipo(t);
    setInvalido(null);
    if (modo.tipo === "termino")
      setValor(
        equivalenciasPrevias
          .filter((e) => e.tipo === t)
          .map((e) => e.nombre)
          .join(", "),
      );
  };
  const quitadas =
    modo.tipo === "propuesta"
      ? modo.propuesta.equivalencias.filter(
          (e) =>
            e.tipo !== tipo ||
            !valor
              .split(",")
              .map((v) => v.trim().toLowerCase())
              .includes(e.nombre.toLowerCase()),
        )
      : [];

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setInvalido(null);
    const entrada = {
      termino,
      sinonimos: sinonimos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tipo,
      valores: valor
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const r = await (
      modo.tipo === "propuesta"
        ? enviarJson(`/api/v1/lexico/propuestas/${modo.propuesta.id}/aprobar`, { edicion: entrada })
        : enviarJson("/api/v1/lexico", {
            ...entrada,
            ...(modo.tipo === "termino" ? { id: modo.termino.id } : {}),
            ...(modo.tipo === "candidata" ? { candidataId: modo.candidata.id } : {}),
          })
    ).catch(() => null);
    if (r && (r.status === 200 || r.status === 201))
      return recargarConAviso(
        modo.tipo === "propuesta"
          ? `Propuesta aprobada: «${termino.trim()}» ya está en el léxico.`
          : `«${termino.trim()}» guardado en el léxico. La búsqueda lo reconoce desde ahora.`,
      );
    setEnviando(false);
    const cuerpo = r
      ? ((await r.json().catch(() => ({}))) as {
          motivo?: string;
          valor?: string;
          sugerencias?: string[];
        })
      : {};
    if (cuerpo.motivo === "valor_inexistente")
      setInvalido({ valor: cuerpo.valor ?? valor, sugerencias: cuerpo.sugerencias ?? [] });
    else
      setError(
        r?.status === 403
          ? "Tu rol es de consulta: no puedes cambiar el léxico."
          : cuerpo.motivo === "termino_vacio"
            ? "Escribe el término del cliente."
            : cuerpo.motivo === "sin_valor"
              ? "Elige al menos un valor del catálogo."
              : cuerpo.motivo === "ya_decidida"
                ? "Esa propuesta ya se decidió. Recarga la página."
                : "No se pudo guardar. Inténtalo de nuevo.",
      );
  }

  const titulo =
    modo.tipo === "propuesta"
      ? "Editar la propuesta"
      : modo.tipo === "termino"
        ? "Editar término"
        : "Agregar término";
  const origen =
    modo.tipo === "propuesta"
      ? `Propuesta de Gemini del ${modo.propuesta.fecha}, a partir de ${modo.propuesta.busquedas} ${modo.propuesta.busquedas === 1 ? "búsqueda" : "búsquedas"} sin coincidencia de ${modo.propuesta.cuentas} ${modo.propuesta.cuentas === 1 ? "cuenta" : "cuentas"}. Entra al léxico tal como la dejes.`
      : modo.tipo === "candidata"
        ? `Desde la búsqueda «${modo.candidata.consulta}».`
        : null;
  const catalogoTexto = { rol: "roles", tecnologia: "tecnologías", sector: "sectores" }[tipo];

  return (
    <aside className="lx-alta" id="lx-alta" aria-labelledby="lx-alta-titulo">
      <h2
        className="lx-alta__titulo"
        id="lx-alta-titulo"
        style={origen ? undefined : { marginBottom: "var(--tc-sp-5)" }}
      >
        {titulo}
      </h2>
      {origen && <p className="lx-alta__origen">{origen}</p>}
      <form className="pp-form" onSubmit={guardar} noValidate>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="lx-termino">
            Término del cliente
          </label>
          <input
            className="pp-input"
            id="lx-termino"
            type="text"
            placeholder="Ej.: pagos en tiempo real"
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
          />
        </div>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="lx-sinonimos">
            Sinónimos <span className="pp-label__opcional">(opcional)</span>
          </label>
          <input
            className="pp-input"
            id="lx-sinonimos"
            type="text"
            placeholder="Separados por coma"
            value={sinonimos}
            onChange={(e) => setSinonimos(e.target.value)}
          />
        </div>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="lx-tipo">
            Equivale a
          </label>
          <div className="pp-select">
            <select
              className="pp-input"
              id="lx-tipo"
              value={tipo}
              onChange={(e) => cambiarTipo(e.target.value as Tipo)}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {ETIQUETA[t][0]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="pp-campo">
          <label className="pp-label" htmlFor="lx-valor">
            Valor del catálogo
          </label>
          <input
            className="pp-input"
            id="lx-valor"
            type="text"
            placeholder="Escribe y elige de la lista"
            list={`lx-valores-${tipo}`}
            autoComplete="off"
            value={valor}
            onChange={(e) => (setValor(e.target.value), setInvalido(null))}
            aria-invalid={invalido ? true : undefined}
            aria-describedby="lx-valor-msg"
          />
          {invalido ? (
            <>
              <p
                className="pp-error"
                id="lx-valor-msg"
              >{`No se guardó: «${invalido.valor}» no está en el catálogo de ${catalogoTexto}.`}</p>
              {invalido.sugerencias.length > 0 && (
                <>
                  <p className="pp-ayuda" id="lx-sug-titulo">
                    Lo más parecido del catálogo:
                  </p>
                  <ul className="lx-sugerencias" aria-labelledby="lx-sug-titulo">
                    {invalido.sugerencias.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          className="pp-btn pp-btn--contorno pp-btn--sm"
                          onClick={() => {
                            setValor(
                              valor
                                .split(",")
                                .map((v) => (v.trim() === invalido.valor ? s : v.trim()))
                                .filter(Boolean)
                                .join(", "),
                            );
                            setInvalido(null);
                          }}
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="pp-ayuda">
                ¿Falta en el catálogo?{" "}
                <a className="pp-enlace" href={`/catalogos?tipo=${tipo}&crear=1`}>
                  Agrégala en Catálogos
                </a>
                .
              </p>
            </>
          ) : (
            <p className="pp-ayuda" id="lx-valor-msg">
              {quitadas.length > 0
                ? `Quitaste «${quitadas.map((q) => `${ETIQUETA[q.tipo][0]}: ${q.nombre}`).join("», «")}» que proponía Gemini. Solo valores que existen en el catálogo.`
                : "Solo valores que existen en el catálogo."}
            </p>
          )}
        </div>
        {TIPOS.map((t) => (
          <datalist key={t} id={`lx-valores-${t}`}>
            {valores[t].map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        ))}
        {error && (
          <p className="pp-error" role="alert">
            {error}
          </p>
        )}
        <div className="pp-form__acciones">
          {alCancelar && (
            <button type="button" className="pp-btn pp-btn--fantasma" onClick={alCancelar}>
              Cancelar
            </button>
          )}
          <button type="submit" className="pp-btn pp-btn--primario" disabled={enviando}>
            {modo.tipo === "propuesta" ? "Aprobar editada" : "Guardar en el léxico"}
          </button>
        </div>
      </form>
    </aside>
  );
}

export function PantallaLexico(p: {
  escribe: boolean;
  propuestas: PropuestaVista[];
  lista: React.ReactNode;
  terminos: TerminoVista[];
  candidatas: Array<CandidataVista & { sugerido: string }>;
  candidataInicial?: string;
  // Valores activos del catálogo por tipo, para elegir de la lista al escribir.
  valores: Record<Tipo, string[]>;
}) {
  const inicialCandidata = p.candidatas.find((c) => c.id === p.candidataInicial);
  const [modo, setModo] = useState<Modo>(
    inicialCandidata
      ? { tipo: "candidata", candidata: inicialCandidata, sugerido: inicialCandidata.sugerido }
      : { tipo: "alta" },
  );
  const [error, setError] = useState<string | null>(null);
  const clave =
    modo.tipo === "alta"
      ? "alta"
      : modo.tipo === "termino"
        ? modo.termino.id
        : modo.tipo === "propuesta"
          ? modo.propuesta.id
          : modo.candidata.id;
  const editando = modo.tipo === "propuesta" ? modo.propuesta.id : null;
  // La fila de la búsqueda de origen es del servidor: se resalta por su `data-lx-fila`.
  const marco = useRef<HTMLDivElement>(null);
  const deCandidata = modo.tipo === "candidata" ? modo.candidata.id : null;
  useEffect(() => {
    marco.current
      ?.querySelectorAll<HTMLElement>("[data-lx-fila]")
      .forEach((li) =>
        li.classList.toggle("pp-fila--seleccionada", li.dataset.lxFila === deCandidata),
      );
  }, [deCandidata]);

  async function decidir(ruta: string, cuerpo: unknown, aviso: string) {
    setError(null);
    const r = await enviarJson(ruta, cuerpo).catch(() => null);
    if (r?.status === 200) return recargarConAviso(aviso);
    setError(
      r?.status === 403
        ? "Tu rol es de consulta: no puedes decidir."
        : r?.status === 409
          ? "Ya se decidió. Recarga la página."
          : "No se pudo guardar la decisión.",
    );
  }

  // Los botones de las filas del servidor avisan por atributos data-*: una sola escucha aquí.
  const alClic = (e: React.MouseEvent) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-lx]");
    if (!b || !p.escribe) return;
    const id = b.dataset.id!;
    const accion = b.dataset.lx;
    if (accion === "editar-termino") {
      const t = p.terminos.find((x) => x.id === id);
      if (t) setModo({ tipo: "termino", termino: t });
    } else if (accion === "llevar-lexico") {
      e.preventDefault();
      const c = p.candidatas.find((x) => x.id === id);
      if (c) setModo({ tipo: "candidata", candidata: c, sugerido: c.sugerido });
      document.getElementById("lx-alta")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (accion === "reclutamiento")
      void decidir(
        `/api/v1/lexico/candidatas/${id}`,
        { destino: "agenda_reclutamiento" },
        "Consulta enviada a la agenda de reclutamiento.",
      );
    else if (accion === "descartar")
      void decidir(
        `/api/v1/lexico/candidatas/${id}`,
        { destino: "descartada" },
        "Consulta descartada.",
      );
  };

  return (
    <div className="pp-con-lateral" onClick={alClic} ref={marco}>
      <div className="lx-principal">
        {(p.propuestas.length > 0 || p.escribe) && (
          <section aria-labelledby="lx-prop-titulo">
            <div className="pp-seccion__cabecera lx-cabecera">
              <h2 className="pp-seccion__titulo" id="lx-prop-titulo">
                Propuestas de Gemini por aprobar
              </h2>
              <p className="lx-garantia">
                Gemini solo vio el texto de las consultas sin coincidencia y el catálogo, nunca
                datos de perfiles. Ninguna propuesta cambia la búsqueda hasta que la apruebes.
              </p>
            </div>
            {p.propuestas.length === 0 ? (
              <div className="pp-vacio">
                <p>
                  No hay propuestas pendientes. Gemini revisa las consultas sin coincidencia cada
                  semana.
                </p>
              </div>
            ) : (
              <ul className="pp-filas" aria-label="Propuestas de Gemini por aprobar">
                {p.propuestas.map((x) => (
                  <li
                    key={x.id}
                    className={`pp-fila${editando === x.id ? " pp-fila--seleccionada" : ""}`}
                  >
                    <div className="pp-fila__principal">
                      <p className="pp-fila__titulo">
                        <span className="lx-termino">{x.termino}</span>
                        {editando === x.id && (
                          <span className="pp-estado pp-estado--info">Editando</span>
                        )}
                      </p>
                      <Equivalencias lista={x.equivalencias} />
                      <p className="pp-fila__meta">{x.meta}</p>
                      <p className="pp-fila__meta lx-ejemplo">{`p. ej. «${x.ejemplo}»`}</p>
                    </div>
                    {p.escribe && (
                      <div className="pp-fila__acciones lx-acciones">
                        <button
                          type="button"
                          className="pp-btn pp-btn--fantasma pp-btn--sm"
                          onClick={() =>
                            decidir(
                              `/api/v1/lexico/propuestas/${x.id}/rechazar`,
                              {},
                              `Propuesta rechazada: «${x.termino}» no se volverá a proponer.`,
                            )
                          }
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          className="pp-btn pp-btn--fantasma pp-btn--sm"
                          onClick={() => setModo({ tipo: "propuesta", propuesta: x })}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="pp-btn pp-btn--contorno pp-btn--sm"
                          onClick={() =>
                            decidir(
                              `/api/v1/lexico/propuestas/${x.id}/aprobar`,
                              {},
                              `Propuesta aprobada: «${x.termino}» ya está en el léxico.`,
                            )
                          }
                        >
                          Aprobar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p className="pp-error" role="alert">
                {error}
              </p>
            )}
          </section>
        )}
        {p.lista}
      </div>
      {p.escribe && (
        <Formulario
          key={clave}
          modo={modo}
          valores={p.valores}
          alCancelar={modo.tipo === "alta" ? null : () => setModo({ tipo: "alta" })}
        />
      )}
    </div>
  );
}
