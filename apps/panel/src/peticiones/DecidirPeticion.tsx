"use client";
// Fila de una petición de invitación con sus decisiones (HU-145; prototipo peticiones-invitacion y
// variantes --rechazo-motivo, --enlace-no-vigente, --ya-invitado): aprobar; rechazar en una hoja
// lateral con motivo obligatorio; sobre un enlace no vigente, «Ver enlace» y rechazar; si el correo ya
// está invitado, «Revisar» abre la hoja con la lista del enlace y cerrarla no la duplica. Tras decidir,
// recarga la lista y deja el aviso de confirmación para <AvisoDecision />.
import { useState } from "react";
import { enviarJson } from "../acceso/cliente";
import { Hoja, recargarConAviso } from "../marco/Hoja";

export interface FilaPeticionDatos {
  id: string;
  persona: string;
  nombre: string | null;
  correo: string;
  pide: string;
  enlace: { codigo: string; titulo: string; cuenta: string };
  pedida: string;
  paraQue: string | null;
  dominioDistinto: boolean;
  marca: null | "enlace_vencido" | "enlace_revocado" | "ya_invitado";
  enlaceNoVigenteDesde: string | null;
  puedeAprobar: boolean;
  puedeRechazar: boolean;
  yaInvitado: {
    desde: string | null;
    invitados: Array<{ correo: string; detalle: string; esEste: boolean }>;
  } | null;
}

