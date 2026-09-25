"use client";

import { ChevronLeft, ChevronRight, PenLine, ShieldCheck } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ValidacionTecnica } from "./validacion-tecnica";
import { cn } from "@/lib/utils";
import type { Perfil } from "@/lib/types";

/**
 * FichaPerfil — panel lateral sobre los resultados, sin perderlos.
 *
 * La pieza crítica: la ficha DISTINGUE VISUALMENTE, no en letra pequeña,
 * lo verificado por Trycore de lo declarado por el profesional.
 * `tratamiento` deja elegir la expresión sin cambiar la semántica:
 *   columnas — dos columnas enfrentadas
 *   bandas   — bloques apilados con banda teal / borde punteado
 *   placa    — placa navy de autoridad arriba, declarado en blanco abajo
 */

const contenedorVariants = cva("flex flex-col gap-4", {
  variants: {
    tratamiento: {
      columnas: "grid grid-cols-2 gap-4",
      bandas: "flex flex-col gap-3.5",
      placa: "flex flex-col",
    },
  },
  defaultVariants: { tratamiento: "placa" },
});

export interface FichaPerfilProps extends VariantProps<typeof contenedorVariants> {
  perfil: Perfil | null;
  abierta: boolean;
  onOpenChange: (v: boolean) => void;
  posicion: { indice: number; total: number };
  enEquipo: boolean;
  onSumar: (id: string) => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}

