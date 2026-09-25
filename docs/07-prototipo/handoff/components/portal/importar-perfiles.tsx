"use client";

import { useRef, useState, type DragEvent } from "react";
import { Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { COLUMNAS_PLANTILLA, leerImportacion, type FilaImport } from "@/lib/importar-csv";
import type { Perfil } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * ImportarPerfiles — panel de Talento Humano.
 *
 * Tres estados en la misma vista: soltar archivo → revisar fila a fila →
 * resultado. La revisión muestra qué se crea, qué se actualiza, qué trae
 * aviso y qué falla, con la razón en texto. Las filas con error no se
 * importan. Todo resultado se anuncia por aria-live.
 *
 * `onImportar` recibe solo las filas válidas; el backend las guarda como
 * borrador (ver aCambios en lib/importar-csv.ts).
 */

export interface ImportarPerfilesProps {
  existentes: Perfil[];
  roles: string[];
  seniorities: string[];
  onImportar: (filas: FilaImport[]) => Promise<{ creados: number; actualizados: number }>;
  onVerInventario: () => void;
}

type Fase = "inicio" | "revision" | "hecho";

const COLUMNAS = [
  ["codigo", "Opcional. Si ya existe, actualiza ese perfil"], ["nombre", "Solo el nombre de pila"],
  ["apellido", "Publicamos solo el primero"], ["rol", "Tal como está en el catálogo"],
  ["seniority", "Junior, Semi senior, Senior o Líder técnico"], ["anos", "Años de experiencia declarados"],
  ["tecnologias", "Separadas por |"], ["sector", "Separados por |"],
  ["modalidad, ciudad, pais", "Cómo y desde dónde trabaja"], ["consentimiento", "Fecha. Vacío: no se puede publicar"],
] as const;

export function ImportarPerfiles({ existentes, roles, seniorities, onImportar, onVerInventario }: ImportarPerfilesProps) {
  const archivo = useRef<HTMLInputElement>(null);
  const [fase, setFase] = useState<Fase>("inicio");
  const [filas, setFilas] = useState<FilaImport[]>([]);
  const [descartadas, setDescartadas] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [aviso, setAviso] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [resultado, setResultado] = useState({ creados: 0, actualizados: 0, omitidos: 0 });

  function leer(f?: File) {
    setArrastrando(false);
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) return setAviso("Solo aceptamos CSV. Si lo tienes en Excel, guárdalo como «CSV UTF-8» y súbelo de nuevo.");
    f.text().then((txt) => {
      const r = leerImportacion(txt, existentes, roles, seniorities);
      if (r.faltan.length) return setAviso(`Al archivo le faltan columnas obligatorias: ${r.faltan.join(", ")}. Descarga la plantilla y vuelve a intentarlo.`);
      if (!r.filas.length) return setAviso("El archivo no tiene filas de perfiles debajo de la cabecera.");
      setFilas(r.filas); setDescartadas(r.descartadas); setNombre(f.name); setFase("revision");
      setAviso(`Archivo leído: ${r.filas.length} filas para revisar.`);
    });
  }

  async function importar() {
    const validas = filas.filter((f) => f.tipo !== "error");
    const r = await onImportar(validas);
    const omitidos = filas.length - validas.length;
    setResultado({ ...r, omitidos });
    setFase("hecho");
    setAviso(`Importación completada: ${r.creados} creados como borrador, ${r.actualizados} actualizados${omitidos ? ` y ${omitidos} omitidos por error` : ""}.`);
  }

  function plantilla() {
    const csv = `\uFEFF${COLUMNAS_PLANTILLA}\n,Nombre,Apellido,Backend,Senior,8,Java|Kafka,Banca,Híbrido,Bogotá,Colombia,23 sep 2026\n`;
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), download: "plantilla-perfiles.csv" });
    a.click();
  }

  const reiniciar = () => { setFase("inicio"); setFilas([]); setDescartadas([]); setAviso(""); };
  const validas = filas.filter((f) => f.tipo !== "error").length;
  const cuenta = {
    crea: filas.filter((f) => f.tipo === "crea").length,
    actualiza: filas.filter((f) => f.tipo === "actualiza").length,
    aviso: filas.filter((f) => f.tipo !== "error" && f.avisos.length).length,
    error: filas.length - validas,
  };

  return (
    <section className="max-w-[1120px]">
      <h1 className="text-[26px] font-bold tracking-[-0.02em] text-text-h">Importar perfiles</h1>
      <p className="mt-2 max-w-[72ch] text-[14px] leading-[1.6] text-text-b">
        Carga varios perfiles a la vez desde un CSV. Todo lo que importas entra como borrador: ningún perfil llega al cliente sin revisión y sin consentimiento registrado.
      </p>
      <p aria-live="polite" className="mt-2.5 min-h-5 text-[13px] text-teal-ink">{aviso}</p>

      {fase === "inicio" && (
        <div className="mt-1.5 grid items-start gap-5 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div
            onDragOver={(e: DragEvent) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e: DragEvent) => { e.preventDefault(); leer(e.dataTransfer.files[0]); }}
            className={cn(
              "flex min-h-[260px] flex-col items-center justify-center gap-1 rounded-lg border-[1.5px] border-dashed p-7 text-center transition-colors",
              arrastrando ? "border-primary bg-accent" : "border-hairline-strong bg-card",
            )}
          >
            <span aria-hidden className="grid size-11 place-items-center rounded-[12px] bg-subtle text-text-m"><Upload className="size-5" strokeWidth={1.8} /></span>
            <p className="mt-2.5 text-[15px] font-semibold text-text-h">Arrastra aquí el archivo CSV</p>
            <p className="text-[13px] text-text-m">Hasta 500 perfiles por archivo, con la cabecera de la plantilla.</p>
            <Button onClick={() => archivo.current?.click()} className="mt-3.5 bg-teal-fill text-white hover:bg-teal-fill-hover">Elegir archivo</Button>
            <input ref={archivo} type="file" accept=".csv,text/csv" hidden onChange={(e) => { leer(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          <aside aria-labelledby="imp-cols" className="rounded-lg border border-hairline bg-card p-[18px] shadow-1">
            <h2 id="imp-cols" className="text-[14px] font-semibold text-text-h">Columnas de la plantilla</h2>
            <dl className="mt-3 flex flex-col gap-2">
              {COLUMNAS.map(([k, d]) => (
                <div key={k} className="flex items-baseline gap-2.5">
                  <dt className="w-[118px] flex-none font-mono text-[12px] text-text-h">{k}</dt>
                  <dd className="text-[12.5px] leading-[1.45] text-text-m">{d}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3.5 border-t border-hairline pt-3 text-[12.5px] leading-[1.5] text-text-b">No incluyas correo, teléfono ni foto. Si vienen en el archivo, descartamos esas columnas.</p>
            <Button variant="outline" size="sm" onClick={plantilla} className="mt-3 w-full">Descargar plantilla CSV</Button>
          </aside>
        </div>
      )}

      {fase === "revision" && (
        <div className="mt-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[8px] bg-subtle px-2 py-1 font-mono text-[12.5px] text-text-h">{nombre}</span>
              {cuenta.crea > 0 && <Chip tono="ok">{cuenta.crea} nuevos</Chip>}
              {cuenta.actualiza > 0 && <Chip tono="neutro">{cuenta.actualiza} actualizan</Chip>}
              {cuenta.aviso > 0 && <Chip tono="aviso">{cuenta.aviso} con aviso</Chip>}
              {cuenta.error > 0 && <Chip tono="error">{cuenta.error} con error</Chip>}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" size="sm" onClick={reiniciar}>Cambiar archivo</Button>
              <Button size="sm" disabled={!validas} onClick={importar} className="bg-teal-fill text-white hover:bg-teal-fill-hover">
                {validas ? `Importar ${validas} ${validas === 1 ? "perfil" : "perfiles"}` : "Nada que importar"}
              </Button>
            </div>
          </div>
          {descartadas.length > 0 && (
            <p className="mt-3 text-[13px] text-text-b">Descartamos {descartadas.map((d) => `«${d}»`).join(", ")}: nunca publicamos datos de contacto.</p>
          )}
          <div className="mt-3.5 max-h-[calc(100vh-320px)] overflow-auto rounded-lg border border-hairline bg-card shadow-2">
            <Table className="min-w-[920px] text-[13px]">
              <TableCaption className="sr-only">Revisión de las filas del archivo antes de importar</TableCaption>
              <TableHeader className="sticky top-0 bg-subtle">
                <TableRow>{["Fila", "Estado", "Código", "Profesional", "Rol", "Tecnologías", "Observación"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {filas.map((f) => {
                  const estado = f.tipo === "error" ? "Error" : f.tipo === "actualiza" ? "Actualiza" : f.avisos.length ? "Con aviso" : "Listo";
                  const tono = f.tipo === "error" ? "error" : f.tipo === "actualiza" ? "neutro" : f.avisos.length ? "aviso" : "ok";
                  return (
                    <TableRow key={f.fila}>
                      <TableCell className="font-mono text-[12px] text-text-m">{f.fila}</TableCell>
                      <TableCell><Chip tono={tono}>{estado}</Chip></TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-[12px]">{f.tipo === "actualiza" ? f.datos.codigo : f.datos.codigo || "Nuevo"}</TableCell>
                      <TableCell className="font-medium text-text-h">{`${f.datos.nombre || "—"} ${f.datos.apellido ?? ""}`.trim()}</TableCell>
                      <TableCell>{f.datos.rol || "—"}{f.datos.seniority ? ` · ${f.datos.seniority}` : ""}</TableCell>
                      <TableCell>{(f.datos.tecnologias ?? "").split("|").filter(Boolean).join(", ") || "—"}</TableCell>
                      <TableCell className={cn("text-[12.5px] leading-[1.45]", f.error ? "text-[var(--tc-danger-ink)]" : "text-text-b")}>
                        {f.error || f.avisos.join(" · ") || (f.tipo === "actualiza" ? "Actualiza los datos del perfil existente" : "Entra como borrador")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2.5 text-[12.5px] text-text-m">Las filas con error no se importan. Corrígelas en el archivo y súbelo de nuevo cuando quieras.</p>
        </div>
      )}

      {fase === "hecho" && (
        <div className="mt-1.5 flex flex-col items-center rounded-lg border border-hairline bg-card px-7 py-10 text-center">
          <span aria-hidden className="grid size-11 place-items-center rounded-[12px] bg-green-bg text-[var(--tc-ok-badge-ink)]"><Check className="size-5" strokeWidth={2} /></span>
          <h2 className="mt-4 text-lg font-semibold text-text-h">Importación completada</h2>
          <p className="mt-1.5 max-w-[58ch] text-pretty text-[14px] leading-[1.6] text-text-m">
            {resultado.creados} creados como borrador y {resultado.actualizados} actualizados{resultado.omitidos ? `; ${resultado.omitidos} filas omitidas por error` : ""}. Revisa cada borrador, registra el consentimiento y publícalo desde su edición.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Button onClick={onVerInventario} className="bg-teal-fill text-white hover:bg-teal-fill-hover">Ver en el inventario</Button>
            <Button variant="outline" onClick={reiniciar}>Importar otro archivo</Button>
          </div>
        </div>
      )}
    </section>
  );
}

function Chip({ tono, children }: { tono: "ok" | "neutro" | "aviso" | "error"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-pill px-[9px] py-[5px] text-[11.5px] font-medium leading-none",
        tono === "ok" && "bg-green-bg text-[var(--tc-ok-badge-ink)]",
        tono === "neutro" && "bg-subtle text-navy-ink-accent",
        tono === "aviso" && "bg-amber-bg text-[var(--tc-warn-ink)]",
        tono === "error" && "bg-red-bg text-[var(--tc-danger-ink)]",
      )}
    >
      {children}
    </span>
  );
}
