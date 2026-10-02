# EP-006 · 10.5 — mutación manual (2026-10-01)

Tests: `packages/infra/src/postgres/registro-perfil.test.ts` (5, historia real: alta/edición/consentimiento en el panel,
importación y reversión por el worker, carga de Operaciones, archivado) + `packages/dominio/src/auditoria/registro.test.ts` (5).
Línea base: 10 ✓.

| Mutante | Fichero | Resultado |
|---|---|---|
| M1 la auditoría no guarda la referencia del tramo (lote/carga) | `packages/infra/src/postgres/auditoria.ts` | muerto (2 fallan: importación, carga) |
| M2 el estado se muestra con su código, sin etiqueta | `packages/dominio/src/auditoria/registro.ts` | muerto (2 fallan) |
| M3 la carga se atribuye sin la fecha de corte | idem | muerto (2 fallan) |
| M4 el registro sale del más antiguo al más reciente | `packages/infra/src/postgres/registro-perfil.ts` | muerto (2 fallan) |
| M5 el consentimiento cae en el grupo «Contenido» | `packages/dominio/src/auditoria/registro.ts` | muerto (2 fallan) |
| M6 el registro solo trae lo escrito desde el panel | `packages/infra/src/postgres/registro-perfil.ts` | muerto (2 fallan) |

Código restaurado: 10 ✓. HTTP `apps/registro-perfil.test.ts` 6 ✓ (panel standalone). Suite 1176 ✓ (101 ficheros), Playwright 57 ✓ ×2.
De paso: el e2e «pausado con fecha → ALTA…» (ss8) elegía la fecha antes de que terminara la recarga tras pausar y fallaba
bajo carga; ahora espera el aviso de la recarga (sin cambio de producto).
