# INT-SS2-ruta-gemela-listado-api

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:24.948036Z
- comando: `npx vitest run --reporter=verbose apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > happy: la API del listado marca los tres ejemplos (SARO, DISC, modalidad) y los deja publicados y en el portal 238ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > happy: la página filtra por «incompleto» con la marca de cada uno y su pestaña con el conteo 106ms
Test Files  1 passed (1)
Tests  13 passed (13)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M4 listado sin marca: rc=1 · 5 failed | 15 passed (20)
M19 filtro incompleto deja pasar todo: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
