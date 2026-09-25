"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Criterio, ResultadoPerfil } from "@/lib/types";

/**
 * TablaResultados — una columna por criterio activo, con ✓ o –.
 * Selección múltiple para sumar varios perfiles al equipo de una vez.
 * El desplazamiento vive DENTRO del contenedor: la página nunca se arrastra.
 */

export interface TablaResultadosProps {
  resultados: ResultadoPerfil[];
  criteriosActivos: Criterio[];
  equipo: string[];
  onSumar: (id: string) => void;
  onAbrirFicha: (id: string) => void;
  className?: string;
}

export function TablaResultados({
  resultados,
  criteriosActivos,
  equipo,
  onSumar,
  onAbrirFicha,
  className,
}: TablaResultadosProps) {
  return (
    <div
      className={cn(
        "max-h-[calc(100vh-220px)] overflow-auto rounded-lg border border-hairline bg-card shadow-2",
        className,
      )}
    >
      <Table className="min-w-[820px] text-small">
        <TableCaption className="sr-only">
          Perfiles que cumplen los criterios obligatorios, con una columna por
          criterio activo
        </TableCaption>
        <TableHeader className="sticky top-0 z-[2] bg-subtle">
          <TableRow>
            <TableHead scope="col">Sumar</TableHead>
            <TableHead scope="col">Capacidad</TableHead>
            {criteriosActivos.map((c) => (
              <TableHead key={c.clave} scope="col" className="whitespace-nowrap">
                {c.etiqueta}{" "}
                <span className="font-normal normal-case text-text-m">
                  ({c.modo === "obligatorio" ? "oblig." : "des."})
                </span>
              </TableHead>
            ))}
            <TableHead scope="col">Disponibilidad</TableHead>
            <TableHead scope="col">Ficha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultados.map((r) => {
            const enEquipo = equipo.includes(r.perfil.id);
            return (
              <TableRow
                key={r.perfil.id}
                aria-selected={enEquipo}
                className={cn(enEquipo && "bg-accent/40")}
              >
                <TableCell>
                  <Checkbox
                    checked={enEquipo}
                    onCheckedChange={() => onSumar(r.perfil.id)}
                    aria-label={`${enEquipo ? "Quitar del" : "Sumar al"} equipo a ${r.perfil.nombre} ${r.perfil.apellido}`}
                  />
                </TableCell>
                <TableCell scope="row" asChild>
                  <th className="text-left font-normal">
                    <span className="block font-heading text-small font-semibold text-text-h">
                      {r.perfil.capacidad}
                    </span>
                    <span className="mt-0.5 block text-caption text-text-b">
                      {r.perfil.nombre} {r.perfil.apellido}
                    </span>
                    <span className="mt-[3px] block text-[11px] tabular-nums text-text-m">
                      {r.perfil.id}
                    </span>
                  </th>
                </TableCell>
                {criteriosActivos.map((c) => {
                  const e = r.evidencias.find((x) => x.clave === c.clave);
                  return (
                    <TableCell key={c.clave} className="align-top">
                      <span
                        className={cn(
                          "inline-flex items-start gap-1.5 leading-[1.4]",
                          e?.cumple ? "text-ok-ink" : "text-text-m",
                        )}
                      >
                        <span aria-hidden>{e?.cumple ? "✓" : "–"}</span>
                        <span>{e?.texto}</span>
                      </span>
                    </TableCell>
                  );
                })}
                <TableCell className="whitespace-nowrap text-text-b">
                  {r.perfil.disponibilidad}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAbrirFicha(r.perfil.id)}
                  >
                    Ver ficha
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
