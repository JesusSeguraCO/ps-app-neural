// Reglas del perfil en el panel (HU-125, HU-127; RF-8.2, RF-8.4, RF-8.10 con D10). Puras: qué le
// falta a un perfil para poder publicarse —siempre nace en borrador— y si un consentimiento cubre la
// publicación nominal. La publicación en sí (guardas en la transición) es de HU-128.
//
// EP-003 (HU-176, HU-177; D61, D63): la guarda única gana las validaciones de entrada SARO (alcance y
// fecha) y DISC (fecha). Cada condición dice su motivo («Falta <motivo>») y el campo del editor al que
// se salta; panel (individual y masiva), importación y la marca «Incompleto» (HU-178) usan esta misma
// función. Un alcance desactivado pero asignado cuenta como registrado: se pregunta si lo tiene, no si
// está activo (asignarlo es lo que exige activo). El Sello Personal no entra (D63).
import { normalizar } from "../catalogo/parecidos";

export interface DatosParaPublicar {
  nombre: string;
  primerApellido: string;
  rol: boolean;
  tecnologias: number;
  seniority: boolean;
  aniosExperiencia: number | null;
  ciudad: boolean;
  modalidadTrabajo: boolean;
  disponibilidadFecha: string | null;
  experiencias: number;
  modalidadPrueba: { elegida: boolean; activa: boolean };
  familiaConModalidades: boolean;
  consentimiento: { vigente: boolean; nominal: boolean } | null;
  // Verificación de seguridad bajo SARO: ¿tiene alcance (activo o no) y fecha? (D61)
  saro: { alcance: boolean; fecha: boolean };
  // Evaluación DISC: ¿tiene fecha? (D61)
  disc: { fecha: boolean };
}

export type CampoObligatorio =
  | "nombre"
  | "primer_apellido"
  | "rol"
  | "tecnologias"
  | "seniority"
  | "anios_experiencia"
  | "ciudad"
  | "modalidad_trabajo"
  | "disponibilidad"
  | "trayectoria";

export const ETIQUETA_CAMPO: Record<CampoObligatorio, string> = {
  nombre: "Nombre",
  primer_apellido: "Primer apellido",
  rol: "Rol",
  tecnologias: "Tecnologías",
  seniority: "Seniority",
  anios_experiencia: "Años de experiencia",
  ciudad: "Ciudad",
  modalidad_trabajo: "Modalidad de trabajo",
  disponibilidad: "Disponibilidad",
  trayectoria: "Trayectoria",
};

export type ClaveCondicion =
  | "consentimiento"
  | "trayectoria"
  | "disponibilidad"
  | "modalidad_prueba"
  | "saro_alcance"
  | "saro_fecha"
  | "disc_fecha";

// Lo que dice el panel cuando falta («Falta <motivo>», HU-176) y el campo del editor al que lleva. La
// modalidad de una familia sin modalidades lleva al rol: el detalle lo resuelve la UI.
export const MOTIVO_CONDICION: Record<ClaveCondicion, string> = {
  consentimiento: "el consentimiento nominal",
  trayectoria: "la trayectoria",
  disponibilidad: "la disponibilidad vigente",
  modalidad_prueba: "la modalidad de prueba",
  saro_alcance: "el alcance de la verificación SARO",
  saro_fecha: "la fecha de la verificación SARO",
  disc_fecha: "la fecha de la evaluación DISC",
};

export interface Condicion {
  clave: ClaveCondicion;
  etiqueta: string;
  // «el alcance de la verificación SARO»: con `faltaDe` da el texto exacto del bloqueo.
  motivo: string;
  // Campo del editor al que se salta cuando falta (la clave de la condición).
  campo: ClaveCondicion;
  cumple: boolean;
  detalle?:
    "familia_sin_modalidades" | "modalidad_inactiva" | "sin_elegir" | "revocado" | "sin_registrar";
}

export interface EvaluacionPublicacion {
  condiciones: Condicion[];
  faltanDatos: Array<{ campo: CampoObligatorio; etiqueta: string }>;
  publicable: boolean;
}

const lleno = (s: string) => s.trim().length > 0;

