# EP-006 · 10.1–10.3 — mutación manual (2026-10-01)

| Mutante | Fichero | Test | Resultado |
|---|---|---|---|
| M1 `cambiar_acceso` sin bloquear a las administradoras activas | `packages/infra/migraciones/0023_accesos_panel.ts` | infra «carrera real: con la primera baja sin confirmar, la segunda espera y luego se niega» | muerto (con la carrera `Promise.allSettled` sobrevivía: el test se reforzó con dos transacciones abiertas) |
| M2 sin la invariante «al menos una administradora» | idem | infra «la única administradora…», «dos bajas a la vez…» | muerto (2 fallan) |
| M3 bajar de rol no corta la sesión | `packages/dominio/src/acceso/sesion.ts` | dominio «abierta como administradora y hoy observadora → se corta» | muerto (1 falla) |

Código restaurado: infra 8 ✓, dominio 22 ✓. Suite 1141 ✓ (3 workers), Playwright 56 ✓.
