"use client";
// Carga del archivo de Operaciones y decisiones sobre las diferencias (HU-150; prototipos
// colocados--carga-operaciones, --formato-no-admitido y --diferencia-operaciones). El archivo se lee en
// el navegador y viaja como texto; el servidor decide si es JSON o CSV. Un archivo rechazado no cambia
// nada, así que su aviso se queda en la página sin recargar; uno aceptado lleva al resultado de la carga.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { enviarJson } from "../acceso/cliente";
import { recargarConAviso } from "../marco/Hoja";

const ID_ARCHIVO = "cl-archivo";
const ID_AVISOS = "cl-avisos";

// Cualquier botón «Cargar archivo…» de la pestaña abre el mismo selector.
export function BotonCargar(p: { texto: string; clase: string }) {
  return (
    <button
      type="button"
      className={p.clase}
      onClick={() => document.getElementById(ID_ARCHIVO)?.click()}
    >
      {p.texto}
    </button>
  );
}

// Lugar del aviso de rechazo, bajo el encabezado (lo llena `CargaOperaciones`).
export function LugarAvisos() {
  return <div id={ID_AVISOS} />;
}

function rechazo(archivo: string, d: { motivo?: string; faltan?: string[] }, corte: string | null) {
  const nada = corte
    ? `Nada cambió: la pestaña conserva los colocados y el corte de la carga anterior (${corte}).`
    : "Nada cambió en la pestaña.";
  switch (d.motivo) {
    case "formato_no_admitido":
      return `Solo se admite un archivo JSON o CSV. ${nada}`;
    case "faltan_columnas":
      return `Le faltan las columnas ${(d.faltan ?? []).map((c) => `«${c}»`).join(", ")}: se leen código del perfil, cliente, fecha de inicio y fecha de liberación. ${nada}`;
    case "sin_filas":
      return `No trae ninguna fila de colocados. ${nada}`;
    case "demasiadas_filas":
      return `Trae más de 200 filas: divídelo en varios archivos. ${nada}`;
    default:
      return `No se pudo cargar. Inténtalo de nuevo. ${nada}`;
  }
}

export function CargaOperaciones(p: { corte: string | null }) {
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<{ archivo: string; texto: string } | null>(null);
  const [lugar, setLugar] = useState<HTMLElement | null>(null);
  useEffect(() => setLugar(document.getElementById(ID_AVISOS)), []);

  async function cargar(f: File) {
    setAviso(null);
    // Otra extensión se avisa sin enviar; el servidor aplica la misma regla y revisa el contenido.
    if (!/\.(json|csv)$/i.test(f.name))
      return setAviso({ archivo: f.name, texto: rechazo(f.name, { motivo: "formato_no_admitido" }, p.corte) });
    setEnviando(true);
    try {
      const r = await enviarJson("/api/v1/colocados/cargas", {
        archivo: f.name,
        contenido: await f.text(),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 201) {
        window.location.assign(`/colocados?carga=${d.carga.id}`);
        return;
      }
      setAviso({ archivo: f.name, texto: rechazo(f.name, d, p.corte) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <input
        id={ID_ARCHIVO}
        className="cl-archivo"
        type="file"
        accept=".json,.csv,application/json,text/csv"
        tabIndex={-1}
        aria-hidden="true"
        disabled={enviando}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void cargar(f);
        }}
      />
      <BotonCargar texto="Cargar archivo de Operaciones" clase="pp-btn pp-btn--contorno" />
      {aviso &&
        lugar &&
        createPortal(
          <div className="pp-aviso pp-aviso--danger cl-aviso" role="alert">
            <span className="pp-aviso__icono" aria-hidden="true">
              !
            </span>
            <p>
              <span className="pp-aviso__titulo">{`No se cargó ${aviso.archivo}.`}</span>
              {aviso.texto}
            </p>
            <BotonCargar
              texto="Elegir otro archivo"
              clase="pp-btn pp-btn--contorno pp-btn--sm pp-aviso__accion"
            />
          </div>,
          lugar,
        )}
    </>
  );
}

export function DecidirDiferencia(p: { id: string; nombre: string }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function decidir(decision: "aceptada" | "descartada") {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(`/api/v1/colocados/diferencias/${p.id}`, { decision });
      if (r.ok)
        return recargarConAviso(
          decision === "aceptada"
            ? `${p.nombre} queda con los datos de Operaciones.`
            : `${p.nombre} conserva los datos del panel.`,
        );
      setError(
        r.status === 409
          ? "Esta diferencia ya se resolvió o el colocado cambió. Recarga la página."
          : "No se pudo guardar. Inténtalo de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="pp-fila__acciones">
      <button
        type="button"
        className="pp-btn pp-btn--fantasma pp-btn--sm"
        disabled={enviando}
        aria-label={`Mantener la del panel para ${p.nombre}`}
        onClick={() => void decidir("descartada")}
      >
        Mantener la del panel
      </button>
      <button
        type="button"
        className="pp-btn pp-btn--contorno pp-btn--sm"
        disabled={enviando}
        aria-label={`Aceptar la de Operaciones para ${p.nombre}`}
        onClick={() => void decidir("aceptada")}
      >
        Aceptar la de Operaciones
      </button>
      {error && (
        <p className="pp-error" role="alert">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
