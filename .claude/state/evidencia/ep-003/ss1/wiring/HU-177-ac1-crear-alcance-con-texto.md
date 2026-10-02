# HU-177-ac1-crear-alcance-con-texto

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:39:54.134601Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts packages/infra/src/postgres/alcances-saro.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/alcances-saro.test.ts > tipo de catálogo alcance_saro (dominio) > es un tipo de catálogo con su pestaña 1ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > crear sin duplicar (HU-177 happy y error; tarea 1.2) > happy: crea el alcance con su texto de cara al cliente, auditado; queda para elegir en el editor 16ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > crear sin duplicar (HU-177 happy y error; tarea 1.2) > sin texto de cara al cliente → rechazado, nada escrito 1ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > crear sin duplicar (HU-177 happy y error; tarea 1.2) > texto de más de 280 caracteres → rechazado con su motivo 0ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > crear sin duplicar (HU-177 happy y error; tarea 1.2) > error: idéntico salvo mayúsculas → duplicado con la forma registrada 1ms
✓ packages/infra/src/postgres/alcances-saro.test.ts > catálogo de alcances SARO (HU-177) > corregir el texto de un alcance en uso (HU-177 edge; tarea 1.3) > un catálogo sin texto de cara al cliente no tiene impacto de texto 2ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > happy: crear con su texto → 201; queda para elegir (sin texto libre) y el editor lo ofrece 340ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > el editor no admite escribir un alcance: texto → 400; id fuera del catálogo → 422 48ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > sin texto de cara al cliente → 422 `texto_cliente_requerido` 2ms
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-176 · captura y bloqueo > happy: guardar los tres datos → 200; la vista previa muestra el texto del alcance con «marzo de 2026» y la DISC con «abril de 2026» 39ms
Test Files  2 passed (2)
Tests  25 passed (25)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M7 texto de cara al cliente no exigido: rc=1 · 2 failed | 23 passed (25)
```
(scratchpad/mutar.py; código restaurado tras cada mutante)
