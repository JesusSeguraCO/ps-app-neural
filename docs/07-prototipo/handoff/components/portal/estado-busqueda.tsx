"use client";

import { cn } from "@/lib/utils";
import type { PasoBusqueda } from "@/lib/use-busqueda-asistida";

/**
 * EstadoBusqueda — lo que ve el cliente entre Enter y los resultados.
 *
 * Tarjeta con borde teal y halo, barra de progreso arriba que avanza por
 * fases (18 → 55 → 88 → 100 %), un titular que cambia con la fase y los tres
 * pasos como chips: hecho (✓ teal), en curso (anillo girando), pendiente
 * (número, borde punteado). Reemplaza a las sugerencias en el mismo hueco.
 *
 * No menciona el tamaño del banco: por posicionamiento, el portal nunca
 * muestra cuántos perfiles hay publicados.
 */

const TITULOS = ["Leyendo tu instrucción…", "Buscando el talento que encaja…", "Ordenando lo que encontramos…"];
const PROGRESO = [18, 55, 88, 100];

export function EstadoBusqueda({ pasos, className }: { pasos: PasoBusqueda[]; className?: string }) {
  const fase = Math.max(0, pasos.findIndex((p) => p.estado === "actual"));
  const terminado = pasos.every((p) => p.estado === "hecho");
  const f = terminado ? 3 : fase;

  return (
    <div
      role="status"
      className={cn(
        "relative animate-revelar overflow-hidden rounded-lg border border-hairline bg-card px-[18px] pb-3.5 pt-4 shadow-2",
        className,
      )}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-subtle">
        <span
          className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--tc-primary),var(--pp-grad-2))] transition-[width] duration-700 ease-tc"
          style={{ width: `${PROGRESO[f]}%` }}
        />
      </div>
      <p className="text-[14.5px] font-semibold text-text-h">{TITULOS[Math.min(f, 2)]}</p>
      <ol className="mt-3 flex flex-wrap justify-center gap-2">
        {pasos.map((p, i) => (
          <li
            key={p.texto}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-pill pl-[7px] pr-[13px] text-[13px] font-medium transition-colors duration-300",
              p.estado === "actual" && "border border-primary bg-accent text-text-h",
              p.estado === "hecho" && "border border-transparent bg-subtle text-text-b",
              p.estado === "pendiente" && "border border-dashed border-hairline-strong text-text-m",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-5 place-items-center rounded-pill font-mono text-[11px]",
                p.estado === "hecho" && "bg-teal-fill text-white",
                p.estado === "actual" && "animate-spin border-2 border-primary border-t-transparent motion-reduce:animate-none",
                p.estado === "pendiente" && "border border-hairline-strong bg-card text-text-m",
              )}
            >
              {p.estado === "hecho" ? "✓" : p.estado === "pendiente" ? i + 1 : null}
            </span>
            <span>
              <span className="sr-only">{p.estado === "hecho" ? "Hecho: " : p.estado === "actual" ? "En curso: " : "Pendiente: "}</span>
              {p.texto}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
