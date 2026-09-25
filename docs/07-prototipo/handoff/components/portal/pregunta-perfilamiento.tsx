"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * PreguntaPerfilamiento — máximo dos por pantalla, y siempre JUNTO A
 * resultados ya visibles. Nunca como compuerta que bloquea la vista.
 */

export interface PreguntaPerfilamientoProps {
  id: string;
  pregunta: string;
  opciones: string[];
  valor?: string;
  onResponder: (valor: string) => void;
  className?: string;
}

export function PreguntaPerfilamiento({
  id,
  pregunta,
  opciones,
  valor,
  onResponder,
  className,
}: PreguntaPerfilamientoProps) {
  return (
    <Card className={cn("rounded-lg border border-hairline bg-card p-4", className)}>
      <CardHeader className="p-0">
        <CardTitle asChild>
          <h3 className="font-heading text-small font-semibold text-text-h">{pregunta}</h3>
        </CardTitle>
        <p className="mt-0.5 text-[11.5px] text-text-m">
          Afina el orden. No bloquea nada de lo que ya ves.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <RadioGroup
          value={valor}
          onValueChange={onResponder}
          className="mt-2.5 flex flex-wrap gap-[7px]"
        >
          {opciones.map((o) => {
            const optId = `${id}-${o}`;
            const activa = valor === o;
            return (
              <Label
                key={o}
                htmlFor={optId}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-pill border px-3.5 py-[7px] text-caption font-normal text-text-b",
                  activa ? "border-primary bg-accent" : "border-hairline-strong bg-card",
                )}
              >
                <RadioGroupItem id={optId} value={o} />
                {o}
              </Label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
