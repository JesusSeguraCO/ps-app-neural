// Máquina de estados del perfil (diseño §2): todo nace en borrador; revocar el consentimiento saca de
// publicado en la misma operación (HU-127); archivar es idempotente. Tabla exhaustiva estado × acción.
import { describe, expect, it } from "vitest";
import {
  ESTADO_INICIAL,
  esVisibleEnPortal,
  transicion,
  type Accion,
  type EstadoAlmacenado,
} from "./estados";

const ESTADOS: EstadoAlmacenado[] = ["borrador", "publicado", "pausado", "archivado", "colocado"];
const ACCIONES: Accion[] = [
  "publicar",
  "pausar",
  "reactivar",
  "archivar",
  "revocar_consentimiento",
  "a_borrador",
];

// [estado][acción] → estado resultante, «·» = sin cambio legal, «×» = inválida, «=» = ya archivado.
const TABLA: Record<EstadoAlmacenado, Record<Accion, string>> = {
  borrador: {
    publicar: "publicado",
    pausar: "×",
    reactivar: "×",
    archivar: "archivado",
    revocar_consentimiento: "·borrador",
    a_borrador: "×",
  },
  publicado: {
    publicar: "×",
    pausar: "pausado",
    reactivar: "×",
    archivar: "archivado",
    revocar_consentimiento: "borrador",
    a_borrador: "borrador",
  },
  pausado: {
    publicar: "publicado",
    pausar: "×",
    reactivar: "publicado",
    archivar: "archivado",
    revocar_consentimiento: "borrador",
    a_borrador: "×",
  },
  archivado: {
    publicar: "×",
    pausar: "×",
    reactivar: "×",
    archivar: "=",
    revocar_consentimiento: "·archivado",
    a_borrador: "×",
  },
  colocado: {
    publicar: "×",
    pausar: "pausado",
    reactivar: "×",
    archivar: "archivado",
    revocar_consentimiento: "borrador",
    a_borrador: "borrador",
  },
};

describe("máquina de estados del perfil", () => {
  it("un perfil nuevo nace en borrador (HU-125)", () => {
    expect(ESTADO_INICIAL).toBe("borrador");
  });

  it.each(ESTADOS.flatMap((e) => ACCIONES.map((a) => [e, a] as const)))(
    "%s + %s",
    (estado, accion) => {
      const r = transicion(estado, accion);
      const esperado = TABLA[estado][accion];
      if (esperado === "×") expect(r).toEqual({ ok: false, motivo: "transicion_invalida" });
      else if (esperado === "=") expect(r).toEqual({ ok: false, motivo: "ya_archivado" });
      else if (esperado.startsWith("·"))
        expect(r).toEqual({ ok: true, a: esperado.slice(1), cambia: false });
      else expect(r).toEqual({ ok: true, a: esperado, cambia: true });
    },
  );

  it("revocar el consentimiento de un publicado lo saca del portal (HU-127)", () => {
    const r = transicion("publicado", "revocar_consentimiento");
    expect(r.ok && r.a).toBe("borrador");
    expect(esVisibleEnPortal("publicado", true)).toBe(true);
    expect(esVisibleEnPortal("borrador", false)).toBe(false);
    expect(esVisibleEnPortal("publicado", false)).toBe(false);
  });
});
