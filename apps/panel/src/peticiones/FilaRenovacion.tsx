"use client";
// Fila de la bandeja de renovaciones (HU-146): quién pidió el enlace nuevo, de qué enlace, cuándo y en qué
// quedó. Si se emitió un enlace nuevo, «Revocar enlace nuevo» abre una hoja lateral con motivo opcional y
// usa la revocación ya existente del panel (tarea 4.4, auditada).
import { useState } from "react";
import { enviarJson } from "../acceso/cliente";
import type { EstadoRenovacionPanel as EstadoFila } from "@ps/infra/postgres/renovaciones-panel";
import { Hoja, recargarConAviso } from "../marco/Hoja";

export interface FilaRenovacionDatos {
  id: string;
  correo: string | null;
  pedida: string;
  cuenta: string;
  enlaceTitulo: string;
  enlaceVencido: string;
  enlaceNuevo: string | null;
  estado: EstadoFila;
}

const ESTADO: Record<EstadoFila, { clase: string; texto: string }> = {
  pendiente: { clase: "pp-estado--info", texto: "En proceso" },
  enviado: { clase: "pp-estado--ok", texto: "Enlace nuevo enviado" },
  fallido: { clase: "pp-estado--danger", texto: "No se pudo enviar el enlace nuevo" },
  revocado: { clase: "pp-estado--neutro", texto: "Enlace revocado" },
  no_invitado: { clase: "pp-estado--warn", texto: "No estaba invitado · no se envió enlace" },
  sin_efecto: { clase: "pp-estado--neutro", texto: "Sin efecto: el enlace se revocó antes" },
  persona: { clase: "pp-estado--neutro", texto: "Se avisó a una persona (antes del 29 sep 2026)" },
};

export function FilaRenovacion({ r, revoca }: { r: FilaRenovacionDatos; revoca: boolean }) {
  const [hoja, setHoja] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const quien = r.correo ?? "Correo no registrado";
  const e = ESTADO[r.estado];
  const puedeRevocar =
    revoca && r.enlaceNuevo && (r.estado === "enviado" || r.estado === "fallido");

  async function revocar() {
    setError(null);
    setEnviando(true);
    const res = await enviarJson(
      `/api/v1/enlaces/${r.enlaceNuevo}/revocar`,
      motivo.trim() ? { motivo: motivo.trim() } : {},
    ).catch(() => null);
    if (res && (res.status === 200 || res.status === 409))
      return recargarConAviso(
        `Revocaste ${r.enlaceNuevo}. Quien lo tenga abierto pierde el acceso en su siguiente petición.`,
      );
    setEnviando(false);
    setError(
      res?.status === 403
        ? "No tienes permiso para revocar enlaces."
        : "No se pudo revocar. Inténtalo de nuevo.",
    );
  }

  return (
    <li className={`pp-fila${hoja ? " pp-fila--seleccionada" : ""}`} aria-labelledby={`re-${r.id}`}>
      <div className="pp-fila__principal">
        <p className="pp-fila__titulo">
          <span id={`re-${r.id}`}>{quien}</span>
        </p>
        <p className="pp-fila__meta">
          <a className="pi-enlace" href={`/enlaces?enlace=${r.enlaceVencido}`}>
            {r.enlaceTitulo}
          </a>
          {` · vencido ${r.enlaceVencido} · `}
          <span className="pi-hora">{r.pedida}</span>
        </p>
        <p className="pp-fila__meta">
          <span className={`pp-estado ${e.clase}`}>{e.texto}</span>
          {r.enlaceNuevo && (
            <>
              {" · "}
              <a className="pi-enlace pp-mono" href={`/enlaces?enlace=${r.enlaceNuevo}`}>
                {r.enlaceNuevo}
              </a>
            </>
          )}
        </p>
      </div>
      <div className="pp-fila__acciones">
        {puedeRevocar && (
          <button
            type="button"
            className="pp-btn pp-btn--contorno pp-btn--sm"
            onClick={() => setHoja(true)}
          >
            Revocar enlace nuevo
          </button>
        )}
      </div>

      {hoja && (
        <Hoja
          titulo={`Revocar ${r.enlaceNuevo}`}
          sub={`${quien} · ${r.enlaceTitulo}`}
          cerrarEtiqueta="Cerrar sin revocar"
          alCerrar={() => {
            setHoja(false);
            setError(null);
          }}
          pie={
            <>
              <button
                type="button"
                className="pp-btn pp-btn--fantasma"
                onClick={() => setHoja(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form={`re-form-${r.id}`}
                className="pp-btn pp-btn--destructivo"
                disabled={enviando}
              >
                Revocar enlace
              </button>
            </>
          }
        >
          <form
            className="pp-hoja__cuerpo"
            id={`re-form-${r.id}`}
            onSubmit={(ev) => {
              ev.preventDefault();
              void revocar();
            }}
          >
            <p className="pi-texto">
              Nadie vuelve a entrar con este enlace, ni quien lo tiene abierto. El enlace vencido y
              la petición se conservan en el registro.
            </p>
            <dl className="pp-datos">
              <div className="pp-datos__fila">
                <dt>Pidió</dt>
                <dd>
                  {`${quien} · `}
                  <span className="pp-meta">{r.pedida}</span>
                </dd>
              </div>
              <div className="pp-datos__fila">
                <dt>Enlace nuevo</dt>
                <dd>
                  {`${r.enlaceTitulo} `}
                  <span className="pp-meta pp-mono">{r.enlaceNuevo}</span>
                </dd>
              </div>
            </dl>
            <div className="pp-campo">
              <label className="pp-label" htmlFor={`re-motivo-${r.id}`}>
                Motivo (opcional)
              </label>
              <textarea
                className="pp-input pp-input--area"
                id={`re-motivo-${r.id}`}
                rows={4}
                aria-describedby={`re-motivo-ayuda-${r.id}`}
                placeholder="Ya no trabaja en la cuenta"
                value={motivo}
                onChange={(ev) => setMotivo(ev.target.value)}
              />
              <p className="pp-ayuda" id={`re-motivo-ayuda-${r.id}`}>
                Queda en el registro con tu correo y la fecha.
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
    </li>
  );
}
