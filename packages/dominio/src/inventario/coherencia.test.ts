// Coherencia entre estado y disponibilidad (HU-134; matriz D5 corregida; RF-8.14.3, RF-8.14.4). Pura,
// con la fecha civil de Bogotá. Las dos tablas de D5 son la matriz completa: cualquier otra combinación
// no es incoherencia. La tabla de verdad recorre estado × colocado × disponibilidad × antigüedad.
import { describe, expect, it } from "vitest";
import { ESTADOS_PERFIL, type EstadoAlmacenado } from "./estados";
import { clasificarDisponibilidad, evaluarCoherencia, type ClaveIncoherencia } from "./coherencia";

// 1 oct 2026, 10:00 en Bogotá.
const ahora = new Date("2026-10-01T15:00:00Z");
const hace = (dias: number) => new Date(ahora.getTime() - dias * 86_400_000);
const HOY = "2026-10-01";

type Disp = "ninguna" | "ahora" | "con_fecha" | "vencida";
// Fecha guardada para cada clase, según cuándo se actualizó: «ahora» es la fecha del día en que se
// actualizó (así la guarda la opción «Disponible ahora»); «vencida» era futura entonces y hoy ya pasó.
const fechaPara = (d: Disp, actualizadaHace: number | null): string | null => {
  const dia = (n: number) =>
    new Date(Date.parse(`${HOY}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);
  if (d === "ninguna") return null;
  if (d === "con_fecha") return "2026-11-15";
  const desde = actualizadaHace ?? 3;
  return d === "ahora" ? dia(desde) : dia(Math.max(1, desde - 5));
};

describe("clasificarDisponibilidad", () => {
  it("ninguna, ahora (hoy o antes), con fecha (después de hoy)", () => {
    expect(clasificarDisponibilidad(null, ahora)).toBe("ninguna");
    expect(clasificarDisponibilidad(HOY, ahora)).toBe("ahora");
    expect(clasificarDisponibilidad("2026-09-20", ahora)).toBe("ahora");
    expect(clasificarDisponibilidad("2026-10-02", ahora)).toBe("con_fecha");
  });
});

describe("evaluarCoherencia · tabla de verdad", () => {
  const estados: EstadoAlmacenado[] = [...ESTADOS_PERFIL];
  const disps: Disp[] = ["ninguna", "ahora", "con_fecha", "vencida"];
  const antiguedades: Array<number | null> = [2, 30, 31, null];

  // Lo que D5 (corregida) y RF-8.14.4 esperan para cada combinación.
  function esperado(
    estado: EstadoAlmacenado,
    colocado: boolean,
    d: Disp,
    dias: number | null,
  ): ClaveIncoherencia | null {
    if (estado === "borrador") return null;
    if (estado === "pausado" || estado === "archivado")
      return d === "ninguna"
        ? null
        : estado === "pausado"
          ? "pausado_con_disponibilidad"
          : "archivado_con_disponibilidad";
    const esColocado = colocado;
    if (d === "ninguna") return "publicado_sin_disponibilidad";
    // Sin fecha de actualización no se distingue una fecha vencida de un «Disponible ahora»: manda la ALTA.
    if (esColocado && (d === "ahora" || (d === "vencida" && dias === null)))
      return "colocado_disponible_ahora";
    const sinTocar = dias === null || dias > 30;
    if ((d === "vencida" || d === "ahora") && sinTocar) return "por_confirmar";
    if (dias === null) return "por_confirmar";
    if (sinTocar) return "sin_actualizar";
    if (d === "vencida") return "fecha_vencida";
    return null;
  }

  for (const estado of estados)
    for (const colocado of [false, true])
      for (const d of disps)
        for (const dias of antiguedades) {
          if (colocado && estado !== "publicado") continue;
          it(`${estado}${colocado ? " + colocación vigente" : ""} · ${d} · ${dias === null ? "sin fecha de actualización" : `${dias} días`}`, () => {
            const r = evaluarCoherencia(
              {
                estado,
                colocadoVigente: colocado,
                fecha: fechaPara(d, dias),
                actualizadaEn: dias === null ? null : hace(dias),
              },
              ahora,
            );
            expect(r?.clave ?? null).toBe(esperado(estado, colocado, d, dias));
          });
        }
});

describe("evaluarCoherencia · severidad y contradicción nombrada", () => {
  const ev = (x: Partial<Parameters<typeof evaluarCoherencia>[0]>) =>
    evaluarCoherencia(
      {
        estado: "publicado",
        colocadoVigente: false,
        fecha: "2026-11-15",
        actualizadaEn: hace(2),
        ...x,
      },
      ahora,
    );

  it("ALTA: pausado con fecha, nombra la disponibilidad y dice que no es una pausa (HU-134 happy, D6)", () => {
    const r = ev({ estado: "pausado", fecha: "2026-10-20" })!;
    expect(r.severidad).toBe("alta");
    expect(r.contradiccion).toBe(
      "Pausado y con disponibilidad «En 1 mes». Si está ocupado hasta una fecha, no es una pausa: debe seguir publicado con esa disponibilidad.",
    );
  });

  it("ALTA: las seis combinaciones de D5 bloquean y nombran la contradicción", () => {
    for (const x of [
      { estado: "pausado" as const, fecha: HOY },
      { estado: "pausado" as const, fecha: "2026-11-15" },
      { estado: "publicado" as const, colocadoVigente: true, fecha: HOY },
      { estado: "archivado" as const, fecha: HOY },
      { estado: "archivado" as const, fecha: "2026-11-15" },
      { estado: "publicado" as const, fecha: null },
    ]) {
      const r = ev(x)!;
      expect(r.severidad, JSON.stringify(x)).toBe("alta");
      expect(r.contradiccion.length).toBeGreaterThan(20);
    }
  });

  it("MEDIA: vencida y más de 30 días → el portal la muestra «por confirmar» y sigue publicado", () => {
    const r = ev({ fecha: "2026-08-20", actualizadaEn: hace(46) })!;
    expect(r).toMatchObject({ severidad: "media", clave: "por_confirmar", porConfirmar: true });
    expect(r.contradiccion).toBe(
      "La fecha en que quedaba libre ya pasó y lleva 46 días sin actualizar: el portal lo muestra como «Disponibilidad por confirmar». Sigue publicado.",
    );
  });

  it("MEDIA: vencida pero actualizada hace 30 días o menos → advertencia de fecha vencida, no «por confirmar»", () => {
    const r = ev({ fecha: "2026-09-28", actualizadaEn: hace(10) })!;
    expect(r).toMatchObject({ severidad: "media", clave: "fecha_vencida", porConfirmar: false });
    expect(r.contradiccion).toBe(
      "La fecha en que quedaba libre (28 sep 2026) ya pasó. Sigue publicado: confírmala o cámbiala.",
    );
  });

  it("MEDIA: más de 30 días sin actualizar con fecha futura", () => {
    const r = ev({ fecha: "2026-12-01", actualizadaEn: hace(31) })!;
    expect(r).toMatchObject({ severidad: "media", clave: "sin_actualizar", porConfirmar: false });
    expect(r.contradiccion).toBe(
      "Lleva 31 días sin actualizar la disponibilidad. Sigue publicado.",
    );
  });

  it("«Disponible ahora» puesto hace días no es una fecha vencida (prototipo: «hace 3 días» sin aviso)", () => {
    expect(ev({ fecha: "2026-09-28", actualizadaEn: new Date("2026-09-28T15:00:00Z") })).toBeNull();
  });

  it("V3-4: los días son civiles de Bogotá (a las 19:30 del 1 oct siguen siendo 30, no 31)", () => {
    const tarde = new Date("2026-10-02T00:30:00Z");
    expect(
      evaluarCoherencia(
        {
          estado: "publicado",
          colocadoVigente: false,
          fecha: "2026-12-01",
          actualizadaEn: new Date("2026-09-01T15:00:00Z"),
        },
        tarde,
      ),
    ).toBeNull();
  });
});
