# INT-SS3-aplicar-worker-servicio-perfiles

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:27.657748Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/importacion-saro.test.ts apps/importacion-saro-panel.test.ts packages/infra/src/postgres/migracion-0029.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0029.test.ts > migración 0029: indicadores de publicación > la fila de un lote admite las tres claves nuevas del formato (HU-191) y sigue rechazando las ajenas 1ms
✓ packages/infra/src/postgres/importacion-saro.test.ts > SARO y DISC en la importación (HU-191) > tarea 3.4 · aplicar completa los incompletos sin cambiar estados, con origen importación; revertir los devuelve 115ms
✓ apps/importacion-saro-panel.test.ts > SARO y DISC por importación (HU-191) > happy: una hoja completa tres publicados incompletos; siguen publicados, dejan de marcarse, el portal ve SARO y DISC, historial por importación 133ms
Test Files  3 passed (3)
Tests  17 passed (17)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N10 aplicar no escribe la fecha SARO: rc=1 · 2 failed | 9 passed (11)
N15 0029 sin claves SARO en el lote: rc=1 · 2 failed | 8 passed (10)
N16 recorrido: aplicar no escribe el alcance: rc=1 · 1 failed
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)

## En navegador real con el worker (ss3/journey-smoke.md, mismo sha)

```
  ✓  1 [panel] › e2e/importacion-saro.panel.spec.ts:173:7 › SARO y DISC por importación (HU-191) › exportar → completar tres incompletos → pegar → vista previa → confirmar → listado sin marcas → ficha con SARO y DISC (2.8s)
```
