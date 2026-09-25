"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ConmutadorTema } from "./conmutador-tema";
import { ICONO_NAV, Icono } from "./iconos";
import { cn } from "@/lib/utils";

/**
 * AdminShell — mismo marco que AppShell, para Talento Humano (≥ 1024px).
 * Menú claro con icono + texto sobre el lienzo; contenido en el contenedor de
 * radio 24, con scroll propio para que los paneles pegajosos funcionen.
 */

const NAV = [
  { href: "/talento-humano", t: "Inventario de perfiles", i: ICONO_NAV.inventario },
  { href: "/talento-humano/importar", t: "Importar perfiles", i: ICONO_NAV.importar },
  { href: "/talento-humano/perfil", t: "Crear / editar perfil", i: ICONO_NAV.crear },
  { href: "/talento-humano/enlaces", t: "Enlaces de acceso", i: ICONO_NAV.enlaces },
  { href: "/talento-humano/vigencia", t: "Bandeja de vigencia", i: ICONO_NAV.vigencia },
];

export function AdminShell({ usuario, children }: { usuario: { nombre: string; iniciales: string; area: string }; children: React.ReactNode }) {
  const ruta = usePathname();
  return (
    <div className="grid h-screen grid-cols-[236px_minmax(0,1fr)] bg-[var(--pp-frame)] py-3 pr-3">
      <nav aria-label="Panel de Talento Humano" className="flex min-h-0 flex-col gap-[3px] px-3.5 py-2.5">
        <div className="flex items-center gap-2.5 px-2 pb-5 pt-1.5">
          <img src="/assets/symbol-trycore.svg" alt="" className="size-7" />
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-text-h">Talento Humano</span>
            <span className="text-[12px] text-text-m">Portal de perfiles</span>
          </span>
        </div>
        {NAV.map((n) => {
          const activo = n.href === "/talento-humano" ? ruta === n.href : ruta.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} aria-current={activo ? "page" : undefined}
              className={cn("flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-[13px] font-medium transition-colors",
                activo ? "border-hairline bg-card text-text-h shadow-1" : "border-transparent text-text-b hover:bg-card hover:text-text-h")}>
              <Icono icono={n.i} className="size-4" />{n.t}
            </Link>
          );
        })}
        <div className="flex-1" />
        <Link href="/curado" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-[12.5px] font-medium text-text-m hover:bg-card hover:text-text-h">
          <ArrowLeft aria-hidden className="size-3.5" strokeWidth={1.6} /> Volver a la cara cliente
        </Link>
        <ConmutadorTema />
        <div className="mt-2 flex items-center gap-2.5 border-t border-hairline-strong px-2 pb-1 pt-2.5">
          <span className="relative grid size-[34px] flex-none place-items-center rounded-pill bg-[linear-gradient(140deg,#CFF5F1,#D6DEFF)] text-[12px] font-semibold text-[#1D2751]">
            <span aria-hidden>{usuario.iniciales}</span>
            <span aria-hidden className="absolute bottom-0 right-0 size-[9px] rounded-pill bg-[#22C55E] shadow-[0_0_0_2px_var(--pp-frame)]" />
          </span>
          <span className="flex min-w-0 flex-col leading-snug">
            <span className="truncate text-[13px] font-medium text-text-h">{usuario.nombre}</span>
            <span className="text-[12px] text-text-m">{usuario.area}</span>
          </span>
        </div>
      </nav>
      <main className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden rounded-[24px] border border-hairline bg-canvas px-9 pb-20 pt-8 shadow-[0_1px_2px_rgba(16,24,40,.04),0_16px_40px_-16px_rgba(16,24,40,.12)]">
        {children}
      </main>
    </div>
  );
}
