// Frontera `hubspot-api` · contactoDeCuenta (HU-122, ADR-0005/0009): solo lectura, con timeout;
// cualquier fallo es «desconocido» y el dominio deja escribir los invitados a mano.
import { describe, expect, it } from "vitest";
import { DobleHubspot, lectorHubspot } from "./index";

const respuesta = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json" } });

describe("lectorHubspot.contactoDeCuenta", () => {
  it("con contacto: lee las asociaciones de la empresa y los correos de sus contactos", async () => {
    const llamadas: Array<{ url: string; init?: RequestInit }> = [];
    const f = (async (url: string, init?: RequestInit) => {
      llamadas.push({ url, init });
      if (url.includes("/associations/contacts"))
        return respuesta(200, { results: [{ toObjectId: 11 }, { toObjectId: 12 }] });
      return respuesta(200, {
        results: [
          { id: "11", properties: { email: "Lider@Cliente.com" } },
          { id: "12", properties: { email: null } },
        ],
      });
    }) as typeof fetch;
    const r = await lectorHubspot({ token: "t".repeat(40), fetch: f }).contactoDeCuenta("987");
    expect(r).toEqual({ estado: "con_contacto", correos: ["lider@cliente.com"] });
    expect(llamadas[0]!.url).toBe("https://api.hubapi.com/crm/v4/objects/companies/987/associations/contacts?limit=10");
    expect((llamadas[0]!.init!.headers as Record<string, string>).authorization).toBe(`Bearer ${"t".repeat(40)}`);
    expect(llamadas[1]!.init!.method).toBe("POST");
  });

  it("sin contacto asociado → sin_contacto, sin segunda llamada", async () => {
    let n = 0;
    const f = (async () => {
      n++;
      return respuesta(200, { results: [] });
    }) as unknown as typeof fetch;
    expect(await lectorHubspot({ token: "t".repeat(40), fetch: f }).contactoDeCuenta("987")).toEqual({ estado: "sin_contacto" });
    expect(n).toBe(1);
  });

  it.each([
    ["500", async () => respuesta(500, {})],
    ["429", async () => respuesta(429, {})],
    ["red caída", async () => { throw new TypeError("fetch failed"); }],
    ["JSON inesperado", async () => respuesta(200, { otra: "cosa" })],
  ])("%s → desconocido", async (_caso, impl) => {
    const r = await lectorHubspot({ token: "t".repeat(40), fetch: impl as unknown as typeof fetch }).contactoDeCuenta("987");
    expect(r).toEqual({ estado: "desconocido" });
  });

  it("excede el tiempo → desconocido, sin esperar más del límite", async () => {
    const f = ((_url: string, init?: RequestInit) =>
      new Promise((_, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("t", "TimeoutError"))))) as typeof fetch;
    const t0 = Date.now();
    const r = await lectorHubspot({ token: "t".repeat(40), fetch: f, timeoutMs: 200 }).contactoDeCuenta("987");
    expect(r).toEqual({ estado: "desconocido" });
    expect(Date.now() - t0).toBeLessThan(1_000);
  });

  it("una cuenta con caracteres raros no se interpola en la URL", async () => {
    const r = await lectorHubspot({ token: "t".repeat(40), fetch: (async () => respuesta(200, {})) as unknown as typeof fetch }).contactoDeCuenta("1/../x");
    expect(r).toEqual({ estado: "desconocido" });
  });
});

describe("DobleHubspot (DOBLES=hubspot)", () => {
  it("sirve los tres estados según la cuenta", async () => {
    const d = new DobleHubspot();
    expect(await d.contactoDeCuenta("hs-con-contacto")).toEqual({ estado: "con_contacto", correos: ["contacto@cliente-ficticio.com"] });
    expect(await d.contactoDeCuenta("hs-sin-contacto")).toEqual({ estado: "sin_contacto" });
    expect(await d.contactoDeCuenta("hs-caido")).toEqual({ estado: "desconocido" });
  });
});
