"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * ConmutadorTema — claro / oscuro.
 *
 * Por omisión sigue la preferencia del sistema operativo (defaultTheme="system");
 * al pulsar, la elección del usuario se guarda y manda. Se monta en la topbar
 * del cliente y al pie del sidebar de Talento Humano.
 *
 * Requiere en app/layout.tsx:
 *   <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
 */

export function ConmutadorTema() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const oscuro = montado && resolvedTheme === "dark";
  const etiqueta = oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={etiqueta}
      aria-pressed={oscuro}
      onClick={() => setTheme(oscuro ? "light" : "dark")}
      className="size-9 rounded-md"
    >
      {oscuro ? (
        <Sun aria-hidden className="size-4" strokeWidth={1.8} />
      ) : (
        <Moon aria-hidden className="size-4" strokeWidth={1.8} />
      )}
    </Button>
  );
}
