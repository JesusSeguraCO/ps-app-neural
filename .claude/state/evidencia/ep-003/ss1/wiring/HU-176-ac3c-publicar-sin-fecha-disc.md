# HU-176-ac3c-publicar-sin-fecha-disc

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:16.442933Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts packages/dominio/src/inventario/validaciones-entrada.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/validaciones-entrada.test.ts > evaluarPublicacion · SARO y DISC (HU-176) > falta la fecha de la evaluación DISC → no publicable, «Falta <motivo>» exacto y salto a su campo 0ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > falta la fecha de la evaluación DISC → «Falta …» exacto, campo de destino, sigue en borrador y fuera del portal 18ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > error: publicar sin la fecha de la evaluación DISC → 409 con «Falta …» y su campo; sigue en borrador y fuera del portal 35ms
Test Files  3 passed (3)
Tests  45 passed (45)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M2 guarda: disc_fecha siempre cumple: rc=1 · 4 failed | 41 passed (45)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
