# INT-SS1-ficha-portal-ps-portal

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:30.737940Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/migracion-0028.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts packages/infra/src/postgres/alcances-saro.test.ts apps/validaciones-entrada-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3) > el impacto previo cuenta las 4 fichas publicadas (no los borradores); confirmar audita antes/después y el portal ve el texto nuevo 46ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3) > el impacto de la modalidad de prueba (gemela: también un texto de cara al cliente en fichas) se calcula igual 1ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > retirar un alcance en uso (HU-177 edge; tarea 1.8) > desactivar: deja de ofrecerse, los 2 perfiles lo conservan y sus fichas lo siguen mostrando; no hay borrado 13ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > falta el alcance de la verificación SARO → «Falta …» exacto, campo de destino, sigue en borrador y fuera del portal 29ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > falta la fecha de la verificación SARO → «Falta …» exacto, campo de destino, sigue en borrador y fuera del portal 17ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > vistas del portal > ficha_publicable trae el texto del alcance (también desactivado), la fecha SARO y la DISC; el portal la lee 10ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > vistas del portal > catalogo_publicable trae el Sello Personal y las tecnologías en orden de carga 6ms
✓ packages/infra/src/postgres/migracion-0028.test.ts > migración 0028: SARO y DISC en el perfil > vistas del portal > ninguna vista que lee el portal expone la lista negra B.4, `vinculo` ni `aporte` 4ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > falta la fecha de la evaluación DISC → «Falta …» exacto, campo de destino, sigue en borrador y fuera del portal 15ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > con los tres publica y el portal ve el texto del alcance y las fechas 14ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > edge: corregir el texto de un alcance en 4 fichas publicadas → aviso previo de 4 sin escribir; confirmar → las 4 muestran el texto nuevo y el historial guarda quién, cuándo, antes y después 115ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > edge: desactivar un alcance en 2 publicados → 200 con 2 dependientes; deja de ofrecerse; los perfiles y sus fichas lo conservan; no hay borrado (DELETE no existe) 104ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > error: publicar sin el alcance de la verificación SARO → 409 con «Falta …» y su campo; sigue en borrador y fuera del portal 24ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > error: publicar sin la fecha de la verificación SARO → 409 con «Falta …» y su campo; sigue en borrador y fuera del portal 24ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > error: publicar sin la fecha de la evaluación DISC → 409 con «Falta …» y su campo; sigue en borrador y fuera del portal 26ms
Test Files  4 passed (4)
Tests  54 passed (54)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M11 vista ficha sin texto del alcance: rc=1 · 4 failed | 25 passed (29)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
