// Adaptador real de la frontera `otp-mail` (ADR-0009) con un `fetch` falso: lo que sale hacia Mailgun
// y cómo se clasifica la respuesta. El intercambio con Mailgun real se verifica en staging (na aprobado).
import { describe, expect, it } from "vitest";
import { DobleCorreo, REMITENTE, enviadorMailgun, rebotesDelDoble } from "./index";

type Llamada = { url: string; init: RequestInit };

function fetchFalso(respuesta: () => Promise<Response>) {
  const llamadas: Llamada[] = [];
  const f = (async (url: string | URL, init?: RequestInit) => {
    llamadas.push({ url: String(url), init: init ?? {} });
    return respuesta();
  }) as typeof fetch;
  return { f, llamadas };
}

const mensaje = {
  para: "ana@trycore.com",
  asunto: "Tu código",
  texto: "Tu código es 123 456",
  html: "<p>123 456</p>",
  variables: { ambito: "panel" },
};

describe("enviadorMailgun", () => {
  it("envía por la API HTTP de Mailgun: URL del dominio, Basic api:clave, formulario sin seguimiento", async () => {
    const { f, llamadas } = fetchFalso(async () => new Response("{}", { status: 200 }));
    const r = await enviadorMailgun({
      clave: "k-prueba",
      dominio: "people.trycore.com",
      fetch: f,
    }).enviar(mensaje);

    expect(r).toEqual({ resultado: "ok", status: 200 });
    expect(llamadas).toHaveLength(1);
    const { url, init } = llamadas[0]!;
    expect(url).toBe("https://api.mailgun.net/v3/people.trycore.com/messages");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe(
      `Basic ${Buffer.from("api:k-prueba").toString("base64")}`,
    );
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const cuerpo = init.body as URLSearchParams;
    expect(Object.fromEntries(cuerpo)).toEqual({
      from: REMITENTE,
      to: "ana@trycore.com",
      subject: "Tu código",
      text: "Tu código es 123 456",
      html: "<p>123 456</p>",
      "o:tracking": "no",
      "o:tracking-clicks": "no",
      "o:tracking-opens": "no",
      "v:ambito": "panel",
    });
  });

  it("sin html ni variables no manda esos campos; respeta la base configurada", async () => {
    const { f, llamadas } = fetchFalso(async () => new Response("{}", { status: 200 }));
    await enviadorMailgun({
      clave: "k",
      dominio: "d.test",
      base: "https://api.eu.mailgun.net",
      fetch: f,
    }).enviar({
      para: "x@trycore.com",
      asunto: "a",
      texto: "t",
    });
    expect(llamadas[0]!.url).toBe("https://api.eu.mailgun.net/v3/d.test/messages");
    const campos = [...(llamadas[0]!.init.body as URLSearchParams).keys()];
    expect(campos).not.toContain("html");
    expect(campos.some((c) => c.startsWith("v:"))).toBe(false);
  });

  it("4xx es rechazo definitivo; 429 y 5xx son ambiguos (se reintenta)", async () => {
    for (const [status, esperado] of [
      [400, "definitivo"],
      [401, "definitivo"],
      [429, "ambiguo"],
      [500, "ambiguo"],
      [503, "ambiguo"],
    ] as const) {
      const { f } = fetchFalso(async () => new Response("{}", { status }));
      const r = await enviadorMailgun({ clave: "k", dominio: "d", fetch: f }).enviar(mensaje);
      expect(r, String(status)).toEqual({ resultado: esperado, status });
    }
  });

  it("timeout y error de red son ambiguos, sin status", async () => {
    const lento = fetchFalso(
      () =>
        new Promise<Response>((_, rechazar) =>
          setTimeout(() => rechazar(new DOMException("t", "TimeoutError")), 5),
        ),
    );
    expect(
      await enviadorMailgun({ clave: "k", dominio: "d", fetch: lento.f }).enviar(mensaje),
    ).toEqual({
      resultado: "ambiguo",
    });
    const caido = fetchFalso(() => Promise.reject(new TypeError("fetch failed")));
    expect(
      await enviadorMailgun({ clave: "k", dominio: "d", fetch: caido.f }).enviar(mensaje),
    ).toEqual({
      resultado: "ambiguo",
    });
  });

  it("el timeout configurado aborta de verdad la petición", async () => {
    const f = (async (url: string | URL, init?: RequestInit) => {
      return new Promise<Response>((_, rechazar) =>
        init?.signal?.addEventListener("abort", () => rechazar(init.signal!.reason)),
      );
    }) as typeof fetch;
    const r = await enviadorMailgun({ clave: "k", dominio: "d", timeoutMs: 20, fetch: f }).enviar(
      mensaje,
    );
    expect(r).toEqual({ resultado: "ambiguo" });
  });
});

describe("DobleCorreo con buzones que rebotan", () => {
  it("acepta el envío (como Mailgun) pero no lo entrega y avisa del rebote", async () => {
    const entregados: string[] = [];
    const rebotes: string[] = [];
    const doble = new DobleCorreo((m) => entregados.push(m.para), undefined, {
      buzones: rebotesDelDoble(" Salio@Trycore.com , otro@trycore.com"),
      alRebotar: (p) => rebotes.push(p),
    });
    expect(await doble.enviar({ ...mensaje, para: "salio@trycore.com" })).toEqual({
      resultado: "ok",
    });
    expect(await doble.enviar(mensaje)).toEqual({ resultado: "ok" });
    expect(rebotes).toEqual(["salio@trycore.com"]);
    expect(entregados).toEqual(["ana@trycore.com"]);
    expect(doble.enviados.map((m) => m.para)).toEqual(["ana@trycore.com"]);
  });

  it("sin la variable no rebota nada", () => {
    expect(rebotesDelDoble(undefined).size).toBe(0);
    expect(rebotesDelDoble("").size).toBe(0);
  });
});
