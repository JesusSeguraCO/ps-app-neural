# HU-176-ac1-registrar-tres-datos

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:06.354904Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts packages/contratos/src/ficha-saro.test.ts packages/ui/src/FichaPerfil.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/contratos/src/ficha-saro.test.ts > armarFicha · SARO y DISC > lleva el texto del alcance y «marzo de 2026»; la DISC con «abril de 2026» 5ms
✓ packages/ui/src/FichaPerfil.test.ts > FichaPerfil · SARO y DISC (HU-176, vista previa = ficha del portal) > en «Verificado por Trycore»: el texto del alcance con su mes, y la DISC con su mes 1ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · registrar los tres datos (tarea 1.6) > happy: guardar conserva el alcance elegido, la fecha SARO y la DISC; el editor lee el texto del alcance 21ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · registrar los tres datos (tarea 1.6) > un borrador se guarda con parte de los datos 9ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · registrar los tres datos (tarea 1.6) > el editor ofrece solo los alcances activos del catálogo, con su texto 1ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · registrar los tres datos (tarea 1.6) > HU-177: el editor no admite un alcance que no esté en el catálogo 11ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > happy: guardar los tres datos → 200; la vista previa muestra el texto del alcance con «marzo de 2026» y la DISC con «abril de 2026» 30ms
Test Files  4 passed (4)
Tests  39 passed (39)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M8 ficha sin línea SARO: rc=1 · 3 failed | 5 passed | 15 skipped (23)
M13 auditoría sin campos SARO: rc=1 · 3 failed | 28 passed (31)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
