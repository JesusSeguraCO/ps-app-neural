# HU-177-ac5-editar-perfil-con-alcance-desactivado

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:04.040151Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-177 · alcance desactivado (tarea 1.8) > editar el resumen de un publicado con el alcance desactivado: se confirma y queda publicado, conservándolo, sin marcarlo incompleto 38ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > edge: editar el resumen de un publicado que conserva un alcance desactivado → impacto sin pregunta; confirmar lo deja publicado con el alcance; el editor lo muestra señalado 67ms
Test Files  2 passed (2)
Tests  31 passed (31)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M5 desactivado conservado se rechaza al reenviarlo: rc=1 · 2 failed | 29 passed (31)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
