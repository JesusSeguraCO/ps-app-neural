# HU-177-ac2-identico-salvo-mayusculas

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:39:56.685426Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/alcances-saro.test.ts packages/infra/src/postgres/migracion-0027.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/migracion-0027.test.ts > migración 0027: catálogo de alcances SARO > idéntico salvo mayúsculas o tildes → violación del índice único (ni por carrera entra) 2ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > crear sin duplicar (HU-177 happy y error; tarea 1.2) > error: idéntico salvo mayúsculas → duplicado con la forma registrada 1ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > error: idéntico salvo mayúsculas → 409 `duplicado` con la forma registrada 3ms
Test Files  3 passed (3)
Tests  33 passed (33)
```

## Sensibilidad
Test nuevo escrito en rojo antes del código (fase red: el tipo `alcance_saro`, la condición `saro_fecha` y el 403 no existían); la mutación M1/M2 equivalente cubre la rama gemela de la guarda.

## Mutación (cierre de la épica, 2026-10-02T22:36:15Z, sha 9519de3703a26049157acb1fa822a3764ddb5234)

```
M16 identico salvo mayusculas no se rechaza en la app: rc=1 · 1 failed | 9 passed | 15 skipped (25)
M17 indice unico sin normalizar: rc=1 · 1 failed | 7 passed (8)
```
(scratchpad/mutar-cierre.py; código restaurado y panel recompilado tras cada mutante)
