"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recomendado } from "@/lib/recomendados";
import { cn } from "@/lib/utils";

/**
 * PerfilesRecomendados — «Perfiles que pueden sumarte valor».
 * Va bajo la grilla de resultados; se monta solo tras una búsqueda con
 * resultados (ver lib/recomendados.ts). Tarjeta compacta: la razón en una
 * pastilla teal, capacidad, nombre · disponibilidad, 3 tecnologías y acciones.
 */

export interface PerfilesRecomendadosProps {
  items: Recomendado[];
  rolesBuscados: string[];
  equipo: string[];
  onAbrirFicha: (id: string) => void;
  onSumar: (id: string) => void;
}

export function PerfilesRecomendados({ items, rolesBuscados, equipo, onAbrirFicha, onSumar }: PerfilesRecomendadosProps) {
  if (items.length === 0) return null;
  const junto = rolesBuscados.length === 1 ? `un perfil ${rolesBuscados[0].toLowerCase()}` : "los perfiles que encontraste";
  return (
    <section aria-labelledby="rec-t" className="mt-10 border-t border-hairline pt-7">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden className="size-4 text-teal-ink" strokeWidth={1.9} />
        <h2 id="rec-t" className="text-lg font-semibold text-text-h">Perfiles que pueden sumarte valor</h2>
      </div>
      <p className="mb-4 mt-1.5 max-w-[72ch] text-[13.5px] leading-[1.55] text-text-m">
        No entran en tu búsqueda, pero suelen trabajar junto a {junto} en proyectos como el tuyo.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {items.map(({ perfil: p, razon }) => {
          const en = equipo.includes(p.id);
          return (
            <article key={p.id} className="flex animate-revelar flex-col rounded-lg border border-hairline bg-card px-[18px] py-4 shadow-1">
              <p className="self-start rounded-pill bg-accent px-2.5 py-1 text-[12px] font-medium text-teal-ink">{razon}</p>
              <h3 className="mt-3 text-pretty text-[15.5px] font-semibold leading-[1.3] text-text-h">{p.capacidad}</h3>
              <p className="mt-1 text-[13px] text-text-b">{p.nombre} {p.apellido} · {p.disponibilidad}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.tecnologias.slice(0, 3).map((t) => (
                  <li key={t} className="rounded-sm bg-subtle px-[7px] py-[3px] font-mono text-[11px] text-text-b">{t}</li>
                ))}
              </ul>
              <div className="mt-auto flex items-center gap-2 pt-3.5">
                <Button variant="outline" size="sm" onClick={() => onAbrirFicha(p.id)}>Ver ficha</Button>
                <Button
                  size="sm"
                  variant="secondary"
                  aria-pressed={en}
                  onClick={() => onSumar(p.id)}
                  className={cn(en && "border border-primary bg-accent text-teal-ink")}
                >
                  {en ? "En el equipo" : "Sumar al equipo"}
                </Button>
                <span className="ml-auto font-mono text-[11px] text-text-m">{p.id}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
