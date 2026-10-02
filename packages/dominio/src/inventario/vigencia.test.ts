// Bandeja de vigencia (HU-136; HU-133 umbrales; RF-8.14; V3-4). Pura, con la fecha civil de Bogotá:
// publicados sin actualizar hace más de 30 días ordenados del más antiguo al más reciente, los que el
// cliente ya ve «por confirmar» al principio, sin fecha de actualización como «dato incompleto» (nunca
// omitido), y pausados hace más de 30 días con su motivo y desde cuándo. 31 días entra; 30 no.
import { describe, expect, it } from "vitest";
import { bandejaDeVigencia, diasCivilesDesde, type PerfilVigencia } from "./vigencia";

// 1 oct 2026, 10:00 en Bogotá.
const ahora = new Date("2026-10-01T15:00:00Z");
const hace = (dias: number, hora = "15:00:00Z") => {
  const d = new Date(`2026-10-01T${hora}`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d;
};
const base: PerfilVigencia = {
  codigo: "PS-0001",
  nombre: "Laura Méndez",
  estado: "publicado",
  disponibilidadFecha: "2026-11-15",
  disponibilidadActualizadaEn: hace(1),
  pausadoEn: null,
  motivoPausa: null,
};
const p = (codigo: string, x: Partial<PerfilVigencia>): PerfilVigencia => ({
  ...base,
  codigo,
  ...x,
});

describe("diasCivilesDesde", () => {
  it("cuenta días civiles de Bogotá, no horas", () => {
    expect(diasCivilesDesde(hace(31), ahora)).toBe(31);
    expect(diasCivilesDesde(hace(0, "05:01:00Z"), ahora)).toBe(0);
  });

  it("V3-4: a las 19:30 de Bogotá (00:30 UTC del día siguiente) el día aún no cambia", () => {
    const tarde = new Date("2026-10-02T00:30:00Z");
    // Actualizado el 1 sep a las 10:00 de Bogotá: el 1 oct son 30 días; por UTC serían 31.
    expect(diasCivilesDesde(new Date("2026-09-01T15:00:00Z"), tarde)).toBe(30);
    expect(
      diasCivilesDesde(new Date("2026-09-01T15:00:00Z"), new Date("2026-10-02T05:00:00Z")),
    ).toBe(31);
  });
});

describe("bandejaDeVigencia", () => {
  it("publicados con más de 30 días sin actualizar, del más antiguo al más reciente; 30 días no entra", () => {
    const b = bandejaDeVigencia(
      [
        p("PS-0030", { disponibilidadActualizadaEn: hace(30) }),
        p("PS-0031", { disponibilidadActualizadaEn: hace(31) }),
        p("PS-0080", { disponibilidadActualizadaEn: hace(80) }),
        p("PS-0002", { disponibilidadActualizadaEn: hace(2) }),
      ],
      ahora,
    );
    expect(b.porRevisar.map((x) => [x.codigo, x.dias])).toEqual([
      ["PS-0080", 80],
      ["PS-0031", 31],
    ]);
    expect(b.porConfirmar).toEqual([]);
  });

  it("lo que el cliente ya ve «por confirmar» va al principio, en su propio grupo", () => {
    const b = bandejaDeVigencia(
      [
        p("PS-0040", { disponibilidadActualizadaEn: hace(40) }),
        p("PS-0046", { disponibilidadFecha: "2026-09-20", disponibilidadActualizadaEn: hace(46) }),
      ],
      ahora,
    );
    expect(b.porConfirmar.map((x) => x.codigo)).toEqual(["PS-0046"]);
    expect(b.porRevisar.map((x) => x.codigo)).toEqual(["PS-0040"]);
  });

  it("sin fecha de actualización: «dato incompleto», en la bandeja y nunca como al día", () => {
    const b = bandejaDeVigencia([p("PS-0118", { disponibilidadActualizadaEn: null })], ahora);
    expect(b.porRevisar).toEqual([
      expect.objectContaining({ codigo: "PS-0118", datoIncompleto: true, dias: null }),
    ]);
    expect(b.alDia).toBe(0);
  });

  it("pausados hace más de 30 días con motivo, desde cuándo y los días; 30 días no entra", () => {
    const b = bandejaDeVigencia(
      [
        p("PS-0217", {
          estado: "pausado",
          pausadoEn: hace(41),
          motivoPausa: "En licencia o ausencia temporal",
        }),
        p("PS-0047", {
          estado: "pausado",
          pausadoEn: hace(64),
          motivoPausa: "Decisión de Talento Humano",
        }),
        p("PS-0030", {
          estado: "pausado",
          pausadoEn: hace(30),
          motivoPausa: "Decisión de Talento Humano",
        }),
      ],
      ahora,
    );
    expect(b.pausados.map((x) => [x.codigo, x.dias, x.motivoPausa, x.desde])).toEqual([
      ["PS-0047", 64, "Decisión de Talento Humano", "2026-07-29"],
      ["PS-0217", 41, "En licencia o ausencia temporal", "2026-08-21"],
    ]);
  });

  it("borradores y archivados no cuentan; un publicado sí (también el colocado, que sigue publicado)", () => {
    const b = bandejaDeVigencia(
      [
        p("PS-0001", { estado: "borrador", disponibilidadActualizadaEn: hace(90) }),
        p("PS-0002", { estado: "archivado", disponibilidadActualizadaEn: hace(90) }),
        p("PS-0003", { estado: "publicado", disponibilidadActualizadaEn: hace(90) }),
      ],
      ahora,
    );
    expect(b.porRevisar.map((x) => x.codigo)).toEqual(["PS-0003"]);
  });

  it("vacía: lo dice, cuenta los publicados al día y quién entra primero y cuándo", () => {
    const b = bandejaDeVigencia(
      [
        p("PS-0010", { disponibilidadActualizadaEn: hace(10) }),
        p("PS-0020", { nombre: "Valentina Gómez", disponibilidadActualizadaEn: hace(20) }),
      ],
      ahora,
    );
    expect(b.vacia).toBe(true);
    expect(b.alDia).toBe(2);
    expect(b.publicados).toBe(2);
    expect(b.proxima).toEqual({
      codigo: "PS-0020",
      nombre: "Valentina Gómez",
      entra: "2026-10-12",
    });
  });
});
