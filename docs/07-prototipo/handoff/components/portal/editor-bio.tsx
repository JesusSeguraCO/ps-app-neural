"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EvidenciaDeclarada, Perfil } from "@/lib/types";

/**
 * EditorBio — edita lo DECLARADO por el profesional: tecnologías, sectores,
 * trayectoria (lista editable), formación, stack y «qué le interesa aportar».
 *
 * Lo VERIFICADO por Trycore no se edita aquí: se muestra en solo lectura en la
 * pantalla de edición y se corrige por el proceso de verificación.
 *
 * Junto al formulario, una vista previa en vivo de cómo lo verá el cliente
 * en la ficha. Al guardar, un perfil publicado actualiza su ficha al instante.
 */

type Experiencia = EvidenciaDeclarada["trayectoria"][number];

export interface BioEditable {
  tecnologias: string[];
  sector: string[];
  declarado: EvidenciaDeclarada;
}

export interface EditorBioProps {
  perfil: Pick<Perfil, "capacidad" | "nombre" | "apellido"> & BioEditable;
  ultimaActualizacion?: string;
  onChange: (bio: BioEditable) => void;
}

const vacia: Experiencia = { rol: "", empresa: "", periodo: "", resumen: "" };
const MAX_APORTE = 280;

export function EditorBio({ perfil, ultimaActualizacion, onChange }: EditorBioProps) {
  const [tec, setTec] = useState(perfil.tecnologias.join(", "));
  const [sec, setSec] = useState(perfil.sector.join(", "));
  const [exps, setExps] = useState<Experiencia[]>(perfil.declarado.trayectoria.length ? perfil.declarado.trayectoria : [vacia]);
  const [formacion, setFormacion] = useState(perfil.declarado.formacion.join("\n"));
  const [stack, setStack] = useState(perfil.declarado.stack);
  const [aporte, setAporte] = useState(perfil.declarado.aporte);

  const lista = (t: string) => t.split(",").map((x) => x.trim()).filter(Boolean);
  function emitir(parcial: Partial<{ tec: string; sec: string; exps: Experiencia[]; formacion: string; stack: string; aporte: string }>) {
    const v = { tec, sec, exps, formacion, stack, aporte, ...parcial };
    onChange({
      tecnologias: lista(v.tec),
      sector: lista(v.sec),
      declarado: {
        trayectoria: v.exps.filter((x) => x.rol.trim() || x.empresa.trim()),
        formacion: v.formacion.split("\n").map((x) => x.trim()).filter(Boolean),
        stack: v.stack.trim(),
        aporte: v.aporte.trim(),
      },
    });
  }
  const setExp = (i: number, campo: keyof Experiencia, valor: string) => {
    const l = exps.map((x, j) => (j === i ? { ...x, [campo]: valor } : x));
    setExps(l); emitir({ exps: l });
  };

  const trayectoriaPrev = exps
    .filter((x) => x.rol || x.empresa)
    .map((x) => `${[x.rol, x.empresa].filter(Boolean).join(" · ")}${x.periodo ? ` (${x.periodo})` : ""}${x.resumen ? `: ${x.resumen}` : ""}`)
    .join(" ");

  return (
    <div className="grid items-start gap-5 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-labelledby="ed-bio" className="rounded-lg border border-hairline bg-card px-[22px] py-5 shadow-1">
        <h2 id="ed-bio" className="text-base font-semibold text-text-h">Bio y trayectoria</h2>
        <p className="mt-1 text-[13px] leading-[1.55] text-text-m">
          Lo declara el profesional. En la ficha aparece bajo «Declarado por el profesional», separado de lo que verificamos.
        </p>

        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
          <Campo id="ed-tec" etiqueta="Tecnologías ancla" ayuda="Separadas por coma. La tarjeta muestra las cinco primeras.">
            <Input id="ed-tec" value={tec} onChange={(e) => { setTec(e.target.value); emitir({ tec: e.target.value }); }} />
          </Campo>
          <Campo id="ed-sec" etiqueta="Sectores" ayuda="Separados por coma.">
            <Input id="ed-sec" value={sec} onChange={(e) => { setSec(e.target.value); emitir({ sec: e.target.value }); }} />
          </Campo>
        </div>

        <fieldset className="mt-5 min-w-0">
          <legend className="text-[13.5px] font-semibold text-text-h">Trayectoria</legend>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {exps.map((x, i) => (
              <div key={i} className="rounded-[12px] bg-subtle p-3.5">
                <div className="mb-2.5 flex min-h-7 items-center justify-between gap-2.5">
                  <span className="text-[12.5px] font-semibold text-text-b">Experiencia {i + 1}</span>
                  {exps.length > 1 && (
                    <Button variant="ghost" size="sm" aria-label={`Quitar la experiencia ${i + 1}`} onClick={() => { const l = exps.filter((_, j) => j !== i); setExps(l); emitir({ exps: l }); }}>
                      Quitar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
                  <Campo id={`exp-rol-${i}`} etiqueta="Rol"><Input id={`exp-rol-${i}`} value={x.rol} placeholder="Backend senior" onChange={(e) => setExp(i, "rol", e.target.value)} /></Campo>
                  <Campo id={`exp-emp-${i}`} etiqueta="Empresa"><Input id={`exp-emp-${i}`} value={x.empresa} placeholder="Banco regional" onChange={(e) => setExp(i, "empresa", e.target.value)} /></Campo>
                  <Campo id={`exp-per-${i}`} etiqueta="Periodo"><Input id={`exp-per-${i}`} value={x.periodo} placeholder="2021 — 2026" onChange={(e) => setExp(i, "periodo", e.target.value)} /></Campo>
                </div>
                <Campo id={`exp-res-${i}`} etiqueta="Qué hizo" className="mt-2.5">
                  <Textarea id={`exp-res-${i}`} rows={2} value={x.resumen} onChange={(e) => setExp(i, "resumen", e.target.value)} />
                </Campo>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { const l = [...exps, vacia]; setExps(l); emitir({ exps: l }); }}>+ Añadir experiencia</Button>
            <span className="text-[12px] text-text-m">Si el profesional no autorizó el nombre de la empresa, describe su tipo: «Banco regional».</span>
          </div>
        </fieldset>

        <Campo id="ed-for" etiqueta="Formación" ayuda="Una por línea: título, institución y año." className="mt-[18px]">
          <Textarea id="ed-for" rows={3} value={formacion} onChange={(e) => { setFormacion(e.target.value); emitir({ formacion: e.target.value }); }} />
        </Campo>
        <Campo id="ed-stk" etiqueta="Stack de trabajo" className="mt-3.5">
          <Textarea id="ed-stk" rows={2} value={stack} onChange={(e) => { setStack(e.target.value); emitir({ stack: e.target.value }); }} />
        </Campo>
        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="ed-apo" className="text-[12.5px] font-semibold text-text-h">Qué le interesa aportar</Label>
            <span id="ed-apo-n" className="font-mono text-[11.5px] text-text-m">{aporte.length} / {MAX_APORTE}</span>
          </div>
          <Textarea id="ed-apo" rows={3} maxLength={MAX_APORTE} aria-describedby="ed-apo-n ed-apo-h" value={aporte} className="mt-1.5"
            onChange={(e) => { setAporte(e.target.value); emitir({ aporte: e.target.value }); }} />
          <p id="ed-apo-h" className="mt-1.5 text-[12px] text-text-m">Dos o tres frases. Es lo que más lee el cliente después de la capacidad.</p>
        </div>
      </section>

      <aside aria-labelledby="ed-prev" className="rounded-lg xl:sticky xl:top-6 border border-hairline bg-card p-[18px] shadow-1">
        <h2 id="ed-prev" className="text-[14px] font-semibold text-text-h">Así lo verá el cliente</h2>
        <p className="mt-0.5 text-[12px] text-text-m">Se actualiza mientras escribes.</p>
        <div className="mt-3.5 rounded-[12px] border border-hairline p-3.5">
          <p className="text-[14.5px] font-semibold leading-[1.3] text-text-h">{perfil.capacidad}</p>
          <p className="mt-0.5 text-[12.5px] text-text-b">{perfil.nombre} {perfil.apellido.split(/\s+/)[0]}</p>
          <p className="mt-3.5 text-[12px] font-semibold text-text-m">Declarado por el profesional</p>
          <dl className="mt-2 flex flex-col gap-2">
            {[
              ["Trayectoria", trayectoriaPrev || "Sin experiencias todavía"],
              ["Formación declarada", formacion.split("\n").filter(Boolean).join(" · ") || "—"],
              ["Stack de trabajo", stack || "—"],
              ["Qué le interesa aportar", aporte || "—"],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="text-[12px] font-semibold text-text-h">{t}</dt>
                <dd className="mt-0.5 text-[12.5px] leading-[1.5] text-text-b">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-3 text-[12px] text-text-m">Última actualización de la bio: {ultimaActualizacion ?? "aún sin guardar"}</p>
      </aside>
    </div>
  );
}

function Campo({ id, etiqueta, ayuda, className, children }: { id: string; etiqueta: string; ayuda?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-[12.5px] font-semibold text-text-h">{etiqueta}</Label>
      <div className="mt-1.5">{children}</div>
      {ayuda && <p className="mt-1.5 text-[12px] leading-[1.45] text-text-m">{ayuda}</p>}
    </div>
  );
}
