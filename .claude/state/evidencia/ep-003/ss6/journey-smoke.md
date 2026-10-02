# SS6 · journey smoke (tarea 6.6)

Recorrido de HU-156 y HU-158 en navegador real (Chromium de Playwright) contra portal 3200 + panel 3201 de
ESTE worktree y la BD aislada `ps_ep003` (D125). Dos perfiles publicados por la API del panel (uno con Sello
Personal); al segundo se le quita la verificación SARO ya publicado (heredado, D62); el código de acceso lo
envía el worker real (doble de Mailgun); la verificación SARO se completa en el editor del panel y se
confirma. Spec: `e2e/ficha-saro-cierre.portal.spec.ts`.
## Recorrido SS6: código → ficha completa (SARO, DISC con competencias, cierre, SLA en el tamaño del texto, código al pie, sin código en cabecera ni <title>) → heredado sin SARO (sin línea ni marca) → completarlo en el panel → la ficha muestra la línea

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:56:03Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="ficha-saro-cierre\.portal|ficha-validacion-contacto\.portal|tarjeta-evidencia\.portal" npx playwright test --config .local/playwright.ep003.config.ts < /dev/null 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [portal] › e2e/ficha-saro-cierre.portal.spec.ts:25:7 › ficha del perfil · SARO, DISC y cierre (EP-003 · SS6) › código → ficha completa (SARO, DISC, cierre, código al pie) → heredado sin SARO (sin línea ni marca) → completarlo en el panel → la ficha muestra la línea (2.8s)
  ✓  2 [portal] › e2e/ficha-validacion-contacto.portal.spec.ts:26:7 › ficha del perfil (EP-003 · SS5) › código → ficha (verificado/declarado) → validación técnica desplegable → contacto → cambiarlo en el panel → la ficha lo refleja (3.0s)
  ✓  3 [portal] › e2e/tarjeta-evidencia.portal.spec.ts:27:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda» (5.2s)
  -  6 [panel] › e2e/tarjeta-evidencia.portal.spec.ts:27:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda»
  3 passed (12.7s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:56:16Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts < /dev/null 2>&1 | grep -E "✘|passed|failed|skipped|flaky"`

```
  ✘  66 [panel] › e2e/marco.panel.spec.ts:812:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (1.5s)
  ✘  68 [panel] › e2e/marco.panel.spec.ts:952:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.1s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  67 passed (1.7m)
```
- rc: 0

Las 2 fallas son las conocidas del entorno aislado (SS1–SS5): `marco.panel.spec.ts:812` envía `origin`
3101 fijo y `:952` navega a 3100 fijo (la demo, con otra BD). El gate `journey_smoke` NO se cierra aquí.
