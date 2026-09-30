"use client";
// Select de filtro que envía su formulario GET al cambiar (sin botón «Aplicar»).
import type { ReactNode } from "react";

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
