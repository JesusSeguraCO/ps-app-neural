// Coherencia entre estado y disponibilidad (HU-134; matriz D5 corregida del sponsor, 2026-09-30;
// RF-8.14.3, RF-8.14.4; D32). Pura, con la fecha civil de Bogotá. Una sola regla para el listado, el
// bloqueo al publicar, la bandeja y la vista previa de importación.
//  - ALTA (bloquea publicar, rojo): pausado o archivado con cualquier disponibilidad; colocado con
//    «Disponible ahora»; publicado sin ninguna disponibilidad. Colocado con fecha es coherente.
//  - MEDIA (advierte sin bloquear): publicado con la fecha ya pasada; publicado sin actualizar hace más
//    de 30 días. Si además el portal ya lo muestra «por confirmar» (RF-8.14.4), se dice.
// «Fecha ya pasada» es la que era futura el día en que se actualizó y hoy ya pasó: «Disponible ahora»
// se guarda como la fecha de ese día y no vence (D32). La fecha de liberación de un colocado que ya
// pasó es una fecha vencida, no un «Disponible ahora» elegido.
// Cualquier otra combinación no es incoherencia.
import { bandaDeDisponibilidad } from "../catalogo/banda";
import { fechaCivil } from "../fecha/colombia";
import type { EstadoAlmacenado } from "./estados";
import { ETIQUETA_BANDA_PANEL } from "./perfil";
import { diaCivilDeColombia, diasCivilesDesde } from "./vigencia";

export type ClaseDisponibilidad = "ninguna" | "ahora" | "con_fecha";

export type ClaveIncoherencia =
  | "pausado_con_disponibilidad"
  | "archivado_con_disponibilidad"
  | "colocado_disponible_ahora"
  | "publicado_sin_disponibilidad"
  | "por_confirmar"
  | "fecha_vencida"
  | "sin_actualizar";

export interface Incoherencia {
  severidad: "alta" | "media";
  clave: ClaveIncoherencia;
  contradiccion: string;
  // El portal ya lo muestra «Disponibilidad por confirmar» (RF-8.14.4).
  porConfirmar: boolean;
}

export interface EntradaCoherencia {
  estado: EstadoAlmacenado;
  // Publicado con una colocación vigente (tras el contract del sub-slice 9 el colocado es esto).
  colocadoVigente: boolean;
  fecha: string | null;
  actualizadaEn: Date | null;
}

export function clasificarDisponibilidad(fecha: string | null, ahora: Date): ClaseDisponibilidad {
  if (!fecha) return "ninguna";
  return fecha <= diaCivilDeColombia(ahora) ? "ahora" : "con_fecha";
}

const UMBRAL_DIAS = 30;

export function evaluarCoherencia(p: EntradaCoherencia, ahora: Date): Incoherencia | null {
  if (p.estado === "borrador") return null;
  const clase = clasificarDisponibilidad(p.fecha, ahora);
  const banda = bandaDeDisponibilidad({ fecha: p.fecha, actualizadaEn: p.actualizadaEn }, ahora);
  const etiqueta = clase === "ahora" ? ETIQUETA_BANDA_PANEL.inmediato : ETIQUETA_BANDA_PANEL[banda];
  const alta = (clave: ClaveIncoherencia, contradiccion: string): Incoherencia => ({
    severidad: "alta",
    clave,
    contradiccion,
    porConfirmar: false,
  });

  if (p.estado === "pausado" || p.estado === "archivado") {
    if (clase === "ninguna") return null;
    return p.estado === "pausado"
      ? alta(
          "pausado_con_disponibilidad",
          `Pausado y con disponibilidad «${etiqueta}». Si está ocupado hasta una fecha, no es una pausa: debe seguir publicado con esa disponibilidad.`,
        )
      : alta(
          "archivado_con_disponibilidad",
          `Archivado y con disponibilidad «${etiqueta}». Un perfil fuera del banco no tiene disponibilidad.`,
        );
  }

  // Publicado (o el `colocado` almacenado, que se lee como publicado).
  if (clase === "ninguna")
    return alta(
      "publicado_sin_disponibilidad",
      "Publicado sin ninguna disponibilidad: el cliente no puede saber cuándo arranca.",
    );
  const media = (clave: ClaveIncoherencia, contradiccion: string): Incoherencia => ({
    severidad: "media",
    clave,
    contradiccion,
    porConfirmar: clave === "por_confirmar",
  });
  const dias = p.actualizadaEn ? diasCivilesDesde(p.actualizadaEn, ahora) : null;
  const vencida =
    clase === "ahora" &&
    p.fecha! < diaCivilDeColombia(ahora) &&
    p.actualizadaEn !== null &&
    p.fecha! > diaCivilDeColombia(p.actualizadaEn);

  if ((p.estado === "colocado" || p.colocadoVigente) && clase === "ahora" && !vencida)
    return alta(
      "colocado_disponible_ahora",
      "Colocado y con «Disponible ahora». Un colocado siempre muestra su fecha de liberación.",
    );

  if (banda === "por_confirmar")
    return media(
      "por_confirmar",
      dias === null
        ? "No tiene registrada la fecha de su última actualización: el portal lo muestra como «Disponibilidad por confirmar». Sigue publicado."
        : `${vencida ? "La fecha en que quedaba libre ya pasó y lleva" : "Lleva"} ${dias} días sin actualizar: el portal lo muestra como «Disponibilidad por confirmar». Sigue publicado.`,
    );
  if (dias !== null && dias > UMBRAL_DIAS)
    return media(
      "sin_actualizar",
      `Lleva ${dias} días sin actualizar la disponibilidad. Sigue publicado.`,
    );
  if (vencida)
    return media(
      "fecha_vencida",
      `La fecha en que quedaba libre (${fechaCivil(p.fecha!)}) ya pasó. Sigue publicado: confírmala o cámbiala.`,
    );
  return null;
}
