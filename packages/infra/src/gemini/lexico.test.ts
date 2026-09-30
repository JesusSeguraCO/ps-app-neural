// Adaptador de Gemini para `proponer_lexico` con un `fetch` falso: forma de la petición (llave en
// cabecera, nunca en la URL; solo el lote validado), timeout de 6 s, error HTTP y respuesta fuera de
// esquema → la corrida no propone nada.
import { describe, expect, it } from "vitest";
import { DobleGemini, proponedorGemini } from "./lexico";

const lote = {
  consultas: [{ id: "c1", texto: "analista de calidad de software" }],
  taxonomia: { roles: ["Analista QA automatización"], tecnologias: ["Kafka"], sectores: ["Banca"] },
};
const respuestaValida = {
  propuestas: [
    {
      termino: "analista de calidad de software",
      sinonimos: [],
      equivalencias: [{ tipo: "rol", valor: "Analista QA automatización" }],
      consultas: ["c1"],
    },
  ],
};
const gemini = (texto: string, status = 200) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: texto }] } }] }), {
    status,
  });

describe("proponedorGemini", () => {
  it("envía la llave por cabecera, esquema de respuesta y solo el lote; acepta la respuesta válida", async () => {
    let url = "";
    let init: RequestInit = {};
    const p = proponedorGemini({
      clave: "llave-de-prueba",
      fetch: (async (u: string, i: RequestInit) => {
        url = u;
        init = i;
        return gemini(JSON.stringify(respuestaValida));
      }) as typeof fetch,
    });
    const r = await p.proponer(lote);
    expect(r).toEqual({ ok: true, respuesta: respuestaValida });
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    );
    expect(url).not.toContain("llave");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("llave-de-prueba");
    const cuerpo = JSON.parse(String(init.body));
    expect(cuerpo.generationConfig.responseMimeType).toBe("application/json");
    expect(cuerpo.contents[0].parts[0].text).toContain(JSON.stringify(lote));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("timeout → sin propuestas (motivo timeout)", async () => {
    const p = proponedorGemini({
      clave: "x",
      timeoutMs: 20,
      fetch: ((_u: string, i: RequestInit) =>
        new Promise((_, rej) =>
          i.signal!.addEventListener("abort", () => rej(i.signal!.reason)),
        )) as typeof fetch,
    });
    expect(await p.proponer(lote)).toEqual({ ok: false, motivo: "timeout" });
  });

  it("HTTP de error → sin propuestas con el status", async () => {
    const p = proponedorGemini({
      clave: "x",
      fetch: (async () => gemini("{}", 429)) as typeof fetch,
    });
    expect(await p.proponer(lote)).toEqual({ ok: false, motivo: "http", status: 429 });
  });

  it("respuesta con campos de más o sin JSON → fuera de esquema", async () => {
    const conDatos = { propuestas: [{ ...respuestaValida.propuestas[0], perfil: "Laura Méndez" }] };
    for (const texto of [JSON.stringify(conDatos), "no es json"]) {
      const p = proponedorGemini({
        clave: "x",
        fetch: (async () => gemini(texto)) as typeof fetch,
      });
      expect(await p.proponer(lote)).toEqual({ ok: false, motivo: "esquema" });
    }
  });

  it("rechaza enviar un lote con campos de más (nada que no sea texto de consulta y taxonomía)", async () => {
    const p = proponedorGemini({ clave: "x", fetch: (async () => gemini("{}")) as typeof fetch });
    await expect(
      p.proponer({ ...lote, perfiles: ["Laura Méndez"] } as unknown as typeof lote),
    ).rejects.toThrow();
  });
});

describe("DobleGemini", () => {
  it("propone por palabra compartida con la taxonomía y registra el lote recibido", async () => {
    const d = new DobleGemini();
    const r = await d.proponer(lote);
    expect(r).toEqual({ ok: true, respuesta: respuestaValida });
    expect(d.recibidos).toEqual([lote]);
  });
});
