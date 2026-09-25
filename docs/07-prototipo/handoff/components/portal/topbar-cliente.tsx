"use client";

import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConmutadorTema } from "./conmutador-tema";
import { IndicadorEquipo } from "./indicador-equipo";
import { cn } from "@/lib/utils";

/**
 * TopbarCliente — cabecera de la cara cliente.
 *
 * Regla de reparto del ancho: logo y navegación no se encogen (flex-none);
 * el bloque de la cuenta es el único flexible (flex-1 min-w-0) y trunca sus
 * dos líneas con elipsis. Así, desde ~900px nada salta de línea ni se recorta.
 * Talento Humano y el tema van como botones de icono con aria-label.
 */

export interface TopbarClienteProps {
  cliente: string;
  proyecto: string;
  accesoVence: string;
  equipo: number;
  /** Solo para usuarios con rol de Talento Humano. */
  mostrarAdmin?: boolean;
}

const NAV = [
  { href: "/", texto: "Conjunto curado" },
  { href: "/buscar", texto: "Buscar" },
];

export function TopbarCliente({ cliente, proyecto, accesoVence, equipo, mostrarAdmin }: TopbarClienteProps) {
  const ruta = usePathname();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-hairline bg-[var(--pp-header)] px-6 backdrop-blur-md backdrop-saturate-150">
      <div className="flex flex-none items-center gap-3">
        <Image src="/brand/logo-trycore.png" alt="Trycore" width={96} height={20} className="h-5 w-auto dark:hidden" priority />
        <Image src="/brand/logo-trycore-mono-white.svg" alt="Trycore" width={88} height={18} className="hidden h-[18px] w-auto dark:block" priority />
        <span aria-hidden className="text-hairline-strong">/</span>
        <span className="whitespace-nowrap text-sm font-medium text-text-h">Portal de perfiles</span>
      </div>
      <span aria-hidden className="h-6 w-px flex-none bg-hairline" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-text-h">{cliente} · {proyecto}</p>
        <p className="truncate text-[11.5px] text-text-m">Acceso válido hasta {accesoVence}</p>
      </div>
      <nav aria-label="Portal" className="flex flex-none items-center gap-1.5">
        {NAV.map((n) => (
          <Button key={n.href} asChild variant="ghost" className="h-9 rounded-md px-3 text-[13.5px] font-medium text-text-b">
            <Link href={n.href} aria-current={ruta === n.href ? "page" : undefined}>{n.texto}</Link>
          </Button>
        ))}
        <IndicadorEquipo cantidad={equipo} className="ml-1" />
        <span aria-hidden className="mx-1 h-[22px] w-px bg-hairline" />
        <ConmutadorTema />
        {mostrarAdmin ? (
          <Button asChild variant="outline" size="icon" className={cn("size-9 rounded-md")}>
            <Link href="/admin" aria-label="Panel de Talento Humano" title="Panel de Talento Humano">
              <Users aria-hidden className="size-4" strokeWidth={1.8} />
            </Link>
          </Button>
        ) : null}
      </nav>
    </header>
  );
}
