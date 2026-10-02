# DoD EP-006 «Administración del inventario» — PASS (dor-dod-gatekeeper, 2026-10-01 @ 99e03b1)

Re-evaluación tras el FAIL anterior (@ 738d7f1). Entre 738d7f1 y 99e03b1 solo hay documentación:
`git diff 738d7f1 99e03b1 -- apps packages e2e tools tests package.json package-lock.json` vacío. El código medido es el de 738d7f1.

| # | Criterio | | Evidencia |
|---|---|---|---|
| 1 | tdd | ✓ | Hub true. Runner `integration-check` en 738d7f1 VERDE (`integration-report-738d7f1.txt`): vitest 109 ficheros / 1229 ✓ / 1 omitido (frontera Gemini sin llave), Playwright 60 ✓, build, lint, tipos y Lighthouse OK. Ningún `BND-*` en failing. |
| 2 | journey_smoke | ✓ | Hub true; `recorrido-ep006.test.ts` (11 pasos, worker y cola reales) dentro del runner verde en 738d7f1. |
| 3 | coherence_link | ✓ | Hub true; `openspec validate administracion-del-inventario --type change --strict` → «Change ... is valid» (re-ejecutado @ 99e03b1). |
| 4 | data | ✓ | Hub true; `gate-data.md` (H1 cerrado por D44). |
| 5 | api | ✓ | Hub true; Newman 226 / 350 / 0 fallos, 52 métodos de 42 rutas (`newman-11.2.md`); desde b4110f8 nada toca `apps/*/app/api`. |
| 6 | fidelity | ✓ | Hub true; captura MCP real: 66 pantallas (64 FIEL + 2 N/A por D29, `fidelidad-final.md`) y ficha del portal FIEL (`fidelidad-ficha-d47.md`, D48). |
| 6-bis | sub-slices | ✓ | Hub `sub_slices_pending: []`. |
| 6-ter | caparazón | N/A | EP-006 no es la épica caparazón. |
| 7 | wiring_verified | ✓ | Hub true. 2 pasadas (máximo); M1 cerrado con mutación verificada, B2/B3/B6 con test, en 738d7f1. Failing en el hub (`/agent/context`, consultado ahora): exactamente `HU-131-ac1..ac5`, `I-spaces-subida-csp` (D29; resolución humana del hub `ACEPTADA`) e `IP-ss1-lexico-portal` (D46, sponsor → EP-009). Todos declarados en `pr-body.md`. Revisión independiente del cierre + B1 + B5 diferidos al Release Gate y declarados en `pr-body.md` («Diferido al Release Gate»). |
| 8a | OpenSpec tasks | ✓ | `openspec list` 72/75. Restan: 6.3 tachada (diferida por D29, aceptada por humano y declarada en el PR); 11.5 (este DoD: se marca ahora); 11.6 (archive + PR, mismo PR, posterior al DoD por construcción). |
| 8b | Back-refs | ✓ | 32be39c: `docs/03-backlog/epicas.md:217` y las 27 HU de EP-006 del grafo v7. |
| 8c | Diferimientos y `na` en el PR | ✓ | `cierre/pr-body.md` (commiteado): B1, B5 y revisión del cierre → Release Gate; items failing; tarea 6.3; `na` `otp-mail/send-notification` y `otp-mail/send-access-code` (`no_credentials`) con detalle; defecto D49. |
| 9 | Hooks | ✓ | Lint y tipos verdes en el runner de 738d7f1; deps nuevas de la rama (`fast-check`, peer `react`, `@ps/*` internos) en `stack-allowlist.json`; rama `feature/ep-006-…`. |
| — | DoR: HU-149 fuera del grafo | ✓ | graph-sync 8 APPROVED → grafo v7, EP-006 con 27 HU sin HU-149. |
| — | DoR: `design_source_applies` | ✓ (declarado) | Sigue false en el hub. No corregible por consola ni por agente; el sponsor decidió D49 (declarar como defecto del arnés). Fidelidad sí verificada por MCP. Declarado en el PR e `informe-defectos-arnes-2026-09-28.md`. |

## Condiciones para el PR (no bloquean el gate; las hace el modelo)
1. Rellenar los marcadores de `pr-body.md`: `{{GATES}}`, `{{DOD}}`, `{{ARCHIVO}}` (ruta del change archivado).
2. Marcar 11.5 `[x]`; 11.6: `openspec archive administracion-del-inventario` en el mismo PR y `openspec validate --specs` verde tras archivar.
3. La tarea 11.5 dice «28 HU»; son 27 con back-ref (HU-131 diferida). Ajustar el texto al marcarla o dejarlo explicado en el PR.

## Pendiente humano (fuera de este gate)
- Registrar el criterio de D46 en el DoR de EP-009 (B4).
- HU-131 sigue con `estado: lista` en su frontmatter aunque está diferida (documento de discovery).
- Corregir `design_source_applies` en el hub cuando el hub lo permita (D49).
