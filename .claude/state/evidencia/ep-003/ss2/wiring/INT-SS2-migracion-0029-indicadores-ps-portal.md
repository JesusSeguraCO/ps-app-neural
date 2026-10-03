# INT-SS2-migracion-0029-indicadores-ps-portal

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:21.874346Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/migracion-0029.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0029.test.ts > índice: la 0029 está registrada > 0029_indicadores_publicacion en el proveedor estático, la última 1ms
✓ packages/infra/src/postgres/migracion-0029.test.ts > migración 0029: indicadores de publicación > solo booleanos y enteros: ni código, ni identificador, ni dato personal 3ms
✓ packages/infra/src/postgres/migracion-0029.test.ts > migración 0029: indicadores de publicación > una fila por perfil publicado, legible por ps_portal (los heredados incompletos incluidos) 6ms
✓ packages/infra/src/postgres/migracion-0029.test.ts > migración 0029: indicadores de publicación > ps_panel la lee; ps_worker no 7ms
✓ packages/infra/src/postgres/migracion-0029.test.ts > migración 0029: indicadores de publicación > down la retira y up la devuelve con la misma lectura del portal 26ms
Test Files  1 passed (1)
Tests  5 passed (5)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M10 0029 sin lectura del portal: rc=1 · 4 failed | 8 passed (12)
M12 0029 expone una marca: rc=1 · 4 failed | 14 passed (18)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
