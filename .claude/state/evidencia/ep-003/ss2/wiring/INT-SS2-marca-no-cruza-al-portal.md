# INT-SS2-marca-no-cruza-al-portal

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:26.989523Z
- comando: `npx vitest run --reporter=verbose apps/incompletos-lenguaje-panel.test.ts packages/infra/src/postgres/migracion-0029.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0029.test.ts > migración 0029: indicadores de publicación > solo booleanos y enteros: ni código, ni identificador, ni dato personal 3ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > la marca no cruza al portal: ninguna vista que lee ps_portal la tiene 3ms
Test Files  2 passed (2)
Tests  18 passed (18)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M12 0029 expone una marca: rc=1 · 4 failed | 14 passed (18)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
