// Proveedor ESTÁTICO de migraciones (ADR-0008 fila CON-19/QA-9): cada migración se importa de forma
// explícita para que el bundle del worker las contenga. V8-11 comprueba que este índice coincide con
// los ficheros de la carpeta.
import type { Migration } from "kysely/migration";
import * as m0001 from "./0001_identidad_y_cola";

export const MIGRACIONES: Record<string, Migration> = {
  "0001_identidad_y_cola": m0001,
};
