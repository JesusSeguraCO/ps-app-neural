# EP-003 · cierre de los hallazgos de la pasada 2 (sin tercera pasada)

- sha: e71ed18 · rama: feature/ep-003-evidencia-del-perfil · fecha: 2026-10-03 (UTC)
- Regla aplicada (SKILL building-a-slice, condición de parada): hallazgos de la pasada 2 en código nuevo del cierre → arreglo + mutación verificada; lo preexistente se difiere explícitamente al Release Gate y se declara en el PR.
- Runner completo en e71ed18 VERDE: build, lint, tipos, 146 ficheros / 1570 tests, 71 e2e (1 omitido esperado) — `cierre-suite.md`.

| # | Sev. | Origen | Resolución | Evidencia |
|---|---|---|---|---|
| 1 | MEDIA | código del cierre | `accionDelAviso` y `entradasQueFaltan` (VistaPrevia) y `motivo` (PublicacionMasiva) exportados y probados en `apps/panel/src/inventario/salidas-publicar.test.ts` (9 tests: destino de cada salto, orden SARO→DISC, bloque exigido primero, consentimiento, notas «Falta …» exactas, claves de prototipo sin «Falta undefined»). El JSX consume esas funciones. | mutantes abajo |
| 3 | BAJA | código del cierre | consentimiento, modalidad, disponibilidad y trayectoria usan `ANCLA_CONDICION` en EditorPerfil, VistaPrevia y PublicacionMasiva; `anclas.test.ts` vigila que no vuelva un salto escrito a mano | A4 |
| 5 | BAJA | docs del cierre | tasks.md 1.9/2.7/3.5: «pendiente de aprobación» sustituido por la decisión D124/D126 tomada por delegación, revisable en el PR | tasks.md |
| 2 | BAJA | estado | Cola del runtime despachada (0 pendientes, 0 rechazados); `wiring_failing` = 0 tras sembrar 96 items y marcarlos `passing` uno a uno con su `--evidence-file` (96/96 rc 0). La proyección local no lista los items ni las HU (`hus: []`, ids nulos): defecto conocido de proyección, anotado. Defecto adicional del arnés: un lote de 97 eventos supera el `curl -m 10` del despachador (HTTP 000, backoff sin fin); se despachó en lotes FIFO de 8. | `slice-ops.sh status` |
| 4 | BAJA | preexistente | **Diferido al Release Gate** (declarado en el PR): `perfiles-panel.ts:1091` (EP-006) usa el «hoy» UTC para la firma futura; `perfiles-panel.ts:254` lee `saro_fecha`/`disc_fecha` vía `toISOString()` sin fijar el parser de fechas (solo afecta a servidores al este de UTC). | — |

## Mutaciones (código restaurado tras cada una; `git diff` vacío)
```
V1 «Ir al campo» siempre al alcance SARO:            Tests  2 failed | 7 passed (9)
V2 cuenta también las que cumplen:                   Tests  3 failed | 6 passed (9)
V3 el bloque exigido después de la validación:       Tests  1 failed | 8 passed (9)
P1 sin notas «Falta …» en publicar varios:           Tests  3 failed | 6 passed (9)
P2 salta a la última validación:                     Tests  1 failed | 8 passed (9)
P3 vuelve el filtro con `in`:                        Tests  1 failed | 8 passed (9)
A4 salto a mano en el editor (href="#pe-prueba"):    Tests  1 failed | 4 passed (5)
```
