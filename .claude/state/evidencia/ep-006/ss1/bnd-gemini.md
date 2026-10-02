# BND-llm-interpreter-suggest-lexicon-entries — intercambio real (2026-10-01T00:49:47Z)

HTTP 200 · req sha256:dbf372afc248965548b4c6b278fb49273874262e77360c4ee3d0125936a57155 · res sha256:b5b74d790d0148d18ee2457633ee36ddd89c32e408d701240faa01cf42bfc016 · campos: candidates,usageMetadata,modelVersion

- Ejecutado por la persona usuaria con su llave (nunca pasó por el agente ni quedó en disco), con
  `packages/infra/src/gemini/frontera-real.test.ts` y el adaptador `proponedorGemini` del proyecto;
  datos ficticios (dos consultas sintéticas y una taxonomía de ejemplo).
- Respuesta validada por el esquema zod estricto `RespuestaModeloLexico`: 2 propuestas.
- Hallazgos del recorrido: `gemini-2.5-flash` → 404 (retirado para cuentas nuevas); `gemini-3.8-flash`
  y `gemini-flash-latest` → 503 (demanda). Modelo fijado: `gemini-flash-lite-latest`.
- Memoria del proyecto: `.claude/config/build-config.json#boundaries[llm-interpreter].verified[]`.