export function FichaPerfil({
  perfil,
  abierta,
  onOpenChange,
  posicion,
  enEquipo,
  onSumar,
  onAnterior,
  onSiguiente,
  tratamiento = "placa",
}: FichaPerfilProps) {
  if (!perfil) return null;

  const verificado = [
    { titulo: "Identidad", detalle: perfil.verificado.identidad },
    { titulo: "Seguridad y antecedentes", detalle: perfil.verificado.seguridad },
    { titulo: "Formación", detalle: perfil.verificado.formacion },
    { titulo: "Referencias laborales", detalle: perfil.verificado.referencias },
  ];
  const declarado = [
    {
      titulo: "Trayectoria",
      detalle: perfil.declarado.trayectoria
        .map((t) => `${t.rol} · ${t.empresa} (${t.periodo}): ${t.resumen}`)
        .join(" "),
    },
    { titulo: "Formación declarada", detalle: perfil.declarado.formacion.join(" · ") },
    { titulo: "Stack de trabajo", detalle: perfil.declarado.stack },
    { titulo: "Qué le interesa aportar", detalle: perfil.declarado.aporte },
  ];

  return (
    <Sheet open={abierta} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(680px,94vw)] max-w-none flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b border-hairline px-6 pb-4 pt-5 text-left">
          <SheetTitle className="text-pretty font-heading text-[20px] font-bold leading-[1.28] text-text-h">
            {perfil.capacidad}
          </SheetTitle>
          <SheetDescription className="text-body text-text-b">
            {perfil.nombre} {perfil.apellido}
          </SheetDescription>
          <nav aria-label="Navegación entre perfiles" className="mt-3.5 flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={onAnterior}>
              <ChevronLeft aria-hidden className="size-3.5" /> Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={onSiguiente}>
              Siguiente <ChevronRight aria-hidden className="size-3.5" />
            </Button>
            <span className="text-caption text-text-m">
              {posicion.indice + 1} de {posicion.total} en el conjunto actual
            </span>
          </nav>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-6 pb-8 pt-6">
          <div className={cn(contenedorVariants({ tratamiento }))}>
            {tratamiento === "bandas" ? (
              <>
                {verificado.map((v) => (
                  <Bloque key={v.titulo} origen="verificado" {...v} />
                ))}
                {declarado.map((d) => (
                  <Bloque key={d.titulo} origen="declarado" {...d} />
                ))}
              </>
            ) : tratamiento === "placa" ? (
              <>
                <section
                  aria-labelledby="fp-verificado"
                  className="rounded-lg bg-grad-sidebar p-5"
                >
                  <Encabezado id="fp-verificado" tono="oscuro" />
                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3.5">
                    {verificado.map((v) => (
                      <div key={v.titulo}>
                        <dt className="font-heading text-caption font-semibold text-white">
                          {v.titulo}
                        </dt>
                        <dd className="mt-[3px] text-caption leading-[1.5] text-navy-ink">
                          {v.detalle}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <p className="mb-2.5 mt-6 text-[12.5px] font-semibold text-text-m">
                  Lo que declara el profesional
                </p>
                <div className="flex flex-col gap-3">
                  {declarado.map((d) => (
                    <section
                      key={d.titulo}
                      className="rounded-lg border border-hairline bg-card p-4"
                    >
                      <h3 className="font-heading text-body font-semibold text-text-h">
                        {d.titulo}
                      </h3>
                      <p className="mt-[3px] text-small leading-[1.55] text-text-b">
                        {d.detalle}
                      </p>
                    </section>
                  ))}
                </div>
              </>
            ) : (
              <>
                <section
                  aria-labelledby="fp-verificado"
                  className="rounded-lg border border-primary-surface-border bg-primary-surface p-4"
                >
                  <Encabezado id="fp-verificado" tono="claro" />
                  <dl className="mt-3.5 flex flex-col gap-2.5">
                    {verificado.map((v) => (
                      <div key={v.titulo}>
                        <dt className="font-heading text-caption font-semibold text-navy">
                          {v.titulo}
                        </dt>
                        <dd className="mt-0.5 text-small leading-[1.5] text-primary-surface-ink">
                          {v.detalle}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section
                  aria-labelledby="fp-declarado"
                  className="rounded-lg border border-hairline bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <PenLine aria-hidden className="size-[17px] text-text-m" strokeWidth={1.8} />
                    <h3
                      id="fp-declarado"
                      className="text-[12.5px] font-semibold text-text-m"
                    >
                      Lo que declara el profesional
                    </h3>
                  </div>
                  <dl className="mt-3.5 flex flex-col gap-2.5">
                    {declarado.map((d) => (
                      <div key={d.titulo}>
                        <dt className="font-heading text-caption font-semibold text-text-h">
                          {d.titulo}
                        </dt>
                        <dd className="mt-0.5 text-small leading-[1.5] text-text-b">
                          {d.detalle}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </>
            )}
          </div>

          <ValidacionTecnica className="mt-5" datos={perfil.verificado.tecnica} />

          <p className="mt-5 text-[12px] leading-[1.55] text-text-m">
            Referencia interna {perfil.id}. Todos los perfiles que publicamos pasan por
            nuestro estándar Neural-Grid™.
          </p>
        </div>

        <SheetFooter className="flex-row items-center gap-2.5 border-t border-hairline px-6 py-4">
          <Button
            aria-pressed={enEquipo}
            onClick={() => onSumar(perfil.id)}
            className={cn(
              enEquipo
                ? "border border-primary bg-accent text-primary-ink"
                : "bg-primary-strong text-white hover:bg-primary-strong-hover",
            )}
          >
            {enEquipo ? "En el equipo" : "Sumar al equipo"}
          </Button>
          <span className="text-caption text-text-m">{perfil.disponibilidad}</span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Encabezado({ id, tono }: { id: string; tono: "claro" | "oscuro" }) {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck
        aria-hidden
        className={cn("size-[17px]", tono === "oscuro" ? "text-teal-on-navy" : "text-primary-ink")}
        strokeWidth={2}
      />
      <h3
        id={id}
        className={cn(
          "text-[12.5px] font-semibold",
          tono === "oscuro" ? "text-teal-on-navy" : "text-primary-ink",
        )}
      >
        Lo que verificamos
      </h3>
    </div>
  );
}

function Bloque({
  titulo,
  detalle,
  origen,
}: {
  titulo: string;
  detalle: string;
  origen: "verificado" | "declarado";
}) {
  const esVerificado = origen === "verificado";
  return (
    <section
      className={cn(
        "rounded-lg p-4",
        esVerificado
          ? "border border-primary-surface-border bg-primary-surface"
          : "border border-dashed border-hairline-strong bg-surface-declared",
      )}
    >
      <p
        className={cn(
          "text-[12.5px] font-semibold",
          esVerificado ? "text-primary-ink" : "text-text-m",
        )}
      >
        {esVerificado ? "Lo que verificamos" : "Lo que declara el profesional"}
      </p>
      <h3 className="mt-2 font-heading text-body font-semibold text-text-h">{titulo}</h3>
      <p className="mt-[3px] text-small leading-[1.55] text-text-b">{detalle}</p>
    </section>
  );
}
