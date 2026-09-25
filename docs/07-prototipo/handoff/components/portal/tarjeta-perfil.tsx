"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDisponibilidad } from "./badges";
import { Icono, ICONO_META } from "./iconos";
import { EvidenciaCriterio } from "./evidencia-criterio";
import { cn } from "@/lib/utils";
import type { ResultadoPerfil } from "@/lib/types";

/**
 * TarjetaPerfil — composición, no configuración.
 *
 *   <TarjetaPerfil resultado={r} onAbrirFicha={…} onSumar={…}>
 *     <TarjetaPerfil.Evidencia />
 *     <TarjetaPerfil.Pie />
 *   </TarjetaPerfil>
 *
 * Reglas duras: sin foto, nunca. El título visual es la capacidad;
 * el código de referencia vive al pie en letra pequeña. No hay sello
 * ni insignia por perfil — todos los publicados cumplen el estándar.
 */

const tarjetaVariants = cva(
  "flex flex-col rounded-lg bg-card p-5 shadow-2 transition-[border-color,transform] duration-150 ease-tc",
  {
    variants: {
      contexto: {
        curado: "border border-hairline",
        abierto: "border border-hairline",
        equipo: "border border-primary",
      },
      seleccionada: { true: "border-primary", false: "" },
    },
    defaultVariants: { contexto: "abierto", seleccionada: false },
  },
);

interface Ctx {
  resultado: ResultadoPerfil;
  enEquipo: boolean;
  onAbrirFicha: (id: string) => void;
  onSumar: (id: string) => void;
}
const TarjetaCtx = createContext<Ctx | null>(null);
function useTarjeta() {
  const ctx = useContext(TarjetaCtx);
  if (!ctx) throw new Error("Usa las partes dentro de <TarjetaPerfil>");
  return ctx;
}

export interface TarjetaPerfilProps
  extends Omit<VariantProps<typeof tarjetaVariants>, "seleccionada"> {
  resultado: ResultadoPerfil;
  enEquipo?: boolean;
  onAbrirFicha: (id: string) => void;
  onSumar: (id: string) => void;
  children?: ReactNode;
  className?: string;
}

export function TarjetaPerfil({
  resultado,
  enEquipo = false,
  onAbrirFicha,
  onSumar,
  contexto,
  children,
  className,
}: TarjetaPerfilProps) {
  const { perfil } = resultado;
  return (
    <TarjetaCtx.Provider value={{ resultado, enEquipo, onAbrirFicha, onSumar }}>
      <Card
        aria-selected={enEquipo}
        className={cn(
          tarjetaVariants({ contexto, seleccionada: enEquipo }),
          className,
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-0">
          <div className="min-w-0">
            <h3 className="text-pretty font-heading text-[16.5px] font-semibold leading-[1.3] text-text-h">
              {perfil.capacidad}
            </h3>
            <p className="mt-[5px] text-small text-text-b">
              {perfil.nombre} {perfil.apellido}
            </p>
          </div>
          <BadgeDisponibilidad>{perfil.disponibilidad}</BadgeDisponibilidad>
        </CardHeader>

        <CardContent className="p-0">
          <ul className="mt-3.5 flex flex-wrap gap-1.5">
            {perfil.tecnologias.slice(0, 5).map((t) => (
              <li
                key={t}
                className="rounded-pill bg-subtle px-2.5 py-1 font-heading text-[11.5px] font-medium text-navy"
              >
                {t}
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12.5px] text-text-m">
            <li className="inline-flex items-center gap-1.5"><Icono icono={ICONO_META.sector} className="size-3.5 opacity-85" />{perfil.sector.join(" · ")}</li>
            <li className="inline-flex items-center gap-1.5"><Icono icono={perfil.modalidad === "Remoto" ? ICONO_META.remoto : ICONO_META.presencial} className="size-3.5 opacity-85" />{perfil.modalidad}</li>
            <li className="inline-flex items-center gap-1.5"><Icono icono={ICONO_META.ubicacion} className="size-3.5 opacity-85" />{perfil.ciudad}, {perfil.pais}</li>
          </ul>
          {children}
        </CardContent>
      </Card>
    </TarjetaCtx.Provider>
  );
}

function Evidencia() {
  const { resultado } = useTarjeta();
  return (
    <EvidenciaCriterio
      className="mt-3.5"
      evidencias={resultado.evidencias}
      deseablesCumplidos={resultado.deseablesCumplidos}
      deseablesTotal={resultado.deseablesTotal}
    />
  );
}

function Pie() {
  const { resultado, enEquipo, onAbrirFicha, onSumar } = useTarjeta();
  const { perfil } = resultado;
  return (
    <CardFooter className="mt-5 flex items-center gap-2 border-t border-hairline p-0 pt-4">
      <Button
        size="sm"
        onClick={() => onAbrirFicha(perfil.id)}
        className="bg-primary-strong text-white hover:bg-primary-strong-hover"
      >
        Ver ficha
      </Button>
      <Button
        size="sm"
        variant="outline"
        aria-pressed={enEquipo}
        onClick={() => onSumar(perfil.id)}
        className={cn(enEquipo && "border-primary bg-accent text-primary-ink")}
      >
        {enEquipo ? "En el equipo" : "Sumar al equipo"}
      </Button>
      <span className="ml-auto font-mono text-[11px] tabular-nums text-text-m">
        {perfil.id}
      </span>
    </CardFooter>
  );
}

TarjetaPerfil.Evidencia = Evidencia;
TarjetaPerfil.Pie = Pie;
