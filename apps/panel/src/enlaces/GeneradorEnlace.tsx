"use client";
// Generador del enlace curado (prototipo generador-enlace y sus variantes --sin-razon,
// --perfil-no-publicado, --sin-invitados y --emitido; HU-122). La cuenta se escribe por su nombre y
// los invitados a mano (sin lectura de HubSpot). Las reglas las decide el servidor (crearEnlace): la
// pantalla solo pinta los motivos que devuelve.
import { useMemo, useState } from "react";
import type { ErrorEnlace } from "@ps/dominio/enlaces/crear";
import { ROTULO_BANDA, type Banda } from "@ps/dominio/catalogo/banda";
import { horaDeColombia } from "@ps/dominio/fecha/colombia";
import { enviarJson } from "../acceso/cliente";

export interface PerfilElegible {
  codigo: string;
  nombre: string;
  rol: string | null;
  familia: string | null;
  ciudad: string | null;
  banda: Banda;
}

interface Emitido {
  codigo: string;
  url: string;
  vigenteHasta: string;
  invitados: string[];
  codigos: string[];
  generadoEn: Date;
}

const claseBanda = (b: Banda) =>
  b === "inmediato"
    ? "pp-badge--disponible"
    : b === "por_confirmar"
      ? "pp-badge--por-confirmar"
      : "pp-badge--banda";
const dia = (d: Date) => horaDeColombia(d).split(", ")[0];
const DIA_MS = 86_400_000;

