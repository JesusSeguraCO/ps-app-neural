"use client";

import { useCallback } from "react";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import type { ClaveCriterio, ModoCriterio } from "@/lib/types";

/**
 * El estado vive en la URL. Filtros, criterios del Perfil Objetivo, perfil
 * abierto y vista activa se leen de searchParams y se escriben con nuqs.
 * Recargar conserva el estado; un enlace copiado reproduce exactamente la
 * misma pantalla — requisito duro, porque al portal se llega desde un correo.
 *
 * Formato por criterio:  ?rol=o:Backend|Frontend   (o = obligatorio, d = deseable)
 */

const CLAVES: ClaveCriterio[] = [
  "rol",
  "seniority",
  "tecnologias",
  "sector",
  "modalidad",
  "pais",
  "ciudad",
  "idioma",
];

const parsers = {
  vista: parseAsStringLiteral(["tarjetas", "tabla"] as const).withDefault("tarjetas"),
  ambito: parseAsStringLiteral(["curado", "abierto"] as const).withDefault("curado"),
  perfil: parseAsString,
  equipo: parseAsArrayOf(parseAsString, ",").withDefault([]),
  ...Object.fromEntries(CLAVES.map((k) => [k, parseAsString])),
};

export interface CriterioURL {
  valores: string[];
  modo: ModoCriterio;
}

export function useCriteriosURL() {
  const [estado, setEstado] = useQueryStates(parsers, {
    history: "replace",
    clearOnDefault: true,
  });

  const leer = useCallback(
    (clave: ClaveCriterio): CriterioURL => {
      const raw = (estado as Record<string, string | null>)[clave];
      if (!raw) return { valores: [], modo: clave === "rol" ? "obligatorio" : "deseable" };
      const [modo, lista] = raw.split(":");
      return {
        valores: (lista ?? "").split("|").filter(Boolean),
        modo: modo === "o" ? "obligatorio" : "deseable",
      };
    },
    [estado],
  );

  const escribir = useCallback(
    (clave: ClaveCriterio, next: CriterioURL) =>
      setEstado({
        [clave]: next.valores.length
          ? `${next.modo === "obligatorio" ? "o" : "d"}:${next.valores.join("|")}`
          : null,
      } as never),
    [setEstado],
  );

  const alternarValor = useCallback(
    (clave: ClaveCriterio, valor: string) => {
      const actual = leer(clave);
      const valores = actual.valores.includes(valor)
        ? actual.valores.filter((v) => v !== valor)
        : [...actual.valores, valor];
      return escribir(clave, { ...actual, valores });
    },
    [leer, escribir],
  );

  return { estado, setEstado, leer, escribir, alternarValor, CLAVES };
}
