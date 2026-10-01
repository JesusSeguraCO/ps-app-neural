"use client";
// Borrador de la validación técnica (HU-140, HU-130 edge; prototipos borrador-evidencia y
// --campo-ambiguo, sin la columna del artefacto por D29). Lo precargado sale de la modalidad de prueba
// —una plantilla, nunca un modelo— y cada campo dice si sigue siendo de la plantilla o ya es tuyo;
// evaluador, fecha y resultado los escribes tú (D30). Confirmar exige «Revisé cada campo» y enriquece
// la ficha sin republicar; descartar no toca la ficha.
import { useMemo, useState } from "react";
import { fechaCivil } from "@ps/dominio/fecha/colombia";
import {
  criteriosDeTexto,
  faltaParaConfirmar,
  origenTrasEdicion,
  type FaltaReporte,
} from "@ps/dominio/inventario/validacion";
import type { PerfilEditor } from "@ps/infra/postgres/perfiles-panel";
import type { BorradorEditor } from "@ps/infra/postgres/validaciones";
import { enviarJson } from "../acceso/cliente";

const FALTA: Record<FaltaReporte, string> = {
  revisado: "Marca «Revisé cada campo» para confirmar.",
  criterios: "Escribe al menos un criterio evaluado.",
  evaluador: "Escribe quién evaluó.",
  fecha: "Escribe la fecha de la validación (hoy o antes).",
  resultado: "Escribe el resultado.",
};

const MOTIVO: Record<string, string> = {
  borrador_resuelto:
    "Este borrador ya se confirmó o se descartó. Vuelve al perfil para ver su estado.",
  modalidad_cambio:
    "La modalidad de prueba del perfil cambió después de pedir este borrador. Descártalo y pide uno nuevo.",
  reporte_incompleto: "Falta completar el reporte.",
};

function Origen(p: { tuyo: boolean; modalidad: string }) {
  return p.tuyo ? (
    <p className="be-cita be-origen">
      <span className="be-origen__marca be-origen__marca--tuyo">Editado por ti</span> · ya no es el
      texto de la plantilla
    </p>
  ) : (
    <p className="be-cita be-origen">
      <span className="be-origen__marca">De la modalidad de prueba</span> ·{" "}
      <span className="be-cita__donde">{p.modalidad}</span>
    </p>
  );
}

