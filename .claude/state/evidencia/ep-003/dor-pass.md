# DoR · EP-003 — Evidencia del perfil (2026-10-02) — PASA

Evaluación: agente `dor-dod-gatekeeper` (contexto independiente, solo lectura) + decisión del sponsor D101.

| # | Criterio | Estado |
|---|---|---|
| 1 | Épica válida (O2 · RF-3, RF-6), `layer: business` | ✓ |
| 2 | HU enumeradas | ✓ 15 |
| 3 | Frontmatter completo y `estado: lista` | ✓ 15/15 |
| 4 | AC Given/When/Then proporcionales (3–5, happy+error+edge) | ✓ |
| 5 | INVEST 6/6 (validación independiente 2026-10-02) | ✓ |
| 6 | Dependencias resueltas | ✓ tras D101 (HU-175 → EP-004); EP-001 y EP-006 archivadas |
| 7 | Cimiento construido | ✓ EP-001, EP-006 archivadas |
| 7-bis | Caparazón (greenfield) | ✓ EP-001 archivada con checklist evidenciada (`ep-001/caparazon-8.1.md`); `foundation_done=false` = defecto de proyección nº 3 del informe de defectos |
| 8 | Tamaño | descompuesta en 7 sub-slices (abajo) |
| 9 | Fuente de diseño | ✓ claude.ai/design v2 + espejo `docs/07-prototipo/`; pantallas de ficha y validación técnica citadas por las HU |
| 10 | Cobertura ADR | ✓ UC-4, QA-2, QA-5, QA-17 → ADR 0003/0006/0008/0010 (ABORDADO) |

## Alcance (15 HU)
HU-081 · HU-119 · HU-120 · HU-153 · HU-154 · HU-155 · HU-156 · HU-157 · HU-158 · HU-159 · HU-176 · HU-177 · HU-178 · HU-191 · HU-194

**Defecto del hub:** el claim entregó además **HU-079** (`estado: descartada`) y **HU-175** (movida a EP-004 por D101; el grafo v10 la añadió a EP-004 sin retirarla de EP-003). No forman parte del alcance de este slice; se registra para que el `wiring_checklist` y el DoD no las exijan.

## layer y files_scope
`layer: business`.
`packages/infra/migraciones/0027..0029_*.ts`, `packages/infra/migraciones/indice.ts`, `packages/infra/src/postgres/{validaciones,catalogos-panel,perfiles-panel,estado-perfil,banco,catalogo,importacion,aplicar-importacion}*.ts`, `packages/dominio/src/{inventario,importacion,catalogo,lexico}/**`, `packages/contratos/src/{ficha,catalogo,importacion,operaciones,cambios-ficha}*.ts`, `packages/ui/src/{FichaPerfil,ContactoTrycore}*`, `apps/panel/src/{inventario,catalogos,importacion}/**`, `apps/panel/app/{inventario,catalogos,importar}/**`, `apps/panel/app/api/v1/{perfiles,catalogos,importacion}/**`, `apps/portal/src/{ficha,banco,seleccion}/**`, `apps/portal/app/{banco,api/v1}/**`, `apps/worker/src/{aplicar-importacion,sembrar-ficticios}*.ts`, `apps/*.test.ts`, `e2e/*.spec.ts`.

## sub_slices (journey_smoke verde entre cada uno)
1. **SS1** HU-177, HU-176 — catálogo de alcances SARO + captura SARO/DISC (migración, infra, dominio/inventario, panel UI+API)
2. **SS2** HU-178, HU-194 — motor de publicación «Incompleto» + aviso de lenguaje de inventario (dominio, infra, panel)
3. **SS3** HU-191 — columnas SARO/DISC en importación, plantilla y exportación (dominio/importacion, contratos, infra, worker, panel)
4. **SS4** HU-153, HU-081, HU-119 — tarjeta (contratos/catalogo, infra/banco, portal/seleccion)
5. **SS5** HU-154, HU-155, HU-157 — ficha: verificado vs declarado, validación técnica, conversación por Trycore
6. **SS6** HU-156, HU-158 — ficha: SARO/DISC (necesita SS1), cierre con condiciones/SLA/garantía
7. **SS7** HU-159, HU-120 — encabezado del estándar (necesita HU-178), re-verificación del recorrido de fichas (D47)

Gates iniciales: `api=false`, `data=false`, `fidelity=false`, `wiring_verified=false`.
Decisiones aplicables: `.claude/state/evidencia/discovery-2026-10-02/decisiones-sponsor-2026-10-02.md` (D59–D64, D73, D80, D81, D87, D96, D97, D101).
