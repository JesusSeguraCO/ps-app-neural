// ProyeccionCatalogo (ADR-0008 fila UC-4/QA-5, ADR-0003): única vía por la que un perfil llega al
// portal, tanto al HTML de un Server Component como a `GET /api/v1/catalogo`. Lee solo la vista
// `operacion.catalogo_publicable` con `ps_portal`, traduce la fecha a banda (RF-3.13) y pasa el
// resultado por el esquema estricto antes de devolverlo. Sin fecha ni ciudad hacia el cliente.
import "server-only";
import type pg from "pg";
import { RespuestaCatalogo, type PerfilCatalogo } from "@ps/contratos/catalogo";
import { FichaPerfil, armarFicha, type Necesidad } from "@ps/contratos/ficha";
import type { SesionPortalVerificada } from "@ps/dominio/acceso/sesion";
import { bandaDeDisponibilidad } from "@ps/dominio/catalogo/banda";
import { selloValido } from "@ps/dominio/catalogo/tarjeta";

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
  sello_personal: string[];
}

// Columnas de la tarjeta: las leen el catálogo del banco y la selección del enlace (una sola lista).
export const COLUMNAS_TARJETA = `codigo, nombre, primer_apellido, familia, roles, seniority, anios_experiencia, tecnologias,
            sectores, modalidad, pais, disponibilidad_fecha::text AS disponibilidad_fecha,
            disponibilidad_actualizada_en, sello_personal`;

// Un sello fuera de contrato (HU-081 · error) no se dibuja a medias: viaja vacío, la lista no se cae y
// queda el registro con el código —sin datos personales— para que Talento Humano lo corrija.
function selloPublicable(codigo: string, sello: string[] | null): string[] {
  const xs = sello ?? [];
  if (xs.length === 0) return [];
  if (selloValido(xs)) return xs.map((x) => x.trim());
  console.error(JSON.stringify({ evento: "sello_fuera_de_contrato", codigo }));
  return [];
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
      selloPersonal: selloPublicable(f.codigo, f.sello_personal),
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
    `SELECT ${COLUMNAS_TARJETA} FROM operacion.catalogo_publicable ORDER BY codigo`,
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

// Ficha de un perfil publicado (HU-129, HU-130; RF-3.2): las vistas `catalogo_publicable`,
// `ficha_publicable` y `experiencias_publicables` con `ps_portal`, armadas con `armarFicha` —la misma
// función que usa la vista previa del panel— y validadas con el contrato estricto. La ciudad solo
// viaja si la necesidad es presencial o híbrida.
export async function fichaDelPortal(
  bd: pg.Pool,
  _sesion: SesionPortalVerificada,
  codigo: string,
  o: { necesidad?: Necesidad; ahora?: Date } = {},
): Promise<FichaPerfil | null> {
  const r = await bd.query(
    `SELECT c.codigo, c.nombre, c.primer_apellido, c.roles, c.seniority, c.anios_experiencia, c.tecnologias,
            c.sectores, c.modalidad, c.pais, c.ciudad, c.disponibilidad_fecha::text AS disponibilidad_fecha,
            c.disponibilidad_actualizada_en, f.resumen, f.sello_personal, f.formacion, f.idiomas,
            f.enunciado_prueba, f.incluye_clientes, f.reporte_modalidad, f.reporte_resultado,
            f.reporte_evaluador, f.reporte_fecha::text AS reporte_fecha, f.reporte_criterios,
            f.saro_texto, f.saro_fecha::text AS saro_fecha, f.disc_fecha::text AS disc_fecha
       FROM operacion.catalogo_publicable c JOIN operacion.ficha_publicable f USING (codigo)
      WHERE c.codigo = $1`,
    [codigo],
  );
  const c = r.rows[0];
  if (!c) return null;
  selloPublicable(c.codigo, c.sello_personal); // registra el sello fuera de contrato, como la tarjeta
  const trayectoria = (
    await bd.query(
      `SELECT cargo, cliente, desde, hasta, descripcion FROM operacion.experiencias_publicables
        WHERE codigo = $1 ORDER BY orden`,
      [codigo],
    )
  ).rows;
  return FichaPerfil.parse(
    armarFicha(
      {
        codigo: c.codigo,
        nombre: c.nombre,
        primerApellido: c.primer_apellido,
        rol: c.roles[0] ?? null,
        seniority: c.seniority,
        aniosExperiencia: c.anios_experiencia,
        sectores: c.sectores,
        tecnologias: c.tecnologias,
        modalidad: c.modalidad,
        pais: c.pais,
        ciudad: c.ciudad,
        disponibilidadFecha: c.disponibilidad_fecha,
        disponibilidadActualizadaEn: c.disponibilidad_actualizada_en,
        resumen: c.resumen,
        selloPersonal: c.sello_personal,
        formacion: c.formacion,
        idiomas: c.idiomas,
        trayectoria,
        incluyeClientes: c.incluye_clientes,
        enunciadoPrueba: c.enunciado_prueba,
        reporte: c.reporte_resultado
          ? {
              modalidad: c.reporte_modalidad,
              resultado: c.reporte_resultado,
              evaluador: c.reporte_evaluador,
              fecha: c.reporte_fecha,
              criterios: c.reporte_criterios,
            }
          : null,
        saro: { texto: c.saro_texto, fecha: c.saro_fecha },
        disc: { fecha: c.disc_fecha },
      },
      { ahora: o.ahora ?? new Date(), necesidad: o.necesidad ?? "remota" },
    ),
  );
}
