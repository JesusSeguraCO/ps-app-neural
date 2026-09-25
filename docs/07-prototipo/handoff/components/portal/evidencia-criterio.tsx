import { cn } from "@/lib/utils";
import type { Evidencia } from "@/lib/types";

/**
 * EvidenciaCriterio — una línea por criterio activo, dentro de la tarjeta.
 *   ✓ Banca · 8 años declarados
 *   – Sin experiencia declarada en Seguros
 *
 * Muestra los incumplidos también: un listado que solo enseña aciertos
 * no ayuda a decidir. Sin porcentajes de coincidencia, nunca.
 */

export interface EvidenciaCriterioProps {
  evidencias: Evidencia[];
  /** Conteo honesto de deseables: "Cumple 3 de 4 deseables". */
  deseablesCumplidos: number;
  deseablesTotal: number;
  className?: string;
}

export function EvidenciaCriterio({
  evidencias,
  deseablesCumplidos,
  deseablesTotal,
  className,
}: EvidenciaCriterioProps) {
  if (evidencias.length === 0) return null;

  return (
    <div className={cn("border-t border-dashed border-hairline pt-3", className)}>
      <p className="mb-2 text-[12.5px] font-semibold text-text-m">
        {deseablesTotal > 0
          ? `Cumple ${deseablesCumplidos} de ${deseablesTotal} deseables`
          : "Evidencia contra los criterios activos"}
      </p>
      <ul className="flex flex-col gap-1.5">
        {evidencias.map((e) => (
          <li
            key={e.clave}
            className={cn(
              "flex items-start gap-2 text-caption leading-[1.45]",
              e.cumple ? "text-ok-ink" : "text-text-m",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "w-[11px] shrink-0 font-bold",
                e.cumple ? "text-ok-mark" : "text-text-m",
              )}
            >
              {e.cumple ? "✓" : "–"}
            </span>
            <span>
              <span className="sr-only">
                {e.cumple ? "Cumple: " : "No cumple: "}
              </span>
              {e.texto}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
