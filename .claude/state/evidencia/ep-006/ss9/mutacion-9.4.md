# EP-006 · 9.4 — mutación manual (2026-10-01)

Test: `apps/observador-panel.test.ts` (6, servidor standalone del panel recompilado por mutante).

| Mutante | Fichero | Resultado |
|---|---|---|
| M1 el 403 de la API no registra `acceso_rechazado` | `packages/infra/src/http/envoltorios.ts` | muerto (1 falla) |
| M2 la dirección de edición no registra el intento | `apps/panel/src/sesion/rechazo.ts` | muerto (2 fallan) |
| M3 el observador no puede «Avisar» | `packages/dominio/src/acceso/permisos.ts` | muerto (1 falla) |
| M4 el 403 no explica que el rol es de consulta | `packages/infra/src/http/envoltorios.ts` | muerto (1 falla) |

Código restaurado y panel recompilado: 6 ✓.
