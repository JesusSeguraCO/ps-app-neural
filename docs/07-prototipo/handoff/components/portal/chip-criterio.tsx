"use client";

import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ModoCriterio } from "@/lib/types";

/**
 * ChipCriterio — tecnología o criterio activo, removible con un clic.
 * Obligatorio se lee como navy sólido; deseable, como chip neutro.
 * El modo va escrito, no solo pintado.
 */

const chipVariants = cva(
  "inline-flex items-center gap-[7px] rounded-pill px-[11px] py-[5px] text-caption transition-colors duration-150 ease-tc",
  {
    variants: {
      modo: {
        obligatorio: "bg-navy text-white",
        deseable: "bg-subtle text-text-b",
        "fuera-del-banco":
          "bg-amber-bg text-warn-ink border border-dashed border-warn-border",
      },
    },
    defaultVariants: { modo: "deseable" },
  },
);

export interface ChipCriterioProps extends VariantProps<typeof chipVariants> {
  etiqueta: string;
  valor: string;
  /** Sin onQuitar el chip es informativo y no renderiza el botón. */
  onQuitar?: () => void;
  className?: string;
}

export function ChipCriterio({
  etiqueta,
  valor,
  modo,
  onQuitar,
  className,
}: ChipCriterioProps) {
  const leyenda: Record<NonNullable<ChipCriterioProps["modo"]>, string> = {
    obligatorio: "obligatorio",
    deseable: "deseable",
    "fuera-del-banco": "no está en el banco",
  };
  return (
    <span className={cn(chipVariants({ modo }), className)}>
      <span className="font-semibold">{etiqueta}</span>
      <span>{valor}</span>
      <span className="text-[10px] opacity-75">
        {leyenda[modo ?? "deseable"]}
      </span>
      {onQuitar ? (
        <button
          type="button"
          onClick={onQuitar}
          aria-label={`Quitar el criterio ${etiqueta} ${valor}`}
          className="grid size-4 place-items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <X aria-hidden className="size-[11px]" strokeWidth={2.4} />
        </button>
      ) : null}
    </span>
  );
}
