# INT-SS1-fusion-alcance

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:27.965590Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/migracion-0028.test.ts packages/infra/src/postgres/alcances-saro.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > fusión de alcances (HU-143 reutilizada) > fusionar_valor('alcance_saro') reasigna los perfiles y retira el origen 4ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > fusionar alcances (HU-143 reutilizada) > reasigna los perfiles del origen, lo retira y audita cada perfil con origen «fusion» 10ms
Test Files  2 passed (2)
Tests  23 passed (23)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M10 fusión sin rama de alcance: rc=1 · 2 failed | 21 passed (23)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
