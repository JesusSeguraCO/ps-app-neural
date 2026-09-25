import { cn } from "@/lib/utils";

/**
 * OrbeBusqueda — la "masa" de la búsqueda asistida.
 *
 * Cinco discos translúcidos (azul de marca #5C82F2, teal, navy) con el centro
 * transparente y el color concentrado en el borde, cada uno descentrado unos
 * px y girando a su propio ritmo alrededor del eje: al superponerse forman una
 * masa que respira, con un núcleo luminoso. En claro se mezclan con
 * `multiply`; en oscuro con `screen` (variables --pp-orb-* del tema).
 *
 * Vive SIEMPRE sobre el titular de la búsqueda. En reposo gira muy lento
 * (22–40 s por vuelta); con `activo` acelera (3–6 s), crece un 14% y el halo
 * se enciende. motion-reduce la deja quieta.
 */

export interface OrbeBusquedaProps {
  activo?: boolean;
  tamano?: number;
  className?: string;
}

const CAPAS = [
  { d: 0.9, dx: 14, dy: -8, reposo: 26, rapido: 3.4, rev: false, c: "var(--pp-orb-a)" },
  { d: 0.84, dx: -13, dy: 9, reposo: 31, rapido: 4.2, rev: true, c: "var(--pp-orb-b)" },
  { d: 0.88, dx: 9, dy: 14, reposo: 22, rapido: 3.0, rev: false, c: "var(--pp-orb-a)" },
  { d: 0.78, dx: -10, dy: -13, reposo: 35, rapido: 4.8, rev: true, c: "var(--pp-orb-c)" },
  { d: 0.94, dx: 4, dy: 4, reposo: 40, rapido: 5.6, rev: false, c: "var(--pp-orb-a)" },
] as const;

export function OrbeBusqueda({ activo = false, tamano = 150, className }: OrbeBusquedaProps) {
  const S = tamano;
  return (
    <div
      aria-hidden
      className={cn("relative flex-none transition-transform duration-500 ease-tc", activo && "scale-[1.14]", className)}
      style={{ width: S, height: S }}
    >
      <div
        className={cn("absolute -inset-9 rounded-pill transition-opacity duration-500", activo ? "opacity-100" : "opacity-55")}
        style={{ background: "radial-gradient(circle, var(--pp-orb-halo) 0%, transparent 66%)" }}
      />
      {CAPAS.map((c, i) => (
        <div
          key={i}
          className="absolute inset-0 motion-reduce:animate-none"
          style={{ animation: `orbita ${activo ? c.rapido : c.reposo}s linear infinite ${c.rev ? "reverse" : "normal"}` }}
        >
          <div
            className="absolute left-1/2 top-1/2 rounded-pill"
            style={{
              width: S * c.d,
              height: S * c.d,
              marginLeft: -(S * c.d) / 2 + c.dx,
              marginTop: -(S * c.d) / 2 + c.dy,
              background: `radial-gradient(circle, transparent 30%, ${c.c} 97%, transparent 100%)`,
              mixBlendMode: "var(--pp-orb-blend)" as React.CSSProperties["mixBlendMode"],
            }}
          />
        </div>
      ))}
      <div
        className="absolute rounded-pill"
        style={{ inset: S * 0.2, background: "radial-gradient(circle, var(--pp-orb-core) 0%, var(--pp-orb-core) 30%, transparent 72%)" }}
      />
    </div>
  );
}
