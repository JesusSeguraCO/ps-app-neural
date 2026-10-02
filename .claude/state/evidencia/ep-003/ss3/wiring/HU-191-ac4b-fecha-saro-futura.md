# HU-191-ac4b-fecha-saro-futura

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:25.289438Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/importacion/plan-saro.test.ts apps/importacion-saro-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > acepta la fecha en DD/MM/AAAA y la guarda como AAAA-MM-DD 0ms
✓ packages/dominio/src/importacion/plan-saro.test.ts > plan · SARO y DISC (HU-191) > error: fecha SARO 15/11/2026 → grupo con error con su motivo y el valor exacto; las demás filas siguen 0ms
✓ apps/importacion-saro-panel.test.ts > SARO y DISC por importación (HU-191) > error: fecha SARO 15/11 futura → fila con error y su motivo, sin valor nuevo; la otra fila sigue 8ms
Test Files  2 passed (2)
Tests  18 passed (18)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N3 fecha futura aceptada: rc=1 · 1 failed | 17 passed (18)
N5 DD/MM/AAAA no se lee: rc=1 · 3 failed | 12 passed (15)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
