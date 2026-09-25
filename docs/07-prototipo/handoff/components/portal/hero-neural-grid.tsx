import Image from "next/image";
import { ArrowDown, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * HeroNeuralGrid — cabecera del conjunto curado.
 *
 * Lo que se vende es el MODELO, no las personas: el núcleo Neural-Grid en el
 * centro, sus componentes en el primer anillo y los profesionales en el
 * anillo exterior, conectados por líneas punteadas que fluyen hacia el núcleo.
 * Mañana el anillo exterior pueden ser agentes: el diagrama no cambia.
 *
 * Retratos: ILUSTRATIVOS (generados), nunca los de los perfiles publicados,
 * que siguen sin foto. Se cargan en `retratos`; sin archivo se ve un círculo
 * con degradado suave.
 *
 * Geometría fija 640×480 (núcleo 320,240; componentes r=132; retratos r=222).
 * Bajo 1100px la figura pasa debajo del texto. motion-reduce detiene flujo y flotación.
 */

export interface ComponenteGrid { nombre: string; Icono: LucideIcon }

export interface HeroNeuralGridProps {
  cliente: string;
  titulo: string;
  razon: string;
  curadoPor: string;
  totalPerfiles: number;
  componentes: ComponenteGrid[]; // máx. 5
  retratos: (string | null)[]; // 6
  onVerPerfiles: () => void;
}

const C = { x: 320, y: 240 };
const pol = (r: number, a: number) => ({ x: Math.round(C.x + r * Math.cos((a * Math.PI) / 180)), y: Math.round(C.y + r * Math.sin((a * Math.PI) / 180)) });
const NODOS = [-90, -18, 54, 126, 198].map((a) => pol(132, a));
// Retratos en su propia órbita (r=222), fuera de la franja de las píldoras
const RETR = [-150, -90, -30, 30, 90, 150].map((a) => pol(222, a));
const PARES: [number, number[]][] = [[0, [4, 0]], [1, [0, 1]], [2, [1, 2]], [3, [2]], [4, [3]], [5, [4, 3]]];

function curva(P: { x: number; y: number }, N: { x: number; y: number }) {
  const mx = (P.x + N.x) / 2, my = (P.y + N.y) / 2;
  return `M${P.x} ${P.y} Q${Math.round(mx + (C.x - mx) * 0.18)} ${Math.round(my + (C.y - my) * 0.18)} ${N.x} ${N.y}`;
}

export function HeroNeuralGrid({ cliente, titulo, razon, curadoPor, totalPerfiles, componentes, retratos, onVerPerfiles }: HeroNeuralGridProps) {
  return (
    <section aria-labelledby="cur-h1" className="relative flex flex-wrap items-center gap-x-10 gap-y-6 overflow-hidden rounded-[24px] border border-hairline bg-card py-10 pl-12 pr-9 shadow-2">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-16 h-[560px] w-[760px] bg-[radial-gradient(closest-side,var(--pp-hero-glow),transparent)]" />
      <div className="relative min-w-0 max-w-[520px] flex-[1_1_380px]">
        <p className="inline-flex items-center gap-2 rounded-pill border border-hairline bg-card py-1 pl-1.5 pr-3 text-[12.5px] text-text-b shadow-1">Selección hecha a mano para {cliente}</p>
        <h1 id="cur-h1" className="mt-[18px] text-balance text-[36px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-h">{titulo}</h1>
        <p className="mt-3.5 text-pretty text-[15px] leading-[1.65] text-text-b">{razon}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={onVerPerfiles} className="h-[42px] gap-2 rounded-pill bg-[var(--pp-press)] px-[18px] text-[var(--pp-press-ink)] hover:opacity-90">
            Ver los {totalPerfiles} perfiles <ArrowDown aria-hidden className="size-4" strokeWidth={1.6} />
          </Button>
          <span className="text-[12.5px] text-text-m">{curadoPor}</span>
        </div>
        <div className="mt-7 border-t border-hairline pt-[18px]">
          <img src="/assets/logo-neural-h.svg" alt="Neural Grid" className="h-9 w-auto dark:hidden" />
          <img src="/assets/logo-neural-h-dark.svg" alt="Neural Grid" className="hidden h-9 w-auto dark:block" />
          <p className="mt-1 max-w-[52ch] text-[13px] leading-[1.55] text-text-m">Vibramos a la frecuencia de tu proyecto. Lo que te entregamos es capacidad verificada en cinco componentes, y cada perfil de esta selección pasó por todos.</p>
        </div>
      </div>

      <figure aria-label="Neural-Grid: el núcleo conecta los componentes verificados con los profesionales de la selección" className="relative m-0 h-[480px] w-[640px] flex-none">
        {[{ r: 72, c: "border-hairline" }, { r: 132, c: "border-hairline-strong" }, { r: 222, c: "border-dashed border-hairline-strong" }].map(({ r, c }) => (
          <div key={r} aria-hidden className={`absolute rounded-pill border ${c}`} style={{ left: C.x - r, top: C.y - r, width: r * 2, height: r * 2 }} />
        ))}
        {/* Ondas expansivas desde el núcleo: vibramos a la frecuencia del cliente */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="absolute size-[144px] rounded-pill border-[1.5px] border-primary opacity-0 animate-[onda_6s_cubic-bezier(.2,.6,.3,1)_infinite] motion-reduce:hidden"
              style={{ left: C.x - 72, top: C.y - 72, animationDelay: `${i * 1.5}s` }} />
          ))}
        </div>

        <div className="absolute z-[3] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2" style={{ left: C.x, top: C.y }}>
          <div className="grid size-[112px] place-items-center rounded-pill border border-hairline bg-card shadow-[0_18px_44px_-14px_rgba(0,161,154,.5)]">
            <img src="/assets/neural-mark.svg" alt="" className="size-[92px] dark:hidden" />
            <img src="/assets/neural-mark-dark.svg" alt="" className="hidden size-[92px] dark:block" />
          </div>
        </div>

        {componentes.slice(0, 5).map(({ nombre, Icono }, i) => (
          <div key={nombre} className="absolute z-[3] -translate-x-1/2 -translate-y-1/2" style={{ left: NODOS[i].x, top: NODOS[i].y }}>
            <div className="inline-flex animate-[flotar_6s_ease-in-out_infinite] items-center gap-[7px] whitespace-nowrap rounded-pill border border-hairline bg-card py-1.5 pl-[7px] pr-3 text-[12.5px] font-medium text-text-h shadow-2 motion-reduce:animate-none" style={{ animationDelay: `${i * 0.4}s` }}>
              <span aria-hidden className="grid size-6 place-items-center rounded-pill bg-accent text-teal-ink"><Icono className="size-3.5" strokeWidth={1.6} /></span>
              {nombre}
            </div>
          </div>
        ))}

        {/* Los retratos orbitan el modelo; cada uno contragira para quedar derecho */}
        <div aria-hidden className="absolute inset-0 z-[2] origin-[320px_240px] animate-[orbita_90s_linear_infinite] motion-reduce:animate-none">
        {RETR.map((P, i) => (
          <div key={i} className="absolute size-[60px] animate-[orbita_90s_linear_infinite_reverse] motion-reduce:animate-none rounded-pill bg-card p-[3px] shadow-[0_0_0_1px_var(--tc-border),var(--tc-sh-2)]" style={{ left: P.x - 30, top: P.y - 30 }}>
            {retratos[i] ? (
              <Image src={retratos[i]!} alt="" width={54} height={54} className="size-[54px] rounded-pill object-cover" />
            ) : (
              <span className="block size-[54px] rounded-pill bg-[var(--pp-retrato)]" />
            )}
          </div>
        ))}
        </div>
        <figcaption className="sr-only">Los retratos son ilustrativos y no corresponden a los profesionales de la selección.</figcaption>
      </figure>
    </section>
  );
}
