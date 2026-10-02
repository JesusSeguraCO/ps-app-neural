# HU-178-ac1a-incompleto-sin-saro

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:17.033411Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/entrada.test.ts packages/infra/src/postgres/incompletos.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin SARO (alcance y fecha) → «{ saro: [Object] }» 1ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado solo sin el alcance SARO → «{ saro: [Object] }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado solo sin la fecha SARO → «{ saro: [Object] }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin SARO ni DISC → «{ saro: [Object], disc: [Object] }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin modalidad, sin SARO ni DISC → «{ modalidadPrueba: [Object], …(2) }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > un borrador no se marca aunque le falte SARO: la marca es de los publicados, no un estado nuevo 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > un pausado no se marca aunque le falte SARO: la marca es de los publicados, no un estado nuevo 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > un archivado no se marca aunque le falte SARO: la marca es de los publicados, no un estado nuevo 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin SARO → cuenta como incompleto 0ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > happy: cada heredado se marca con lo que le falta, sigue publicado y visible en el portal 67ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.3 · editar un publicado incompleto > error: cambiar el resumen sin registrar SARO → la pregunta de D1 con lo que falta; nada se escribe 33ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > happy: la API del listado marca los tres ejemplos (SARO, DISC, modalidad) y los deja publicados y en el portal 102ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > happy: la página filtra por «incompleto» con la marca de cada uno y su pestaña con el conteo 111ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > error: editar el resumen sin registrar SARO → la pregunta con el motivo (200 al previsualizar, 409 al confirmar); el portal conserva la versión vigente 36ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-194 · aviso de lenguaje de inventario > happy: «disponible para asignación» → guardado con el aviso; publicar no lo impide 33ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-194 · aviso de lenguaje de inventario > error: fecha SARO futura y «stock» → 422 por la fecha, con el aviso aparte y nada guardado 22ms
Test Files  3 passed (3)
Tests  42 passed (42)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M1 SARO no se nombra junto: rc=1 · 6 failed | 36 passed (42)
M4 listado sin marca: rc=1 · 5 failed | 15 passed (20)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)

## En navegador real (ss2/journey-smoke.md, mismo sha)

```
  ✓  1 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:150:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › marcado → editar sin completar (pregunta) → completar y confirmar (deja de marcarse) → trayectoria con «stock» (aviso, guardado) (2.1s)
  ✓  2 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:242:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › borrador: el aviso va aparte del error de la fecha futura y se retira al corregir la frase (780ms)
```
