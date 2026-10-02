# INT-SS1-migracion-0027-catalogo-permisos

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:19.921441Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/migracion-0027.test.ts packages/infra/src/postgres/migracion-0027-0028-down.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0027.test.ts > índice: la 0027 está registrada > 0027_catalogo_alcances_saro en el proveedor estático 1ms
✓ packages/infra/src/postgres/migracion-0027-0028-down.test.ts > migraciones 0027 y 0028: down y up > bajar a la 0026 restaura lo anterior; subir lo devuelve 75ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > el panel crea un alcance con su texto de cara al cliente; nace activo y sin fusionar 8ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > idéntico salvo mayúsculas o tildes → violación del índice único (ni por carrera entra) 3ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > el texto de cara al cliente es obligatorio y de 1 a 280 caracteres 6ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > un fusionado queda inactivo (CHECK fusionado ⇒ no activo) 1ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > nadie borra un alcance: panel y worker sin DELETE (CON-11) 11ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > el portal no lee la tabla (V3-2); el worker la lee (importación, reversión) pero no la escribe (catálogo cerrado) 13ms
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > batería de permisos: ninguna tabla de inventario tiene DELETE para un rol de conexión ni SELECT para el portal 2ms
Test Files  2 passed (2)
Tests  9 passed (9)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M12 0027 portal con lectura: rc=1 · 1 failed | 7 passed (8)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
