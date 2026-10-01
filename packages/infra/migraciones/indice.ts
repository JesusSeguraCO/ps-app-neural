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
import * as m0012 from "./0012_renovacion_sin_hubspot";
import * as m0013 from "./0013_catalogos_y_lexico";
import * as m0014 from "./0014_perfil_y_consentimiento";
import * as m0015 from "./0015_lotes_importacion";
import * as m0016 from "./0016_aplicar_importacion";
import * as m0017 from "./0017_publicar_y_ficha";
import * as m0018 from "./0018_validaciones";
import * as m0019 from "./0019_pausa_y_vigencia";
import * as m0020 from "./0020_colocaciones";
import * as m0021 from "./0021_retirar_colocado";
import * as m0022 from "./0022_observador";
import * as m0023 from "./0023_accesos_panel";
import * as m0024 from "./0024_contacto_trycore";

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
  "0012_renovacion_sin_hubspot": m0012,
  "0013_catalogos_y_lexico": m0013,
  "0014_perfil_y_consentimiento": m0014,
  "0015_lotes_importacion": m0015,
  "0016_aplicar_importacion": m0016,
  "0017_publicar_y_ficha": m0017,
  "0018_validaciones": m0018,
  "0019_pausa_y_vigencia": m0019,
  "0020_colocaciones": m0020,
  "0021_retirar_colocado": m0021,
  "0022_observador": m0022,
  "0023_accesos_panel": m0023,
  "0024_contacto_trycore": m0024,
};
