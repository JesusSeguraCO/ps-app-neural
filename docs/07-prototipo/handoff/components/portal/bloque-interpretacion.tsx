"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChipCriterio } from "./chip-criterio";
import { cn } from "@/lib/utils";
import type { Criterio } from "@/lib/types";

/**
 * BloqueInterpretacion — muestra cómo se leyó la consulta, con chips editables.
 * Dos densidades: compacta cuando la lectura es firme, y expandida cuando la
 * confianza es baja (instrucción corta o ambigua), porque ahí el cliente
 * necesita ver y corregir.
 */

export interface BloqueInterpretacionProps {
  lectura: string;
  criterios: Criterio[];
  /** Baja confianza abre el bloque y añade la nota de ajuste. */
  bajaConfianza?: boolean;
  onQuitarCriterio: (clave: Criterio["clave"], valor: string) => void;
  className?: string;
}

export function BloqueInterpretacion({
  lectura,
  criterios,
  bajaConfianza = false,
  onQuitarCriterio,
  className,
}: BloqueInterpretacionProps) {
  return (
    <Collapsible
      defaultOpen={bajaConfianza || criterios.length > 0}
      className={cn(
        "rounded-lg border border-hairline bg-card shadow-1",
        bajaConfianza ? "p-5" : "px-5 py-3",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-primary-strong">
            Así entendimos la instrucción
          </p>
          <p className="mt-2 max-w-[72ch] text-body leading-[1.6] text-text-b">
            {lectura}
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0">
            Ver detalle
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <ul className="mt-3.5 flex flex-wrap gap-[7px]">
          {criterios.length === 0 ? (
            <li className="text-caption text-text-m">
              Todavía no hay criterios activos: se ve el banco completo.
            </li>
          ) : (
            criterios.flatMap((c) =>
              c.valores.map((v) => (
                <li key={`${c.clave}-${v}`}>
                  <ChipCriterio
                    etiqueta={c.etiqueta}
                    valor={v}
                    modo={
                      c.fueraDelBanco?.includes(v)
                        ? "fuera-del-banco"
                        : c.modo
                    }
                    onQuitar={() => onQuitarCriterio(c.clave, v)}
                  />
                </li>
              )),
            )
          )}
        </ul>
        {bajaConfianza ? (
          <p className="mt-3 rounded-md bg-amber-bg px-3 py-2 text-caption leading-[1.55] text-warn-ink">
            La instrucción es corta y quedó margen de interpretación. Ajusta los
            criterios del panel si no coinciden con lo que necesitas.
          </p>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
