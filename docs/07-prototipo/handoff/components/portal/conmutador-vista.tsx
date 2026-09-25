"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { useQueryState } from "nuqs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * ConmutadorVista — tarjetas / tabla. La vista activa vive en la URL:
 * recargar la conserva y un enlace copiado la reproduce.
 */

export type Vista = "tarjetas" | "tabla";

export interface ConmutadorVistaProps {
  /** Nombre del parámetro en searchParams. */
  param?: string;
  defaultValue?: Vista;
  onChange?: (v: Vista) => void;
}

export function ConmutadorVista({
  param = "vista",
  defaultValue = "tarjetas",
  onChange,
}: ConmutadorVistaProps) {
  const [vista, setVista] = useQueryState(param, {
    defaultValue,
    clearOnDefault: true,
    history: "replace",
  });

  return (
    <ToggleGroup
      type="single"
      value={vista}
      onValueChange={(v) => {
        if (!v) return;
        void setVista(v);
        onChange?.(v as Vista);
      }}
      aria-label="Vista de resultados"
      className="overflow-hidden rounded-md border border-hairline-strong bg-card"
    >
      <ToggleGroupItem
        value="tarjetas"
        aria-label="Ver los resultados como tarjetas"
        className="gap-2 px-4 py-2 font-heading text-small font-semibold data-[state=on]:bg-navy data-[state=on]:text-white"
      >
        <LayoutGrid aria-hidden className="size-4" strokeWidth={1.6} />
        Tarjetas
      </ToggleGroupItem>
      <ToggleGroupItem
        value="tabla"
        aria-label="Ver los resultados como tabla"
        className="gap-2 px-4 py-2 font-heading text-small font-semibold data-[state=on]:bg-navy data-[state=on]:text-white"
      >
        <Rows3 aria-hidden className="size-4" strokeWidth={1.6} />
        Tabla
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
