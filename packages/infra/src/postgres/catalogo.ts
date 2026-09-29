// ProyeccionCatalogo (ADR-0008 fila UC-4/QA-5, ADR-0003): única vía por la que un perfil llega al
// portal, tanto al HTML de un Server Component como a `GET /api/v1/catalogo`. Lee solo la vista
// `operacion.catalogo_publicable` con `ps_portal`, traduce la fecha a banda (RF-3.13) y pasa el
// resultado por el esquema estricto antes de devolverlo. Sin fecha ni ciudad hacia el cliente.
import "server-only";
import type pg from "pg";
import { RespuestaCatalogo, type PerfilCatalogo } from "@ps/contratos/catalogo";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { bandaDeDisponibilidad } from "@ps/dominio/catalogo/banda";

interface FilaCatalogo {
  codigo: string;
  nombre: string;
  primer_apellido: string;
  familia: string | null;
  roles: string[];
  seniority: string | null;
  anios_experiencia: number | null;
  tecnologias: string[];
  sectores: string[];
  modalidad: string | null;
  pais: string | null;
  disponibilidad_fecha: string | null;
  disponibilidad_actualizada_en: Date | null;
}

export function proyectar(filas: FilaCatalogo[], ahora: Date): PerfilCatalogo[] {
  return RespuestaCatalogo.parse({
    perfiles: filas.map((f) => ({
      codigo: f.codigo,
      nombre: f.nombre,
      primerApellido: f.primer_apellido,
      familia: f.familia,
      roles: f.roles,
      seniority: f.seniority,
      aniosExperiencia: f.anios_experiencia,
      tecnologias: f.tecnologias,
      sectores: f.sectores,
      modalidad: f.modalidad,
      pais: f.pais,
      disponibilidad: bandaDeDisponibilidad(
        { fecha: f.disponibilidad_fecha, actualizadaEn: f.disponibilidad_actualizada_en },
        ahora,
      ),
    })),
  }).perfiles;
}

// `_sesion` no se lee: exigirla obliga a haber pasado por la guarda (el tipo solo lo fabrican
// `exigirSesion` y `conSesionPortal`). Todo el banco publicable es visible con sesión (HU-094).
export async function proyeccionCatalogo(
  bd: pg.Pool,
  _sesion: SesionPortalVerificada,
  ahora: Date = new Date(),
): Promise<PerfilCatalogo[]> {
  const r = await bd.query<FilaCatalogo>(
    `SELECT codigo, nombre, primer_apellido, familia, roles, seniority, anios_experiencia, tecnologias,
            sectores, modalidad, pais, disponibilidad_fecha::text AS disponibilidad_fecha,
            disponibilidad_actualizada_en
       FROM operacion.catalogo_publicable ORDER BY codigo`,
  );
  return proyectar(r.rows, ahora);
}

export interface PublicablePanel {
  codigo: string;
  nombre: string;
  rol: string | null;
  familia: string | null;
  ciudad: string | null;
  banda: ReturnType<typeof bandaDeDisponibilidad>;
}

// Para elegir perfiles al generar un enlace (panel, uso interno): los publicables con su rol
// principal, familia, ciudad y banda. La fecha no sale ni en el panel: solo la banda.
export async function publicablesParaPanel(bd: pg.Pool, ahora: Date = new Date()): Promise<PublicablePanel[]> {
  const r = await bd.query<FilaCatalogo>(
    `SELECT codigo, nombre, primer_apellido, familia, roles, ciudad,
            disponibilidad_fecha::text AS disponibilidad_fecha, disponibilidad_actualizada_en
       FROM operacion.catalogo_publicable ORDER BY codigo`,
  );
  return r.rows.map((f) => ({
    codigo: f.codigo,
    nombre: `${f.nombre} ${f.primer_apellido}`,
    rol: f.roles[0] ?? null,
    familia: f.familia,
    ciudad: (f as FilaCatalogo & { ciudad: string | null }).ciudad,
    banda: bandaDeDisponibilidad({ fecha: f.disponibilidad_fecha, actualizadaEn: f.disponibilidad_actualizada_en }, ahora),
  }));
}
