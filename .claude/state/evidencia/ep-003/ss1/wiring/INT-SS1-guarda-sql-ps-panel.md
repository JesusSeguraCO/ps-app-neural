# INT-SS1-guarda-sql-ps-panel

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:22.019811Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/migracion-0028.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > sin alcance SARO → excepción y el perfil sigue en borrador 3ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > sin fecha SARO → excepción y el perfil sigue en borrador 3ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > sin fecha DISC → excepción y el perfil sigue en borrador 2ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > con los tres datos entra en publicado 3ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > un publicado que ya estaba no se toca al editar otra columna (D62: sigue visible) 1ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > un alcance desactivado asignado sigue contando como registrado (HU-177 edge) 2ms
Test Files  1 passed (1)
Tests  13 passed (13)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M9 guarda BD sin DISC: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
