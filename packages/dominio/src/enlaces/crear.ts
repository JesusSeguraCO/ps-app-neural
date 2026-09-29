// Generación del enlace curado (HU-122, RF-19.4, ADR-0002 H9). Regla pura: valida la entrada contra
// el estado público de cada código y devuelve el enlace listo para guardar, o TODOS los motivos por
// los que no se emite. El enlace es una lista explícita de códigos, nunca criterios de filtro.
import { createHash, randomBytes } from "node:crypto";
import { normalizarCorreo } from "../acceso/codigo";

export type EstadoPublico = "disponible" | "colocado" | "pausado" | "fuera_del_banco";

export const VIGENCIA_POR_OMISION_DIAS = 30;
export const VIGENCIA_MAXIMA_DIAS = 365;
const DIA_MS = 86_400_000;
const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface EntradaEnlace {
  cuenta: { ref: string; nombre: string } | null;
  proyecto?: string | null;
  razon: string;
  codigos: string[];
  invitados: string[];
  vigenciaDias?: number;
}

export interface EnlaceNuevo {
  cuentaRef: string;
  cuentaNombre: string;
  proyecto: string | null;
  razon: string;
  codigos: string[];
  invitados: string[];
  vigenteHasta: Date;
}

export type ErrorEnlace =
  | { tipo: "sin_cuenta"; mensaje: string }
  | { tipo: "sin_razon"; mensaje: string }
  | { tipo: "no_publicado"; codigos: string[]; mensaje: string }
  | { tipo: "sin_invitados"; mensaje: string }
  | { tipo: "correo_invalido"; correos: string[]; mensaje: string }
  | { tipo: "vigencia_invalida"; mensaje: string };

export type ResultadoEnlace = { ok: true; enlace: EnlaceNuevo } | { ok: false; errores: ErrorEnlace[] };

const unicos = <T>(xs: T[]) => [...new Set(xs)];
const enumerar = (xs: string[]) => (xs.length === 1 ? xs[0]! : `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}`);

export function crearEnlace(
  e: EntradaEnlace,
  estados: ReadonlyMap<string, EstadoPublico>,
  ahora: Date,
): ResultadoEnlace {
  const errores: ErrorEnlace[] = [];
  if (!e.cuenta?.ref.trim()) errores.push({ tipo: "sin_cuenta", mensaje: "Elige la cuenta a la que va el enlace." });

  const razon = e.razon.trim();
  if (!razon)
    errores.push({
      tipo: "sin_razon",
      mensaje: "Sin razón, el cliente recibe un catálogo y no una curaduría. Escribe por qué elegiste estos perfiles.",
    });

  const codigos = unicos(e.codigos.map((c) => c.trim()));
  const noPublicados = codigos.filter((c) => estados.get(c) !== "disponible");
  if (noPublicados.length)
    errores.push({
      tipo: "no_publicado",
      codigos: noPublicados,
      mensaje: `${enumerar(noPublicados)} ${noPublicados.length === 1 ? "no está publicado" : "no están publicados"}: quítalo${noPublicados.length === 1 ? "" : "s"} de la selección o publícalo${noPublicados.length === 1 ? "" : "s"} antes.`,
    });

  const invitados = unicos(e.invitados.map(normalizarCorreo).filter(Boolean));
  const malos = invitados.filter((c) => !CORREO.test(c));
  if (!invitados.length) errores.push({ tipo: "sin_invitados", mensaje: "El enlace necesita al menos un correo invitado." });
  else if (malos.length)
    errores.push({ tipo: "correo_invalido", correos: malos, mensaje: `Revisa ${enumerar(malos)}: no parece un correo.` });

  const dias = e.vigenciaDias ?? VIGENCIA_POR_OMISION_DIAS;
  if (!Number.isInteger(dias) || dias < 1 || dias > VIGENCIA_MAXIMA_DIAS)
    errores.push({ tipo: "vigencia_invalida", mensaje: `La vigencia va de 1 a ${VIGENCIA_MAXIMA_DIAS} días.` });

  if (errores.length) return { ok: false, errores };
  return {
    ok: true,
    enlace: {
      cuentaRef: e.cuenta!.ref.trim(),
      cuentaNombre: e.cuenta!.nombre.trim(),
      proyecto: e.proyecto?.trim() || null,
      razon,
      codigos,
      invitados,
      vigenteHasta: new Date(ahora.getTime() + dias * DIA_MS),
    },
  };
}

// Token opaco de 32 bytes (H9): viaja solo en el fragmento `#t=`; en BD solo su SHA-256.
export function generarTokenEnlace(): { token: string; hash: Buffer } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashTokenEnlace(token) };
}

export function hashTokenEnlace(token: string): Buffer {
  return createHash("sha256").update(token).digest();
}
