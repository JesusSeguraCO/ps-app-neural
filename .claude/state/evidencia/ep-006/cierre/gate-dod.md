# DoD EP-006 «Administración del inventario» — FAIL (dor-dod-gatekeeper, 2026-10-01 @ 738d7f1)

Veredicto: **FAIL**. No se reporta `gate dod pass`. Lo que falta es corto (ver «Qué falta»); ningún gate del inner loop está roto.

## Criterios

| # | Criterio | | Evidencia |
|---|---|---|---|
| 1 | tdd | ✓ (con reserva) | Hub `tdd=true`. Runner VERDE en c9b06ed (`integration-report-c9b06ed.txt`: vitest 1227 ✓, e2e 60 ✓, Lighthouse OK). Ningún `BND-*` en failing (hub `/agent/context`). **Reserva:** 738d7f1 cambia producto (`Resultado.tsx`) y un e2e (`marco.panel.spec.ts`); el runner no se re-ancló a HEAD. Yo corrí en HEAD: eslint de los 6 ficheros = 0, `npm run typecheck` = 0, vitest sin BD de `ficha-portal`/`observador-panel`/`dominio/importacion` = 63 ✓ (17 omitidos por requerir BD). |
| 2 | journey_smoke | ✓ | Hub true; `recorrido-ep006.test.ts` (11 pasos, worker y cola reales) dentro del runner verde; `gate-tdd-journey.md`, `recorrido-11.1.md`. |
| 3 | coherence_link | ✓ | Hub true; `openspec validate administracion-del-inventario --type change --strict` → «Change ... is valid» (exit 0, corrido hoy). |
| 4 | data | ✓ | Hub true; `gate-data.md` (H1 cerrado con D44). |
| 5 | api | ✓ | Hub true; Newman 226 peticiones / 350 aserciones / 0 fallos, 52 métodos de 42 rutas (`newman-11.2.md`, re-anclado en b4110f8; c9b06ed..738d7f1 no tocan `apps/*/app/api`). |
| 6 | fidelity | ✓ | Hub true; `fidelidad-final.md` 64 FIEL + 2 N/A (HU-131, D29) sobre 66 pantallas, MCP real; `fidelidad-ficha-d47.md` FIEL escritorio y móvil por MCP, desviaciones I-1..I-6 aceptadas (D48). |
| 6-bis | sub-slices | ✓ | Hub `sub_slices_pending: []`. |
| 6-ter | checklist del caparazón | N/A | EP-006 no es la épica caparazón. |
| 7 | wiring_verified | ✓ | Hub true. Pasada 2 (`wiring-pasada-2.md`): HUECOS → M1, B2, B3, B6 cerrados (M1 con mutación verificada) en 738d7f1, sin tercera pasada. Failing en el hub, exactamente 7: `HU-131-ac1..ac5`, `I-spaces-subida-csp` (D29; **la escalada ya tiene resolución humana en el hub: `ACEPTADA` — «el feature de cargar documentos se va para una versión futura»**) e `IP-ss1-lexico-portal` (transferido a EP-009, D46, sponsor). B1 y B5 diferidos al Release Gate. |
| 8a | OpenSpec tasks todas [x] | **✗** | `openspec list`: 70/75. Sin marcar: 6.3 (tachada, diferida D29 — aceptable si se declara), **11.3d** (hecha, sin marcar), **11.4** (incluye un acto humano pendiente), 11.5 (este DoD; se marca al pasar), 11.6 (PR + archive, va en el mismo PR tras el DoD). |
| 8b | Back-refs | ✓ | 32be39c: `docs/03-backlog/epicas.md:217` + las 27 HU de EP-006 en el grafo v7. HU-131 (diferida) y HU-149 (descartada) sin back-ref, coherente. |
| 8c | Diferimientos declarados en el PR | **✗** | No hay PR ni borrador de su descripción (rama sin publicar). Sin la declaración, el `dod` no cierra. |
| 9 | Hooks | ✓ | eslint 0 y typecheck 0 en HEAD; deps nuevas de la rama (`fast-check`, `react` peer, paquetes `@ps/*` internos) en `stack-allowlist.json`; rama `feature/*`. |
| — | Condición del DoR «retirar HU-149 del grafo antes del DoD» | ✓ | graph-sync 8 APPROVED → grafo v7: EP-006 con 27 HU, sin HU-149 ni HU-131. |
| — | Condición del DoR «corregir `design_source_applies`» | **✗** | Hub: `design_source_applies=false` (es true: el slice tiene UI y el gate de fidelidad se exigió). Acto humano en la consola; bloquea marcar 11.4. |

## Qué falta y quién

Modelo (build-orchestrator):
1. Re-anclar a HEAD el runner determinista (`tools/loop/integration-check.sh`) en 738d7f1 —incluye el e2e modificado y los tests con BD— y guardar el reporte en `cierre/`.
2. Marcar `[x]` la 11.3d (evidencia ya existe).
3. Commitear la evidencia que hoy está sin commitear: `decisiones-sponsor-2026-10-01.md` (D44–D48, que respaldan D46/D47 y los cierres), `newman-11.2.md`, `newman-ep-006.json` y este informe.
4. Escribir la descripción del PR en un fichero (p. ej. `cierre/pr-body.md`) que declare: B1 y B5 diferidos al Release Gate (revisión independiente del cierre de la pasada 2); `HU-131-ac1..ac5` + `I-spaces-subida-csp` en failing por D29, con la resolución `ACEPTADA` del hub; tarea 6.3 diferida (D29); `IP-ss1-lexico-portal` transferido a EP-009 (D46); revisiones del Release Gate (security, smell, ux, coherence, stack_arch). Los `na` de `otp-mail` (no_credentials) se declararon en EP-001; repetirlos no estorba.

Humano (consola del hub):
5. Corregir `design_source_applies` a true (parte de 11.4). Hecho eso, el modelo marca 11.4.
6. (No bloquea este DoD, sí el no perder alcance) Registrar el criterio de D46 donde lo lea el DoR de EP-009 (B4). HU-131 sigue con `estado: lista` en su frontmatter aunque está diferida: corregirlo es decisión humana sobre discovery.

Tras 1–5, re-invocar al gatekeeper; con PASS se marca 11.5 y la 11.6 (archive + PR) va en el mismo PR.
