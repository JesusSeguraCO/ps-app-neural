# HU-191-ac2-exportacion-ida-y-vuelta

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:21.838403Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/importacion/plan-saro.test.ts packages/infra/src/postgres/importacion-saro.test.ts apps/importacion-saro-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > ida y vuelta: los tres datos tal como se exportan dejan el perfil «sin cambios» 0ms
✓ packages/infra/src/postgres/importacion-saro.test.ts > SARO y DISC en la importación (HU-191) > tarea 3.2 · el banco se exporta con el alcance registrado y las fechas; la plantilla toma uno activo 6ms
✓ apps/importacion-saro-panel.test.ts > SARO y DISC por importación (HU-191) > happy: la exportación trae las tres columnas con el alcance como está en el catálogo, y vuelve «sin cambios» 63ms
Test Files  3 passed (3)
Tests  22 passed (22)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N8 exportación sin alcance: rc=1 · 2 failed | 9 passed (11)
N2 forma registrada perdida: rc=1 · 4 failed | 11 passed (15)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
