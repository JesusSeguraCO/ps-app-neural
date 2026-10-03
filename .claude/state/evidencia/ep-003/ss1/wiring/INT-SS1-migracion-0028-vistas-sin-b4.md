# INT-SS1-migracion-0028-vistas-sin-b4

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:21.071031Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/migracion-0028.test.ts packages/infra/src/postgres/migracion-0027-0028-down.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0028.test.ts > índice: la 0028 está registrada > 0028_saro_disc_perfil en el proveedor estático 1ms
✓ packages/infra/src/postgres/migracion-0027-0028-down.test.ts > migraciones 0027 y 0028: down y up > bajar a la 0026 restaura lo anterior; subir lo devuelve 64ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > columnas y CHECK > fecha SARO o DISC posterior a hoy (Bogotá) → CHECK; hoy y antes se aceptan 15ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > columnas y CHECK > el alcance es una FK al catálogo cerrado: un id que no existe → violación de FK 2ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > sin alcance SARO → excepción y el perfil sigue en borrador 4ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > sin fecha SARO → excepción y el perfil sigue en borrador 3ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > sin fecha DISC → excepción y el perfil sigue en borrador 4ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > con los tres datos entra en publicado 4ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > un publicado que ya estaba no se toca al editar otra columna (D62: sigue visible) 3ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > guarda de publicar en la BD (tarea 1.7: SQL como ps_panel) > un alcance desactivado asignado sigue contando como registrado (HU-177 edge) 2ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > vistas del portal > ficha_publicable trae el texto del alcance (también desactivado), la fecha SARO y la DISC; el portal la lee 13ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > vistas del portal > catalogo_publicable trae el Sello Personal y las tecnologías en orden de carga 5ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > vistas del portal > ninguna vista que lee el portal expone la lista negra B.4, `vinculo` ni `aporte` 4ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > fusión de alcances (HU-143 reutilizada) > fusionar_valor('alcance_saro') reasigna los perfiles y retira el origen 3ms
Test Files  2 passed (2)
Tests  14 passed (14)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M11 vista ficha sin texto del alcance: rc=1 · 4 failed | 25 passed (29)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
