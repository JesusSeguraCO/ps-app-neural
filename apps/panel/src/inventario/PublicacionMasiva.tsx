"use client";
// Publicación masiva (HU-128 edge; prototipo inventario-perfiles--publicacion-masiva). La tabla del
// inventario la dibuja el servidor con una casilla por fila (`name="ip-sel"`); `BarraSeleccion`
// cuenta las marcadas y publica a la vez las elegidas. El servidor publica las que cumplen y señala
// a las demás con su motivo, sin abortar; el resultado se guarda para mostrarlo tras recargar
// (`ResultadoPublicacion`), con la salida directa a resolver cada motivo.
import { useEffect, useState } from "react";
import {
  MOTIVO_CONDICION,
  OPCIONES_DISPONIBILIDAD,
} from "@ps/dominio/inventario/perfil";
import { enviarJson } from "../acceso/cliente";
import { bandaCliente, cuerpoDisponibilidad, type EleccionDisponibilidad } from "./EstadoEnLista";
import { ANCLA_CONDICION, esValidacionDeEntrada } from "./anclas";

const CLAVE = "pp-publicacion-masiva";
// Disponibilidad en bloque (HU-132 edge): el resultado se muestra por perfil tras recargar.
const CLAVE_DISP = "pp-disponibilidad-bloque";
interface ResultadoBloque {
  banda: string | null;
  filas: Array<{ codigo: string; nombre: string; ok: boolean; motivo?: string; estado?: string }>;
}

export interface Fallo {
  codigo: string;
  nombre: string;
  motivos: string[];
  estado?: string;
  condiciones?: Array<{ clave: string; detalle?: string }>;
  faltanDatos?: Array<{ campo: string; etiqueta: string }>;
  familia?: { nombre: string; modalidades: number } | null;
  // Contradicción ALTA entre estado y disponibilidad que impidió publicarlo (HU-134).
  contradiccion?: string;
}
interface Resultado {
  total: number;
  publicados: string[];
  fallos: Fallo[];
}

const casillas = () =>
  Array.from(document.querySelectorAll<HTMLInputElement>('input[name="ip-sel"]'));

