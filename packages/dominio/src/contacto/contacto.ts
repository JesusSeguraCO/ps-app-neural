// Contacto de Trycore que ve el cliente (HU-147; diseño §10): un solo contacto para todo el portal, con
// correo @trycore.com obligatorio y nombre y cargo opcionales. Mientras nadie lo configure, el buzón de
// People Service. Las pantallas de contacto del portal lo componen como «Nombre, Cargo: correo» o
// «People Service: correo», sin separadores huérfanos. El correo va en `direccion`: en el portal ninguna
// clave `correo` cruza al navegador (V8-4, lista negra B.4 de los perfiles), y este no es de un perfil.
import { validarCorreoPanel } from "../acceso/accesos";

export interface ContactoTrycore {
  direccion: string;
  nombre: string | null;
  cargo: string | null;
}

export const CONTACTO_POR_OMISION: ContactoTrycore = {
  direccion: "people.service@trycore.com",
  nombre: null,
  cargo: null,
};

export const LARGO_MAXIMO_CONTACTO = 80;

const limpio = (t: string | null | undefined): string | null => t?.trim() || null;

// A quién se nombra: «Eida Tinjacá, Coordinación de Servicio», solo uno de los dos, o el buzón.
export function quienAtiende(c: ContactoTrycore): string {
  const partes = [limpio(c.nombre), limpio(c.cargo)].filter(Boolean);
  return partes.length ? partes.join(", ") : "People Service";
}

export const textoContacto = (c: ContactoTrycore): string => `${quienAtiende(c)}: ${c.direccion}`;

export function validarContacto(entrada: {
  correo: string;
  nombre?: string | null;
  cargo?: string | null;
}):
  | { ok: true; contacto: ContactoTrycore }
  | { ok: false; motivo: "correo_invalido" | "correo_externo" | "texto_largo" } {
  const v = validarCorreoPanel(entrada.correo);
  if (!v.ok) return v;
  const nombre = limpio(entrada.nombre);
  const cargo = limpio(entrada.cargo);
  if ((nombre?.length ?? 0) > LARGO_MAXIMO_CONTACTO || (cargo?.length ?? 0) > LARGO_MAXIMO_CONTACTO)
    return { ok: false, motivo: "texto_largo" };
  return { ok: true, contacto: { direccion: v.correo, nombre, cargo } };
}
