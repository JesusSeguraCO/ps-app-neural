import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidacionTecnicaData } from "@/lib/types";

/**
 * ValidacionTecnica — bloque expandible de estructura fija de cinco campos.
 * Vive dentro de la ficha. Nunca en un tooltip y nunca en la tarjeta.
 *
 * El encabezado declara el origen — verificado por Trycore — porque esta es
 * la distinción más importante del producto y no puede quedar en letra pequeña.
 */

export interface ValidacionTecnicaProps {
  datos: ValidacionTecnicaData;
  defaultOpen?: boolean;
  className?: string;
}

const CAMPOS: Array<[keyof ValidacionTecnicaData, string]> = [
  ["pruebaAplicada", "Prueba aplicada"],
  ["evaluador", "Evaluador"],
  ["fecha", "Fecha"],
  ["resultado", "Resultado"],
  ["alcanceEvaluado", "Alcance evaluado"],
];

export function ValidacionTecnica({
  datos,
  defaultOpen = true,
  className,
}: ValidacionTecnicaProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "validacion" : undefined}
      className={cn("overflow-hidden rounded-lg border border-hairline", className)}
    >
      <AccordionItem value="validacion" className="border-0">
        <AccordionTrigger className="bg-surface-quiet px-5 py-4 hover:no-underline">
          <span className="flex items-center gap-2 text-left">
            <ShieldCheck
              aria-hidden
              className="size-[18px] text-primary-ink"
              strokeWidth={2}
            />
            <span>
              <span className="block text-[12.5px] font-semibold text-primary-ink">
                Lo que verificamos
              </span>
              <span className="mt-1 block font-heading text-[14.5px] font-semibold text-text-h">
                Validación técnica
              </span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5 pt-1">
          <dl className="grid grid-cols-[minmax(120px,auto)_1fr] gap-x-[18px] gap-y-2.5">
            {CAMPOS.map(([clave, etiqueta]) => (
              <div key={clave} className="contents">
                <dt className="pt-0.5 font-heading text-[11.5px] font-semibold text-text-m">
                  {etiqueta}
                </dt>
                <dd className="text-small leading-[1.5] text-text-b">
                  {datos[clave]}
                </dd>
              </div>
            ))}
          </dl>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
