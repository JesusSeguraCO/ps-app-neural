"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CtaEquipoFlotante — invita a cerrar el recorrido sin crecer con el equipo.
 *
 * Ancho estable (~400px) tenga 1 o 30 perfiles:
 *   · roles como códigos apilados (BE · AR · DO) — máximo 3 + «+N»,
 *     nunca fotos: el portal no publica rostros;
 *   · texto corto que solo cambia de número: «8 perfiles · 5 roles cubiertos».
 * La lista completa va en aria-label y en el title de cada código.
 *
 * Escritorio: pastilla flotante abajo a la derecha.
 * Móvil (<640px): barra anclada al borde inferior, a lo ancho, respetando la
 * zona segura (safe-area-inset-bottom); bajo 380px el botón dice «Enviar».
 * No existe con el equipo vacío; se oculta con ficha/comparador abiertos y en
 * solicitud, resumen y confirmación.
 */

export interface RolEnEquipo {
  rol: string;
  /** Prefijo del código de referencia: BE, FE, AR, DO, QA… */
  codigo: string;
}

export interface CtaEquipoFlotanteProps {
  cantidad: number;
  roles: RolEnEquipo[];
  visible: boolean;
  hrefEquipo?: string;
  hrefSolicitud?: string;
  className?: string;
}

const TONOS = [
  "bg-navy text-white",
  "bg-teal-fill text-white",
  "bg-subtle text-text-h",
];

export function CtaEquipoFlotante({
  cantidad, roles, visible, hrefEquipo = "/equipo", hrefSolicitud = "/solicitud", className,
}: CtaEquipoFlotanteProps) {
  if (!visible || cantidad === 0) return null;
  const visibles = roles.slice(0, 3);
  const resto = roles.slice(3);

  return (
    <div
      className={cn(
        "fixed z-50 animate-revelar",
        "inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-6 sm:right-6",
        className,
      )}
    >
      <section
        aria-label="Tu equipo"
        className="flex items-center justify-between gap-3 rounded-pill border border-hairline-strong bg-card py-1.5 pl-2 pr-1.5 shadow-3 sm:w-max"
      >
        <Link
          href={hrefEquipo}
          aria-label={`Ver mi equipo: ${cantidad} ${cantidad === 1 ? "perfil" : "perfiles"}, ${roles.map((r) => r.rol).join(", ")}`}
          className="flex min-w-0 items-center gap-2.5 rounded-pill py-[3px] pl-[3px] pr-2.5 transition-colors hover:bg-subtle"
        >
          <span aria-hidden className="flex flex-none pl-2">
            {visibles.map((r, i) => (
              <span
                key={r.rol}
                title={r.rol}
                style={{ zIndex: 10 - i }}
                className={cn("relative -ml-2 grid size-8 place-items-center rounded-pill font-mono text-[11px] font-medium shadow-[0_0_0_2px_var(--tc-card)]", TONOS[i])}
              >
                {r.codigo}
              </span>
            ))}
            {resto.length > 0 ? (
              <span
                title={resto.map((r) => r.rol).join(", ")}
                className="relative z-[7] -ml-2 grid size-8 place-items-center rounded-pill border border-hairline-strong bg-card font-mono text-[11px] font-medium text-text-b shadow-[0_0_0_2px_var(--tc-card)]"
              >
                +{resto.length}
              </span>
            ) : null}
          </span>
          <span className="min-w-0 text-left">
            <span aria-live="polite" className="block whitespace-nowrap text-[13.5px] font-semibold text-text-h">
              {cantidad === 1 ? "1 perfil" : `${cantidad} perfiles`}
            </span>
            <span className="block whitespace-nowrap text-[12px] text-text-m">
              {roles.length === 1 ? "1 rol cubierto" : `${roles.length} roles cubiertos`}
            </span>
          </span>
        </Link>
        <Button asChild className="h-11 flex-none gap-2 rounded-pill bg-teal-fill px-[18px] text-white shadow-[var(--pp-btn-shadow)] hover:bg-teal-fill-hover">
          <Link href={hrefSolicitud}>
            <span className="max-[380px]:hidden">Enviar solicitud</span>
            <span className="hidden max-[380px]:inline">Enviar</span>
            <ArrowRight aria-hidden className="size-4" strokeWidth={1.9} />
          </Link>
        </Button>
      </section>
    </div>
  );
}
