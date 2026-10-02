# HU-177-ac3-corregir-texto-en-uso

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:39:59.115201Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/alcances-saro.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3) > el impacto previo cuenta las 4 fichas publicadas (no los borradores); confirmar audita antes/después y el portal ve el texto nuevo 34ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3) > el impacto de la modalidad de prueba (gemela: también un texto de cara al cliente en fichas) se calcula igual 2ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3) > un catálogo sin texto de cara al cliente no tiene impacto de texto 2ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > edge: corregir el texto de un alcance en 4 fichas publicadas → aviso previo de 4 sin escribir; confirmar → las 4 muestran el texto nuevo y el historial guarda quién, cuándo, antes y después 141ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > edge: editar el resumen de un publicado que conserva un alcance desactivado → impacto sin pregunta; confirmar lo deja publicado con el alcance; el editor lo muestra señalado 63ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > edge: corregir la fecha SARO de un publicado → el impacto la declara al cliente; confirmar → la ficha muestra febrero y el historial guarda quién, cuándo, antes y después 62ms
Test Files  2 passed (2)
Tests  25 passed (25)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M6 impacto de texto vacío: rc=1 · 3 failed | 22 passed (25)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
