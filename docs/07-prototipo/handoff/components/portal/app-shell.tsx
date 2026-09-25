"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Search, Settings, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConmutadorTema } from "./conmutador-tema";
import { cn } from "@/lib/utils";

/**
 * AppShell — marco de plataforma de la cara cliente.
 *
 * Lienzo gris (--pp-frame) con un riel de iconos a la izquierda y el contenido
 * en un contenedor redondeado de 24px que flota con sombra suave. El riel
 * lleva: símbolo Trycore, Conjunto curado, Buscar, Mi equipo (con conteo),
 * y al pie el acceso a Talento Humano, el tema y la persona con sesión.
 * La cabecera del contenedor es ligera: nombre del portal, la cuenta, la
 * vigencia del acceso y «Nueva búsqueda».
 *
 * Móvil (siguiente pasada): el riel pasa a barra inferior y el contenedor
 * pierde el margen y el radio.
 */

export interface AppShellProps {
  cliente: string;
  proyecto: string;
  accesoVence: string;
  usuario: { nombre: string; iniciales: string };
  perfilesEnEquipo: number;
  children: React.ReactNode;
}

const NAV = [
  { href: "/curado", etiqueta: "Conjunto curado", Icono: Layers },
  { href: "/buscar", etiqueta: "Buscar talento", Icono: Search },
  { href: "/equipo", etiqueta: "Mi equipo", Icono: Users },
];

export function AppShell({ cliente, proyecto, accesoVence, usuario, perfilesEnEquipo, children }: AppShellProps) {
  const ruta = usePathname();
  return (
    <div className="grid min-h-screen grid-cols-[76px_minmax(0,1fr)] bg-[var(--pp-frame)] py-3 pr-3">
      <nav aria-label="Portal" className="sticky top-3 flex h-[calc(100vh-24px)] flex-col items-center gap-1.5 py-2">
        <img src="/assets/symbol-trycore.svg" alt="Trycore" className="mb-2.5 size-7" />
        {NAV.map(({ href, etiqueta, Icono }) => {
          const activo = ruta.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              aria-label={href === "/equipo" ? `${etiqueta}: ${perfilesEnEquipo} perfiles` : etiqueta}
              title={etiqueta}
              className={cn(
                "relative grid size-11 place-items-center rounded-[14px] border transition-colors",
                activo ? "border-hairline bg-card text-text-h shadow-1" : "border-transparent text-text-m hover:bg-card hover:text-text-h",
              )}
            >
              <Icono aria-hidden className="size-5" strokeWidth={1.6} />
              {href === "/equipo" && perfilesEnEquipo > 0 && (
                <span aria-hidden className="absolute right-[3px] top-1 h-[17px] min-w-[17px] rounded-pill bg-teal-fill px-1 text-center font-mono text-[10px] leading-[17px] text-white shadow-[0_0_0_2px_var(--pp-frame)]">
                  {perfilesEnEquipo}
                </span>
              )}
            </Link>
          );
        })}
        <div className="flex-1" />
        <Link href="/talento-humano" aria-label="Panel de Talento Humano" title="Panel de Talento Humano" className="grid size-11 place-items-center rounded-[14px] text-text-m hover:bg-card hover:text-text-h">
          <Settings aria-hidden className="size-[19px]" strokeWidth={1.6} />
        </Link>
        <ConmutadorTema />
        <span title={`${usuario.nombre} · ${cliente}`} className="relative mt-1.5 grid size-9 place-items-center rounded-pill bg-[linear-gradient(140deg,#CFF5F1,#D6DEFF)] text-[12.5px] font-semibold text-[#1D2751]">
          <span aria-hidden>{usuario.iniciales}</span>
          <span className="sr-only">{usuario.nombre} · {cliente}</span>
          <span aria-hidden className="absolute bottom-0 right-0 size-[9px] rounded-pill bg-[#22C55E] shadow-[0_0_0_2px_var(--pp-frame)]" />
        </span>
      </nav>

      <div className="min-w-0 overflow-clip rounded-[24px] border border-hairline bg-canvas shadow-[0_1px_2px_rgba(16,24,40,.04),0_16px_40px_-16px_rgba(16,24,40,.12)]">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 bg-[var(--pp-header)] px-7 backdrop-blur-md">
          <span className="whitespace-nowrap text-[15px] font-semibold text-text-h">Portal de perfiles</span>
          <span className="whitespace-nowrap rounded-[7px] border border-hairline-strong px-2 py-0.5 text-[12px] font-medium text-text-b">{cliente} · {proyecto}</span>
          <div className="flex-1" />
          <span className="whitespace-nowrap text-[12.5px] text-text-m">Acceso vigente hasta {accesoVence}</span>
          <Button asChild className="h-[38px] gap-2 rounded-pill bg-[var(--pp-press)] px-4 text-[13.5px] text-[var(--pp-press-ink)] hover:opacity-90">
            <Link href="/buscar?nueva=1">Nueva búsqueda <Sparkles aria-hidden className="size-[15px]" strokeWidth={1.6} /></Link>
          </Button>
        </header>
        {children}
      </div>
    </div>
  );
}
