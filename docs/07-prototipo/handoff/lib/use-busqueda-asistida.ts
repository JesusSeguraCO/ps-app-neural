"use client";

import { useCallback, useEffect, useRef, useState } from "react";
export interface PasoBusqueda {
  texto: string;
  estado: "hecho" | "actual" | "pendiente";
}

/**
 * Orquesta la búsqueda asistida: fases visibles del orbe y resolución.
 *
 * `interpretar` es la llamada real (servidor / modelo) que devuelve criterios.
 * La duración mínima (~2,3 s) no es teatro: garantiza que el cliente vea cómo
 * se leyó su instrucción antes de que cambie la lista. Si el servidor tarda
 * más, el orbe sigue hasta que responda.
 *
 * Al resolver, el contenedor escribe los criterios en la URL
 * (`useCriteriosURL`) — así el resultado de una búsqueda también es un enlace.
 */

const TEXTOS = [
  "Leyendo tu instrucción",
  "Cruzando con nuestro talento verificado",
  "Ordenando por evidencia",
];

export function useBusquedaAsistida<T>(
  interpretar: (instruccion: string) => Promise<T>,
  onResultado: (criterios: T) => void,
  duracionMinimaMs = 2300,
) {
  const [buscando, setBuscando] = useState(false);
  const [fase, setFase] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const buscar = useCallback(
    async (instruccion: string) => {
      timers.current.forEach(clearTimeout);
      setBuscando(true);
      setFase(0);
      // El orbe va bajo la barra; en ventanas bajas se trae a la vista lo justo.
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>("[role=status][data-orbe], [data-orbe]");
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.bottom <= window.innerHeight && r.top >= 64) return;
        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({
          top: Math.max(0, r.bottom + window.scrollY - window.innerHeight + 24),
          behavior: quieto ? "auto" : "smooth",
        });
      });
      timers.current = [
        setTimeout(() => setFase(1), duracionMinimaMs / 3),
        setTimeout(() => setFase(2), (duracionMinimaMs * 2) / 3),
      ];
      const [criterios] = await Promise.all([
        interpretar(instruccion),
        new Promise((r) => setTimeout(r, duracionMinimaMs)),
      ]);
      onResultado(criterios);
      setFase(3);
      setBuscando(false);
    },
    [interpretar, onResultado, duracionMinimaMs],
  );

  const pasos: PasoBusqueda[] = TEXTOS.map((texto, i) => ({
    texto,
    estado: fase > i ? "hecho" : fase === i ? "actual" : "pendiente",
  }));

  return { buscando, pasos, buscar };
}
