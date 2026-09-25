"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ClaveCriterio, Criterio, ModoCriterio, Perfil } from "@/lib/types";

/**
 * PanelPerfilObjetivo — el componente más complejo del portal.
 *
 * No es un formulario: cada campo calcula sus opciones contra lo ya
 * seleccionado y muestra el conteo real de perfiles al lado de cada opción.
 * Por omisión solo el rol es obligatorio; el resto ordena.
 */

export interface OpcionCampo {
  valor: string;
  /** Conteo real contra los demás criterios obligatorios. */
  conteo: number;
  activa: boolean;
  /** Añadida por el cliente: no existe en el banco. */
  fueraDelBanco?: boolean;
}

export interface PanelPerfilObjetivoProps {
  criterios: Criterio[];
  /** Conteo con la combinación actual. */
  totalPerfiles: number;
  /**
   * false cuando no hay criterios y el ámbito es todo el banco: por
   * posicionamiento nunca se numera el banco completo, solo el resultado
   * de una búsqueda o de un filtro.
   */
  mostrarConteo?: boolean;
  opcionesPorCampo: Record<ClaveCriterio, OpcionCampo[]>;
  apertura: string;
  onToggleValor: (clave: ClaveCriterio, valor: string) => void;
  onCambiarModo: (clave: ClaveCriterio, modo: ModoCriterio) => void;
  onAgregarFueraDelBanco: (clave: ClaveCriterio, valor: string) => void;
  onCambiarBastaAlguna: (v: boolean) => void;
  onCambiarApertura: (v: string) => void;
  className?: string;
}

export function PanelPerfilObjetivo({
  criterios,
  totalPerfiles,
  opcionesPorCampo,
  apertura,
  mostrarConteo = true,
  onToggleValor,
  onCambiarModo,
  onAgregarFueraDelBanco,
  onCambiarBastaAlguna,
  onCambiarApertura,
  className,
}: PanelPerfilObjetivoProps) {
  const modalidad = criterios.find((c) => c.clave === "modalidad");
  const pais = criterios.find((c) => c.clave === "pais");
  const ciudad = criterios.find((c) => c.clave === "ciudad");
  const exigeUbicacion =
    !!modalidad?.valores.some((v) => v !== "Remoto") &&
    (!pais?.valores.length || !ciudad?.valores.length);

  return (
    <aside
      aria-labelledby="ppo-titulo"
      className={cn(
        "sticky top-[88px] max-h-[calc(100vh-112px)] overflow-auto rounded-lg border border-hairline bg-card shadow-2",
        className,
      )}
    >
      <header className="border-b border-hairline px-5 pb-3 pt-5">
        <h2 id="ppo-titulo" className="font-heading text-[16px] font-semibold text-text-h">
          Perfil objetivo
        </h2>
        <p className="mt-1.5 text-caption leading-[1.5] text-text-m">
          Obligatorio reduce el conjunto. Deseable lo ordena y se cuenta en la
          evidencia de cada tarjeta.
        </p>
        <p
          aria-live="polite"
          className="mt-3.5 flex items-baseline gap-2 rounded-md bg-accent px-3 py-2"
        >
          {mostrarConteo ? (
            <span className="font-heading text-h2 font-bold tabular-nums text-navy">{totalPerfiles}</span>
          ) : null}
          <span className="text-caption text-navy">
            {!mostrarConteo
              ? "Añade un criterio y te decimos cuántos perfiles encajan"
              : totalPerfiles === 1
                ? "perfil cumple los criterios obligatorios"
                : "perfiles cumplen los criterios obligatorios"}
          </span>
        </p>
      </header>

      <div>
        {criterios.map((c) => (
          <CampoCriterio
            key={c.clave}
            criterio={c}
            opciones={opcionesPorCampo[c.clave] ?? []}
            onToggleValor={onToggleValor}
            onCambiarModo={onCambiarModo}
            onAgregarFueraDelBanco={onAgregarFueraDelBanco}
            onCambiarBastaAlguna={onCambiarBastaAlguna}
          />
        ))}
      </div>

      {exigeUbicacion ? (
        <p
          role="status"
          className="mx-5 my-3 rounded-md bg-amber-bg px-3 py-3 text-caption leading-[1.5] text-warn-ink"
        >
          Con modalidad presencial o híbrida, país y ciudad de la necesidad son
          obligatorios. Falta indicarlos.
        </p>
      ) : null}

      <div className="px-5 pb-5 pt-4">
        <Label
          htmlFor="ppo-apertura"
          className="font-heading text-caption font-semibold text-text-h"
        >
          ¿Qué tiene que quedar funcionando cuando el proyecto termine?
        </Label>
        <Textarea
          id="ppo-apertura"
          rows={3}
          value={apertura}
          onChange={(e) => onCambiarApertura(e.target.value)}
          placeholder="Ej.: el equipo interno operando el motor de pagos sin acompañamiento"
          className="mt-1.5 resize-y text-small leading-[1.55]"
        />
        <p className="mt-[7px] text-[11.5px] leading-[1.5] text-text-m">
          No filtra perfiles. Viaja con la solicitud y orienta la conversación.
        </p>
      </div>
    </aside>
  );
}

