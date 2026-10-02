# HU-191-ac5-vaciar-en-publicado

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:25.289679Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/importacion/plan-saro.test.ts apps/importacion-saro-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > edge: `[vaciar]` la fecha DISC de un publicado → error con el motivo de HU-191; conserva su fecha 0ms
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > `[vaciar]` en un borrador sí se aplica 0ms
✓ apps/importacion-saro-panel.test.ts > SARO y DISC por importación (HU-191) > edge: `[vaciar]` en la fecha DISC de un publicado → error con el motivo; conserva su fecha y sigue publicado 7ms
Test Files  2 passed (2)
Tests  18 passed (18)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N6 vaciar en publicado aceptado: rc=1 · 1 failed | 17 passed (18)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
