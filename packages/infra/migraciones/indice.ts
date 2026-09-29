// Proveedor ESTÁTICO de migraciones (ADR-0008 fila CON-19/QA-9): cada migración se importa de forma
// explícita para que el bundle del worker las contenga. V8-11 comprueba que este índice coincide con
// los ficheros de la carpeta.
import type { Migration } from "kysely/migration";
import * as m0001 from "./0001_identidad_y_cola";
import * as m0002 from "./0002_claves_y_admin_inicial";
import * as m0003 from "./0003_un_codigo_vigente";
import * as m0004 from "./0004_tope_emision";
import * as m0005 from "./0005_inventario_minimo";
import * as m0006 from "./0006_enlaces_panel";
import * as m0007 from "./0007_motivo_revocacion";
import * as m0008 from "./0008_estado_seleccion";
import * as m0009 from "./0009_renovar_enlace";
import * as m0010 from "./0010_equipo_y_taxonomia";
import * as m0011 from "./0011_peticiones_invitacion";

export const MIGRACIONES: Record<string, Migration> = {
  "0001_identidad_y_cola": m0001,
  "0002_claves_y_admin_inicial": m0002,
  "0003_un_codigo_vigente": m0003,
  "0004_tope_emision": m0004,
  "0005_inventario_minimo": m0005,
  "0006_enlaces_panel": m0006,
  "0007_motivo_revocacion": m0007,
  "0008_estado_seleccion": m0008,
  "0009_renovar_enlace": m0009,
  "0010_equipo_y_taxonomia": m0010,
  "0011_peticiones_invitacion": m0011,
};
