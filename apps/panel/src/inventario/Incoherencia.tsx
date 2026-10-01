"use client";
// Contradicción entre estado y disponibilidad en la propia fila del listado (HU-134; matriz D5;
// prototipo inventario-perfiles--incoherencia). ALTA en rojo («Bloquea la publicación» para el pausado,
// «Contradicción alta» para el resto), MEDIA sin rojo («Advertencia media»); cada una con la acción que
// la corrige sin salir del listado. La observadora ve la señal sin acciones.
import { useState } from "react";
import type { Incoherencia } from "@ps/dominio/inventario/coherencia";
import { enviarJson } from "../acceso/cliente";
import { recargarConAviso } from "../marco/Hoja";
import { EVENTO_FECHA } from "./EstadoEnLista";

interface Accion {
  etiqueta: string;
  // Petición que la resuelve, o un destino, o abrir la fecha en la fila.
  peticion?: { url: string; cuerpo: unknown; aviso: string };
  href?: string;
  fecha?: true;
  principal?: boolean;
}

function acciones(c: Incoherencia, codigo: string, nombre: string): Accion[] {
  const disponibilidad = {
    url: "/api/v1/perfiles/disponibilidad",
    cuerpo: { codigos: [codigo], disponibilidad: { confirmar: true } },
    aviso: `Disponibilidad de ${nombre} confirmada.`,
  };
  switch (c.clave) {
    case "pausado_con_disponibilidad":
      return [
        {
          etiqueta: "Quitar la disponibilidad",
          peticion: {
            url: `/api/v1/perfiles/${codigo}/quitar-disponibilidad`,
            cuerpo: {},
            aviso: `${nombre} sigue pausado, sin disponibilidad.`,
          },
        },
        {
          etiqueta: "Publicar con esa disponibilidad",
          principal: true,
          peticion: {
            url: `/api/v1/perfiles/${codigo}/reactivar`,
            cuerpo: { disponibilidad: { confirmar: true } },
            aviso: `${nombre} volvió a publicado con esa disponibilidad.`,
          },
        },
      ];
    case "archivado_con_disponibilidad":
      return [
        {
          etiqueta: "Quitar la disponibilidad",
          principal: true,
          peticion: {
            url: `/api/v1/perfiles/${codigo}/quitar-disponibilidad`,
            cuerpo: {},
            aviso: `${nombre} sigue archivado, sin disponibilidad.`,
          },
        },
      ];
    case "colocado_disponible_ahora":
      return [
        {
          etiqueta: "Usar la fecha de liberación",
          principal: true,
          peticion: {
            url: `/api/v1/perfiles/${codigo}/usar-liberacion`,
            cuerpo: {},
            aviso: `${nombre} muestra ahora su fecha de liberación.`,
          },
        },
      ];
    case "publicado_sin_disponibilidad":
      return [{ etiqueta: "Poner la fecha en que queda libre", principal: true, fecha: true }];
    case "por_confirmar":
    case "sin_actualizar":
      return [
        { etiqueta: "Ver en Vigencia", href: "/vigencia" },
        { etiqueta: "Confirmar disponibilidad", principal: true, peticion: disponibilidad },
      ];
    case "fecha_vencida":
      return [{ etiqueta: "Confirmar disponibilidad", principal: true, peticion: disponibilidad }];
  }
}

const MOTIVO: Record<string, string> = {
  no_aplica: "El perfil cambió de estado. Recarga para ver cómo quedó.",
  no_publicable: "No se puede publicar todavía: abre el perfil para ver qué falta.",
  sin_fecha: "No tiene una fecha que confirmar: elige su disponibilidad en la fila.",
};

export function IncoherenciaFila(p: {
  codigo: string;
  nombre: string;
  coherencia: Incoherencia;
  columnas: number;
  escribe: boolean;
}) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const c = p.coherencia;
  const rotulo =
    c.severidad === "media"
      ? "Advertencia media"
      : c.clave === "pausado_con_disponibilidad"
        ? "Bloquea la publicación"
        : "Contradicción alta";

  async function resolver(a: NonNullable<Accion["peticion"]>) {
    setEnviando(true);
    setError(null);
    try {
      const r = await enviarJson(a.url, a.cuerpo);
      const d = await r.json().catch(() => ({}));
      const fallo = d.resultados?.find((x: { ok: boolean }) => !x.ok);
      if (r.ok && !fallo) return recargarConAviso(a.aviso);
      setError(MOTIVO[fallo?.motivo ?? d.motivo] ?? "No se pudo corregir. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <tr className="ip-detalle">
      <td colSpan={p.columnas}>
        <div className="ip-detalle__cuerpo">
          <p className="ip-detalle__texto">
            <span
              className={`pp-estado ${c.severidad === "alta" ? "pp-estado--danger" : "pp-estado--warn"}`}
            >
              {rotulo}
            </span>{" "}
            {c.contradiccion}
          </p>
          {p.escribe && (
            <div className="ip-detalle__acciones">
              {acciones(c, p.codigo, p.nombre).map((a) => {
                const clase = `pp-btn ${a.principal ? "pp-btn--contorno" : "pp-btn--fantasma"} pp-btn--sm`;
                if (a.href)
                  return (
                    <a key={a.etiqueta} className={clase} href={a.href}>
                      {a.etiqueta}
                    </a>
                  );
                return (
                  <button
                    key={a.etiqueta}
                    type="button"
                    className={clase}
                    disabled={enviando}
                    aria-label={`${a.etiqueta}: ${p.nombre}`}
                    onClick={() =>
                      a.fecha
                        ? document.dispatchEvent(
                            new CustomEvent(EVENTO_FECHA, { detail: p.codigo }),
                          )
                        : void resolver(a.peticion!)
                    }
                  >
                    {a.etiqueta}
                  </button>
                );
              })}
            </div>
          )}
          {error && (
            <p className="pp-error" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}
