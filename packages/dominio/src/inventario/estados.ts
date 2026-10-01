// Máquina de estados del perfil (diseño §2; RF-8.3, ADR-0003). Pura: dice si una transición es legal
// y con qué efecto; la escritura la hace `ServicioPerfiles`, única vía para panel, importación,
// reversión, fusión, colocados y revocación. Las guardas de publicar (consentimiento, modalidad de
// prueba, obligatorios) se evalúan con `evaluarPublicacion` y las aplica el sub-slice de HU-128.
//
// `colocado` no es un estado (RF-8.3, RF-8.13.2; contract 0021 del sub-slice 9): el colocado sigue
// publicado y su asignación vive en `colocaciones`.

export const ESTADOS_PERFIL = ["borrador", "publicado", "pausado", "archivado"] as const;
export type EstadoPerfil = (typeof ESTADOS_PERFIL)[number];
// Lo que guarda la BD: desde la 0021, exactamente los cuatro estados.
export type EstadoAlmacenado = EstadoPerfil;

export const ETIQUETA_ESTADO: Record<EstadoAlmacenado, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  pausado: "Pausado",
  archivado: "Archivado",
};

// Todo perfil nuevo nace en borrador, venga del panel o de la importación (HU-125, HU-128 edge).
export const ESTADO_INICIAL: EstadoPerfil = "borrador";

export type Accion =
  "publicar" | "pausar" | "reactivar" | "archivar" | "revocar_consentimiento" | "a_borrador";

export type ResultadoTransicion =
  | { ok: true; a: EstadoPerfil; cambia: boolean }
  | { ok: false; motivo: "transicion_invalida" | "ya_archivado" };

const visible = (e: EstadoAlmacenado) => e === "publicado";

export function transicion(de: EstadoAlmacenado, accion: Accion): ResultadoTransicion {
  switch (accion) {
    case "publicar":
      return de === "borrador" || de === "pausado"
        ? { ok: true, a: "publicado", cambia: true }
        : { ok: false, motivo: "transicion_invalida" };
    case "pausar":
      return visible(de)
        ? { ok: true, a: "pausado", cambia: true }
        : { ok: false, motivo: "transicion_invalida" };
    case "reactivar":
      return de === "pausado"
        ? { ok: true, a: "publicado", cambia: true }
        : { ok: false, motivo: "transicion_invalida" };
    case "archivar":
      // Idempotente: archivar lo archivado informa sin escribir (HU-135).
      return de === "archivado"
        ? { ok: false, motivo: "ya_archivado" }
        : { ok: true, a: "archivado", cambia: true };
    case "revocar_consentimiento":
      // Revocar saca de publicado (o de pausado: no puede volver sin consentimiento) en la misma
      // operación (HU-127). Un borrador o un archivado se quedan donde están.
      if (visible(de) || de === "pausado") return { ok: true, a: "borrador", cambia: true };
      return de === "archivado"
        ? { ok: true, a: "archivado", cambia: false }
        : { ok: true, a: "borrador", cambia: false };
    case "a_borrador":
      // Respuesta «paso el perfil a borrador» a la pregunta D1 de HU-126.
      return visible(de)
        ? { ok: true, a: "borrador", cambia: true }
        : { ok: false, motivo: "transicion_invalida" };
  }
}

export function esVisibleEnPortal(
  estado: EstadoAlmacenado,
  consentimientoVigente: boolean,
): boolean {
  return visible(estado) && consentimientoVigente;
}
