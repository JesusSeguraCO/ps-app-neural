"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FranjaServicio — onboarding de una sola vez.
 *
 * Se muestra solo hasta la primera búsqueda completada y nunca más (se guarda
 * en localStorage 'pp-onboarding'); también se puede cerrar con ×. Después, el
 * empuje a enviar lo hace <CtaEquipoFlotante />.
 *
 * Contenido: tu avance, no un folleto.
 *
 * Tres pasos (describir → armar equipo → enviar) que reflejan dónde está el
 * cliente de verdad. Solo cambia cuando él avanza: al terminar la primera
 * búsqueda, al sumar el primer perfil y cuando ya puede enviar. Sin bucles de
 * animación; la línea se llena con una transición de 600 ms entre pasos.
 * En el paso 3 aparece la acción «Enviar solicitud».
 *
 * aria-current="step" marca el paso actual; cada estado se lee también en texto.
 */

export interface FranjaServicioProps {
  yaBusco: boolean;
  perfilesEnEquipo: number;
  hrefSolicitud?: string;
  className?: string;
}

type Estado = "hecho" | "actual" | "pendiente";

export function FranjaServicio({ yaBusco, perfilesEnEquipo, hrefSolicitud = "/solicitud", className }: FranjaServicioProps) {
  const [visto, setVisto] = useState(true);
  useEffect(() => setVisto(localStorage.getItem("pp-onboarding") === "1"), []);
  useEffect(() => {
    if (yaBusco) localStorage.setItem("pp-onboarding", "1");
  }, [yaBusco]);
  const cerrar = () => {
    localStorage.setItem("pp-onboarding", "1");
    setVisto(true);
  };
  if (visto || yaBusco) return null;

  const paso = perfilesEnEquipo > 0 ? 3 : yaBusco ? 2 : 1;
  const estado = (n: number): Estado => (n < paso ? "hecho" : n === paso ? "actual" : "pendiente");

  const pasos = [
    estado(1) === "hecho"
      ? { t: "Describiste lo que necesitas", d: "Puedes ajustar la búsqueda cuando quieras" }
      : { t: "Describe lo que necesitas", d: "En tus palabras, sin formularios" },
    estado(2) === "hecho"
      ? { t: "Armaste tu equipo", d: perfilesEnEquipo === 1 ? "1 perfil seleccionado" : `${perfilesEnEquipo} perfiles seleccionados` }
      : { t: "Suma perfiles a tu equipo", d: "Desde las tarjetas, la tabla o la ficha" },
    { t: "Envíanos la solicitud", d: "Te respondemos en 10 días hábiles" },
  ];

  return (
    <nav aria-label="Cómo funciona" className={cn("relative mx-auto mt-8 max-w-[940px] border-t border-hairline pb-0.5 pt-4", className)}>
      <Button variant="ghost" size="icon" onClick={cerrar} aria-label="Ocultar la guía de pasos" className="absolute right-0 top-2.5 size-7 rounded-md text-text-m">
        <X aria-hidden className="size-3.5" strokeWidth={2} />
      </Button>
      <ol className="relative grid grid-cols-3">
        <li aria-hidden className="absolute left-[16.66%] right-[16.66%] top-[11px] h-0.5 rounded-sm bg-hairline">
          <span
            className="absolute inset-y-0 left-0 rounded-sm bg-[linear-gradient(90deg,var(--tc-primary),var(--pp-grad-2))] transition-[width] duration-[600ms] ease-tc"
            style={{ width: paso === 1 ? "0%" : paso === 2 ? "50%" : "100%" }}
          />
        </li>
        {pasos.map((p, i) => {
          const e = estado(i + 1);
          return (
            <li key={i} aria-current={e === "actual" ? "step" : undefined} className="relative flex flex-col items-center px-3 text-center">
              <span
                aria-hidden
                className={cn(
                  "grid size-6 place-items-center rounded-pill font-mono text-[11px] shadow-[0_0_0_4px_var(--tc-bg-canvas)] transition-colors duration-300",
                  e === "hecho" && "border border-transparent bg-teal-fill text-white",
                  e === "actual" && "border-2 border-primary bg-card text-teal-ink",
                  e === "pendiente" && "border border-hairline-strong bg-card text-text-m",
                )}
              >
                {e === "hecho" ? "✓" : i + 1}
              </span>
              <span className={cn("mt-2 text-[13px]", e === "actual" ? "font-semibold" : "font-medium", e === "pendiente" ? "text-text-m" : "text-text-h")}>
                <span className="sr-only">{e === "hecho" ? "Hecho: " : e === "actual" ? "Paso actual: " : "Pendiente: "}</span>
                {p.t}
              </span>
              <span className="mt-0.5 text-[12px] text-text-m">{p.d}</span>
              {i === 2 && e === "actual" ? (
                <Button asChild size="sm" className="mt-2 h-[30px] gap-1.5 rounded-pill bg-teal-fill px-3 text-[12.5px] text-white shadow-[var(--pp-btn-shadow)] hover:bg-teal-fill-hover">
                  <Link href={hrefSolicitud}>Enviar solicitud <span aria-hidden>→</span></Link>
                </Button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
