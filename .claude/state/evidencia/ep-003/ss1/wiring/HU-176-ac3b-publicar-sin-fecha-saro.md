# HU-176-ac3b-publicar-sin-fecha-saro

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:13.983656Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts packages/dominio/src/inventario/validaciones-entrada.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/validaciones-entrada.test.ts > evaluarPublicacion · SARO y DISC (HU-176) > falta la fecha de la verificación SARO → no publicable, «Falta <motivo>» exacto y salto a su campo 0ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · publicar sin SARO o sin DISC (tarea 1.7) > falta la fecha de la verificación SARO → «Falta …» exacto, campo de destino, sigue en borrador y fuera del portal 13ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > error: publicar sin la fecha de la verificación SARO → 409 con «Falta …» y su campo; sigue en borrador y fuera del portal 29ms
Test Files  3 passed (3)
Tests  45 passed (45)
```

## Sensibilidad
Test nuevo escrito en rojo antes del código (fase red: el tipo `alcance_saro`, la condición `saro_fecha` y el 403 no existían); la mutación M1/M2 equivalente cubre la rama gemela de la guarda.

## Mutación (cierre de la épica, 2026-10-02T22:36:15Z, sha 9519de3703a26049157acb1fa822a3764ddb5234)

```
M14 guarda: saro_fecha siempre cumple: rc=1 · 4 failed | 41 passed (45)
```
(scratchpad/mutar-cierre.py; código restaurado y panel recompilado tras cada mutante)
