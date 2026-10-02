"use client";
// Atajos de la ficha (prototipo ficha-perfil: ← → recorrer, Esc cerrar) y el foco al abrir en «Cerrar».
// Sin JS la ficha funciona igual: anterior, siguiente y cerrar son enlaces.
import { useEffect } from "react";

export function AtajosFicha(p: { anterior: string | null; siguiente: string | null; cerrar: string }) {
  useEffect(() => {
    document.getElementById("fp-cerrar")?.focus();
    const alPulsar = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const destino =
        e.key === "Escape" ? p.cerrar : e.key === "ArrowLeft" ? p.anterior : e.key === "ArrowRight" ? p.siguiente : null;
      if (!destino) return;
      e.preventDefault();
      window.location.assign(destino);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [p.anterior, p.siguiente, p.cerrar]);
  return null;
}
