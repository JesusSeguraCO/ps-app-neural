import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoPerfil } from "@/lib/types";

/**
 * BadgeDisponibilidad y BadgeEstado.
 * El significado nunca descansa en el color: el texto siempre lo dice.
 */

const disponibilidadVariants = cva(
  "rounded-pill font-heading text-badge font-semibold px-[9px] py-[3px] border",
  {
    variants: {
      tono: {
        inmediata: "bg-green-bg text-ok-badge-ink border-transparent",
        proxima: "bg-subtle text-text-m border-transparent",
        ocupada: "bg-card text-text-m border-hairline-strong",
      },
    },
    defaultVariants: { tono: "proxima" },
  },
);

export interface BadgeDisponibilidadProps
  extends VariantProps<typeof disponibilidadVariants> {
  /** Texto literal de disponibilidad: "Disponible en 2 semanas". */
  children: string;
  className?: string;
}

export function BadgeDisponibilidad({
  tono,
  children,
  className,
}: BadgeDisponibilidadProps) {
  const inferido =
    tono ??
    (children.toLowerCase().includes("inmediato")
      ? "inmediata"
      : children.toLowerCase().includes("proyecto")
        ? "ocupada"
        : "proxima");
  return (
    <Badge
      variant="outline"
      className={cn(disponibilidadVariants({ tono: inferido }), className)}
    >
      {children}
    </Badge>
  );
}

const estadoVariants = cva(
  "rounded-pill font-heading text-badge font-semibold px-[9px] py-[3px] border-transparent",
  {
    variants: {
      estado: {
        borrador: "bg-subtle text-text-m",
        publicado: "bg-green-bg text-ok-badge-ink",
        pausado: "bg-amber-bg text-warn-ink",
        archivado: "bg-red-bg text-danger-ink",
      },
    },
    defaultVariants: { estado: "borrador" },
  },
);

const ETIQUETA_ESTADO: Record<EstadoPerfil, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  pausado: "Pausado",
  archivado: "Archivado",
};

export interface BadgeEstadoProps {
  estado: EstadoPerfil;
  className?: string;
}

export function BadgeEstado({ estado, className }: BadgeEstadoProps) {
  return (
    <Badge variant="outline" className={cn(estadoVariants({ estado }), className)}>
      {ETIQUETA_ESTADO[estado]}
    </Badge>
  );
}
