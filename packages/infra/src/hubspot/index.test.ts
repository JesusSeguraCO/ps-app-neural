// Adaptador HubSpot de solo lectura `estadoDeEmpresa` (HU-092, design §3): por id si el enlace lo
// tiene, si no por nombre exacto con una sola coincidencia. Cualquier fallo → «desconocido» (el dominio
// lo trata como fallo cerrado). Probado con un `fetch` simulado que registra las peticiones.
import { describe, expect, it } from "vitest";
import { DobleHubspot, consultaHubspot } from "./index";

type Llamada = { url: string; init: RequestInit };

function fetchFalso(respuestas: Array<(l: Llamada) => Response | Promise<Response>>) {
  const llamadas: Llamada[] = [];
  const f = (async (url: string, init: RequestInit = {}) => {
    const l = { url: String(url), init };
    llamadas.push(l);
    const r = respuestas.shift();
    if (!r) throw new Error("llamada inesperada");
    return r(l);
  }) as typeof fetch;
  return { f, llamadas };
}

const json = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json" } });

const base = { token: "pat-na1-x", propiedad: "lifecyclestage", valorActiva: "customer", timeoutMs: 50 };

describe("consultaHubspot.estadoDeEmpresa", () => {
  it("por id: empresa activa con propietario → activa + correo del propietario", async () => {
    const { f, llamadas } = fetchFalso([
      () => json(200, { id: "123", properties: { lifecyclestage: "customer", hubspot_owner_id: "77" } }),
      () => json(200, { id: "77", email: "comercial@trycore.com" }),
    ]);
    const r = await consultaHubspot({ ...base, fetch: f }).estadoDeEmpresa({ id: "123", nombre: "Bancolombia" });
    expect(r).toEqual({ estado: "activa", propietario: "comercial@trycore.com" });
    expect(llamadas[0]!.url).toBe(
      "https://api.hubapi.com/crm/v3/objects/companies/123?properties=lifecyclestage,hubspot_owner_id",
    );
    expect(new Headers(llamadas[0]!.init.headers).get("authorization")).toBe("Bearer pat-na1-x");
    expect(llamadas[0]!.init.method ?? "GET").toBe("GET");
    expect(llamadas[1]!.url).toBe("https://api.hubapi.com/crm/v3/owners/77");
  });

  it("por nombre exacto con una sola coincidencia", async () => {
    const { f, llamadas } = fetchFalso([
      () => json(200, { total: 1, results: [{ id: "9", properties: { lifecyclestage: "lead", hubspot_owner_id: null } }] }),
    ]);
    const r = await consultaHubspot({ ...base, fetch: f }).estadoDeEmpresa({ id: null, nombre: " Bancolombia " });
    expect(r).toEqual({ estado: "inactiva", propietario: null });
    expect(llamadas[0]!.url).toBe("https://api.hubapi.com/crm/v3/objects/companies/search");
    expect(llamadas[0]!.init.method).toBe("POST");
    expect(JSON.parse(String(llamadas[0]!.init.body))).toEqual({
      filterGroups: [{ filters: [{ propertyName: "name", operator: "EQ", value: "Bancolombia" }] }],
      properties: ["lifecyclestage", "hubspot_owner_id"],
      limit: 2,
    });
  });

  it.each([
    ["ninguna coincidencia por nombre", [() => json(200, { total: 0, results: [] })]],
    ["dos empresas con el mismo nombre", [() => json(200, { total: 2, results: [{ id: "1", properties: {} }, { id: "2", properties: {} }] })]],
    ["HubSpot responde 500", [() => json(500, {})]],
    ["HubSpot responde 429", [() => json(429, {})]],
    ["error de red", [() => Promise.reject(new TypeError("fetch failed"))]],
    ["no responde a tiempo", [(l: Llamada) => new Promise<Response>((_, rej) => l.init.signal?.addEventListener("abort", () => rej(new DOMException("t", "TimeoutError"))))]],
    ["cuerpo ilegible", [() => new Response("<html>", { status: 200 })]],
  ])("%s → desconocido", async (_c, respuestas) => {
    const { f } = fetchFalso(respuestas as Array<(l: Llamada) => Response | Promise<Response>>);
    const r = await consultaHubspot({ ...base, fetch: f }).estadoDeEmpresa({ id: null, nombre: "Bancolombia" });
    expect(r).toEqual({ estado: "desconocido" });
  });

  it("el propietario no se puede leer → sigue la decisión con propietario nulo", async () => {
    const { f } = fetchFalso([
      () => json(200, { id: "5", properties: { lifecyclestage: "customer", hubspot_owner_id: "8" } }),
      () => json(404, {}),
    ]);
    const r = await consultaHubspot({ ...base, fetch: f }).estadoDeEmpresa({ id: "5", nombre: "X" });
    expect(r).toEqual({ estado: "activa", propietario: null });
  });
});

describe("DobleHubspot (CI y local)", () => {
  it("devuelve el estado sembrado por nombre, «desconocido» si se declaró sin respuesta o no existe", async () => {
    const d = new DobleHubspot({
      Bancolombia: { estado: "activa", propietario: "c@trycore.com" },
      Nutresa: { estado: "inactiva", propietario: "p@trycore.com" },
      Caida: "sin_respuesta",
    });
    expect(await d.estadoDeEmpresa({ id: null, nombre: "Bancolombia" })).toEqual({ estado: "activa", propietario: "c@trycore.com" });
    expect(await d.estadoDeEmpresa({ id: null, nombre: "Nutresa" })).toEqual({ estado: "inactiva", propietario: "p@trycore.com" });
    expect(await d.estadoDeEmpresa({ id: null, nombre: "Caida" })).toEqual({ estado: "desconocido" });
    expect(await d.estadoDeEmpresa({ id: null, nombre: "Otra" })).toEqual({ estado: "desconocido" });
    expect(d.consultas).toEqual(["Bancolombia", "Nutresa", "Caida", "Otra"]);
  });
});
