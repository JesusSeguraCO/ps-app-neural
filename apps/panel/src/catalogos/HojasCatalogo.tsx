"use client";
// Acciones de Catálogos en hojas laterales (prototipo catalogos y variantes --duplicado, --parecidos,
// --familia-sin-modalidades, --modalidad-en-uso y --fusion; HU-089, HU-143): crear y editar con la
// revisión del nombre mientras se escribe (idéntico → bloqueo con el existente; parecido → «Usar X» o
// confirmar que es distinto), aviso de familia sin modalidades de prueba, desactivar con las fichas
// que dependen y fusionar con la vista de impacto antes de confirmar. Nada se borra.
import { useEffect, useMemo, useRef, useState } from "react";
import type { TipoCatalogo } from "@ps/dominio/catalogo/tipos";
import { enviarJson } from "../acceso/cliente";
import { Hoja, recargarConAviso } from "../marco/Hoja";

export interface Opcion {
  id: string;
  nombre: string;
}

export interface ValorFila {
  id: string;
  nombre: string;
  activo: boolean;
  grupo: string | null;
  familiaId: string | null;
  perfiles: number;
  textoCliente?: string | null;
  enunciadoReto?: string | null;
  entregables?: string | null;
  criterios?: string | null;
}

export interface ContextoCatalogo {
  tipo: TipoCatalogo;
  singular: string;
  femenino: boolean;
  familias: Array<Opcion & { modalidades: number }>;
  grupos: readonly string[];
  // Valores activos del catálogo, para elegir el destino de una fusión.
  activos: Array<Opcion & { perfiles: number; familiaId: string | null }>;
}

type Revision =
  | { tipo: "vacio" }
  | { tipo: "nuevo" }
  | { tipo: "identico"; existente: ValorComparable }
  | { tipo: "parecido"; parecidos: ValorComparable[] };
interface ValorComparable {
  id: string;
  nombre: string;
  activo: boolean;
  perfiles: number;
  grupo: string | null;
}

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const perfilesTexto = (n: number) => `${n} ${n === 1 ? "perfil" : "perfiles"}`;
const conFamilia = (t: TipoCatalogo) => t === "rol" || t === "modalidad_prueba";

function IconoMas() {
  return (
    <svg className="pp-icono pp-icono--sm" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </svg>
  );
}

