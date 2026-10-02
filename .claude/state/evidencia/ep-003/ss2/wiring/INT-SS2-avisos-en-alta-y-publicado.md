# INT-SS2-avisos-en-alta-y-publicado

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:24.948209Z
- comando: `npx vitest run --reporter=verbose apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-194 · aviso de lenguaje de inventario > gemelas: el alta y la edición de un publicado (previsualizar y confirmar) llevan el mismo aviso; el resumen también cuenta 43ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-194 · aviso de lenguaje de inventario > la observadora no guarda: 403 sin escribir 5ms
Test Files  1 passed (1)
Tests  13 passed (13)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M17 alta sin avisos: rc=1 · 1 failed | 12 passed (13)
M18 publicado sin avisos: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
