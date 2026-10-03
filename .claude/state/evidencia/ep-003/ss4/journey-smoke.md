# SS4 · journey smoke (tarea 4.7)

Recorrido de HU-153, HU-081 y HU-119 en navegador real (Chromium de Playwright) contra los servidores
standalone de ESTE worktree (portal 3200, panel 3201) y la BD aislada `ps_ep003` (D125). Los tres perfiles
se publican por la API del panel (con SARO, DISC y Sello Personal); el código de acceso lo envía el worker
real del worktree con el doble de Mailgun (APP_ENV=local) y el spec lo lee de su registro.
Spec: `e2e/tarjeta-evidencia.portal.spec.ts`.
## Recorrido SS4: código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda»

- sha: 8a0292008a794910192e8b6df1de10441b9b2038 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:58:25Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="tarjeta-evidencia\.portal" npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [portal] › e2e/tarjeta-evidencia.portal.spec.ts:250:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda» (3.2s)
  -  2 [panel] › e2e/tarjeta-evidencia.portal.spec.ts:250:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda»
  1 passed (4.9s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: 8a0292008a794910192e8b6df1de10441b9b2038 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:58:30Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✘|passed|failed|skipped|flaky"`

```
  ✘  64 [panel] › e2e/marco.panel.spec.ts:811:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (858ms)
  ✘  66 [panel] › e2e/marco.panel.spec.ts:951:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.0s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  65 passed (1.4m)
```
- rc: 0

Las 2 fallas son las conocidas del entorno aislado (SS1–SS3): `marco.panel.spec.ts:811` envía `origin`
3101 fijo y `:951` navega a 3100 fijo (la demo, con otra BD). 65 verdes (64 de SS3 + el recorrido de SS4).
El gate `journey_smoke` NO se cierra aquí.
