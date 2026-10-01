"use client";
// Publicación masiva (HU-128 edge; prototipo inventario-perfiles--publicacion-masiva). La tabla del
// inventario la dibuja el servidor con una casilla por fila (`name="ip-sel"`); `BarraSeleccion`
// cuenta las marcadas y publica a la vez las elegidas. El servidor publica las que cumplen y señala
// a las demás con su motivo, sin abortar; el resultado se guarda para mostrarlo tras recargar
// (`ResultadoPublicacion`), con la salida directa a resolver cada motivo.
import { useEffect, useState } from "react";
import { enviarJson } from "../acceso/cliente";

const CLAVE = "pp-publicacion-masiva";

interface Fallo {
  codigo: string;
  nombre: string;
  motivos: string[];
  estado?: string;
  condiciones?: Array<{ clave: string; detalle?: string }>;
  faltanDatos?: Array<{ campo: string; etiqueta: string }>;
  familia?: { nombre: string; modalidades: number } | null;
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

  const n = elegidos.length;
  return (
    <div className="ip-lote" role="region" aria-label="Acciones sobre los perfiles seleccionados">
      <p className="ip-lote__cuenta" aria-live="polite">
        {n === 1 ? "1 seleccionado" : `${n} seleccionados`}
      </p>
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
function motivo(f: Fallo): { nota: string; accion: string; href: string } {
  const editor = `/inventario/${f.codigo}`;
  if (f.motivos.includes("no_existe"))
    return {
      nota: "Ya no existe en el inventario.",
      accion: "Ver el inventario",
      href: "/inventario",
    };
  if (f.motivos.includes("transicion_invalida"))
    return {
      nota:
        f.estado === "publicado" || f.estado === "colocado"
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
    accion = { accion: "Registrar consentimiento", href: `${editor}#consentimiento` };
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
    if (notas.length === 1) accion = { accion: "Elegir modalidad", href: `${editor}#pe-prueba` };
  }
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
  return (
    <>
      <div
        className={`pp-aviso ${todos ? "pp-aviso--ok" : "pp-aviso--warn"} ip-avisos`}
        role="status"
      >
        <span className="pp-aviso__icono" aria-hidden="true">
          {todos ? "✓" : "!"}
        </span>
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
