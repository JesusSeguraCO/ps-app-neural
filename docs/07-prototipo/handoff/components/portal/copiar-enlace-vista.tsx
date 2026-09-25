"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CopiarEnlaceVista — hace visible lo que el estado en la URL ya permite:
 * llevarse la pantalla exacta (criterios, ámbito, vista) a un correo o un chat.
 *
 * El resultado se anuncia por aria-live; sin eso el botón no da señal a quien
 * navega con lector de pantalla.
 */

export interface CopiarEnlaceVistaProps {
  className?: string;
}

export function CopiarEnlaceVista({ className }: CopiarEnlaceVistaProps) {
  const [aviso, setAviso] = useState("");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setAviso("Enlace copiado. Reproduce esta vista tal cual, con los criterios y la vista activa.");
    } catch {
      setAviso("No pudimos copiarlo. Usa la barra de direcciones del navegador.");
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={copiar} className={cn("gap-2", className)}>
        <Link2 aria-hidden className="size-3.5" strokeWidth={1.8} />
        Copiar enlace de esta vista
      </Button>
      <p aria-live="polite" className="min-h-4 text-[12px] text-primary-strong">
        {aviso}
      </p>
    </>
  );
}
