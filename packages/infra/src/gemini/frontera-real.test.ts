// Verificación de la frontera `llm-interpreter#suggest-lexicon-entries` contra Gemini REAL
// (boundary-check.md): un único intercambio con datos ficticios por el adaptador del proyecto. Solo
// corre si GEMINI_API_KEY está en el entorno; nunca imprime ni guarda la llave ni los cuerpos: solo
// código de estado, hashes de petición y respuesta y nombres de campos (evidencia del item BND-*).
//   GEMINI_API_KEY=… BND_SALIDA=ruta.json npx vitest run packages/infra/src/gemini/frontera-real.test.ts
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import { proponedorGemini } from "./lexico";

const h = (s: string) => `sha256:${createHash("sha256").update(s).digest("hex")}`;

it.skipIf(!process.env.GEMINI_API_KEY)(
  "Gemini real: suggest-lexicon-entries con datos ficticios",
  async () => {
    let peticion = "";
    let respuesta = "";
    let status = 0;
    const p = proponedorGemini({
      clave: process.env.GEMINI_API_KEY!,
      timeoutMs: 30_000,
      fetch: (async (url: string, init: RequestInit) => {
        peticion = String(init.body);
        const r = await fetch(url, init);
        status = r.status;
        respuesta = await r.clone().text();
        return r;
      }) as typeof fetch,
    });
    const r = await p.proponer({
      consultas: [
        { id: "c1", texto: "analista de calidad de software con pruebas automatizadas" },
        { id: "c2", texto: "desarrollador con experiencia en pagos en tiempo real para banca" },
      ],
      taxonomia: {
        roles: ["Analista QA automatización", "Desarrollador backend Java"],
        tecnologias: ["Kafka", "Java"],
        sectores: ["Banca", "Seguros"],
      },
    });
    let campos: string[] = [];
    try {
      campos = Object.keys(JSON.parse(respuesta)).slice(0, 3);
    } catch {
      campos = [];
    }
    const evidencia = {
      status,
      request_hash: h(peticion),
      response_hash: h(respuesta),
      campos,
      resultado: r.ok ? "esquema_ok" : r.motivo,
      propuestas: r.ok ? r.respuesta.propuestas.length : 0,
      at: new Date().toISOString(),
    };
    if (status !== 200) {
    // Diagnóstico sin datos sensibles: el mensaje de error de Google y los modelos con generateContent.
    let mensaje = "";
    try {
      mensaje = (JSON.parse(respuesta) as { error?: { message?: string } }).error?.message ?? "";
    } catch {
      mensaje = "";
    }
    const lista = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY! },
    });
    const modelos = lista.ok
      ? ((await lista.json()) as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> }).models
          ?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m) => m.name.replace(/^models\//, ""))
      : [];
    console.log(JSON.stringify({ diagnostico: mensaje, modelos_generate_content: modelos }));
  }
  if (process.env.BND_SALIDA)
      writeFileSync(process.env.BND_SALIDA, JSON.stringify(evidencia, null, 1));
    console.log(JSON.stringify(evidencia));
    expect(status).toBe(200);
    expect(r.ok).toBe(true);
  },
  60_000,
);
