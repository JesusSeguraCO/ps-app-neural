// Contrato de la frontera `llm-interpreter#suggest-lexicon-entries` (HU-139, RF-8.12.1; ADR-0009
// `proponer_lexico`): lo único que viaja a Gemini y el esquema estricto de lo que se acepta de vuelta.
import { z } from "zod";

// Al modelo: solo el texto de consultas permitidas y sin nombres de perfiles, y la taxonomía.
export const LoteHaciaModelo = z.strictObject({
  consultas: z
    .array(z.strictObject({ id: z.string(), texto: z.string().min(1).max(500) }))
    .max(200),
  taxonomia: z.strictObject({
    roles: z.array(z.string()),
    tecnologias: z.array(z.string()),
    sectores: z.array(z.string()),
  }),
});
export type LoteHaciaModelo = z.infer<typeof LoteHaciaModelo>;

// Del modelo: propuestas con equivalencias nombradas; cualquier campo de más invalida la respuesta.
export const RespuestaModeloLexico = z.strictObject({
  propuestas: z
    .array(
      z.strictObject({
        termino: z.string().min(1).max(120),
        sinonimos: z.array(z.string().min(1).max(120)).max(10),
        equivalencias: z
          .array(
            z.strictObject({
              tipo: z.enum(["rol", "tecnologia", "sector"]),
              valor: z.string().min(1).max(200),
            }),
          )
          .min(1)
          .max(6),
        consultas: z.array(z.string()).min(1).max(50),
      }),
    )
    .max(30),
});
export type RespuestaModeloLexico = z.infer<typeof RespuestaModeloLexico>;

// El mismo esquema en el formato que Gemini acepta como `responseSchema` (subconjunto OpenAPI).
export const ESQUEMA_RESPUESTA_GEMINI = {
  type: "OBJECT",
  properties: {
    propuestas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          termino: { type: "STRING" },
          sinonimos: { type: "ARRAY", items: { type: "STRING" } },
          equivalencias: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                tipo: { type: "STRING", enum: ["rol", "tecnologia", "sector"] },
                valor: { type: "STRING" },
              },
              required: ["tipo", "valor"],
            },
          },
          consultas: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["termino", "sinonimos", "equivalencias", "consultas"],
      },
    },
  },
  required: ["propuestas"],
} as const;
