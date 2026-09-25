"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { ChevronsUpDown, Globe, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { OrbeBusqueda } from "./orbe-busqueda";
import type { PasoBusqueda } from "@/lib/use-busqueda-asistida";
import { cn } from "@/lib/utils";

/**
 * BarraInstruccion — búsqueda asistida, centrada y limpia.
 *
 *   orbe  →  titular  →  caja de escritura  →  sugerencias / pasos
 *
 * Todo lo accionable vive DENTRO de la caja: el campo, el selector de ámbito
 * (banco completo / conjunto curado) con su conteo, los atajos y el botón.
 * Bajo la caja se alternan dos estados en la misma altura, sin saltos: en
 * reposo las sugerencias; buscando, los tres pasos (aria-live).
 */

type Ambito = "abierto" | "curado";

export interface BarraInstruccionProps {
  valorInicial: string;
  sugerencias: string[];
  ambito: Ambito;
  /** Ya no se muestra el tamaño del banco: se retiró por posicionamiento. */
  conteoAmbito?: number;
  onCambiarAmbito: (a: Ambito) => void;
  buscando?: boolean;
  pasos: PasoBusqueda[];
  onBuscar: (instruccion: string) => void;
  className?: string;
}

function Tecla({ children }: { children: string }) {
  return (
    <kbd className="inline-block rounded-[5px] border border-b-2 border-hairline-strong px-[5px] py-0.5 font-mono text-[10.5px] leading-none text-text-m">
      {children}
    </kbd>
  );
}

export function BarraInstruccion({
  valorInicial, sugerencias, ambito, conteoAmbito, onCambiarAmbito, buscando = false, pasos, onBuscar, className,
}: BarraInstruccionProps) {
  const id = useId();
  const [valor, setValor] = useState(valorInicial);

  function buscar(texto = valor) {
    const limpio = texto.trim();
    if (!limpio || buscando) return;
    setValor(limpio);
    onBuscar(limpio);
  }
  function alPresionar(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      buscar();
    }
  }

  return (
    <section aria-labelledby={`${id}-t`} className={cn("relative overflow-x-clip pt-7", className)}>
      <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-[560px] w-[min(1000px,100%)] -translate-x-1/2 bg-[radial-gradient(closest-side,var(--pp-hero-glow),transparent)]" />
      <div className="relative mx-auto flex max-w-[760px] flex-col items-center text-center">
        <OrbeBusqueda activo={buscando} />
        <h1 id={`${id}-t`} className="mt-3.5 text-[36px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-h">
          <label htmlFor={id} className="cursor-text">
            ¿Qué{" "}
            <span className="text-teal-ink">talento</span>{" "}
            necesitas?
          </label>
        </h1>
        <p className="mt-2.5 max-w-[56ch] text-[15px] leading-[1.6] text-text-m">
          Cuéntanoslo como se lo contarías a un colega. Lo cruzamos con los perfiles que ya verificamos.
        </p>

        <div className="mt-6 w-full rounded-xl border border-hairline-strong bg-card text-left shadow-[var(--pp-cmd-shadow)] transition-colors hover:border-text-s">
          <Textarea
            id={id}
            rows={2}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={alPresionar}
            aria-describedby={`${id}-atajos`}
            className="min-h-0 resize-none rounded-t-xl border-0 bg-transparent px-[22px] pb-1.5 pt-[18px] text-[17px] leading-[1.55] text-text-h caret-primary shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center justify-between gap-3 pb-2.5 pl-3.5 pr-2.5 pt-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onCambiarAmbito(ambito === "curado" ? "abierto" : "curado")}
                aria-label={`Ámbito de búsqueda: ${ambito === "curado" ? "conjunto curado" : "banco completo"}. Pulsa para cambiar`}
                className="h-8 gap-1.5 rounded-pill px-3 text-[13px]"
              >
                <Globe aria-hidden className="size-3.5" strokeWidth={1.8} />
                {ambito === "curado" ? "Conjunto curado" : "Banco completo"}
                <ChevronsUpDown aria-hidden className="size-3" strokeWidth={2} />
              </Button>
              <span className="whitespace-nowrap text-[12px] text-text-m">{ambito === "curado" ? "Seleccionado para tu cuenta" : "Talento verificado"}</span>
            </div>
            <div className="flex items-center gap-3">
              <p id={`${id}-atajos`} className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-text-m">
                <Tecla>Enter</Tecla> buscar <span aria-hidden>·</span> <Tecla>Shift ↵</Tecla> línea
              </p>
              <Button onClick={() => buscar()} disabled={buscando} className="h-10 gap-2 rounded-pill bg-teal-fill pl-3.5 pr-4 text-white shadow-[var(--pp-btn-shadow)] hover:bg-teal-fill-hover">
                <Sparkles aria-hidden className="size-[15px]" strokeWidth={1.9} />
                {buscando ? "Buscando…" : "Buscar"}
              </Button>
            </div>
          </div>
        </div>

        <div aria-live="polite" className="mt-4 min-h-[34px] w-full">
          {buscando ? (
            <ol className="flex flex-wrap justify-center gap-x-[22px] gap-y-2 font-mono text-[12.5px]">
              {pasos.map((p) => (
                <li key={p.texto} className={cn("flex items-center gap-2", p.estado === "actual" ? "font-medium text-text-h" : p.estado === "hecho" ? "text-text-b" : "text-text-m")}>
                  <span aria-hidden className={cn(p.estado === "pendiente" ? "text-text-m" : "text-teal-ink", p.estado === "actual" ? "text-[8px]" : "text-[12px]")}>
                    {p.estado === "hecho" ? "✓" : p.estado === "actual" ? "●" : "○"}
                  </span>
                  {p.texto}
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {sugerencias.map((s) => (
                <button key={s} type="button" onClick={() => buscar(s)} className="rounded-pill border border-hairline px-3 py-1.5 text-[13px] text-text-b transition-colors hover:border-primary hover:bg-accent hover:text-text-h">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
