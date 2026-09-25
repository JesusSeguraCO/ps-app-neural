"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * IndicadorEquipo — conteo visible desde cualquier pantalla.
 * El número es decorativo para lectores de pantalla; la cuenta se anuncia
 * en texto y el cambio se comunica por aria-live desde el contenedor.
 */

export interface IndicadorEquipoProps {
  cantidad: number;
  href?: string;
  className?: string;
}

export function IndicadorEquipo({
  cantidad,
  href = "/equipo",
  className,
}: IndicadorEquipoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-hairline-strong bg-card px-3.5 py-[7px] font-heading text-small font-semibold text-navy transition-colors duration-150 ease-tc hover:border-primary",
        className,
      )}
    >
      Mi equipo
      <span
        aria-hidden
        className="inline-grid h-5 min-w-5 place-items-center rounded-pill bg-navy px-1.5 text-[11px] font-bold text-white"
      >
        {cantidad}
      </span>
      <span className="sr-only">
        {cantidad === 1 ? "un perfil en el equipo" : `${cantidad} perfiles en el equipo`}
      </span>
    </Link>
  );
}