export function BarraSeleccion() {
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eleccion, setEleccion] = useState<EleccionDisponibilidad>("");
  const [dia, setDia] = useState("");
  const [aplicando, setAplicando] = useState(false);

  useEffect(() => {
    const leer = () =>
      setElegidos(
        casillas()
          .filter((c) => c.checked)
          .map((c) => c.value),
      );
    const alCambiar = (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (t.matches?.("input[data-ip-todos]")) for (const c of casillas()) c.checked = t.checked;
      if (t.matches?.('input[name="ip-sel"], input[data-ip-todos]')) leer();
    };
    document.addEventListener("change", alCambiar);
    leer();
    return () => document.removeEventListener("change", alCambiar);
  }, []);

  if (elegidos.length === 0) return null;

  const quitar = () => {
    for (const c of casillas()) c.checked = false;
    const todos = document.querySelector<HTMLInputElement>("input[data-ip-todos]");
    if (todos) todos.checked = false;
    setElegidos([]);
  };

  async function publicar() {
    setPublicando(true);
    setError(null);
    try {
      const r = await enviarJson("/api/v1/perfiles/publicar", { codigos: elegidos });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(
          d.motivo === "lote_demasiado_grande"
            ? `Se publican hasta ${d.tope} perfiles a la vez. Quita algunos de la selección.`
            : "No se pudo publicar. Inténtalo de nuevo.",
        );
        return;
      }
      const nombre = (codigo: string) =>
        casillas().find((c) => c.value === codigo)?.dataset.nombre ?? codigo;
      const resultado: Resultado = {
        total: d.resultados.length,
        publicados: d.resultados
          .filter((x: { ok: boolean }) => x.ok)
          .map((x: { codigo: string }) => nombre(x.codigo)),
        fallos: d.resultados
          .filter((x: { ok: boolean }) => !x.ok)
          .map((x: Omit<Fallo, "nombre">) => ({ ...x, nombre: nombre(x.codigo) })),
      };
      try {
        sessionStorage.setItem(CLAVE, JSON.stringify(resultado));
      } catch {
        // Sin almacenamiento solo se pierde el detalle tras recargar.
      }
      window.location.reload();
    } finally {
      setPublicando(false);
    }
  }

  const nombreDe = (codigo: string) =>
    casillas().find((c) => c.value === codigo)?.dataset.nombre ?? codigo;

  async function aplicarDisponibilidad() {
    if (!eleccion || (eleccion === "fecha" && !dia)) return;
    setAplicando(true);
    setError(null);
    try {
      const r = await enviarJson("/api/v1/perfiles/disponibilidad", {
        codigos: elegidos,
        disponibilidad: cuerpoDisponibilidad(eleccion, dia),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError("No se pudo actualizar la disponibilidad. Inténtalo de nuevo.");
        return;
      }
      const resultado: ResultadoBloque = {
        banda: bandaCliente(eleccion, dia),
        filas: d.resultados.map(
          (x: { codigo: string; ok: boolean; motivo?: string; estado?: string }) => ({
            ...x,
            nombre: nombreDe(x.codigo),
          }),
        ),
      };
      try {
        sessionStorage.setItem(CLAVE_DISP, JSON.stringify(resultado));
      } catch {
        // Sin almacenamiento solo se pierde el detalle tras recargar.
      }
      window.location.reload();
    } finally {
      setAplicando(false);
    }
  }

  const n = elegidos.length;
  const banda = bandaCliente(eleccion, dia);
  return (
    <div className="ip-lote" role="region" aria-label="Acciones sobre los perfiles seleccionados">
      <p className="ip-lote__cuenta" aria-live="polite">
        {n === 1 ? "1 seleccionado" : `${n} seleccionados`}
      </p>
      <div className="ip-lote__disp">
        <label className="pp-label" htmlFor="ip-lote-disp">
          Disponibilidad
        </label>
        <div className="pp-select">
          <select
            className="pp-input"
            id="ip-lote-disp"
            value={eleccion}
            onChange={(e) => setEleccion(e.target.value as EleccionDisponibilidad)}
          >
            <option value="">Elegir…</option>
            {Object.entries(OPCIONES_DISPONIBILIDAD).map(([k, o]) => (
              <option key={k} value={k}>
                {o.etiqueta}
              </option>
            ))}
            <option value="fecha">Elegir una fecha…</option>
          </select>
        </div>
        {eleccion === "fecha" && (
          <>
            <label className="pp-sr" htmlFor="ip-lote-fecha">
              Quedan libres el
            </label>
            <input
              className="pp-input"
              id="ip-lote-fecha"
              type="date"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            />
          </>
        )}
        <button
          type="button"
          className="pp-btn pp-btn--contorno pp-btn--sm"
          disabled={!eleccion || (eleccion === "fecha" && !dia) || aplicando}
          aria-describedby="ip-lote-ayuda"
          onClick={aplicarDisponibilidad}
        >
          {aplicando ? "Aplicando…" : n === 1 ? "Aplicar al seleccionado" : `Aplicar a los ${n}`}
        </button>
        <p className="pp-ayuda ip-lote__ayuda" id="ip-lote-ayuda">
          {banda
            ? `El cliente verá «${banda}», no la fecha.`
            : "El cliente verá la banda, no la fecha."}
        </p>
      </div>
      <div className="ip-lote__acciones">
        <button type="button" className="pp-btn pp-btn--fantasma pp-btn--sm" onClick={quitar}>
          Quitar la selección
        </button>
        <button
          type="button"
          className="pp-btn pp-btn--primario pp-btn--sm"
          onClick={publicar}
          disabled={publicando}
        >
          {publicando ? "Publicando…" : n === 1 ? "Publicar el seleccionado" : `Publicar los ${n}`}
        </button>
      </div>
      {error && (
        <p className="pp-error" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Motivo y salida de un perfil que no se publicó.
export function motivo(f: Fallo): { nota: string; accion: string; href: string } {
  const editor = `/inventario/${f.codigo}`;
  if (f.motivos.includes("no_existe"))
    return {
      nota: "Ya no existe en el inventario.",
      accion: "Ver el inventario",
      href: "/inventario",
    };
  if (f.motivos.includes("incoherencia"))
    return {
      nota: f.contradiccion ?? "Su estado y su disponibilidad se contradicen: resuélvelo en su fila.",
      accion: "Resolver en su fila",
      href: `/inventario?estado=incoherencia&q=${encodeURIComponent(f.codigo)}`,
    };
  if (f.motivos.includes("transicion_invalida"))
    return {
      nota:
        f.estado === "publicado"
          ? "Ya estaba publicado."
          : f.estado === "archivado"
            ? "Está archivado: no se publica."
            : "Su estado no permite publicarlo.",
      accion: "Ver el perfil",
      href: editor,
    };
  const notas: string[] = [];
  let accion = { accion: "Completar el perfil", href: editor };
  const prueba = f.condiciones?.find((c) => c.clave === "modalidad_prueba");
  if (f.motivos.includes("consentimiento")) {
    notas.push("Falta el consentimiento nominal registrado.");
    accion = { accion: "Registrar consentimiento", href: `${editor}#${ANCLA_CONDICION.consentimiento}` };
  }
  if (prueba?.detalle === "familia_sin_modalidades") {
    notas.push(
      `La familia ${f.familia?.nombre ?? "del rol"} no tiene modalidades de prueba: ningún perfil suyo puede publicarse.`,
    );
    if (notas.length === 1)
      accion = { accion: "Registrar modalidad", href: "/catalogos?tipo=modalidad_prueba" };
  } else if (prueba) {
    notas.push(
      prueba.detalle === "modalidad_inactiva"
        ? "La modalidad de prueba elegida ya no está activa o no es de su familia."
        : `Falta elegir la modalidad de prueba${
            f.familia?.modalidades ? ` (${f.familia.nombre} tiene ${f.familia.modalidades})` : ""
          }.`,
    );
    if (notas.length === 1) accion = { accion: "Elegir modalidad", href: `${editor}#${ANCLA_CONDICION.modalidad_prueba}` };
  }
  // Validaciones de entrada (HU-176): cada una con su «Falta …» exacto y el salto a su campo.
  const entradas = (f.condiciones ?? [])
    .map((c) => c.clave)
    .filter(esValidacionDeEntrada);
  for (const c of entradas) notas.push(`Falta ${MOTIVO_CONDICION[c]}.`);
  if (entradas.length && notas.length === entradas.length)
    accion = { accion: "Completar las validaciones", href: `${editor}#${ANCLA_CONDICION[entradas[0]!]}` };
  const datos = f.faltanDatos ?? [];
  if (datos.length)
    notas.push(`Faltan datos: ${datos.map((x) => x.etiqueta.toLowerCase()).join(", ")}.`);
  return { nota: notas.join(" "), ...accion };
}

export function ResultadoPublicacion() {
  const [r, setR] = useState<Resultado | null>(null);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(CLAVE);
      if (v) {
        sessionStorage.removeItem(CLAVE);
        setR(JSON.parse(v));
      }
    } catch {
      // Sin almacenamiento no hay resultado que mostrar.
    }
  }, []);
  if (!r) return null;
  const n = r.publicados.length;
  const todos = r.fallos.length === 0;
  const contradice = r.fallos.some((f) => f.motivos.includes("incoherencia"));
  return (
    <>
      <div
        className={`pp-aviso ${todos ? "pp-aviso--ok" : contradice ? "pp-aviso--danger" : "pp-aviso--warn"} ip-avisos`}
        role={contradice ? "alert" : "status"}
      >
        <span className="pp-aviso__icono" aria-hidden="true">
          {todos ? "✓" : "!"}
        </span>
        {contradice && n === 0 && r.fallos.length === 1 ? (
          <p>
            <span className="pp-aviso__titulo">{`No se publicó ${r.fallos[0]!.nombre} (${r.fallos[0]!.codigo}).`}</span>
            Su estado y su disponibilidad se contradicen. Resuélvelo en su fila.
          </p>
        ) : (
          <p>
            <span className="pp-aviso__titulo">
              {todos
                ? n === 1
                  ? "Se publicó el perfil."
                  : `Se publicaron los ${n}.`
                : `Se publicaron ${n} de ${r.total}.`}
            </span>
            {n > 0 &&
              `${r.publicados.join(" y ").replace(/ y (?=.* y )/g, ", ")} ${n === 1 ? "ya está" : "ya están"} en el portal.`}
            {!todos &&
              ` ${r.fallos.length === 1 ? "El otro sigue" : `Los otros ${r.fallos.length} siguen`} como ${r.fallos.length === 1 ? "estaba" : "estaban"}, con su motivo; la operación no se canceló.`}
          </p>
        )}
      </div>
      {!todos && (
        <section className="ip-resultado" aria-labelledby="ip-res-t">
          <div className="pp-seccion__cabecera">
            <h2 className="pp-seccion__titulo" id="ip-res-t">
              No se publicaron
            </h2>
            <span className="pp-meta">{r.fallos.length}</span>
          </div>
          <ul className="pp-filas" aria-labelledby="ip-res-t">
            {r.fallos.map((f) => {
              const m = motivo(f);
              return (
                <li className="pp-fila" key={f.codigo}>
                  <div className="pp-fila__principal">
                    <p className="pp-fila__titulo">
                      <span>{f.nombre}</span>
                      <span className="pp-mono pp-meta">{f.codigo}</span>
                    </p>
                    <p className="pp-fila__nota">{m.nota}</p>
                  </div>
                  <div className="pp-fila__acciones">
                    <a className="pp-btn pp-btn--contorno pp-btn--sm" href={m.href}>
                      {m.accion}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

const MOTIVO_DISP: Record<string, string> = {
  no_aplica: "No aplica en su estado",
  no_existe: "Ya no existe en el inventario",
  sin_fecha: "No tiene una fecha que confirmar",
};

// Resultado por perfil de la disponibilidad en bloque (HU-132: «no un mensaje global»).
export function ResultadoDisponibilidadBloque() {
  const [r, setR] = useState<ResultadoBloque | null>(null);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem(CLAVE_DISP);
      if (v) {
        sessionStorage.removeItem(CLAVE_DISP);
        setR(JSON.parse(v));
      }
    } catch {
      // Sin almacenamiento no hay resultado que mostrar.
    }
  }, []);
  if (!r) return null;
  const ok = r.filas.filter((f) => f.ok).length;
  return (
    <section className="ip-resultado" aria-labelledby="ip-disp-res-t">
      <div className="pp-seccion__cabecera">
        <h2 className="pp-seccion__titulo" id="ip-disp-res-t">
          {`Disponibilidad actualizada en ${ok} de ${r.filas.length}`}
        </h2>
        {r.banda && <span className="pp-meta">{`El cliente ve «${r.banda}»`}</span>}
      </div>
      <ul className="pp-filas" aria-labelledby="ip-disp-res-t">
        {r.filas.map((f) => (
          <li className="pp-fila" key={f.codigo}>
            <div className="pp-fila__principal">
              <p className="pp-fila__titulo">
                <span>{f.nombre}</span>
                <span className="pp-mono pp-meta">{f.codigo}</span>
              </p>
              <p className="pp-fila__nota">
                {f.ok
                  ? "Actualizada."
                  : `${MOTIVO_DISP[f.motivo ?? ""] ?? "No se actualizó"}${f.estado ? ` (${f.estado})` : ""}: sigue como estaba.`}
              </p>
            </div>
            <span className={`pp-estado ${f.ok ? "pp-estado--ok" : "pp-estado--warn"}`}>
              {f.ok ? "Hecho" : "Sin cambio"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
