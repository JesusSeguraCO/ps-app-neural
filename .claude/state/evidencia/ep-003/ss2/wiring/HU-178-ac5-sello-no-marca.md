# HU-178-ac5-sello-no-marca

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:19.021420Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/entrada.test.ts packages/infra/src/postgres/incompletos.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > un publicado completo, sin ninguna competencia del Sello Personal, no se marca (D63) 0ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > edge: un publicado completo sin Sello Personal no se marca y se edita y publica sin registrarlo 28ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > edge: un publicado completo sin Sello Personal no se marca; se edita y publica sin registrarlo 41ms
Test Files  3 passed (3)
Tests  42 passed (42)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M6 Sello cuenta para la guarda: rc=1 · 13 failed | 7 passed (20)
M5 marca también fuera de publicado: rc=1 · 7 failed | 22 passed (29)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
