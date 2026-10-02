# HU-176-ac4-corregir-dato-publicado

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:18.731683Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/saro-disc-perfil.test.ts packages/contratos/src/ficha-saro.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/contratos/src/ficha-saro.test.ts > armarFicha · SARO y DISC > corregir la fecha de un publicado declara el cambio de cara al cliente (HU-176 edge) 0ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · corregir el dato de un perfil publicado (tarea 1.7) > pasa por la confirmación de HU-126: previsualizar no escribe; confirmar cambia la ficha y deja quién, cuándo, antes y después 24ms
✓ packages/infra/src/postgres/saro-disc-perfil.test.ts > SARO y DISC en el perfil (HU-176, HU-177) > HU-176 · corregir el dato de un perfil publicado (tarea 1.7) > una fecha futura en un publicado tampoco se escribe 21ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > edge: corregir la fecha SARO de un publicado → el impacto la declara al cliente; confirmar → la ficha muestra febrero y el historial guarda quién, cuándo, antes y después 69ms
Test Files  3 passed (3)
Tests  35 passed (35)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M13 auditoría sin campos SARO: rc=1 · 3 failed | 28 passed (31)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