function CampoCriterio({
  criterio,
  opciones,
  onToggleValor,
  onCambiarModo,
  onAgregarFueraDelBanco,
  onCambiarBastaAlguna,
}: {
  criterio: Criterio;
  opciones: OpcionCampo[];
  onToggleValor: PanelPerfilObjetivoProps["onToggleValor"];
  onCambiarModo: PanelPerfilObjetivoProps["onCambiarModo"];
  onAgregarFueraDelBanco: PanelPerfilObjetivoProps["onAgregarFueraDelBanco"];
  onCambiarBastaAlguna: PanelPerfilObjetivoProps["onCambiarBastaAlguna"];
}) {
  const [borrador, setBorrador] = useState("");
  const esTecnologias = criterio.clave === "tecnologias";

  return (
    <fieldset className="border-b border-hairline px-5 py-3">
      <div className="flex items-center justify-between gap-2.5">
        <legend className="font-heading text-caption font-semibold text-text-h">
          {criterio.etiqueta}
        </legend>
        <ToggleGroup
          type="single"
          value={criterio.modo}
          onValueChange={(v) => v && onCambiarModo(criterio.clave, v as ModoCriterio)}
          aria-label={`Peso del criterio ${criterio.etiqueta}`}
          className="overflow-hidden rounded-md border border-hairline-strong"
        >
          <ToggleGroupItem
            value="obligatorio"
            className="px-2.5 py-1 font-heading text-[10.5px] font-semibold data-[state=on]:bg-navy data-[state=on]:text-white"
          >
            Obligatorio
          </ToggleGroupItem>
          <ToggleGroupItem
            value="deseable"
            className="px-2.5 py-1 font-heading text-[10.5px] font-semibold data-[state=on]:bg-navy data-[state=on]:text-white"
          >
            Deseable
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="mt-2.5 w-full justify-between rounded-md border-hairline-strong px-[11px] py-2 text-left font-body text-small font-normal text-text-b hover:border-primary"
          >
            <span className="truncate">
              {criterio.valores.length
                ? `${criterio.valores.length} seleccionado${criterio.valores.length === 1 ? "" : "s"}: ${criterio.valores.join(", ")}`
                : "Sin restricción"}
            </span>
            <ChevronDown aria-hidden className="size-3.5" strokeWidth={1.8} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder={`Buscar en ${criterio.etiqueta.toLowerCase()}…`} />
            <CommandList>
              <CommandEmpty className="p-3 text-caption text-text-m">
                Nada coincide. Puedes añadirlo como opción fuera del banco.
              </CommandEmpty>
              <CommandGroup>
                {opciones.map((o) => (
                  <CommandItem
                    key={o.valor}
                    value={o.valor}
                    onSelect={() => onToggleValor(criterio.clave, o.valor)}
                    aria-selected={o.activa}
                    className="flex items-center justify-between gap-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Checkbox checked={o.activa} tabIndex={-1} aria-hidden />
                      <span className="truncate">{o.valor}</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[11px] tabular-nums",
                        o.fueraDelBanco
                          ? "text-warn-ink-strong"
                          : o.conteo === 0
                            ? "text-danger"
                            : "text-text-m",
                      )}
                    >
                      {o.fueraDelBanco ? "no está en el banco" : `${o.conteo} perfiles`}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="flex gap-1.5 border-t border-hairline p-2">
            <input
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              aria-label={`Añadir una opción de ${criterio.etiqueta} que no está en el banco`}
              placeholder="Añadir una opción que no está en el banco"
              className="min-w-0 flex-1 rounded-md border border-dashed border-hairline-strong px-2.5 py-[7px] text-caption"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (!borrador.trim()) return;
                onAgregarFueraDelBanco(criterio.clave, borrador.trim());
                setBorrador("");
              }}
            >
              Añadir
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {esTecnologias ? (
        <Label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-caption text-text-b">
          <Checkbox
            checked={criterio.bastaAlguna ?? true}
            onCheckedChange={(v) => onCambiarBastaAlguna(v === true)}
          />
          Basta con que tenga alguna de las tecnologías marcadas
        </Label>
      ) : null}
    </fieldset>
  );
}
