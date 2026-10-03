# INT-SS3-alcance-desactivado-no-se-asigna

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:29.893883Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/importacion/plan-saro.test.ts packages/infra/src/postgres/importacion-saro.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > un alcance desactivado no se acepta para un perfil que no lo tenía; quien ya lo tiene queda «sin cambios» 0ms
✓ packages/infra/src/postgres/importacion-saro.test.ts > SARO y DISC en la importación (HU-191) > un alcance desactivado no se asigna por importación a quien no lo tenía 3ms
Test Files  2 passed (2)
Tests  15 passed (15)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N7 desactivado asignable: rc=1 · 2 failed | 13 passed (15)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
