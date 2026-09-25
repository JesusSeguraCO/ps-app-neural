"use client";

import { SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Criterio } from "@/lib/types";

/**
 * AvisoCero — estado vacío de la búsqueda, uno solo por vista.
 *
 * Centrado, sin franjas de color: icono neutro en tesela, titular, una línea
 * con la salida y el plazo, los criterios obligatorios como botones que se
 * quitan con un clic (hover rojo = «vas a quitar esto»), y dos acciones.
 * Debajo, el contenedor muestra «Lo más cercano».
 *
 * Se anuncia por role="alert".
 */

export interface AvisoCeroProps {
  criteriosObligatorios: Criterio[];
  onQuitarCriterio: (clave: Criterio["clave"], valor: string) => void;
  onQuitarTodos: () => void;
  onSolicitarAMedida: () => void;
  slaDiasHabiles?: number;
  className?: string;
}

export function AvisoCero({
  criteriosObligatorios, onQuitarCriterio, onQuitarTodos, onSolicitarAMedida, slaDiasHabiles = 10, className,
}: AvisoCeroProps) {
  const cuantos = criteriosObligatorios.reduce((n, c) => n + c.valores.length, 0);
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-lg border border-hairline bg-card px-7 pb-[30px] pt-9 text-center", className)}>
      <span aria-hidden className="grid size-11 place-items-center rounded-[12px] bg-subtle text-text-m">
        <SearchX className="size-5" strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-balance text-[17px] font-semibold text-text-h">
        {cuantos === 1
          ? "Ningún perfil cumple ese criterio obligatorio"
          : `Ningún perfil cumple los ${cuantos} criterios obligatorios a la vez`}
      </h2>
      <p className="mt-1.5 max-w-[52ch] text-pretty text-[14px] leading-[1.6] text-text-m">
        Quita uno de estos criterios o pídenos un perfil a medida. Te respondemos en {slaDiasHabiles} días hábiles.
      </p>

      <ul className="mt-[18px] flex flex-wrap justify-center gap-2">
        {criteriosObligatorios.flatMap((c) =>
          c.valores.map((v) => (
            <li key={`${c.clave}-${v}`}>
              <button
                type="button"
                onClick={() => onQuitarCriterio(c.clave, v)}
                aria-label={`Quitar el criterio ${c.etiqueta} ${v}`}
                className="inline-flex h-[34px] items-center gap-2 rounded-md border border-hairline-strong bg-card pl-3 pr-2.5 text-[13px] text-text-h transition-colors hover:border-danger hover:bg-red-bg"
              >
                <span className="text-text-m">{c.etiqueta}</span>
                <span className="font-medium">{v}</span>
                <X aria-hidden className="size-3 text-text-m" strokeWidth={2.2} />
              </button>
            </li>
          )),
        )}
      </ul>

      <div className="mt-[22px] flex flex-wrap justify-center gap-2.5">
        <Button onClick={onSolicitarAMedida} className="bg-teal-fill text-white shadow-[var(--pp-btn-shadow)] hover:bg-teal-fill-hover">
          Pedir un perfil a medida
        </Button>
        <Button variant="outline" onClick={onQuitarTodos}>Quitar todos los criterios</Button>
      </div>
    </div>
  );
}
