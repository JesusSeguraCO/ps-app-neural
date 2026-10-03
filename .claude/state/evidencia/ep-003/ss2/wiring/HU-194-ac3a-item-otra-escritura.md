# HU-194-ac3a-item-otra-escritura

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:20.933802Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/lenguaje.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/lenguaje.test.ts > avisosDeLenguaje (HU-194) > «Lideró la migración de un ITEM crítico del core bancario» → ["ITEM"] 0ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-194 · aviso de lenguaje de inventario > edge: «Lideró la migración de un ITEM crítico del core bancario» → [{"tipo":"lenguaje_inventario","expresion":"ITEM"}] 20ms
Test Files  2 passed (2)
Tests  28 passed (28)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M14 sin normalizar mayúsculas: rc=1 · 8 failed | 20 passed (28)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
