# HU-191-ac1-completar-incompletos-con-hoja

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:21.838036Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/importacion/plan-saro.test.ts packages/infra/src/postgres/importacion-saro.test.ts apps/importacion-saro-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > happy: tres publicados incompletos se completan con alcance, fecha SARO y fecha DISC; siguen publicados 3ms
✓ packages/infra/src/postgres/importacion-saro.test.ts > SARO y DISC en la importación (HU-191) > tarea 3.4 · aplicar completa los incompletos sin cambiar estados, con origen importación; revertir los devuelve 78ms
✓ apps/importacion-saro-panel.test.ts > SARO y DISC por importación (HU-191) > happy: una hoja completa tres publicados incompletos; siguen publicados, dejan de marcarse, el portal ve SARO y DISC, historial por importación 147ms
Test Files  3 passed (3)
Tests  22 passed (22)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N2 forma registrada perdida: rc=1 · 4 failed | 11 passed (15)
N10 aplicar no escribe la fecha SARO: rc=1 · 2 failed | 9 passed (11)
N16 recorrido: aplicar no escribe el alcance: rc=1 · 1 failed
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)

## En navegador real con el worker (ss3/journey-smoke.md, mismo sha)

```
  ✓  1 [panel] › e2e/importacion-saro.panel.spec.ts:173:7 › SARO y DISC por importación (HU-191) › exportar → completar tres incompletos → pegar → vista previa → confirmar → listado sin marcas → ficha con SARO y DISC (2.8s)
```