function IconoQuitar() {
  return (
    <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function resumen(errores: ErrorEnlace[]): string {
  const partes = errores.map((e) => {
    switch (e.tipo) {
      case "sin_cuenta":
        return "falta la cuenta";
      case "sin_razon":
        return "falta la razón";
      case "no_publicado":
        return `${e.codigos.join(", ")} ${e.codigos.length === 1 ? "no está publicado" : "no están publicados"}`;
      case "sin_invitados":
        return "falta un correo invitado";
      case "correo_invalido":
        return "hay un correo mal escrito";
      case "vigencia_invalida":
        return "la vigencia no es válida";
    }
  });
  return `No se generó: ${partes.join("; ")}.`;
}

export function GeneradorEnlace({
  publicables,
  autora,
}: {
  publicables: PerfilElegible[];
  autora: string;
}) {
  const [cuenta, setCuenta] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [elegidos, setElegidos] = useState<PerfilElegible[]>([]);
  const [razon, setRazon] = useState("");
  const [invitados, setInvitados] = useState<string[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [vigencia, setVigencia] = useState("30");
  const [selector, setSelector] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [errores, setErrores] = useState<ErrorEnlace[] | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [emitido, setEmitido] = useState<Emitido | null>(null);
  const [copiado, setCopiado] = useState(false);

  const error = <T extends ErrorEnlace["tipo"]>(tipo: T) =>
    errores?.find((e) => e.tipo === tipo) as Extract<ErrorEnlace, { tipo: T }> | undefined;
  const noPublicados = new Set(error("no_publicado")?.codigos ?? []);
  const familias = new Set(elegidos.map((p) => p.familia).filter(Boolean)).size;
  const dias = Number(vigencia);
  const venceEl =
    Number.isInteger(dias) && dias > 0 ? dia(new Date(Date.now() + dias * DIA_MS)) : null;

  const candidatos = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    const ya = new Set(elegidos.map((p) => p.codigo));
    return publicables
      .filter((p) => !ya.has(p.codigo))
      .filter(
        (p) =>
          !q ||
          [p.codigo, p.nombre, p.rol ?? "", p.familia ?? ""].some((x) =>
            x.toLowerCase().includes(q),
          ),
      );
  }, [publicables, elegidos, filtro]);

  function anadirCorreo() {
    const c = nuevoCorreo.trim();
    if (!c) return;
    if (!invitados.some((x) => x.toLowerCase() === c.toLowerCase()))
      setInvitados([...invitados, c]);
    setNuevoCorreo("");
  }

  async function generar(ev: React.FormEvent) {
    ev.preventDefault();
    setEnviando(true);
    setFallo(null);
    try {
      const r = await enviarJson("/api/v1/enlaces", {
        cuenta,
        proyecto: proyecto || undefined,
        razon,
        codigos: elegidos.map((p) => p.codigo),
        invitados: nuevoCorreo.trim() ? [...invitados, nuevoCorreo.trim()] : invitados,
        vigenciaDias: Number.isFinite(dias) ? Math.trunc(dias) : undefined,
      });
      if (r.status === 201) {
        const { enlace } = (await r.json()) as { enlace: Omit<Emitido, "generadoEn"> };
        setEmitido({ ...enlace, generadoEn: new Date() });
        setErrores(null);
        return;
      }
      if (r.status === 422) {
        setErrores(((await r.json()) as { errores: ErrorEnlace[] }).errores);
        return;
      }
      setFallo(
        r.status === 403
          ? "No tienes permiso para generar enlaces."
          : "No se pudo generar el enlace. Inténtalo de nuevo.",
      );
    } catch {
      setFallo("No se pudo generar el enlace. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (emitido) {
    const porCodigo = new Map(elegidos.map((p) => [p.codigo, p]));
    const titulo = [cuenta.trim(), proyecto.trim()].filter(Boolean).join(" · ");
    const diasVigencia = Math.round(
      (Date.parse(emitido.vigenteHasta) - emitido.generadoEn.getTime()) / DIA_MS,
    );
    return (
      <>
        <div className="pp-encabezado">
          <div className="pp-encabezado__texto">
            <h1 className="pp-encabezado__titulo">{titulo}</h1>
            <p className="pp-encabezado__meta">
              <span className="pp-mono">{emitido.codigo}</span> ·{" "}
              <span className="pp-estado pp-estado--ok">Vigente</span>
            </p>
          </div>
        </div>
        <section className="pp-tarjeta ge-form" aria-label="Enlace generado">
          <dl className="pp-datos">
            <div className="pp-datos__fila">
              <dt>Enlace</dt>
              <dd>
                <div className="ge-url">
                  <span className="ge-url__texto">{emitido.url}</span>
                  <button
                    type="button"
                    className="pp-btn pp-btn--primario"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(emitido.url).catch(() => {});
                      setCopiado(true);
                    }}
                  >
                    {copiado ? "Copiado" : "Copiar enlace"}
                  </button>
                </div>
                <p className="pp-ayuda">Cópialo ahora: por seguridad no se vuelve a mostrar.</p>
              </dd>
            </div>
            <div className="pp-datos__fila">
              <dt>Perfiles</dt>
              <dd>
                {emitido.codigos.length ? (
                  <ul
                    className="pp-lista ge-perfiles-emitidos"
                    aria-label="Lista explícita de códigos de perfil"
                  >
                    {emitido.codigos.map((c) => {
                      const p = porCodigo.get(c);
                      return (
                        <li key={c}>
                          <span className="pp-mono">{c}</span>
                          <span>{[p?.rol, p?.nombre].filter(Boolean).join(" · ")}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  "Sin selección: el cliente entra al encuadre del banco."
                )}
              </dd>
            </div>
            <div className="pp-datos__fila">
              <dt>Razón de la selección</dt>
              <dd>
                <p className="ge-razon">{razon.trim()}</p>
              </dd>
            </div>
            <div className="pp-datos__fila">
              <dt>Correos invitados</dt>
              <dd>
                <ul className="pp-lista">
                  {emitido.invitados.map((c) => (
                    <li key={c} className="ge-trunc">
                      {c}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="pp-datos__fila">
              <dt>Vigencia</dt>
              <dd className="ge-num">{`${diasVigencia} días · vence el ${dia(new Date(emitido.vigenteHasta))}`}</dd>
            </div>
            <div className="pp-datos__fila">
              <dt>Generado por</dt>
              <dd>
                {autora} · <span className="ge-num">{horaDeColombia(emitido.generadoEn)}</span>
              </dd>
            </div>
          </dl>
        </section>
        <div className="pp-toast" role="status">
          <span className="pp-toast__marca" aria-hidden="true">
            ✓
          </span>
          <p className="pp-toast__texto">{`Enlace generado. Solo ${emitido.invitados.length === 1 ? "el correo invitado puede" : `los ${emitido.invitados.length} correos invitados pueden`} entrar.`}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Nuevo enlace</h1>
        </div>
      </div>
      <form
        className="pp-tarjeta pp-form pp-form--alineado ge-form"
        aria-label="Datos del enlace curado"
        noValidate
        onSubmit={generar}
      >
        <div className="pp-form-fila">
          <div className="pp-form-fila__etiqueta">
            <label className="pp-label" htmlFor="ge-cuenta">
              Cuenta
            </label>
          </div>
          <div className="pp-form-fila__control">
            <input
              className="pp-input"
              id="ge-cuenta"
              name="cuenta"
              type="text"
              placeholder="Nombre de la empresa"
              value={cuenta}
              onChange={(e) => setCuenta(e.target.value)}
              aria-invalid={error("sin_cuenta") ? true : undefined}
              aria-describedby={error("sin_cuenta") ? "ge-cuenta-error" : undefined}
            />
            {error("sin_cuenta") && (
              <p className="pp-error" id="ge-cuenta-error">
                {error("sin_cuenta")!.mensaje}
              </p>
            )}
          </div>
        </div>
        <div className="pp-form-fila">
          <div className="pp-form-fila__etiqueta">
            <label className="pp-label" htmlFor="ge-proyecto">
              Proyecto <span className="pp-label__opcional">(opcional)</span>
            </label>
          </div>
          <div className="pp-form-fila__control">
            <input
              className="pp-input"
              id="ge-proyecto"
              name="proyecto"
              type="text"
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
            />
          </div>
        </div>
        <div className="pp-form-fila">
          <div className="pp-form-fila__etiqueta">
            <span className="pp-label" id="ge-l-perfiles">
              Perfiles
            </span>
            <p className="pp-ayuda">Se guarda esta lista de códigos, no un filtro.</p>
          </div>
          <div className="pp-form-fila__control">
            <div className="pp-filas">
              <div className="pp-filas__cabecera">
                <span className="pp-meta">
                  {elegidos.length
                    ? `${elegidos.length} ${elegidos.length === 1 ? "perfil" : "perfiles"} · ${familias} ${familias === 1 ? "familia" : "familias"}`
                    : "Sin perfiles: el cliente entra al encuadre del banco"}
                </span>
                <button
                  type="button"
                  className="ge-accion pp-enlace pp-meta"
                  aria-expanded={selector}
                  onClick={() => setSelector(!selector)}
                >
                  {selector ? "Cerrar el inventario" : "Añadir desde el inventario"}
                </button>
              </div>
              {selector && (
                <div className="ge-selector">
                  <label className="pp-sr" htmlFor="ge-buscar">
                    Buscar en el inventario publicado
                  </label>
                  <input
                    className="pp-input"
                    id="ge-buscar"
                    name="buscar"
                    type="search"
                    placeholder="Nombre, código, rol o familia"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                  <ul className="pp-lista ge-candidatos" aria-label="Perfiles publicados">
                    {candidatos.length === 0 && (
                      <li className="pp-meta ge-candidatos__vacio">
                        No hay más perfiles publicados que coincidan.
                      </li>
                    )}
                    {candidatos.map((p) => (
                      <li key={p.codigo} className="ge-candidato">
                        <span className="ge-trunc">
                          <span className="pp-mono">{p.codigo}</span> · {p.rol} · {p.nombre}
                        </span>
                        <button
                          type="button"
                          className="pp-btn pp-btn--contorno pp-btn--sm"
                          onClick={() => setElegidos([...elegidos, p])}
                        >
                          Añadir
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {elegidos.length > 0 && (
                <ul className="pp-lista" aria-labelledby="ge-l-perfiles">
                  {elegidos.map((p) => {
                    const mal = noPublicados.has(p.codigo);
                    return (
                      <li
                        key={p.codigo}
                        className={`pp-fila${mal ? " ge-fila--error" : ""}`}
                        aria-describedby={mal ? `ge-error-${p.codigo}` : undefined}
                      >
                        <div className="pp-fila__principal">
                          <p className="pp-fila__titulo ge-fila__rol">{p.rol}</p>
                          <p className="ge-fila__nombre">{p.nombre}</p>
                          <p className="pp-fila__meta">
                            <span className="pp-mono">{p.codigo}</span>
                            {[p.familia, p.ciudad].filter(Boolean).map((x) => ` · ${x}`)}
                          </p>
                        </div>
                        <div className="pp-fila__acciones">
                          {mal ? (
                            <span className="pp-estado pp-estado--borrador">No publicado</span>
                          ) : (
                            <span className={`pp-badge ${claseBanda(p.banda)}`}>
                              {ROTULO_BANDA[p.banda]}
                            </span>
                          )}
                          <button
                            type="button"
                            className="pp-btn pp-btn--fantasma pp-btn--sm"
                            aria-label={`Quitar a ${p.nombre} de la selección`}
                            onClick={() =>
                              setElegidos(elegidos.filter((x) => x.codigo !== p.codigo))
                            }
                          >
                            <IconoQuitar />
                            Quitar
                          </button>
                        </div>
                        {mal && (
                          <p className="pp-error ge-fila__error" id={`ge-error-${p.codigo}`}>
                            No está publicado: el cliente no podría verlo. Publícalo en el
                            inventario o quítalo.
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="pp-form-fila">
          <div className="pp-form-fila__etiqueta">
            <label className="pp-label" htmlFor="ge-razon">
              Razón de la selección
            </label>
            <p className="pp-ayuda">
              El cliente la lee íntegra. Pide el contexto al ejecutivo comercial.
            </p>
          </div>
          <div className="pp-form-fila__control">
            <textarea
              className="pp-input pp-input--area"
              id="ge-razon"
              name="razon"
              rows={5}
              placeholder="Por qué estos perfiles y no otros, referido al proyecto del cliente"
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              aria-invalid={error("sin_razon") ? true : undefined}
              aria-describedby={error("sin_razon") ? "ge-razon-error" : undefined}
            />
            {error("sin_razon") && (
              <p className="pp-error" id="ge-razon-error">
                {error("sin_razon")!.mensaje}
              </p>
            )}
          </div>
        </div>
        <div className="pp-form-fila">
          <div className="pp-form-fila__etiqueta">
            <span className="pp-label">Correos invitados</span>
            <p className="pp-ayuda">Solo ellos podrán entrar. Reenviar el enlace no da acceso.</p>
          </div>
          <div className="pp-form-fila__control">
            {invitados.length > 0 && (
              <div className="pp-filas">
                <ul className="pp-lista" aria-label="Correos invitados">
                  {invitados.map((c) => (
                    <li key={c} className="pp-fila ge-fila--compacta">
                      <div className="pp-fila__principal">
                        <p className="pp-fila__titulo">
                          <span className="ge-trunc">{c}</span>
                        </p>
                      </div>
                      <div className="pp-fila__acciones">
                        <button
                          type="button"
                          className="pp-btn pp-btn--fantasma pp-btn--sm"
                          aria-label={`Quitar ${c}`}
                          onClick={() => setInvitados(invitados.filter((x) => x !== c))}
                        >
                          <IconoQuitar />
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <label className="pp-sr" htmlFor="ge-correo-nuevo">
              {invitados.length ? "Añadir otro correo" : "Añadir correo"}
            </label>
            <div className="ge-anadir">
              <input
                className="pp-input"
                id="ge-correo-nuevo"
                name="correo"
                type="email"
                placeholder="nombre.apellido@empresa.com"
                value={nuevoCorreo}
                onChange={(e) => setNuevoCorreo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    anadirCorreo();
                  }
                }}
                aria-invalid={error("sin_invitados") || error("correo_invalido") ? true : undefined}
                aria-describedby={
                  error("sin_invitados") || error("correo_invalido") ? "ge-correo-error" : undefined
                }
              />
              <button type="button" className="pp-btn pp-btn--contorno" onClick={anadirCorreo}>
                Añadir
              </button>
            </div>
            {(error("sin_invitados") || error("correo_invalido")) && (
              <p className="pp-error" id="ge-correo-error">
                {(error("sin_invitados") ?? error("correo_invalido"))!.mensaje}
              </p>
            )}
          </div>
        </div>
        <div className="pp-form-fila">
          <div className="pp-form-fila__etiqueta">
            <label className="pp-label" htmlFor="ge-vigencia">
              Vigencia
            </label>
            <p className="pp-ayuda">30 días por omisión.</p>
          </div>
          <div className="pp-form-fila__control">
            <div className="ge-vigencia">
              <input
                className="pp-input"
                id="ge-vigencia"
                name="vigencia"
                type="number"
                min={1}
                max={365}
                inputMode="numeric"
                value={vigencia}
                onChange={(e) => setVigencia(e.target.value)}
                aria-describedby="ge-vigencia-fin"
                aria-invalid={error("vigencia_invalida") ? true : undefined}
              />
              <span id="ge-vigencia-fin">{venceEl ? `días · vence el ${venceEl}` : "días"}</span>
            </div>
            {error("vigencia_invalida") && (
              <p className="pp-error">{error("vigencia_invalida")!.mensaje}</p>
            )}
          </div>
        </div>
        <div className="pp-form__acciones">
          {(errores || fallo) && (
            <p className="pp-error ge-pie-error" role="alert">
              {fallo ?? resumen(errores!)}
            </p>
          )}
          <a className="pp-btn pp-btn--fantasma" href="/enlaces">
            Cancelar
          </a>
          <button type="submit" className="pp-btn pp-btn--primario" disabled={enviando}>
            Generar enlace
          </button>
        </div>
      </form>
    </>
  );
}
