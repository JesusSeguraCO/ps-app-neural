// Bandeja de vigencia (HU-136; umbrales de HU-133; RF-8.14.2, RF-8.14.4; V3-4). Pura: recibe `ahora`
// y cuenta días civiles de Bogotá, así que a las 19:30 de Bogotá (00:30 UTC del día siguiente) nada
// cambia hasta la medianoche local.
//  - «Por confirmar»: lo que el cliente ya ve como «Disponibilidad por confirmar» (la misma banda del
//    portal), al principio.
//  - «Por revisar»: publicados (y colocados) sin actualizar hace más de 30 días, del cambio más antiguo
//    al más reciente; sin fecha de actualización entran como «dato incompleto», al final.
//  - Pausados hace más de 30 días, con su motivo y desde qué fecha; sin fecha de pausa, «dato
//    incompleto». 31 días entra; 30 no.
import { bandaDeDisponibilidad, DIAS_SIN_TOCAR } from "../catalogo/banda";
import type { EstadoAlmacenado } from "./estados";

const DIA_MS = 86_400_000;
const BOGOTA_MS = -5 * 3_600_000;

// Fecha civil de Bogotá (AAAA-MM-DD) de un instante.
export const diaCivilDeColombia = (d: Date) =>
  new Date(d.getTime() + BOGOTA_MS).toISOString().slice(0, 10);

export function diasCivilesDesde(desde: Date, ahora: Date): number {
  return Math.round(
    (Date.parse(`${diaCivilDeColombia(ahora)}T00:00:00Z`) -
      Date.parse(`${diaCivilDeColombia(desde)}T00:00:00Z`)) /
      DIA_MS,
  );
}

const sumarDias = (aaaammdd: string, dias: number) =>
  new Date(Date.parse(`${aaaammdd}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10);

export interface PerfilVigencia {
  codigo: string;
  nombre: string;
  estado: EstadoAlmacenado;
  disponibilidadFecha: string | null;
  disponibilidadActualizadaEn: Date | null;
  pausadoEn: Date | null;
  motivoPausa: string | null;
}

export interface FilaVigencia {
  codigo: string;
  // Días sin actualizar (publicados) o en pausa (pausados); null = dato incompleto.
  dias: number | null;
  // Fecha civil del último cambio o del inicio de la pausa.
  desde: string | null;
  datoIncompleto: boolean;
  motivoPausa: string | null;
}

export interface BandejaVigencia {
  porConfirmar: FilaVigencia[];
  porRevisar: FilaVigencia[];
  pausados: FilaVigencia[];
  vacia: boolean;
  publicados: number;
  alDia: number;
  // Quién entra primero si nadie lo actualiza, y qué día (para la bandeja vacía).
  proxima: { codigo: string; nombre: string; entra: string } | null;
}

const visible = (e: EstadoAlmacenado) => e === "publicado";
const masAntiguoPrimero = (a: FilaVigencia, b: FilaVigencia) =>
  a.dias === null
    ? b.dias === null
      ? a.codigo.localeCompare(b.codigo)
      : 1
    : b.dias === null
      ? -1
      : b.dias - a.dias;

export function bandejaDeVigencia(perfiles: PerfilVigencia[], ahora: Date): BandejaVigencia {
  const porConfirmar: FilaVigencia[] = [];
  const porRevisar: FilaVigencia[] = [];
  const pausados: FilaVigencia[] = [];
  let publicados = 0;
  let proxima: BandejaVigencia["proxima"] = null;

  for (const p of perfiles) {
    if (visible(p.estado)) {
      publicados++;
      const fila: FilaVigencia = {
        codigo: p.codigo,
        dias: p.disponibilidadActualizadaEn
          ? diasCivilesDesde(p.disponibilidadActualizadaEn, ahora)
          : null,
        desde: p.disponibilidadActualizadaEn
          ? diaCivilDeColombia(p.disponibilidadActualizadaEn)
          : null,
        datoIncompleto: !p.disponibilidadActualizadaEn,
        motivoPausa: null,
      };
      const banda = bandaDeDisponibilidad(
        { fecha: p.disponibilidadFecha, actualizadaEn: p.disponibilidadActualizadaEn },
        ahora,
      );
      if (fila.datoIncompleto) porRevisar.push(fila);
      else if (banda === "por_confirmar") porConfirmar.push(fila);
      else if (fila.dias! > DIAS_SIN_TOCAR) porRevisar.push(fila);
      else {
        const entra = sumarDias(fila.desde!, DIAS_SIN_TOCAR + 1);
        if (!proxima || entra < proxima.entra)
          proxima = { codigo: p.codigo, nombre: p.nombre, entra };
      }
    } else if (p.estado === "pausado") {
      const dias = p.pausadoEn ? diasCivilesDesde(p.pausadoEn, ahora) : null;
      if (dias === null || dias > DIAS_SIN_TOCAR)
        pausados.push({
          codigo: p.codigo,
          dias,
          desde: p.pausadoEn ? diaCivilDeColombia(p.pausadoEn) : null,
          datoIncompleto: dias === null,
          motivoPausa: p.motivoPausa,
        });
    }
  }
  porConfirmar.sort(masAntiguoPrimero);
  porRevisar.sort(masAntiguoPrimero);
  pausados.sort(masAntiguoPrimero);
  const pendientes = porConfirmar.length + porRevisar.length;
  return {
    porConfirmar,
    porRevisar,
    pausados,
    vacia: pendientes + pausados.length === 0,
    publicados,
    alDia: publicados - pendientes,
    proxima,
  };
}
