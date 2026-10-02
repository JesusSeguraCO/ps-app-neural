# HU-177-ac4-retirar-alcance-en-uso

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:01.723853Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/alcances-saro.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > retirar un alcance en uso (HU-177 edge; tarea 1.8) > desactivar: deja de ofrecerse, los 2 perfiles lo conservan y sus fichas lo siguen mostrando; no hay borrado 9ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-177 · alcance desactivado (tarea 1.8) > los perfiles que lo tenían lo conservan; no se asigna a uno que no lo tenía; el editor no lo ofrece 63ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > edge: desactivar un alcance en 2 publicados → 200 con 2 dependientes; deja de ofrecerse; los perfiles y sus fichas lo conservan; no hay borrado (DELETE no existe) 114ms
Test Files  3 passed (3)
Tests  41 passed (41)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M4 alcance desactivado asignable: rc=1 · 4 failed | 27 passed (31)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
