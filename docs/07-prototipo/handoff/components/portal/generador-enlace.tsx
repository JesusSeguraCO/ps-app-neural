"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Perfil } from "@/lib/types";

/**
 * GeneradorEnlace — panel de Talento Humano.
 *
 * Cada cliente entra por un enlace propio que lleva su conjunto curado, la
 * razón declarada de esa selección y una vigencia. El enlace NO abre el portal
 * por sí solo: lleva a la puerta, que pide correo y código de un solo uso.
 *
 * Dos reglas del producto viven aquí:
 *   · sin razón declarada no se emite — el aterrizaje la muestra íntegra;
 *   · la vigencia del enlace nunca supera el consentimiento más corto del
 *     conjunto, y por eso los perfiles cuyo consentimiento caduca antes se
 *     marcan al seleccionarlos.
 */

export interface EnlaceEmitido {
  token: string;
  cuenta: string;
  proyecto: string;
  perfiles: number;
  vence: string;
  estado: "activo" | "vencido" | "revocado";
  usos: string;
}

export interface BorradorEnlace {
  cuenta: string;
  proyecto: string;
  razon: string;
  correos: string;
  dias: "15" | "30" | "60" | "90";
  perfiles: string[];
}

export interface GeneradorEnlaceProps {
  borrador: BorradorEnlace;
  onCambiar: (parcial: Partial<BorradorEnlace>) => void;
  publicados: Perfil[];
  /** Debe devolver el token emitido por el backend. */
  onEmitir: () => Promise<string>;
  baseUrl?: string;
  className?: string;
}

export function GeneradorEnlace({
  borrador,
  onCambiar,
  publicados,
  onEmitir,
  baseUrl = "https://perfiles.trycore.com/p/",
  className,
}: GeneradorEnlaceProps) {
  const [token, setToken] = useState("px-nuevo");
  const [aviso, setAviso] = useState("");
  const emitible = borrador.razon.trim().length > 0 && borrador.perfiles.length > 0;
  const url = `${baseUrl}${token}#pantalla=aterrizaje&ambito=curado`;

  function alternarPerfil(id: string) {
    onCambiar({
      perfiles: borrador.perfiles.includes(id)
        ? borrador.perfiles.filter((x) => x !== id)
        : [...borrador.perfiles, id],
    });
  }

  return (
    <section className={cn("grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]", className)}>
      <div className="rounded-lg border border-hairline bg-card p-5 shadow-1">
        <h2 className="mb-4 font-heading text-h3 font-semibold text-text-h">
          Emitir un enlace nuevo
        </h2>

        <div className="grid grid-cols-2 gap-3.5">
          <Campo id="en-cuenta" etiqueta="Cuenta">
            <Input
              id="en-cuenta"
              value={borrador.cuenta}
              onChange={(e) => onCambiar({ cuenta: e.target.value })}
            />
          </Campo>
          <Campo id="en-proyecto" etiqueta="Proyecto">
            <Input
              id="en-proyecto"
              value={borrador.proyecto}
              onChange={(e) => onCambiar({ proyecto: e.target.value })}
            />
          </Campo>
        </div>

        <Campo
          id="en-razon"
          etiqueta="Razón declarada de la selección"
          ayuda="Se muestra íntegra en el aterrizaje. Si está vacía, el enlace no se emite."
          className="mt-3.5"
        >
          <Textarea
            id="en-razon"
            rows={3}
            value={borrador.razon}
            onChange={(e) => onCambiar({ razon: e.target.value })}
            placeholder="Por qué estos perfiles y no otros, referido al proyecto del cliente"
          />
        </Campo>

        <div className="mt-3.5 grid grid-cols-2 gap-3.5">
          <Campo
            id="en-correos"
            etiqueta="Correos autorizados"
            ayuda="Solo estos reciben el código de un solo uso."
          >
            <Input
              id="en-correos"
              value={borrador.correos}
              onChange={(e) => onCambiar({ correos: e.target.value })}
              placeholder="separados por coma"
            />
          </Campo>
          <Campo id="en-dias" etiqueta="Vigencia">
            <Select
              value={borrador.dias}
              onValueChange={(v) => onCambiar({ dias: v as BorradorEnlace["dias"] })}
            >
              <SelectTrigger id="en-dias">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="60">60 días</SelectItem>
                <SelectItem value="90">90 días · tope del consentimiento</SelectItem>
              </SelectContent>
            </Select>
          </Campo>
        </div>

        <fieldset className="mt-5 border-0 p-0">
          <legend className="font-heading text-caption font-semibold text-text-h">
            Perfiles del conjunto curado{" "}
            <span className="font-normal text-text-m">
              · {borrador.perfiles.length} de {publicados.length} publicados
            </span>
          </legend>
          <ul className="mt-2.5 max-h-60 overflow-auto rounded-md border border-hairline">
            {publicados.map((p) => {
              const activo = borrador.perfiles.includes(p.id);
              const caducaAntes = p.vigenciaDias < Number(borrador.dias);
              return (
                <li key={p.id}>
                  <Label
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 border-b border-hairline px-3 py-2.5 font-normal",
                      activo ? "bg-primary-surface" : "bg-card",
                    )}
                  >
                    <Checkbox checked={activo} onCheckedChange={() => alternarPerfil(p.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-small font-semibold text-text-h">
                        {p.capacidad}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-text-b">
                        {p.nombre} {p.apellido} · {p.id}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[11.5px]",
                        caducaAntes ? "text-warn-ink" : "text-text-m",
                      )}
                    >
                      {p.vigenciaDias} días
                      {caducaAntes ? " · caduca antes que el enlace" : ""}
                    </span>
                  </Label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <Button
          disabled={!emitible}
          onClick={async () => {
            const t = await onEmitir();
            setToken(t);
            setAviso(`Enlace ${t} emitido para ${borrador.cuenta}. Ya puedes copiarlo al correo de invitación.`);
          }}
          className="mt-5 bg-primary-strong text-white hover:bg-primary-strong-hover"
        >
          Emitir enlace
        </Button>
      </div>

      <aside className="rounded-lg border border-hairline bg-card p-5 shadow-1">
        <h2 className="font-heading text-body font-semibold text-text-h">
          Vista previa del enlace
        </h2>
        <p className="mt-3 break-all rounded-md bg-subtle px-3 py-3 font-mono text-[12px] leading-[1.55] text-text-b">
          {url}
        </p>
        <Button
          onClick={() => void navigator.clipboard.writeText(url)}
          className="mt-3 w-full bg-primary-strong text-white hover:bg-primary-strong-hover"
        >
          Copiar enlace
        </Button>
        <p aria-live="polite" className="min-h-5 pt-3 text-caption text-primary-strong">
          {aviso}
        </p>
      </aside>
    </section>
  );
}

function Campo({
  id,
  etiqueta,
  ayuda,
  children,
  className,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="font-heading text-caption font-semibold text-text-h">
        {etiqueta}
      </Label>
      <div className="mt-1.5">{children}</div>
      {ayuda ? <p className="mt-1.5 text-[11.5px] text-text-m">{ayuda}</p> : null}
    </div>
  );
}
