import {
  Briefcase, Building2, ChartNoAxesColumnIncreasing, Clock, CodeXml, Globe, GraduationCap, IdCard,
  Languages, Laptop, Layers, Link, MapPin, MessagesSquare, Search, ShieldCheck, Target, Upload,
  UserPlus, Users, CalendarClock, type LucideIcon,
} from "lucide-react";
import type { ClaveCriterio } from "@/lib/types";

/**
 * Iconografía del portal — Lucide (licencia ISC, libre), la misma familia que
 * define el sistema Trycore. Solo línea, trazo 1.6, color heredado.
 *
 * Tamaños: 12px dentro de badges · 14px en metadatos · 15–16px en rótulos,
 * navegación y encabezados de bloque. Nunca como decoración suelta: cada
 * icono acompaña un texto que ya dice lo mismo (aria-hidden).
 *
 *   <Icono icono={ICONO_CRITERIO.sector} className="size-3.5" />
 */

export const TRAZO = 1.6;

export const ICONO_CRITERIO: Record<ClaveCriterio, LucideIcon> = {
  rol: Briefcase, seniority: ChartNoAxesColumnIncreasing, tecnologias: CodeXml, sector: Building2,
  modalidad: Laptop, pais: Globe, ciudad: MapPin, idioma: Languages,
};

export const ICONO_VERIFICADO = { identidad: IdCard, seguridad: ShieldCheck, formacion: GraduationCap, referencias: MessagesSquare } as const;
export const ICONO_DECLARADO = { trayectoria: Briefcase, formacion: GraduationCap, stack: CodeXml, aporte: Target } as const;
export const ICONO_META = { sector: Building2, remoto: Globe, presencial: Laptop, ubicacion: MapPin, disponibilidad: Clock } as const;
export const ICONO_NAV = { curado: Layers, buscar: Search, equipo: Users, inventario: Users, importar: Upload, crear: UserPlus, enlaces: Link, vigencia: CalendarClock } as const;

export function Icono({ icono: I, className }: { icono: LucideIcon; className?: string }) {
  return <I aria-hidden strokeWidth={TRAZO} className={className ?? "size-4 shrink-0"} />;
}
