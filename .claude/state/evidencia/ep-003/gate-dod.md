# EP-003 · gate dod

- sha: d81569f · rama: feature/ep-003-evidencia-del-perfil · fecha: 2026-10-03 (UTC)
- evaluador: dor-dod-gatekeeper (solo informa); cierra el orquestador.
- Veredicto: **PASA, con condiciones que se cumplen en el PR** (tareas 8.5 y 8.6 = este cierre + PR con el archivo del change).

| Punto | Estado | Evidencia |
|---|---|---|
| tdd | ✓ | gate-tdd.md; runner VERDE en e71ed18: 146 ficheros / 1570 tests, lint, tipos (cierre-suite.md); sin items BND-* |
| journey_smoke | ✓ | gate-journey-smoke.md (9c04167) + 71 e2e repetidos en verde en e71ed18 |
| coherence_link | ✓ | gate-coherence-link.md; `openspec validate ep-003-evidencia-del-perfil --type change --strict` → valid, 0 issues |
| data | ✓ | gate-data.md (5/5 invariantes) |
| api | ✓ | gate-api.md (71 peticiones, 179 aserciones, 0 fallos) |
| fidelity | ✓ | gate-fidelity.md (capturas MCP reales; desviaciones D124/D126/D134 en design.md) |
| sub-slices | ✓ | SS1–SS7 con tareas [x] y journey-smoke propio; 96 items de cableado |
| wiring_verified | ✓ | wiring-pasada-1.md + wiring-pasada-2.md (PASA) + wiring-pasada-2-cierre.md (hallazgos del cierre con mutación: V1–V3, P1–P3, A4 muertos) |
| OpenSpec | ✓ con condición | 54 tareas [x]; 8.5/8.6 se cierran con este gate y el PR (archivo en el mismo PR) |
| back-references | ✓ | epicas.md §EP-003 y las 15 HU con «> OpenSpec change: ep-003-evidencia-del-perfil» |
| na de frontera | ✓ | EP-003 no registró ninguno; preexisten otp-mail/send-access-code y send-notification (no_credentials) |
| hooks | ✓ | lint/tipos verdes; sin dependencias nuevas; rama feature/* |

## Lo que el PR declara
1. Diferido al Release Gate: hallazgo 4 de la pasada 2 (preexistente, BAJA): `perfiles-panel.ts:1091` (hoy UTC en firma futura) y `perfiles-panel.ts:254` (lectura de fechas SARO/DISC vía toISOString sin parser fijo); y la revisión independiente posterior a la pasada 2.
2. Desviaciones de fidelidad aprobadas por delegación: D124, D126, D134.
3. Recordatorio de los `na` de Mailgun preexistentes.

## No verificado
- La proyección del runtime no lista items ni HU (`hus: []`, ids nulos; defecto conocido); los 96 passing se apoyan en 96/96 rc 0 y `wiring_failing = 0`.
- Fidelidad anclada en 9c04167; después solo cambiaron hrefs y tests del panel (sin cambio visual), con los 71 e2e verdes en e71ed18.
