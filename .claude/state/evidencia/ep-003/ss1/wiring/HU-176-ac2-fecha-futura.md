# HU-176-ac2-fecha-futura

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:08.891166Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts packages/dominio/src/inventario/validaciones-entrada.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/validaciones-entrada.test.ts > validarFechaVerificacion (HU-176 error) > posterior a hoy → rechazada con el mensaje del panel 2ms
✓ packages/dominio/src/inventario/validaciones-entrada.test.ts > validarFechaVerificacion (HU-176 error) > ilegible o inexistente → rechazada como ilegible 0ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · una fecha futura (tarea 1.6) > saroFecha posterior a hoy → rechazada con su campo, sin escribir: el perfil conserva lo que tenía 12ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · una fecha futura (tarea 1.6) > discFecha posterior a hoy → rechazada con su campo, sin escribir: el perfil conserva lo que tenía 9ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · una fecha futura (tarea 1.6) > una fecha ilegible → rechazada 16ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · corregir el dato de un perfil publicado (tarea 1.7) > una fecha futura en un publicado tampoco se escribe 19ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > error: una fecha posterior a hoy → 422 con su campo y mensaje; el perfil conserva lo que tenía 32ms
Test Files  3 passed (3)
Tests  45 passed (45)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M3 fecha futura aceptada: rc=1 · 4 failed | 41 passed (45)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