export function FilaPeticion({ p, decide }: { p: FilaPeticionDatos; decide: boolean }) {
  const [hoja, setHoja] = useState<null | "rechazo" | "ya_invitado">(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function decidir(ruta: "aprobar" | "rechazar", aviso: string) {
    setError(null);
    setEnviando(true);
    const r = await enviarJson(
      `/api/v1/invitaciones/${p.id}/${ruta}`,
      ruta === "rechazar" ? { motivo } : {},
    ).catch(() => null);
    if (r?.status === 200) return recargarConAviso(aviso);
    setEnviando(false);
    setError(
      r?.status === 400
        ? "Escribe el motivo del rechazo."
        : "No se pudo guardar la decisión. Recarga la página.",
    );
  }

  const cerrarHoja = () => {
    setHoja(null);
    setError(null);
  };
  const noVigente = p.marca === "enlace_vencido" || p.marca === "enlace_revocado";

  return (
    <li className={`pp-fila${hoja ? " pp-fila--seleccionada" : ""}`} aria-labelledby={`pi-${p.id}`}>
      <div className="pp-fila__principal">
        <p className="pp-fila__titulo">
          <span id={`pi-${p.id}`}>{p.persona}</span>{" "}
          {p.nombre && <span className="pp-fila__sub">{p.correo}</span>}
        </p>
        <p className="pp-fila__meta">
          {`Pide ${p.pide} · `}
          <a className="pi-enlace" href={`/enlaces?enlace=${p.enlace.codigo}`}>
            {p.enlace.titulo}
          </a>
          {" · "}
          <span className="pi-hora">{p.pedida}</span>
        </p>
        {p.paraQue && (
          <p className="pp-fila__nota">
            <q className="pi-cita">{p.paraQue}</q>
          </p>
        )}
        {p.dominioDistinto && p.marca === null && (
          <p className="pp-fila__meta">
            <span className="pp-estado pp-estado--warn">Dominio distinto al de quien pide</span>
          </p>
        )}
        {noVigente && (
          <p className="pp-fila__meta">
            <span
              className={`pp-estado ${p.marca === "enlace_revocado" ? "pp-estado--danger" : "pp-estado--warn"}`}
            >
              {`${p.marca === "enlace_revocado" ? "Enlace revocado el" : "Enlace vencido el"} ${p.enlaceNoVigenteDesde}`}
            </span>
            {" · No se puede aprobar mientras el enlace no esté vigente."}
          </p>
        )}
        {p.marca === "ya_invitado" && (
          <p className="pp-fila__meta">
            <span className="pp-estado pp-estado--info">Ya tiene acceso a este enlace</span>
          </p>
        )}
      </div>
      <div className="pp-fila__acciones">
        {noVigente && (
          <a
            className="pp-btn pp-btn--fantasma pp-btn--sm"
            href={`/enlaces?enlace=${p.enlace.codigo}`}
          >
            Ver enlace
          </a>
        )}
        {decide && p.puedeRechazar && (
          <button
            type="button"
            className={`pp-btn ${noVigente ? "pp-btn--contorno" : "pp-btn--fantasma"} pp-btn--sm`}
            onClick={() => setHoja("rechazo")}
          >
            Rechazar
          </button>
        )}
        {decide && p.marca === null && (
          <button
            type="button"
            className="pp-btn pp-btn--contorno pp-btn--sm"
            disabled={enviando}
            onClick={() =>
              void decidir(
                "aprobar",
                `Aprobaste a ${p.persona}. Ya puede entrar al enlace de ${p.enlace.cuenta}.`,
              )
            }
          >
            Aprobar
          </button>
        )}
        {decide && p.marca === "ya_invitado" && (
          <button
            type="button"
            className="pp-btn pp-btn--contorno pp-btn--sm"
            onClick={() => setHoja("ya_invitado")}
          >
            Revisar
          </button>
        )}
        {error && !hoja && (
          <p className="pp-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {hoja === "rechazo" && (
        <Hoja
          titulo={`Rechazar a ${p.persona}`}
          sub={p.correo}
          cerrarEtiqueta="Cerrar sin rechazar"
          alCerrar={cerrarHoja}
          pie={
            <>
              <button type="button" className="pp-btn pp-btn--fantasma" onClick={cerrarHoja}>
                Cancelar
              </button>
              <button
                type="submit"
                form={`pi-rechazo-${p.id}`}
                className="pp-btn pp-btn--destructivo"
                disabled={enviando}
              >
                Rechazar petición
              </button>
            </>
          }
        >
          <form
            className="pp-hoja__cuerpo"
            id={`pi-rechazo-${p.id}`}
            onSubmit={(e) => {
              e.preventDefault();
              void decidir(
                "rechazar",
                `Rechazaste a ${p.persona}. ${p.pide} verá el motivo en el portal.`,
              );
            }}
          >
            <dl className="pp-datos">
              <div className="pp-datos__fila">
                <dt>Pide</dt>
                <dd>
                  {`${p.pide} · ${p.enlace.cuenta} · `}
                  <span className="pp-meta">{p.pedida}</span>
                </dd>
              </div>
              <div className="pp-datos__fila">
                <dt>Enlace</dt>
                <dd>
                  {`${p.enlace.titulo} `}
                  <span className="pp-meta pp-mono">{p.enlace.codigo}</span>
                </dd>
              </div>
              {p.paraQue && (
                <div className="pp-datos__fila">
                  <dt>Para qué lo invita</dt>
                  <dd>
                    <q className="pi-cita">{p.paraQue}</q>
                  </dd>
                </div>
              )}
              {p.dominioDistinto && (
                <div className="pp-datos__fila">
                  <dt>Dominio</dt>
                  <dd>
                    <span className="pp-estado pp-estado--warn">Distinto al de quien pide</span>
                  </dd>
                </div>
              )}
            </dl>
            <div className="pp-campo">
              <label className="pp-label" htmlFor={`motivo-${p.id}`}>
                Motivo del rechazo
              </label>
              <textarea
                className="pp-input pp-input--area"
                id={`motivo-${p.id}`}
                rows={5}
                required
                aria-describedby={`motivo-ayuda-${p.id}`}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
              <p className="pp-ayuda" id={`motivo-ayuda-${p.id}`}>
                {`Obligatorio. ${p.pide} lo verá en el portal.`}
              </p>
              {error && (
                <p className="pp-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </form>
        </Hoja>
      )}

      {hoja === "ya_invitado" && p.yaInvitado && (
        <Hoja
          titulo={`${p.persona} ya tiene acceso`}
          sub={`${p.correo} · ${p.enlace.titulo}`}
          cerrarEtiqueta="Cerrar la hoja"
          alCerrar={cerrarHoja}
          pie={
            <>
              <button type="button" className="pp-btn pp-btn--fantasma" onClick={cerrarHoja}>
                Volver a la lista
              </button>
              <button
                type="button"
                className="pp-btn pp-btn--primario"
                data-foco
                disabled={enviando}
                onClick={() =>
                  void decidir(
                    "aprobar",
                    `Cerraste la petición de ${p.persona}. Ya tenía acceso al enlace de ${p.enlace.cuenta}.`,
                  )
                }
              >
                Cerrar sin cambios
              </button>
            </>
          }
        >
          <div className="pp-hoja__cuerpo">
            {p.yaInvitado.desde && (
              <p className="pi-texto">{`Está en la lista de invitados desde el ${p.yaInvitado.desde}.`}</p>
            )}
            <section aria-labelledby={`pi-inv-${p.id}`}>
              <div className="pp-seccion__cabecera">
                <h3 className="pp-seccion__titulo" id={`pi-inv-${p.id}`}>
                  Invitados del enlace
                </h3>
                <span className="pp-meta">{p.yaInvitado.invitados.length}</span>
              </div>
              <ul className="pp-filas pi-invitados">
                {p.yaInvitado.invitados.map((i) => (
                  <li
                    key={i.correo}
                    className={`pp-fila${i.esEste ? " pp-fila--seleccionada" : ""}`}
                  >
                    <div className="pp-fila__principal">
                      <p className="pp-fila__titulo">{i.correo}</p>
                    </div>
                    <div className="pp-fila__acciones">
                      <span className="pp-fila__meta">{i.detalle}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <dl className="pp-datos">
              <div className="pp-datos__fila">
                <dt>Pide</dt>
                <dd>
                  {`${p.pide} · ${p.enlace.cuenta} · `}
                  <span className="pp-meta">{p.pedida}</span>
                </dd>
              </div>
              {p.paraQue && (
                <div className="pp-datos__fila">
                  <dt>Para qué lo invita</dt>
                  <dd>
                    <q className="pi-cita">{p.paraQue}</q>
                  </dd>
                </div>
              )}
            </dl>
            {error && (
              <p className="pp-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </Hoja>
      )}
    </li>
  );
}