// ─── crear y editar ───────────────────────────────────────────────────────────────────────
function HojaValor({
  ctx,
  valor,
  familiaInicial,
  alCerrar,
}: {
  ctx: ContextoCatalogo;
  valor?: ValorFila;
  familiaInicial?: string;
  alCerrar: () => void;
}) {
  const { tipo, singular } = ctx;
  const [nombre, setNombre] = useState(valor?.nombre ?? "");
  const [familiaId, setFamiliaId] = useState(valor?.familiaId ?? familiaInicial ?? "");
  const [grupo, setGrupo] = useState(valor?.grupo ?? "");
  const [textoCliente, setTextoCliente] = useState(valor?.textoCliente ?? "");
  const [enunciadoReto, setEnunciadoReto] = useState(valor?.enunciadoReto ?? "");
  const [entregables, setEntregables] = useState(valor?.entregables ?? "");
  const [criterios, setCriterios] = useState(valor?.criterios ?? "");
  const [distinto, setDistinto] = useState(false);
  const [revision, setRevision] = useState<Revision>({ tipo: "vacio" });
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const familia = ctx.familias.find((f) => f.id === familiaId);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!nombre.trim()) return setRevision({ tipo: "vacio" });
      const q = new URLSearchParams({ revisar: nombre });
      if (familiaId) q.set("familiaId", familiaId);
      if (valor) q.set("excepto", valor.id);
      const r = await fetch(`/api/v1/catalogos/${tipo}?${q}`).catch(() => null);
      if (r?.ok) setRevision((await r.json()) as Revision);
    }, 250);
    return () => clearTimeout(t);
  }, [nombre, familiaId, tipo, valor]);
  useEffect(() => setDistinto(false), [revision.tipo]);

  const faltaFamilia = conFamilia(tipo) && !familiaId;
  const faltaTexto = tipo === "modalidad_prueba" && !textoCliente.trim();
  const bloqueado =
    revision.tipo === "vacio" ||
    revision.tipo === "identico" ||
    (revision.tipo === "parecido" && !distinto) ||
    faltaFamilia ||
    faltaTexto ||
    enviando;
  const verbo = valor ? "Guardar" : `Crear ${singular}`;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (bloqueado) return;
    setEnviando(true);
    setError(null);
    const cuerpo = {
      nombre,
      ...(conFamilia(tipo) ? { familiaId } : {}),
      ...(tipo === "tecnologia" ? { grupo: grupo || null } : {}),
      ...(tipo === "modalidad_prueba"
        ? {
            textoCliente,
            enunciadoReto: enunciadoReto || null,
            entregables: entregables || null,
            criterios: criterios || null,
          }
        : {}),
      ...(revision.tipo === "parecido" ? { confirmarDistinto: distinto } : {}),
    };
    const r = await enviarJson(
      valor ? `/api/v1/catalogos/${tipo}/${valor.id}` : `/api/v1/catalogos/${tipo}`,
      cuerpo,
      valor ? "PATCH" : "POST",
    ).catch(() => null);
    if (r && (r.status === 201 || r.status === 200)) {
      const { valor: v } = (await r.json()) as {
        valor: { nombre: string; advertencia: string | null; familia: string | null };
      };
      const base = valor
        ? `${mayuscula(singular)} guardad${ctx.femenino ? "a" : "o"}: ${v.nombre}.`
        : `${mayuscula(singular)} cread${ctx.femenino ? "a" : "o"}: ${v.nombre}.`;
      return recargarConAviso(
        v.advertencia === "familia_sin_modalidades"
          ? `${base} Sus perfiles no se podrán publicar hasta que ${v.familia} tenga una modalidad de prueba.`
          : base,
      );
    }
    setEnviando(false);
    const cuerpoError = r ? ((await r.json().catch(() => ({}))) as { motivo?: string }) : {};
    setError(
      r?.status === 403
        ? "Tu rol es de consulta: no puedes cambiar los catálogos."
        : cuerpoError.motivo === "duplicado"
          ? "Ese nombre ya existe en el catálogo."
          : cuerpoError.motivo === "parecido"
            ? "Confirma que es distinto del valor parecido."
            : "No se pudo guardar. Inténtalo de nuevo.",
    );
  }

  return (
    <Hoja
      titulo={valor ? `Editar ${singular}` : `Crear ${singular}`}
      cerrarEtiqueta="Cerrar"
      alCerrar={alCerrar}
      pie={
        <>
          <button type="button" className="pp-btn pp-btn--fantasma" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            form="ct-form"
            className="pp-btn pp-btn--primario"
            disabled={bloqueado}
          >
            {verbo}
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo">
        <form className="pp-form" id="ct-form" onSubmit={enviar} noValidate>
          <div className="pp-campo">
            <label className="pp-label" htmlFor="ct-nombre">
              {`Nombre ${ctx.femenino ? "de la" : "del"} ${singular}`}
            </label>
            <input
              className="pp-input"
              id="ct-nombre"
              type="text"
              data-foco
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={revision.tipo === "identico" ? true : undefined}
              aria-describedby="ct-nombre-val"
            />
            {revision.tipo === "identico" && (
              <p className="pp-error" id="ct-nombre-val" role="alert">
                {`${revision.existente.nombre} ya existe${revision.existente.activo ? "" : " (desactivad" + (ctx.femenino ? "a" : "o") + ")"}. Las mayúsculas no l${ctx.femenino ? "a" : "o"} hacen distint${ctx.femenino ? "a" : "o"}: usa ${ctx.femenino ? "la" : "el"} que hay.`}
              </p>
            )}
            {revision.tipo === "nuevo" && (
              <p className="ct-ok" id="ct-nombre-val">
                <span aria-hidden="true">✓</span>
                {`${ctx.femenino ? "Ninguna" : "Ningún"} ${singular} parecid${ctx.femenino ? "a" : "o"} en el catálogo.`}
              </p>
            )}
          </div>
          {revision.tipo === "identico" && (
            <div className="ct-existe">
              <span>
                <span className="ct-existe__nombre">{revision.existente.nombre}</span>
                <span className="ct-existe__meta">
                  {revision.existente.grupo ? `${revision.existente.grupo} · ` : ""}
                  <span className="pp-mono">{revision.existente.perfiles}</span>{" "}
                  {revision.existente.perfiles === 1 ? "perfil" : "perfiles"}
                </span>
              </span>
              <a
                className="pp-btn pp-btn--contorno pp-btn--sm"
                href={`/catalogos?tipo=${tipo}&q=${encodeURIComponent(revision.existente.nombre)}`}
              >
                Ver en la lista
              </a>
            </div>
          )}
          {revision.tipo === "parecido" && (
            <div className="pp-aviso pp-aviso--warn" role="status" id="ct-nombre-val">
              <span className="pp-aviso__icono" aria-hidden="true">
                !
              </span>
              <p>
                <span className="pp-aviso__titulo">{`Se parece a ${revision.parecidos.map((x) => x.nombre).join(", ")}, que ya existe.`}</span>
                {`L${ctx.femenino ? "a" : "o"} usan `}
                <span className="pp-mono">{revision.parecidos[0]!.perfiles}</span>
                {` ${revision.parecidos[0]!.perfiles === 1 ? "perfil" : "perfiles"}. Si es ${ctx.femenino ? "la misma" : "el mismo"}, úsal${ctx.femenino ? "a" : "o"} y el filtro del cliente no se parte en dos.`}
              </p>
              <a
                className="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
                href={`/catalogos?tipo=${tipo}&q=${encodeURIComponent(revision.parecidos[0]!.nombre)}`}
              >
                {`Usar ${revision.parecidos[0]!.nombre}`}
              </a>
            </div>
          )}
          {conFamilia(tipo) && (
            <div className="pp-campo">
              <label className="pp-label" htmlFor="ct-familia">
                Familia
              </label>
              <div className="pp-select">
                <select
                  className="pp-input"
                  id="ct-familia"
                  required
                  value={familiaId}
                  onChange={(e) => setFamiliaId(e.target.value)}
                  aria-describedby={
                    tipo === "rol" ? "ct-familia-ayuda ct-familia-aviso" : undefined
                  }
                >
                  <option value="">Elige una familia</option>
                  {ctx.familias.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {tipo === "rol" && (
                <p className="pp-ayuda" id="ct-familia-ayuda">
                  Define con qué modalidades de prueba se valida el rol.
                </p>
              )}
            </div>
          )}
          {tipo === "rol" && familia && familia.modalidades === 0 && (
            <div className="pp-aviso pp-aviso--warn" role="status" id="ct-familia-aviso">
              <span className="pp-aviso__icono" aria-hidden="true">
                !
              </span>
              <p>
                <span className="pp-aviso__titulo">{`${familia.nombre} no tiene modalidades de prueba.`}</span>
                Puedes crear el rol, pero sus perfiles no se podrán publicar hasta que definas al
                menos una.{" "}
                <a
                  className="pp-enlace"
                  href={`/catalogos?tipo=modalidad_prueba&crear=1&familia=${familia.id}`}
                >
                  Definir modalidades
                </a>
              </p>
            </div>
          )}
          {tipo === "tecnologia" && (
            <div className="pp-campo">
              <label className="pp-label" htmlFor="ct-grupo">
                Grupo <span className="pp-label__opcional">(opcional)</span>
              </label>
              <div className="pp-select">
                <select
                  className="pp-input"
                  id="ct-grupo"
                  value={grupo}
                  onChange={(e) => setGrupo(e.target.value)}
                >
                  <option value="">Sin grupo</option>
                  {ctx.grupos.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {tipo === "modalidad_prueba" && (
            <>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="ct-texto">
                  Lo que ve el cliente
                </label>
                <textarea
                  className="pp-input pp-input--area"
                  id="ct-texto"
                  value={textoCliente}
                  onChange={(e) => setTextoCliente(e.target.value)}
                  aria-describedby="ct-texto-ayuda"
                  aria-invalid={
                    faltaTexto && textoCliente !== (valor?.textoCliente ?? "") ? true : undefined
                  }
                />
                <p className="pp-ayuda" id="ct-texto-ayuda">
                  Qué exige, qué evalúa y qué entrega la prueba. Es el Nivel 0 de la ficha
                  publicada.
                </p>
              </div>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="ct-reto">
                  Enunciado del reto <span className="pp-label__opcional">(opcional)</span>
                </label>
                <textarea
                  className="pp-input pp-input--area"
                  id="ct-reto"
                  value={enunciadoReto}
                  onChange={(e) => setEnunciadoReto(e.target.value)}
                />
              </div>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="ct-entregables">
                  Entregables <span className="pp-label__opcional">(opcional)</span>
                </label>
                <textarea
                  className="pp-input pp-input--area"
                  id="ct-entregables"
                  value={entregables}
                  onChange={(e) => setEntregables(e.target.value)}
                />
              </div>
              <div className="pp-campo">
                <label className="pp-label" htmlFor="ct-criterios">
                  Criterios de evaluación <span className="pp-label__opcional">(opcional)</span>
                </label>
                <textarea
                  className="pp-input pp-input--area"
                  id="ct-criterios"
                  value={criterios}
                  onChange={(e) => setCriterios(e.target.value)}
                />
                <p className="pp-ayuda">
                  Precargan el borrador del reporte de validación; una persona lo confirma.
                </p>
              </div>
            </>
          )}
          {revision.tipo === "parecido" && (
            <label className="pp-check">
              <input
                type="checkbox"
                checked={distinto}
                onChange={(e) => setDistinto(e.target.checked)}
              />
              <span className="pp-check__texto">
                {`${nombre.trim()} es ${ctx.femenino ? "una" : "un"} ${singular} distint${ctx.femenino ? "a" : "o"} de ${revision.parecidos[0]!.nombre}`}
                <span className="pp-check__ayuda">
                  Márcalo solo para crearl{ctx.femenino ? "a" : "o"} aun así. Queda registrado con
                  tu correo.
                </span>
              </span>
            </label>
          )}
          {error && (
            <p className="pp-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </Hoja>
  );
}

// ─── desactivar ───────────────────────────────────────────────────────────────────────────
interface DependientesDatos {
  nombre: string;
  familia: string | null;
  publicados: Array<{ codigo: string; nombre: string }>;
  borradores: number;
  otros: number;
}

function HojaDesactivar({
  ctx,
  valor,
  alCerrar,
}: {
  ctx: ContextoCatalogo;
  valor: ValorFila;
  alCerrar: () => void;
}) {
  const [dep, setDep] = useState<DependientesDatos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    fetch(`/api/v1/catalogos/${ctx.tipo}/${valor.id}`)
      .then((r) => (r.ok ? (r.json() as Promise<DependientesDatos>) : null))
      .then(setDep)
      .catch(() => setError("No se pudo leer cuántas fichas dependen."));
  }, [ctx.tipo, valor.id]);
  const a = ctx.femenino ? "a" : "o";
  const etiqueta = ctx.tipo === "modalidad_prueba" ? "modalidad" : ctx.singular;

  async function desactivar() {
    setEnviando(true);
    const r = await enviarJson(`/api/v1/catalogos/${ctx.tipo}/${valor.id}/desactivar`, {}).catch(
      () => null,
    );
    if (r?.status === 200)
      return recargarConAviso(
        `${mayuscula(ctx.singular)} desactivad${a}: ${valor.nombre}. Sus fichas l${a} conservan.`,
      );
    setEnviando(false);
    setError(
      r?.status === 403
        ? "Tu rol es de consulta: no puedes cambiar los catálogos."
        : "No se pudo desactivar. Inténtalo de nuevo.",
    );
  }

  return (
    <Hoja
      titulo={`Desactivar «${valor.nombre}»`}
      sub={[mayuscula(ctx.singular), dep?.familia].filter(Boolean).join(" · ")}
      cerrarEtiqueta="Cerrar"
      alCerrar={alCerrar}
      pie={
        <>
          <button type="button" className="pp-btn pp-btn--fantasma" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--destructivo"
            onClick={desactivar}
            disabled={!dep || enviando}
          >
            {`Desactivar ${etiqueta}`}
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo">
        {dep && dep.publicados.length > 0 && (
          <div className="pp-aviso pp-aviso--warn" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              !
            </span>
            <p>
              <span className="pp-aviso__titulo">
                <span className="pp-mono">{dep.publicados.length}</span>
                {` ${dep.publicados.length === 1 ? "ficha publicada l" + a + " cita" : "fichas publicadas l" + a + " citan"}.`}
              </span>
              {`Conservan su texto tal cual y siguen explicando cómo se validó a cada profesional.`}
              {dep.borradores > 0 && (
                <>
                  {" "}
                  <span className="pp-mono">{dep.borradores}</span>
                  {` ${dep.borradores === 1 ? "borrador también l" + a + " tiene" : "borradores también l" + a + " tienen"}.`}
                </>
              )}
            </p>
          </div>
        )}
        {dep && dep.publicados.length === 0 && (
          <div className="pp-aviso pp-aviso--info" role="status">
            <span className="pp-aviso__icono" aria-hidden="true">
              i
            </span>
            <p>
              <span className="pp-aviso__titulo">Ninguna ficha publicada l{a} cita.</span>
              {dep.borradores + dep.otros > 0
                ? `${perfilesTexto(dep.borradores + dep.otros)} sin publicar l${a} conservan.`
                : "Ningún perfil l" + a + " usa."}
            </p>
          </div>
        )}
        {dep && dep.publicados.length > 0 && (
          <section className="ct-seccion" aria-labelledby="ct-fichas">
            <h3 className="ct-seccion__titulo" id="ct-fichas">
              {`Fichas publicadas que l${a} citan`}
            </h3>
            <ul className="ct-perfiles">
              {dep.publicados.map((p) => (
                <li key={p.codigo} className="ct-perfil ct-perfil--2">
                  <span className="ct-perfil__codigo">{p.codigo}</span>
                  <span className="ct-perfil__nombre">{p.nombre}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="ct-regla">{`Deja de poder elegirse en perfiles nuevos. No se borra: puedes reactivarl${a} cuando quieras.`}</p>
        {error && (
          <p className="pp-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </Hoja>
  );
}

// ─── fusionar ─────────────────────────────────────────────────────────────────────────────
interface Impacto {
  origen: { id: string; nombre: string; perfiles: number };
  destino: { id: string; nombre: string; perfiles: number };
  perfiles: Array<{ codigo: string; nombre: string; estado: string }>;
}
const ESTADO: Record<string, [string, string]> = {
  publicado: ["Publicado", "pp-estado--ok"],
  borrador: ["Borrador", "pp-estado--borrador"],
  pausado: ["Pausado", "pp-estado--warn"],
  archivado: ["Archivado", "pp-estado--neutro"],
  colocado: ["Colocado", "pp-estado--info"],
};
const MOTIVO_FUSION: Record<string, string> = {
  mismo_valor: "Origen y destino son el mismo valor: no hay nada que fusionar.",
  distinto_catalogo: "Solo se fusionan valores activos del mismo catálogo.",
  distinta_familia: "Solo se fusionan modalidades de prueba de la misma familia.",
  modalidad_repetida:
    "Las dos familias tienen una modalidad con el mismo nombre: fusiónalas primero.",
};

function HojaFusion({
  ctx,
  origenInicial,
  alCerrar,
}: {
  ctx: ContextoCatalogo;
  origenInicial?: string;
  alCerrar: () => void;
}) {
  const [origen, setOrigen] = useState(origenInicial ?? "");
  const [destino, setDestino] = useState("");
  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const [rechazo, setRechazo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const plural =
    ctx.tipo === "modalidad_prueba"
      ? "modalidades de prueba"
      : ctx.singular === "rol"
        ? "roles"
        : ctx.singular === "sector"
          ? "sectores"
          : `${ctx.singular}s`;
  const destinos = useMemo(() => {
    const o = ctx.activos.find((v) => v.id === origen);
    return ctx.activos.filter(
      (v) =>
        v.id !== origen && (ctx.tipo !== "modalidad_prueba" || !o || v.familiaId === o.familiaId),
    );
  }, [ctx, origen]);

  useEffect(() => {
    setImpacto(null);
    setRechazo(null);
    if (!origen || !destino) return;
    let vigente = true;
    (async () => {
      const r = await enviarJson(`/api/v1/catalogos/${ctx.tipo}/${origen}/fusionar?previsualizar`, {
        destinoId: destino,
      }).catch(() => null);
      if (!vigente) return;
      const cuerpo = r
        ? ((await r.json().catch(() => ({}))) as { impacto?: Impacto; motivo?: string })
        : {};
      if (r?.status === 200 && cuerpo.impacto) setImpacto(cuerpo.impacto);
      else
        setRechazo(
          r?.status === 403
            ? "Tu rol es de consulta: no puedes fusionar."
            : (MOTIVO_FUSION[cuerpo.motivo ?? ""] ?? "No se pudo calcular el impacto."),
        );
    })();
    return () => {
      vigente = false;
    };
  }, [ctx.tipo, origen, destino]);

  async function fusionar() {
    if (!impacto) return;
    setEnviando(true);
    const r = await enviarJson(`/api/v1/catalogos/${ctx.tipo}/${origen}/fusionar`, {
      destinoId: destino,
    }).catch(() => null);
    const cuerpo = r
      ? ((await r.json().catch(() => ({}))) as { reasignados?: number; motivo?: string })
      : {};
    if (r?.status === 200)
      return recargarConAviso(
        `${impacto.origen.nombre} se fusionó en ${impacto.destino.nombre}: ${perfilesTexto(cuerpo.reasignados ?? 0)} pasaron a ${impacto.destino.nombre}.`,
      );
    setEnviando(false);
    setRechazo(MOTIVO_FUSION[cuerpo.motivo ?? ""] ?? "No se pudo fusionar. Nada cambió.");
  }

  return (
    <Hoja
      titulo={`Fusionar ${plural}`}
      cerrarEtiqueta="Cerrar"
      alCerrar={alCerrar}
      pie={
        <>
          <p className="ct-pie-nota">Nada cambia hasta que confirmes. Después no se deshace.</p>
          <button type="button" className="pp-btn pp-btn--fantasma" onClick={alCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn pp-btn--primario"
            onClick={fusionar}
            disabled={!impacto || enviando}
          >
            {impacto ? `Fusionar en ${impacto.destino.nombre}` : "Fusionar"}
          </button>
        </>
      }
    >
      <div className="pp-hoja__cuerpo">
        <dl className="pp-datos ct-par">
          <div className="pp-datos__fila">
            <dt>
              <label htmlFor="ct-origen">Se fusiona</label>
            </dt>
            <dd>
              {impacto ? (
                <span>
                  <span className="ct-par__valor">{impacto.origen.nombre}</span>{" "}
                  <span className="ct-par__meta">{`· ${perfilesTexto(impacto.origen.perfiles)} · sale del catálogo`}</span>
                </span>
              ) : null}
              <div className="pp-select ct-par__select" hidden={Boolean(impacto)}>
                <select
                  className="pp-input"
                  id="ct-origen"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  data-foco
                >
                  <option value="">Elige el valor que sale</option>
                  {ctx.activos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </dd>
          </div>
          <div className="pp-datos__fila">
            <dt>
              <label htmlFor="ct-destino">Destino</label>
            </dt>
            <dd>
              {impacto ? (
                <span>
                  <span className="ct-par__valor">{impacto.destino.nombre}</span>{" "}
                  <span className="ct-par__meta">{`· ${perfilesTexto(impacto.destino.perfiles)}`}</span>
                </span>
              ) : (
                <div className="pp-select ct-par__select">
                  <select
                    className="pp-input"
                    id="ct-destino"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                  >
                    <option value="">Elige el valor que queda</option>
                    {destinos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {impacto && (
                <button
                  type="button"
                  className="pp-btn pp-btn--fantasma pp-btn--sm"
                  onClick={() => {
                    setOrigen(destino);
                    setDestino(origen);
                  }}
                >
                  Invertir
                </button>
              )}
            </dd>
          </div>
        </dl>
        {impacto && (
          <section className="ct-seccion" aria-labelledby="ct-impacto">
            <h3 className="ct-seccion__titulo" id="ct-impacto">
              <span className="pp-mono">{impacto.perfiles.length}</span>
              {` ${impacto.perfiles.length === 1 ? "perfil pasa" : "perfiles pasan"} de ${impacto.origen.nombre} a ${impacto.destino.nombre}`}
            </h3>
            <p className="ct-seccion__meta">{`Los publicados mostrarán ${impacto.destino.nombre} en su ficha.`}</p>
            {impacto.perfiles.length > 0 && (
              <ul className="ct-perfiles">
                {impacto.perfiles.map((p) => (
                  <li key={p.codigo} className="ct-perfil">
                    <span className="ct-perfil__codigo">{p.codigo}</span>
                    <span className="ct-perfil__nombre">{p.nombre}</span>
                    <span className={`pp-estado ${ESTADO[p.estado]?.[1] ?? "pp-estado--neutro"}`}>
                      {ESTADO[p.estado]?.[0] ?? p.estado}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="pp-btn pp-btn--fantasma pp-btn--sm ct-cambiar"
              onClick={() => setImpacto(null)}
            >
              Elegir otros valores
            </button>
          </section>
        )}
        {rechazo && (
          <p className="pp-error" role="alert">
            {rechazo}
          </p>
        )}
      </div>
    </Hoja>
  );
}

// ─── puntos de entrada ────────────────────────────────────────────────────────────────────
export function AccionesEncabezado({
  ctx,
  crearAbierto,
  familiaInicial,
}: {
  ctx: ContextoCatalogo;
  crearAbierto: boolean;
  familiaInicial?: string;
}) {
  const [hoja, setHoja] = useState<null | "crear" | "fusion">(crearAbierto ? "crear" : null);
  return (
    <>
      <button type="button" className="pp-btn pp-btn--contorno" onClick={() => setHoja("fusion")}>
        Fusionar duplicados
      </button>
      <button type="button" className="pp-btn pp-btn--primario" onClick={() => setHoja("crear")}>
        {`Crear ${ctx.singular}`}
      </button>
      {hoja === "crear" && (
        <HojaValor ctx={ctx} familiaInicial={familiaInicial} alCerrar={() => setHoja(null)} />
      )}
      {hoja === "fusion" && <HojaFusion ctx={ctx} alCerrar={() => setHoja(null)} />}
    </>
  );
}

export function AccionesFila({ ctx, valor }: { ctx: ContextoCatalogo; valor: ValorFila }) {
  const [hoja, setHoja] = useState<null | "editar" | "desactivar" | "fusion">(null);
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!menu) return;
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false);
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [menu]);

  async function reactivar() {
    const r = await enviarJson(`/api/v1/catalogos/${ctx.tipo}/${valor.id}/reactivar`, {}).catch(
      () => null,
    );
    if (r?.status === 200)
      return recargarConAviso(
        `${mayuscula(ctx.singular)} reactivad${ctx.femenino ? "a" : "o"}: ${valor.nombre}.`,
      );
    setError("No se pudo reactivar.");
  }

  return (
    <span className="ct-acc" ref={ref}>
      {valor.activo ? (
        <button
          type="button"
          className="pp-btn pp-btn--fantasma pp-btn--sm"
          aria-label={`Editar ${valor.nombre}`}
          onClick={() => setHoja("editar")}
        >
          Editar
        </button>
      ) : (
        <button
          type="button"
          className="pp-btn pp-btn--fantasma pp-btn--sm"
          aria-label={`Reactivar ${valor.nombre}`}
          onClick={reactivar}
        >
          Reactivar
        </button>
      )}
      <button
        type="button"
        className="pp-btn pp-btn--fantasma pp-btn--sm pp-btn--icono"
        aria-label={valor.activo ? `Más acciones para ${valor.nombre}: desactivar o fusionar` : `Más acciones para ${valor.nombre}`}
        aria-haspopup="menu"
        aria-expanded={menu}
        onClick={() => setMenu((m) => !m)}
      >
        <IconoMas />
      </button>
      {menu && (
        <span className="ct-menu" role="menu">
          {valor.activo ? (
            <>
              <button type="button" role="menuitem" className="ct-menu__item" onClick={() => (setMenu(false), setHoja("editar"))}>
                Editar
              </button>
              <button type="button" role="menuitem" className="ct-menu__item" onClick={() => (setMenu(false), setHoja("desactivar"))}>
                Desactivar
              </button>
              <button type="button" role="menuitem" className="ct-menu__item" onClick={() => (setMenu(false), setHoja("fusion"))}>
                Fusionar con otro valor
              </button>
            </>
          ) : (
            <button type="button" role="menuitem" className="ct-menu__item" onClick={() => (setMenu(false), void reactivar())}>
              Reactivar
            </button>
          )}
        </span>
      )}
      {error && (
        <span className="pp-error" role="alert">
          {error}
        </span>
      )}
      {hoja === "editar" && <HojaValor ctx={ctx} valor={valor} alCerrar={() => setHoja(null)} />}
      {hoja === "desactivar" && (
        <HojaDesactivar ctx={ctx} valor={valor} alCerrar={() => setHoja(null)} />
      )}
      {hoja === "fusion" && (
        <HojaFusion ctx={ctx} origenInicial={valor.id} alCerrar={() => setHoja(null)} />
      )}
    </span>
  );
}