export function evaluarPublicacion(d: DatosParaPublicar): EvaluacionPublicacion {
  const faltas: CampoObligatorio[] = [];
  if (!lleno(d.nombre)) faltas.push("nombre");
  if (!lleno(d.primerApellido)) faltas.push("primer_apellido");
  if (!d.rol) faltas.push("rol");
  if (d.tecnologias < 1) faltas.push("tecnologias");
  if (!d.seniority) faltas.push("seniority");
  if (d.aniosExperiencia === null) faltas.push("anios_experiencia");
  if (!d.ciudad) faltas.push("ciudad");
  if (!d.modalidadTrabajo) faltas.push("modalidad_trabajo");
  if (!d.disponibilidadFecha) faltas.push("disponibilidad");
  if (d.experiencias < 1) faltas.push("trayectoria");

  const c = d.consentimiento;
  const con = (clave: ClaveCondicion) => ({ clave, motivo: MOTIVO_CONDICION[clave], campo: clave });
  const condiciones: Condicion[] = [
    {
      ...con("consentimiento"),
      etiqueta: "Consentimiento nominal",
      cumple: Boolean(c?.vigente && c.nominal),
      ...(c?.vigente && c.nominal
        ? {}
        : { detalle: c ? ("revocado" as const) : ("sin_registrar" as const) }),
    },
    { ...con("trayectoria"), etiqueta: "Trayectoria", cumple: d.experiencias >= 1 },
    {
      ...con("disponibilidad"),
      etiqueta: "Disponibilidad vigente",
      cumple: Boolean(d.disponibilidadFecha),
    },
    {
      ...con("modalidad_prueba"),
      etiqueta: "Modalidad de prueba",
      cumple: d.modalidadPrueba.elegida && d.modalidadPrueba.activa,
      ...(d.modalidadPrueba.elegida && d.modalidadPrueba.activa
        ? {}
        : {
            detalle: !d.familiaConModalidades
              ? ("familia_sin_modalidades" as const)
              : d.modalidadPrueba.elegida
                ? ("modalidad_inactiva" as const)
                : ("sin_elegir" as const),
          }),
    },
    {
      ...con("saro_alcance"),
      etiqueta: "Alcance de la verificación SARO",
      cumple: d.saro.alcance,
    },
    { ...con("saro_fecha"), etiqueta: "Fecha de la verificación SARO", cumple: d.saro.fecha },
    { ...con("disc_fecha"), etiqueta: "Fecha de la evaluación DISC", cumple: d.disc.fecha },
  ];
  return {
    condiciones,
    faltanDatos: faltas.map((campo) => ({ campo, etiqueta: ETIQUETA_CAMPO[campo] })),
    publicable: faltas.length === 0 && condiciones.every((x) => x.cumple),
  };
}

// «Falta el alcance de la verificación SARO»: el texto exacto del bloqueo de publicar (HU-176).
export const faltaDe = (c: Pick<Condicion, "motivo">) => `Falta ${c.motivo}`;

// Fecha de una verificación (SARO o DISC; HU-176): AAAA-MM-DD real y no posterior a hoy en
// America/Bogota (`hoy` lo da quien llama). Vacía es válida: un borrador se guarda incompleto.
export const MENSAJE_FECHA_FUTURA = "La fecha de una verificación no puede ser posterior a hoy.";
export function validarFechaVerificacion(
  fecha: string | null,
  hoy: string,
): { ok: true } | { ok: false; motivo: "fecha_futura" | "fecha_ilegible" } {
  if (fecha === null) return { ok: true };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const d = m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : null;
  if (!d || d.toISOString().slice(0, 10) !== fecha) return { ok: false, motivo: "fecha_ilegible" };
  return fecha > hoy ? { ok: false, motivo: "fecha_futura" } : { ok: true };
}

// Lo que el profesional autorizó (HU-127). Nominal = nombre y primer apellido con la trayectoria; los
// clientes nombrados son opcionales (sin ellos la experiencia se despersonaliza). Un consentimiento
// recogido para el banco sin nombres no cubre este uso y no se registra.
export function validarConsentimiento(a: {
  nombreApellido: boolean;
  trayectoria: boolean;
  clientes: boolean;
}): { ok: true; incluyeClientes: boolean } | { ok: false; motivo: "no_nominal" } {
  if (!a.nombreApellido || !a.trayectoria) return { ok: false, motivo: "no_nominal" };
  return { ok: true, incluyeClientes: a.clientes };
}

// Opciones rápidas de disponibilidad del editor, con los rótulos de banda del PRD (RF-3.13). Se guarda
// la fecha civil; el portal solo verá la banda.
export const OPCIONES_DISPONIBILIDAD = {
  ahora: { etiqueta: "Disponible ahora", dias: 0 },
  una_semana: { etiqueta: "En 1 semana", dias: 7 },
  dos_semanas: { etiqueta: "En 2 semanas", dias: 14 },
  un_mes: { etiqueta: "En 1 mes", dias: 30 },
} as const;
export type OpcionDisponibilidad = keyof typeof OPCIONES_DISPONIBILIDAD;

export function fechaDeOpcionDisponibilidad(opcion: OpcionDisponibilidad, ahora: Date): string {
  const hoyBogota = new Date(ahora.getTime() - 5 * 3_600_000);
  hoyBogota.setUTCDate(hoyBogota.getUTCDate() + OPCIONES_DISPONIBILIDAD[opcion].dias);
  return hoyBogota.toISOString().slice(0, 10);
}

// Experiencia Clave (Anexo B.1): el cliente nombrado va en su propio campo para que el consentimiento
// parcial lo oculte sin reescribir el texto (HU-127 edge). Si el texto también lo nombra, ocultar el
// campo no despersonaliza nada: se rechaza al guardar.
export function clienteEnDescripcion(descripcion: string, cliente: string | null): boolean {
  const palabras = (t: string) => normalizar(t.replace(/[^\p{L}\p{N}]+/gu, " "));
  if (!cliente || !palabras(cliente)) return false;
  return ` ${palabras(descripcion)} `.includes(` ${palabras(cliente)} `);
}

// Rótulo de la banda en el panel, con las mismas palabras que las opciones rápidas del editor.
export const ETIQUETA_BANDA_PANEL = {
  inmediato: "Disponible ahora",
  una_semana: "En 1 semana",
  dos_semanas: "En 2 semanas",
  un_mes: "En 1 mes",
  mas_de_un_mes: "Más de 1 mes",
  por_confirmar: "Por confirmar",
} as const;
