// Ficha del perfil (RF-3.2, RF-8.7; HU-129, HU-130; diseño §2): lo que el cliente ve al abrir un
// perfil. Una sola implementación del armado, `armarFicha`, la usan el portal (desde la vista
// `operacion.ficha_publicable` con `ps_portal`) y la vista previa del panel (desde el perfil en
// edición): por eso la vista previa es la ficha del portal y no una copia.
//  - Disponibilidad como banda, nunca fecha (RF-3.13).
//  - El país siempre; la ciudad solo si la necesidad es presencial o híbrida (D-18 revisada).
//  - Validación de Nivel 0 con el enunciado de la modalidad de prueba elegida (RF-8.10, D10): nadie
//    lo redacta. El reporte detallado que confirmó una persona —de esa misma modalidad— lo enriquece
//    a Nivel 1 con resultado, evaluador, fecha y criterios evaluados (HU-130 edge), sin republicar.
//  - El cliente nombrado solo si el consentimiento lo incluye (HU-127).
//  - Un bloque opcional sin datos no existe en la ficha (no viaja ni se dibuja).
//  - Nada de la lista negra B.4: el esquema estricto hace fallar cualquier campo de más.
import { z } from "zod";
import { BANDAS, ROTULO_BANDA, bandaDeDisponibilidad } from "@ps/dominio/catalogo/banda";
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

export const ValidacionFicha = z.discriminatedUnion("nivel", [
  z.strictObject({ nivel: z.literal(0), enunciado: z.string().min(1) }),
  z.strictObject({
    nivel: z.literal(1),
    enunciado: z.string().min(1),
    modalidad: z.string().min(1),
    resultado: z.string().min(1),
    evaluador: z.string().min(1),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    criterios: z.array(z.string().min(1)).min(1),
  }),
]);

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
  // Reporte detallado confirmado de esa misma modalidad (Nivel 1), si existe.
  reporte?: {
    modalidad: string;
    resultado: string;
    evaluador: string;
    fecha: string;
    criterios: string[];
  } | null;
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
    validacion: !enunciado
      ? null
      : d.reporte && d.reporte.criterios.length > 0
        ? {
            nivel: 1,
            enunciado,
            modalidad: d.reporte.modalidad,
            resultado: d.reporte.resultado.trim(),
            evaluador: d.reporte.evaluador.trim(),
            fecha: d.reporte.fecha,
            criterios: lista(d.reporte.criterios),
          }
        : { nivel: 0, enunciado },
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

// Impacto de editar un publicado (HU-126, D3): qué cambia de cara al cliente, campo a campo, con el
// valor anterior y el nuevo tal como los ve el cliente. Se compara la ficha armada —la misma del
// portal—: lo interno (motivación, vínculo, capacidad) nunca cuenta, la disponibilidad se compara
// como banda y el cliente nombrado solo si el consentimiento lo incluye. `null` = queda sin dato.
export interface CambioDeCaraAlCliente {
  campo: string;
  etiqueta: string;
  antes: string | null;
  despues: string | null;
}

const unir = (xs: string[]) => (xs.length ? xs.join(" · ") : null);
const periodo = (desde: number | null, hasta: number | null) =>
  desde && hasta ? `${desde}–${hasta}` : desde ? `desde ${desde}` : hasta ? `hasta ${hasta}` : null;

const VISTA_CLIENTE: Array<[campo: string, etiqueta: string, valor: (f: FichaEnEdicion) => string | null]> = [
  ["nombre", "Nombre", (f) => [f.nombre, f.primerApellido].filter(Boolean).join(" ") || null],
  ["rol", "Rol", (f) => f.rol],
  ["seniority", "Seniority", (f) => f.seniority],
  ["anios_experiencia", "Años de experiencia", (f) => f.aniosExperiencia?.toString() ?? null],
  ["tecnologias", "Tecnologías ancla", (f) => unir(f.tecnologias)],
  ["sectores", "Sectores", (f) => unir(f.sectores)],
  ["modalidad_trabajo", "Modalidad de trabajo", (f) => f.modalidad],
  ["ubicacion", "Ubicación", (f) => [f.ciudad, f.pais].filter(Boolean).join(", ") || null],
  ["disponibilidad", "Disponibilidad", (f) => ROTULO_BANDA[f.disponibilidad]],
  ["resumen", "Resumen", (f) => f.resumen],
  ["sello_personal", "Sello personal", (f) => unir(f.selloPersonal)],
  ["formacion", "Formación", (f) => f.formacion],
  ["idiomas", "Idiomas", (f) => unir(f.idiomas)],
  [
    "trayectoria",
    "Trayectoria",
    (f) =>
      f.trayectoria
        .map((e) => {
          const cabeza = [e.cargo, e.cliente].filter(Boolean).join(" · ");
          const p = periodo(e.desde, e.hasta);
          return `${cabeza}${p ? `, ${p}` : ""}: ${e.descripcion}`;
        })
        .join("\n") || null,
  ],
  [
    "validacion",
    "Validación técnica",
    (f) =>
      !f.validacion
        ? null
        : f.validacion.nivel === 0
          ? f.validacion.enunciado
          : `${f.validacion.modalidad} · ${f.validacion.resultado} (${f.validacion.evaluador}, ${f.validacion.fecha}). Evaluó: ${f.validacion.criterios.join(" · ")}`,
  ],
];

export function cambiosDeCaraAlCliente(
  antes: FichaEnEdicion,
  despues: FichaEnEdicion,
): CambioDeCaraAlCliente[] {
  return VISTA_CLIENTE.flatMap(([campo, etiqueta, valor]) => {
    const a = valor(antes);
    const d = valor(despues);
    return a === d ? [] : [{ campo, etiqueta, antes: a, despues: d }];
  });
}
