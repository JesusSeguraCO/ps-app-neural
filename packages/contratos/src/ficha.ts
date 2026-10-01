// Ficha del perfil (RF-3.2, RF-8.7; HU-129, HU-130; diseño §2): lo que el cliente ve al abrir un
// perfil. Una sola implementación del armado, `armarFicha`, la usan el portal (desde la vista
// `operacion.ficha_publicable` con `ps_portal`) y la vista previa del panel (desde el perfil en
// edición): por eso la vista previa es la ficha del portal y no una copia.
//  - Disponibilidad como banda, nunca fecha (RF-3.13).
//  - El país siempre; la ciudad solo si la necesidad es presencial o híbrida (D-18 revisada).
//  - Validación de Nivel 0 con el enunciado de la modalidad de prueba elegida (RF-8.10, D10): nadie
//    lo redacta. El reporte detallado, cuando exista, enriquece este bloque (HU-130, sub-slice 6).
//  - El cliente nombrado solo si el consentimiento lo incluye (HU-127).
//  - Un bloque opcional sin datos no existe en la ficha (no viaja ni se dibuja).
//  - Nada de la lista negra B.4: el esquema estricto hace fallar cualquier campo de más.
import { z } from "zod";
import { BANDAS, bandaDeDisponibilidad } from "@ps/dominio/catalogo/banda";
import type { CampoObligatorio } from "@ps/dominio/inventario/perfil";

export const NECESIDADES = ["remota", "hibrida", "presencial"] as const;
export type Necesidad = (typeof NECESIDADES)[number];

export const ExperienciaFicha = z.strictObject({
  cargo: z.string().min(1),
  cliente: z.string().min(1).nullable(),
  desde: z.number().int().nullable(),
  hasta: z.number().int().nullable(),
  descripcion: z.string().min(1),
});

export const ValidacionFicha = z.strictObject({
  nivel: z.literal(0),
  enunciado: z.string().min(1),
});

// Contrato del portal: estricto y completo (un publicado tiene todo lo obligatorio).
export const FichaPerfil = z.strictObject({
  codigo: z.string().regex(/^PS-\d{4}$/),
  nombre: z.string().min(1),
  primerApellido: z.string().min(1),
  rol: z.string().min(1),
  seniority: z.string().min(1),
  aniosExperiencia: z.number().int().nonnegative(),
  sectores: z.array(z.string()),
  tecnologias: z.array(z.string()).min(1),
  modalidad: z.string().min(1),
  pais: z.string().min(1),
  ciudad: z.string().min(1).nullable(),
  disponibilidad: z.enum(BANDAS),
  resumen: z.string().min(1).nullable(),
  selloPersonal: z.array(z.string().min(1)).max(3),
  formacion: z.string().min(1).nullable(),
  idiomas: z.array(z.string().min(1)),
  trayectoria: z.array(ExperienciaFicha).min(1),
  validacion: ValidacionFicha,
});
export type FichaPerfil = z.infer<typeof FichaPerfil>;

// Lo que arma la vista previa: la misma forma, pero un borrador puede venir incompleto.
type Incompletos = "nombre" | "primerApellido" | "rol" | "seniority" | "aniosExperiencia" | "modalidad" | "pais";
export type FichaEnEdicion = Omit<FichaPerfil, Incompletos | "validacion"> & {
  [K in Incompletos]: FichaPerfil[K] | null;
} & { validacion: FichaPerfil["validacion"] | null };

export interface DatosFicha {
  codigo: string;
  nombre: string | null;
  primerApellido: string | null;
  rol: string | null;
  seniority: string | null;
  aniosExperiencia: number | null;
  sectores: string[];
  tecnologias: string[];
  // Texto de cara al cliente de la modalidad de trabajo («Híbrido»).
  modalidad: string | null;
  pais: string | null;
  ciudad: string | null;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: Date | null;
  resumen: string | null;
  selloPersonal: string[];
  formacion: string | null;
  idiomas: string[];
  trayectoria: Array<{
    cargo: string;
    cliente: string | null;
    desde: number | null;
    hasta: number | null;
    descripcion: string;
  }>;
  incluyeClientes: boolean;
  // Texto de cara al cliente de la modalidad de prueba elegida (Nivel 0).
  enunciadoPrueba: string | null;
}

const texto = (s: string | null | undefined) => {
  const t = s?.trim();
  return t ? t : null;
};
const lista = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean);

export function armarFicha(
  d: DatosFicha,
  o: { ahora: Date; necesidad: Necesidad },
): FichaEnEdicion {
  const enunciado = texto(d.enunciadoPrueba);
  return {
    codigo: d.codigo,
    nombre: texto(d.nombre),
    primerApellido: texto(d.primerApellido),
    rol: texto(d.rol),
    seniority: texto(d.seniority),
    aniosExperiencia: d.aniosExperiencia,
    sectores: lista(d.sectores),
    tecnologias: lista(d.tecnologias),
    modalidad: texto(d.modalidad),
    pais: texto(d.pais),
    ciudad: o.necesidad === "remota" ? null : texto(d.ciudad),
    disponibilidad: bandaDeDisponibilidad(
      { fecha: d.disponibilidadFecha, actualizadaEn: d.disponibilidadActualizadaEn },
      o.ahora,
    ),
    resumen: texto(d.resumen),
    selloPersonal: lista(d.selloPersonal).slice(0, 3),
    formacion: texto(d.formacion),
    idiomas: lista(d.idiomas),
    trayectoria: d.trayectoria.map((e) => ({
      cargo: e.cargo.trim(),
      cliente: d.incluyeClientes ? texto(e.cliente) : null,
      desde: e.desde,
      hasta: e.hasta,
      descripcion: e.descripcion.trim(),
    })),
    validacion: enunciado ? { nivel: 0, enunciado } : null,
  };
}

// Bloques de la ficha (HU-129). Un bloque obligatorio está incompleto cuando le falta un dato que
// `evaluarPublicacion` exige —la misma regla que impide publicar—; uno opcional sin datos no se dibuja
// y no impide publicar.
export type BloqueFicha =
  | "cabecera"
  | "persona"
  | "disponibilidad"
  | "modalidad"
  | "validacion"
  | "trayectoria"
  | "stack";

export const BLOQUE_DE_DATO: Record<CampoObligatorio, BloqueFicha> = {
  nombre: "persona",
  primer_apellido: "persona",
  rol: "cabecera",
  seniority: "persona",
  anios_experiencia: "persona",
  tecnologias: "stack",
  ciudad: "modalidad",
  modalidad_trabajo: "modalidad",
  disponibilidad: "disponibilidad",
  trayectoria: "trayectoria",
};

export const OPCIONALES = ["resumen", "sello", "formacion", "idiomas", "sectores"] as const;
export type BloqueOpcional = (typeof OPCIONALES)[number];

export function opcionalesVacios(f: FichaEnEdicion): BloqueOpcional[] {
  const vacios: BloqueOpcional[] = [];
  if (!f.resumen) vacios.push("resumen");
  if (f.selloPersonal.length === 0) vacios.push("sello");
  if (!f.formacion) vacios.push("formacion");
  if (f.idiomas.length === 0) vacios.push("idiomas");
  if (f.sectores.length === 0) vacios.push("sectores");
  return vacios;
}
