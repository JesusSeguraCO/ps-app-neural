// Frontera `llm-interpreter` (build-config.json), forma `suggest-lexicon-entries`: Gemini por su API
// HTTP con `fetch`, solo desde el worker (ADR-0004 enmienda: sin SDK), timeout de 6 s y esquema
// estricto de la respuesta. Ante fallo, timeout o respuesta fuera de esquema la corrida no propone
// nada (sin reintento agresivo). El doble declarado (`DOBLES=gemini`) registra lo que recibiría.
import "server-only";
import {
  ESQUEMA_RESPUESTA_GEMINI,
  LoteHaciaModelo,
  RespuestaModeloLexico,
} from "@ps/contratos/lexico";
import { normalizar } from "@ps/dominio/catalogo/parecidos";

export type ResultadoPropuesta =
  | { ok: true; respuesta: RespuestaModeloLexico }
  | { ok: false; motivo: "timeout" | "red" | "http" | "esquema"; status?: number };

export interface ProponedorLexico {
  proponer(lote: LoteHaciaModelo): Promise<ResultadoPropuesta>;
}

// Google retiró gemini-2.5-flash para cuentas nuevas (respuesta 404 de la API, 2026-10-01).
export const MODELO_GEMINI = "gemini-3.8-flash";

function instruccion(lote: LoteHaciaModelo): string {
  return [
    "Eres el asistente del léxico de búsqueda de un banco de perfiles de talento tecnológico.",
    "Recibes consultas de clientes que no encontraron coincidencia y la taxonomía del banco.",
    "Propón términos del cliente con su equivalencia en rol, tecnología o sector, usando SOLO",
    "valores que aparecen literalmente en la taxonomía. Si ninguna equivalencia es clara, no",
    "propongas nada para esa consulta. Cita en `consultas` los id de las consultas que la originan.",
    "",
    JSON.stringify(lote),
  ].join("\n");
}

export function proponedorGemini(opciones: {
  clave: string;
  modelo?: string;
  timeoutMs?: number;
  base?: string;
  fetch?: typeof fetch;
}): ProponedorLexico {
  const f = opciones.fetch ?? fetch;
  const base = opciones.base ?? "https://generativelanguage.googleapis.com";
  const modelo = opciones.modelo ?? MODELO_GEMINI;
  return {
    async proponer(lote) {
      const valido = LoteHaciaModelo.parse(lote);
      let r: Response;
      try {
        r = await f(`${base}/v1beta/models/${modelo}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": opciones.clave },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: instruccion(valido) }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
              responseSchema: ESQUEMA_RESPUESTA_GEMINI,
            },
          }),
          signal: AbortSignal.timeout(opciones.timeoutMs ?? 6_000),
        });
      } catch (e) {
        const nombre = (e as Error).name;
        return {
          ok: false,
          motivo: nombre === "TimeoutError" || nombre === "AbortError" ? "timeout" : "red",
        };
      }
      if (!r.ok) return { ok: false, motivo: "http", status: r.status };
      try {
        const cuerpo = (await r.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const texto = cuerpo.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const respuesta = RespuestaModeloLexico.safeParse(JSON.parse(texto));
        return respuesta.success
          ? { ok: true, respuesta: respuesta.data }
          : { ok: false, motivo: "esquema" };
      } catch {
        return { ok: false, motivo: "esquema" };
      }
    },
  };
}

// Doble determinista para local y CI: propone cada consulta como término con el primer valor de la
// taxonomía con el que comparte una palabra (de 4 letras o más). Guarda cada lote recibido (V9-8).
export class DobleGemini implements ProponedorLexico {
  readonly recibidos: LoteHaciaModelo[] = [];
  constructor(private readonly fallo?: ResultadoPropuesta & { ok: false }) {}

  async proponer(lote: LoteHaciaModelo): Promise<ResultadoPropuesta> {
    this.recibidos.push(LoteHaciaModelo.parse(lote));
    if (this.fallo) return this.fallo;
    const palabras = (s: string) =>
      new Set(
        normalizar(s)
          .split(/[^a-z0-9ñ]+/)
          .filter((w) => w.length >= 4),
      );
    const valores = [
      ...lote.taxonomia.roles.map((valor) => ({ tipo: "rol" as const, valor })),
      ...lote.taxonomia.tecnologias.map((valor) => ({ tipo: "tecnologia" as const, valor })),
      ...lote.taxonomia.sectores.map((valor) => ({ tipo: "sector" as const, valor })),
    ];
    const propuestas = lote.consultas.flatMap((c) => {
      const deConsulta = palabras(c.texto);
      const v = valores.find((x) => [...palabras(x.valor)].some((w) => deConsulta.has(w)));
      return v ? [{ termino: c.texto, sinonimos: [], equivalencias: [v], consultas: [c.id] }] : [];
    });
    return { ok: true, respuesta: { propuestas } };
  }
}
