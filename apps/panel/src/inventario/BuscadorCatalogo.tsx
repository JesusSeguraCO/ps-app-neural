"use client";
// Buscador del catálogo en el editor de perfiles (HU-089 «seleccionar en vez de escribir», HU-125 edge).
// Lo tecleado solo sirve para encontrar: el campo ofrece las coincidencias del catálogo (GET
// /api/v1/catalogos/{tipo}?q=) y nunca guarda texto libre. Crear un valor nuevo es una acción aparte,
// al final de la lista, que abre la hoja de alta con los parecidos a la vista antes de dejar crear.
import { useEffect, useId, useRef, useState } from "react";
import { accionEnter, coincidenciaExacta, indiceInicial } from "./buscador-enter";
import { pedir } from "../acceso/cliente";

export interface ValorElegible {
  id: string;
  nombre: string;
}

export function BuscadorCatalogo(p: {
  id: string;
  tipo: "rol" | "tecnologia" | "sector";
  placeholder: string;
  // Valor elegido (rol) que se muestra en el campo mientras no se escribe.
  elegido?: string | null;
  excluir?: string[];
  deshabilitado?: boolean;
  invalido?: boolean;
  describedBy?: string;
  meta?: (v: ValorElegible) => string | null;
  alElegir: (v: ValorElegible) => void;
  alCrear?: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  // Sugerencias del catálogo (incluidas las ya elegidas) y la consulta a la que corresponden.
  const [todas, setTodas] = useState<ValorElegible[]>([]);
  const [cargadas, setCargadas] = useState<string | null>(null);
  const [activa, setActiva] = useState(0);
  const lista = useId();
  const pedido = useRef(0);
  // Enter pulsado antes de que lleguen las sugerencias de lo escrito: se resuelve al llegar.
  const enterPendiente = useRef<string | null>(null);
  const excluir = p.excluir ?? [];
  const opciones = todas.filter((v) => !excluir.includes(v.id));

  useEffect(() => {
    const q = texto.trim();
    if (!q) {
      setTodas([]);
      setCargadas(null);
      return;
    }
    const n = ++pedido.current;
    const t = setTimeout(async () => {
      const r = await pedir(`/api/v1/catalogos/${p.tipo}?q=${encodeURIComponent(q)}`, {
        credentials: "same-origin",
      }).catch(() => null);
      if (!r?.ok || n !== pedido.current) return;
      const { valores } = (await r.json()) as { valores: ValorElegible[] };
      setTodas(valores);
      setCargadas(q);
      setActiva(
        indiceInicial(
          q,
          valores.filter((v) => !p.excluir?.includes(v.id)),
        ),
      );
      // Enter ya pulsado: solo la coincidencia exacta se elige sola; si no la hay, se muestra la lista.
      if (enterPendiente.current === q) {
        enterPendiente.current = null;
        const exacta = coincidenciaExacta(q, valores);
        if (exacta && !p.excluir?.includes(exacta.id)) {
          p.alElegir(exacta);
          setTexto("");
          setAbierto(false);
        }
      }
    }, 120);
    return () => clearTimeout(t);
    // `excluir` cambia de identidad en cada render del padre: basta con el texto.
  }, [texto, p.tipo]);

  const q = texto.trim();
  // Crear solo con las sugerencias de lo escrito a la vista y sin un valor que ya se llame así.
  const conCrear = Boolean(p.alCrear && q && cargadas === q && !coincidenciaExacta(q, todas));
  const total = opciones.length + (conCrear ? 1 : 0);
  const elegir = (i: number) => {
    if (i < opciones.length) {
      p.alElegir(opciones[i]!);
      setTexto("");
      setAbierto(false);
    } else if (conCrear) {
      p.alCrear!(q);
      setTexto("");
      setAbierto(false);
    }
  };

  return (
    <div className="pe-buscar">
      <input
        className="pp-input"
        id={p.id}
        type="text"
        role="combobox"
        aria-expanded={abierto && q.length > 0}
        aria-controls={lista}
        aria-autocomplete="list"
        aria-activedescendant={abierto && total ? `${lista}-${activa}` : undefined}
        aria-invalid={p.invalido || undefined}
        aria-describedby={p.describedBy}
        placeholder={p.elegido ?? p.placeholder}
        value={texto}
        autoComplete="off"
        disabled={p.deshabilitado}
        onChange={(e) => {
          setTexto(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiva((a) => (total ? (a + 1) % total : 0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiva((a) => (total ? (a - 1 + total) % total : 0));
          } else if (e.key === "Enter") {
            // Enter nunca guarda lo escrito ni ofrece crear lo que ya existe: elige la coincidencia
            // exacta o la opción activa; sin sugerencias de lo escrito todavía, espera a que lleguen.
            e.preventDefault();
            const a = accionEnter({
              q,
              cargadas,
              todas,
              excluir,
              activa,
              puedeCrear: Boolean(p.alCrear),
            });
            enterPendiente.current = a.tipo === "esperar" ? q : null;
            if (a.tipo === "elegir") elegir(opciones.indexOf(a.valor));
            else if (a.tipo === "crear") elegir(opciones.length);
          } else if (e.key === "Escape") {
            setAbierto(false);
          }
        }}
      />
      {abierto && q.length > 0 && (
        <ul className="pe-opciones" id={lista} role="listbox" aria-label="Valores del catálogo">
          {opciones.map((v, i) => (
            <li
              key={v.id}
              id={`${lista}-${i}`}
              role="option"
              aria-selected={i === activa}
              className="pe-opcion"
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(i);
              }}
            >
              <span>{v.nombre}</span>
              {p.meta?.(v) && <span className="pe-opcion__meta">{p.meta(v)}</span>}
            </li>
          ))}
          {opciones.length === 0 && (
            <li className="pe-opcion pe-opcion--vacia" role="presentation">
              {cargadas === q ? "Ningún valor del catálogo coincide." : "Buscando en el catálogo…"}
            </li>
          )}
          {conCrear && (
            <li
              id={`${lista}-${opciones.length}`}
              role="option"
              aria-selected={activa === opciones.length}
              className="pe-opcion pe-opcion--crear"
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(opciones.length);
              }}
            >
              {`Crear «${q}» en el catálogo`}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
