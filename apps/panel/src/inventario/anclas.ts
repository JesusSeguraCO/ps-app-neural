// Campo del editor de cada condición de publicar (HU-176, HU-178): el salto de «Falta …» en el editor,
// en su lateral, en la vista previa y en el resultado de publicar varios. Un solo mapa para las tres
// superficies: si se añade una condición, el tipo `Record<ClaveCondicion, …>` obliga a darle su campo
// aquí y ninguna copia queda atrás.
import type { ClaveCondicion } from "@ps/dominio/inventario/perfil";

export const ANCLA_CONDICION: Readonly<Record<ClaveCondicion, string>> = {
  consentimiento: "consentimiento",
  trayectoria: "pe-trayectoria",
  disponibilidad: "pe-disp",
  modalidad_prueba: "pe-prueba",
  saro_alcance: "pe-saro-alcance",
  saro_fecha: "pe-saro-fecha",
  disc_fecha: "pe-disc-fecha",
};

// Las validaciones de entrada (SARO y DISC): cada una con su «Falta …» exacto y el salto a su campo.
export const VALIDACION_ENTRADA: ReadonlySet<ClaveCondicion> = new Set<ClaveCondicion>([
  "saro_alcance",
  "saro_fecha",
  "disc_fecha",
]);

export const esValidacionDeEntrada = (clave: string): clave is ClaveCondicion =>
  VALIDACION_ENTRADA.has(clave as ClaveCondicion);
