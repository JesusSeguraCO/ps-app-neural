# INT-SS1-publicacion-masiva

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:24.380398Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > publicación masiva: el que no cumple queda con su motivo y no aborta a los demás 35ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > publicación masiva: el que no tiene DISC queda con su motivo y no aborta a los demás 38ms
Test Files  2 passed (2)
Tests  31 passed (31)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M2 guarda: disc_fecha siempre cumple: rc=1 · 4 failed | 41 passed (45)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
