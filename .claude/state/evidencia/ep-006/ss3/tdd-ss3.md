# EP-006 · sub-slice 3 — evidencia TDD (determinista)

- sha: `fd21190c6962e520867d960ef8fc45fa99da748e` (+ prueba HTTP endurecida de este commit) · rama `feature/ep-006-administracion-del-inventario` · 2026-10-01
- Entorno: PostgreSQL 16 + PgBouncer local con roles reales; panel standalone compilado; Chrome por MCP.
- vitest completo: 822 ✓ (3 omitidos preexistentes: Gemini real y dos sondas de entorno). Sostienen el checklist: `packages/contratos/src/importacion.test.ts`, `packages/dominio/src/importacion/{emparejar,plan}.test.ts`, `packages/infra/src/postgres/{importacion,migracion-0015}.test.ts`, `apps/importacion-panel.test.ts` (15 ✓ contra el panel real).
- Mutación acotada: 14 mutantes, uno por AC, 14 MUERTOS (`mutacion-ss3.json`); árbol restaurado tras cada uno.
- Fidelidad y recorrido en la UI real: `fidelidad-ss3.md`, `journey-ss3.md`.
