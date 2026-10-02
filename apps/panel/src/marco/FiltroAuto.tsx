"use client";
// Controles de las barras de filtro del panel.
// Select de filtro que envía su formulario GET al cambiar (sin botón «Aplicar»).
import { useEffect, type ReactNode } from "react";

export function SelectAuto(p: { id: string; name: string; valor: string; etiqueta: string; className?: string; children: ReactNode }) {
  return (
    <div className={`pp-select ${p.className ?? ""}`}>
      <label className="pp-sr" htmlFor={p.id}>
        {p.etiqueta}
      </label>
      <select
        className="pp-input"
        id={p.id}
        name={p.name}
        defaultValue={p.valor}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {p.children}
      </select>
    </div>
  );
}

// Atajo «/» del buscador (prototipo: pp-kbd en el campo): lleva el foco al buscador de la página.
export function AtajoBuscador({ id }: { id: string }) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      document.getElementById(id)?.focus();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [id]);
  return (
    <span className="pp-kbd pp-buscador__atajo" aria-hidden="true">
      /
    </span>
  );
}
