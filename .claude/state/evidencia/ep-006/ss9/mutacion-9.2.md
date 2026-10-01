# EP-006 · 9.2 — mutación manual (2026-10-01)

| Mutante | Fichero | Test que lo mata | Resultado |
|---|---|---|---|
| M1 `faltan <= 60` → `< 60` (destacado de 60 días) | `packages/dominio/src/inventario/colocados.ts` | `colocados.test.ts` · ordena y separa ≤ 60 | muerto (1 falla) |
| M2 sin guarda `sin_liberacion` | `packages/dominio/src/inventario/colocados.ts` | dominio «sin fecha de liberación» + infra «no escribe nada» | muerto (2 fallan) |
| M3 no fija disponibilidad = liberación | `packages/infra/src/postgres/colocados.ts` | infra «registrar… disponibilidad = liberación… el portal la ve» | muerto (2 fallan) |

Código restaurado: dominio 12 ✓ + infra 5 ✓.
