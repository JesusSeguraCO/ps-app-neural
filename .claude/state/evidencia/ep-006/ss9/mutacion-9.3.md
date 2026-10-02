# EP-006 · 9.3 — mutación manual (2026-10-01)

Tests: `packages/contratos/src/operaciones.test.ts` (9) + `packages/infra/src/postgres/colocados.test.ts` (9).

| Mutante | Fichero | Resultado |
|---|---|---|
| M1 desincronizado `> 7` → `>= 7` | `packages/contratos/src/operaciones.ts` | muerto (1 falla: 7 días → sin aviso) |
| M2 sin rechazo por extensión ni binario | `packages/contratos/src/operaciones.ts` | muerto (2 fallan) |
| M3 sin rechazo por columnas mínimas | `packages/contratos/src/operaciones.ts` | muerto (2 fallan) |
| M4 la fila de Operaciones pisa al colocado del panel (D15) | `packages/infra/src/postgres/colocados.ts` | muerto (1 falla) |
| M5 acepta liberación ya llegada | `packages/contratos/src/operaciones.ts` | muerto (1 falla) |

Código restaurado (diff vacío contra la copia): 18 ✓.
