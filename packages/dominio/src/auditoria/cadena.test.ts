import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  compromisoDeValor,
  contenidoCanonico,
  descifrarValor,
  cifrarValor,
  desenvolverClave,
  envolverClave,
  hashDeFila,
  type FilaAuditada,
} from "./cadena";

const fila: FilaAuditada = {
  seq: 7,
  tramo: 1,
  actor: "ana@trycore.com",
  entidad: "enlaces",
  entidadId: "e-1",
  campo: "estado",
  titular: "sistema",
  antesHmac: Buffer.from("aa", "hex"),
  despuesHmac: Buffer.from("bb", "hex"),
  origen: "panel",
  cuando: new Date("2026-09-28T12:00:00.000Z"),
};

describe("hash encadenado (ADR-0003 H1, H42)", () => {
  const clave = "k".repeat(48);
  const anterior = Buffer.alloc(32, 1);

  it("el contenido canónico cubre metadatos y compromisos, no los valores en claro", () => {
    const c = contenidoCanonico(fila);
    expect(c).toBe(
      JSON.stringify([
        7,
        1,
        "ana@trycore.com",
        "enlaces",
        "e-1",
        "estado",
        "sistema",
        "aa",
        "bb",
        "panel",
        "2026-09-28T12:00:00.000Z",
      ]),
    );
  });

  it("depende del hash anterior (encadenado) y de cada campo", () => {
    const h = hashDeFila(clave, anterior, fila);
    expect(h.length).toBe(32);
    expect(hashDeFila(clave, Buffer.alloc(32, 2), fila).equals(h)).toBe(false);
    expect(hashDeFila(clave, anterior, { ...fila, actor: "otra@trycore.com" }).equals(h)).toBe(
      false,
    );
    expect(hashDeFila(clave, anterior, { ...fila, seq: 8 }).equals(h)).toBe(false);
    expect(hashDeFila("otra".repeat(12), anterior, fila).equals(h)).toBe(false);
  });

  it("un valor nulo tiene compromiso nulo", () => {
    expect(compromisoDeValor(randomBytes(32), null)).toBeNull();
    expect(compromisoDeValor(randomBytes(32), "x")?.length).toBe(32);
  });
});

describe("valores cifrados con la clave del titular (AES-256-GCM)", () => {
  const kek = "e".repeat(48);

  it("envolver y desenvolver la clave del titular con AUDIT_KEK", () => {
    const clave = randomBytes(32);
    const envuelta = envolverClave(kek, clave);
    expect(envuelta.equals(clave)).toBe(false);
    expect(desenvolverClave(kek, envuelta).equals(clave)).toBe(true);
    expect(() => desenvolverClave("z".repeat(48), envuelta)).toThrow();
  });

  it("cifrar y descifrar un valor; nulo se queda nulo; manipulado falla", () => {
    const clave = randomBytes(32);
    const c = cifrarValor(clave, "revocado")!;
    expect(descifrarValor(clave, c)).toBe("revocado");
    expect(cifrarValor(clave, null)).toBeNull();
    c.writeUInt8(c.readUInt8(c.length - 1) ^ 1, c.length - 1);
    expect(() => descifrarValor(clave, c)).toThrow();
  });
});
