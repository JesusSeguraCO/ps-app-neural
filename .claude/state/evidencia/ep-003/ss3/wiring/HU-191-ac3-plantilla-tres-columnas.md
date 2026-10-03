# HU-191-ac3-plantilla-tres-columnas

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:23.564879Z
- comando: `npx vitest run --reporter=verbose packages/contratos/src/importacion-saro.test.ts apps/importacion-saro-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > la plantilla trae los tres con un alcance activo del catálogo, tal como está registrado 1ms
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > sin ningún alcance activo, la plantilla deja la celda del alcance vacía (nunca inventa uno) 0ms
✓ apps/importacion-saro-panel.test.ts > SARO y DISC por importación (HU-191) > happy: la plantilla trae las tres columnas con un alcance activo; su fila de ejemplo no da error en ellas 20ms
Test Files  2 passed (2)
Tests  12 passed (12)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N9 plantilla sin alcance: rc=1 · 1 failed | 6 passed (7)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
