import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { VIGENCIA_POR_OMISION_DIAS, crearEnlace, generarTokenEnlace, type EstadoPublico } from "./crear";

const AHORA = new Date("2026-09-28T15:00:00Z");
const ESTADOS = new Map<string, EstadoPublico>([
  ["PS-0142", "disponible"],
  ["PS-0201", "disponible"],
  ["PS-0230", "disponible"],
  ["PS-0160", "fuera_del_banco"],
  ["PS-0151", "pausado"],
]);
const base = {
  cuenta: { ref: "hs-123", nombre: "Bancolombia" },
  proyecto: "Modernización de pagos",
  razon: "Equipo para el core de pagos: backend, QA y DevOps",
  codigos: ["PS-0142", "PS-0201", "PS-0230"],
  invitados: ["lider@bancolombia.com.co"],
};

describe("crearEnlace (HU-122, RF-19.4)", () => {
  it("happy: selección heterogénea → lista explícita de esos códigos y 30 días por omisión", () => {
    const r = crearEnlace(base, ESTADOS, AHORA);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.enlace.codigos).toEqual(["PS-0142", "PS-0201", "PS-0230"]);
    expect(r.enlace.vigenteHasta.getTime() - AHORA.getTime()).toBe(VIGENCIA_POR_OMISION_DIAS * 86_400_000);
    expect(r.enlace).toMatchObject({ cuentaRef: "hs-123", cuentaNombre: "Bancolombia", razon: base.razon });
  });

  it("la vigencia es editable", () => {
    const r = crearEnlace({ ...base, vigenciaDias: 45 }, ESTADOS, AHORA);
    expect(r.ok && (r.enlace.vigenteHasta.getTime() - AHORA.getTime()) / 86_400_000).toBe(45);
  });

  it.each([0, -1, 1.5, 366])("una vigencia de %s días no es válida", (vigenciaDias) => {
    const r = crearEnlace({ ...base, vigenciaDias }, ESTADOS, AHORA);
    expect(!r.ok && r.errores.map((e) => e.tipo)).toEqual(["vigencia_invalida"]);
  });

  it("error: sin razón no se emite y explica que sería un catálogo, no una curaduría", () => {
    const r = crearEnlace({ ...base, razon: "   " }, ESTADOS, AHORA);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errores).toEqual([
      { tipo: "sin_razon", mensaje: "Sin razón, el cliente recibe un catálogo y no una curaduría. Escribe por qué elegiste estos perfiles." },
    ]);
  });

  it("error: un perfil sin publicar → dice cuál y no emite", () => {
    const r = crearEnlace({ ...base, codigos: ["PS-0142", "PS-0160", "PS-0151"] }, ESTADOS, AHORA);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errores).toEqual([
      { tipo: "no_publicado", codigos: ["PS-0160", "PS-0151"], mensaje: "PS-0160 y PS-0151 no están publicados: quítalos de la selección o publícalos antes." },
    ]);
  });

  it("un código que no existe cuenta como no publicado", () => {
    const r = crearEnlace({ ...base, codigos: ["PS-9999"] }, ESTADOS, AHORA);
    expect(!r.ok && r.errores[0]).toMatchObject({ tipo: "no_publicado", codigos: ["PS-9999"] });
  });

  it("edge: contacto del CRM más otro invitado → ambos, normalizados y sin duplicar", () => {
    const r = crearEnlace(
      { ...base, invitados: ["Lider@Bancolombia.com.co", "arquitecto@bancolombia.com.co", " lider@bancolombia.com.co "] },
      ESTADOS,
      AHORA,
    );
    expect(r.ok && r.enlace.invitados).toEqual(["lider@bancolombia.com.co", "arquitecto@bancolombia.com.co"]);
  });

  it("edge: ningún correo invitado → no emite y lo indica", () => {
    const r = crearEnlace({ ...base, invitados: [] }, ESTADOS, AHORA);
    expect(!r.ok && r.errores).toEqual([
      { tipo: "sin_invitados", mensaje: "El enlace necesita al menos un correo invitado." },
    ]);
  });

  it("un correo mal escrito se señala sin emitir", () => {
    const r = crearEnlace({ ...base, invitados: ["lider@bancolombia", "ok@cliente.com"] }, ESTADOS, AHORA);
    expect(!r.ok && r.errores[0]).toMatchObject({ tipo: "correo_invalido", correos: ["lider@bancolombia"] });
  });

  it("sin cuenta destinataria no se emite (RF-19.4)", () => {
    const r = crearEnlace({ ...base, cuenta: null }, ESTADOS, AHORA);
    expect(!r.ok && r.errores.map((e) => e.tipo)).toEqual(["sin_cuenta"]);
  });

  it("junta todos los errores a la vez para corregirlos de una", () => {
    const r = crearEnlace({ ...base, razon: "", invitados: [], codigos: ["PS-0160"] }, ESTADOS, AHORA);
    expect(!r.ok && r.errores.map((e) => e.tipo)).toEqual(["sin_razon", "no_publicado", "sin_invitados"]);
  });

  it("una selección vacía es un enlace sin selección, válido (HU-093)", () => {
    const r = crearEnlace({ ...base, codigos: [] }, ESTADOS, AHORA);
    expect(r.ok && r.enlace.codigos).toEqual([]);
  });

  it("los códigos repetidos se guardan una vez, en el orden elegido", () => {
    const r = crearEnlace({ ...base, codigos: ["PS-0230", "PS-0142", "PS-0230"] }, ESTADOS, AHORA);
    expect(r.ok && r.enlace.codigos).toEqual(["PS-0230", "PS-0142"]);
  });
});

describe("token del enlace (H9)", () => {
  it("32 bytes aleatorios en base64url; en BD solo su SHA-256", () => {
    const a = generarTokenEnlace();
    const b = generarTokenEnlace();
    expect(Buffer.from(a.token, "base64url")).toHaveLength(32);
    expect(a.token).not.toBe(b.token);
    expect(a.hash.equals(createHash("sha256").update(a.token).digest())).toBe(true);
    expect(a.hash.toString("hex")).not.toContain(Buffer.from(a.token, "base64url").toString("hex"));
  });
});
