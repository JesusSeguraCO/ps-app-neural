import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EstadoVacio — ninguno puede quedar sin salida. Cada variante trae su
 * explicación y su acción siguiente; el vacío nunca es un callejón.
 */

const estadoVacioVariants = cva(
  "rounded-lg border border-dashed border-hairline-strong bg-card p-10 text-center",
  {
    variants: {
      tono: {
        neutro: "",
        atencion: "border-warn-border bg-amber-bg/40",
      },
    },
    defaultVariants: { tono: "neutro" },
  },
);

type Caso =
  | "sin-resultados"
  | "equipo-vacio"
  | "acceso-vencido"
  | "sin-conjunto-curado";

const CASOS: Record<
  Caso,
  { titulo: string; cuerpo: string; accion: string; tono: "neutro" | "atencion" }
> = {
  "sin-resultados": {
    titulo: "Ningún perfil cumple los criterios obligatorios",
    cuerpo:
      "Quita un criterio del panel y vuelve a mirar, o pide un perfil a medida: respondemos con candidatos en 10 días hábiles.",
    accion: "Solicitar un perfil a medida",
    tono: "neutro",
  },
  "equipo-vacio": {
    titulo: "Todavía no has sumado perfiles",
    cuerpo:
      "Empieza por el conjunto curado para tu proyecto: son los perfiles escogidos a mano para esta necesidad.",
    accion: "Ver el conjunto curado",
    tono: "neutro",
  },
  "acceso-vencido": {
    titulo: "Tu acceso a este portal venció",
    cuerpo:
      "Los perfiles incluyen nombre y trayectoria de profesionales reales, por eso el acceso tiene fecha. Pide una renovación y vuelves con el mismo equipo armado.",
    accion: "Pedir renovación del acceso",
    tono: "atencion",
  },
  "sin-conjunto-curado": {
    titulo: "Aún no hay un conjunto curado para tu cuenta",
    cuerpo:
      "Estamos armando tu selección. Mientras tanto puedes buscar en todo nuestro banco de talento.",
    accion: "Buscar en el banco completo",
    tono: "neutro",
  },
};

export interface EstadoVacioProps
  extends Omit<VariantProps<typeof estadoVacioVariants>, "tono"> {
  caso: Caso;
  onAccion: () => void;
  /** Sobrescribe el texto por defecto cuando el contexto lo pide. */
  titulo?: string;
  cuerpo?: string;
  className?: string;
}

export function EstadoVacio({
  caso,
  onAccion,
  titulo,
  cuerpo,
  className,
}: EstadoVacioProps) {
  const base = CASOS[caso];
  return (
    <div className={cn(estadoVacioVariants({ tono: base.tono }), className)}>
      <h2 className="font-heading text-[18px] font-semibold text-text-h">
        {titulo ?? base.titulo}
      </h2>
      <p className="mx-auto mb-5 mt-2 max-w-[52ch] text-body text-text-b">
        {cuerpo ?? base.cuerpo}
      </p>
      <Button
        onClick={onAccion}
        className="bg-primary-strong text-white hover:bg-primary-strong-hover"
      >
        {base.accion}
      </Button>
    </div>
  );
}
