# EP-006 · sub-slice 4 — evidencia TDD (determinista)

- sha: `7863757` + este commit · rama `feature/ep-006-administracion-del-inventario` · 2026-10-01
- Entorno: PostgreSQL 16 + PgBouncer local con roles reales; panel standalone compilado; worker compilado; Chrome por MCP.
- vitest completo: 857 ✓ (3 omitidos preexistentes). e2e panel: 24 ✓ (axe + sin scroll a 320/390, incluido historial y resultado).
- Sostienen el checklist: `packages/infra/src/postgres/{aplicar-importacion,revertir-importacion,errores-importacion,perfiles-panel}.test.ts`, `apps/worker/src/aplicar-importacion.test.ts`, `apps/aplicar-importacion-panel.test.ts`, `apps/perfiles-panel.test.ts`, `packages/contratos/src/importacion.test.ts`, `packages/dominio/src/importacion/plan.test.ts`, `e2e/marco.panel.spec.ts`.
- Mutación acotada (uno por punto del checklist): sectores solo el primero; sin revalidar el plan; sin subir versión; sin detectar retoma; revertir sin hijas; ignorar cambiados después; worker sin comprobar «última»; no archivar creados; errores con todas las filas; sin causa común → **10/10 MUERTOS**, árbol restaurado tras cada uno (detalle en `d23-sectores.md`, `4.1-4.2-backend.md`, `4.3-backend.md`, `4.4-backend.md`).