export function BorradorValidacion(p: {
  perfil: PerfilEditor;
  borrador: BorradorEditor;
  hoy: string;
}) {
  const b = p.borrador;
  const [enunciado, setEnunciado] = useState(b.enunciadoReto);
  const [entregables, setEntregables] = useState(b.entregables);
  const [criterios, setCriterios] = useState(b.criterios.join("\n"));
  const [evaluador, setEvaluador] = useState(b.evaluador ?? "");
  const [fecha, setFecha] = useState(b.fecha ?? "");
  const [resultado, setResultado] = useState(b.resultado ?? "");
  const [revisado, setRevisado] = useState(false);
  const [intento, setIntento] = useState(false);
  const [enviando, setEnviando] = useState<null | "guardar" | "confirmar" | "descartar">(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const campos = () => ({
    id: b.id,
    enunciadoReto: enunciado,
    entregables,
    criterios: criteriosDeTexto(criterios),
    evaluador: evaluador || null,
    fecha: fecha || null,
    resultado: resultado || null,
  });
  const origen = useMemo(
    () =>
      origenTrasEdicion(b.plantilla, {
        enunciadoReto: enunciado,
        entregables,
        criterios: criteriosDeTexto(criterios),
      }),
    [b.plantilla, enunciado, entregables, criterios],
  );
  const faltan = faltaParaConfirmar({ ...campos(), revisado }, p.hoy);
  const falta = (f: FaltaReporte) => intento && faltan.includes(f);
  const algunoTuyo = Object.values(origen).includes("persona");
  const nombre = [p.perfil.nombre, p.perfil.primerApellido].filter(Boolean).join(" ");

  async function enviar(accion: "guardar" | "confirmar" | "descartar") {
    setError(null);
    if (accion === "confirmar") {
      setIntento(true);
      if (faltan.length) return;
    }
    setEnviando(accion);
    try {
      const base = `/api/v1/perfiles/${p.perfil.codigo}/validacion`;
      const r =
        accion === "guardar"
          ? await enviarJson(base, campos(), "PATCH")
          : accion === "confirmar"
            ? await enviarJson(`${base}/confirmar`, { ...campos(), revisado })
            : await enviarJson(`${base}/descartar`, { id: b.id });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(MOTIVO[d.motivo] ?? "No se pudo guardar. Inténtalo de nuevo.");
        return;
      }
      if (accion === "guardar") {
        setAviso("Borrador guardado sin confirmar. La ficha no cambió.");
        setTimeout(() => setAviso(null), 6000);
        return;
      }
      try {
        sessionStorage.setItem(
          "pp-aviso",
          accion === "confirmar"
            ? p.perfil.estado === "publicado" || p.perfil.estado === "colocado"
              ? "Reporte confirmado. La ficha del portal ya lo muestra, sin republicar."
              : "Reporte confirmado. La ficha lo mostrará cuando se publique."
            : "Borrador descartado. La ficha no recibió ningún campo suyo.",
        );
      } catch {
        // Sin almacenamiento solo se pierde el aviso.
      }
      window.location.href = `/inventario/${p.perfil.codigo}`;
    } finally {
      setEnviando(null);
    }
  }

  return (
    <>
      <div className="pp-encabezado">
        <div className="pp-encabezado__texto">
          <h1 className="pp-encabezado__titulo">Borrador de la validación técnica</h1>
          <p className="pp-encabezado__meta">
            <span className="pp-mono">{p.perfil.codigo}</span>
            {` · ${nombre}${p.perfil.rol ? ` · ${p.perfil.rol.nombre}` : ""} · `}
            <span className="pp-estado pp-estado--borrador">Sin confirmar</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="pp-aviso pp-aviso--danger pe-alerta" role="alert">
          <span className="pp-aviso__icono" aria-hidden="true">
            !
          </span>
          <p>{error}</p>
        </div>
      )}

      <div className="pp-con-lateral">
        <div>
          <form
            className="pp-tarjeta be-form"
            aria-label="Borrador de la validación técnica"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar("confirmar");
            }}
          >
            <section className="be-grupo" aria-labelledby="g-modalidad">
              <div className="be-grupo__cabecera">
                <h2 className="pp-seccion__titulo" id="g-modalidad">
                  Precargado desde la modalidad de prueba
                </h2>
                <span className="pp-meta">
                  Plantilla del catálogo ·{" "}
                  <a className="pp-enlace" href="/catalogos">
                    Editar en Catálogos
                  </a>
                </span>
              </div>
              <div className="pp-form pp-form--alineado">
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <span className="pp-label">Modalidad elegida</span>
                  </div>
                  <div className="pp-form-fila__control">
                    <p className="be-valor">{b.modalidad.nombre}</p>
                    <p className="pp-ayuda">Se elige en el perfil, del catálogo de su familia.</p>
                  </div>
                </div>
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <label className="pp-label" htmlFor="be-enunciado">
                      Enunciado del reto
                    </label>
                  </div>
                  <div className="pp-form-fila__control">
                    <textarea
                      className="pp-input pp-input--area"
                      id="be-enunciado"
                      maxLength={2000}
                      value={enunciado}
                      onChange={(e) => setEnunciado(e.target.value)}
                    />
                    <Origen
                      tuyo={origen.enunciadoReto === "persona"}
                      modalidad={b.modalidad.nombre}
                    />
                  </div>
                </div>
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <label className="pp-label" htmlFor="be-entregables">
                      Entregables esperados
                    </label>
                  </div>
                  <div className="pp-form-fila__control">
                    <textarea
                      className="pp-input pp-input--area"
                      id="be-entregables"
                      maxLength={1000}
                      value={entregables}
                      onChange={(e) => setEntregables(e.target.value)}
                    />
                    <Origen
                      tuyo={origen.entregables === "persona"}
                      modalidad={b.modalidad.nombre}
                    />
                  </div>
                </div>
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <label className="pp-label" htmlFor="be-criterios">
                      Criterios evaluados
                    </label>
                  </div>
                  <div className="pp-form-fila__control">
                    <textarea
                      className="pp-input pp-input--area"
                      id="be-criterios"
                      value={criterios}
                      aria-invalid={falta("criterios") || undefined}
                      aria-describedby={`be-criterios-ayuda${falta("criterios") ? " be-criterios-error" : ""}`}
                      onChange={(e) => setCriterios(e.target.value)}
                    />
                    <p className="pp-ayuda" id="be-criterios-ayuda">
                      Uno por línea. El cliente los ve como la evidencia de la validación.
                    </p>
                    {falta("criterios") && (
                      <ErrorCampo id="be-criterios-error" texto={FALTA.criterios} />
                    )}
                    <Origen tuyo={origen.criterios === "persona"} modalidad={b.modalidad.nombre} />
                  </div>
                </div>
              </div>
            </section>

            <section className="be-grupo" aria-labelledby="g-resultado">
              <div className="be-grupo__cabecera">
                <h2 className="pp-seccion__titulo" id="g-resultado">
                  Resultado de la validación
                </h2>
                <span className="pp-meta">
                  Lo escribes tú: el sistema no lo lee de ningún archivo.
                </span>
              </div>
              <div className="pp-form pp-form--alineado">
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <label className="pp-label" htmlFor="be-evaluador">
                      Evaluador
                    </label>
                  </div>
                  <div className="pp-form-fila__control">
                    <input
                      className="pp-input"
                      id="be-evaluador"
                      maxLength={120}
                      value={evaluador}
                      placeholder="p. ej. Célula de arquitectura de Trycore"
                      aria-invalid={falta("evaluador") || undefined}
                      aria-describedby={falta("evaluador") ? "be-evaluador-error" : undefined}
                      onChange={(e) => setEvaluador(e.target.value)}
                    />
                    {falta("evaluador") && (
                      <ErrorCampo id="be-evaluador-error" texto={FALTA.evaluador} />
                    )}
                  </div>
                </div>
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <label className="pp-label" htmlFor="be-fecha">
                      Fecha de la validación
                    </label>
                  </div>
                  <div className="pp-form-fila__control">
                    <input
                      className="pp-input be-fecha"
                      id="be-fecha"
                      type="date"
                      max={p.hoy}
                      value={fecha}
                      aria-invalid={falta("fecha") || undefined}
                      aria-describedby={falta("fecha") ? "be-fecha-error" : undefined}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                    {falta("fecha") && <ErrorCampo id="be-fecha-error" texto={FALTA.fecha} />}
                  </div>
                </div>
                <div className="pp-form-fila">
                  <div className="pp-form-fila__etiqueta">
                    <label className="pp-label" htmlFor="be-resultado">
                      Resultado
                    </label>
                  </div>
                  <div className="pp-form-fila__control">
                    <input
                      className="pp-input"
                      id="be-resultado"
                      maxLength={200}
                      value={resultado}
                      placeholder="p. ej. Aprobada, nivel senior"
                      aria-invalid={falta("resultado") || undefined}
                      aria-describedby={falta("resultado") ? "be-resultado-error" : undefined}
                      onChange={(e) => setResultado(e.target.value)}
                    />
                    {falta("resultado") && (
                      <ErrorCampo id="be-resultado-error" texto={FALTA.resultado} />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="be-pie">
              <label className="pp-check">
                <input
                  type="checkbox"
                  checked={revisado}
                  aria-describedby="be-motivo-confirmar"
                  onChange={(e) => setRevisado(e.target.checked)}
                />
                <span className="pp-check__texto">Revisé cada campo</span>
              </label>
              <div className="be-acciones">
                <button
                  type="button"
                  className="pp-btn pp-btn--fantasma be-acciones__descartar"
                  disabled={enviando !== null}
                  onClick={() => enviar("descartar")}
                >
                  Descartar borrador
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn--contorno"
                  disabled={enviando !== null}
                  onClick={() => enviar("guardar")}
                >
                  {enviando === "guardar" ? "Guardando…" : "Guardar sin confirmar"}
                </button>
                <button
                  type="submit"
                  className="pp-btn pp-btn--primario"
                  aria-disabled={faltan.length > 0 || undefined}
                  aria-describedby="be-motivo-confirmar"
                  disabled={enviando !== null}
                >
                  {enviando === "confirmar" ? "Confirmando…" : "Confirmar borrador"}
                </button>
              </div>
              <p
                className="pp-ayuda be-pie__motivo"
                id="be-motivo-confirmar"
                role={intento ? "alert" : undefined}
              >
                {intento && faltan.includes("revisado")
                  ? FALTA.revisado
                  : algunoTuyo
                    ? "Al confirmar, la ficha guarda lo que escribiste, no el texto de la plantilla. Descartar deja la ficha sin ningún campo de este borrador."
                    : "Marca «Revisé cada campo» para confirmar. Descartar no toca la ficha."}
              </p>
            </div>
          </form>
        </div>

        <aside className="be-lateral" aria-labelledby="be-ficha-titulo">
          <h2 className="pp-seccion__titulo" id="be-ficha-titulo">
            En la ficha del cliente
          </h2>
          <dl className="be-datos">
            <div>
              <dt>Hoy</dt>
              <dd>
                {p.perfil.reporte
                  ? `Reporte de ${fechaCivil(p.perfil.reporte.fecha)}: ${p.perfil.reporte.resultado}`
                  : `Nivel 0: «${p.perfil.modalidadPrueba?.textoCliente ?? ""}»`}
              </dd>
            </div>
            <div>
              <dt>Al confirmar</dt>
              <dd>
                Resultado, evaluador, fecha y criterios evaluados, sin republicar el perfil ni
                cambiar su estado.
              </dd>
            </div>
            <div>
              <dt>No llega</dt>
              <dd>Enunciado del reto y entregables: son internos de Talento Humano.</dd>
            </div>
          </dl>
          <p className="pp-ayuda">
            La plantilla no inventa nada: lo que no corrijas queda como está en el catálogo.
          </p>
        </aside>
      </div>

      {aviso && (
        <div className="pp-toast pe-toast" role="status">
          <span className="pp-toast__marca" aria-hidden="true">
            ✓
          </span>
          <p className="pp-toast__texto">{aviso}</p>
        </div>
      )}
    </>
  );
}

function ErrorCampo({ id, texto }: { id: string; texto: string }) {
  return (
    <p className="pp-error" id={id}>
      <span aria-hidden="true">!</span>
      {texto}
    </p>
  );
}
