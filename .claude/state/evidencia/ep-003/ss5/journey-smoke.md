# SS5 · journey smoke (tarea 5.6)

Recorrido de HU-154, HU-155 y HU-157 en navegador real (Chromium de Playwright) contra portal 3200 + panel
3201 de ESTE worktree y la BD aislada `ps_ep003` (D125). Dos perfiles publicados por la API del panel, uno
con reporte de validación confirmado (Nivel 1) y otro solo con la modalidad (Nivel 0); el código de acceso
lo envía el worker real (doble de Mailgun). El contacto se cambia en la pantalla del panel
(/administracion/contacto) bajo el candado compartido con los demás e2e y se repone al terminar.
Spec: `e2e/ficha-validacion-contacto.portal.spec.ts`.
## Recorrido SS5: código → ficha (verificado/declarado) → validación desplegable → contacto → cambiarlo en el panel → ficha y vista previa lo reflejan → Nivel 0

- sha: 70c9515f738a1c6525d6eb84e1ee7b56f691bf4d (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:24:57Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="ficha-validacion-contacto\.portal" npx playwright test --config .local/playwright.ep003.config.ts < /dev/null 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [portal] › e2e/ficha-validacion-contacto.portal.spec.ts:26:7 › ficha del perfil (EP-003 · SS5) › código → ficha (verificado/declarado) → validación técnica desplegable → contacto → cambiarlo en el panel → la ficha lo refleja (2.9s)
  1 passed (4.5s)
```
- rc: 0

## Recorrido SS5 (re-anclado a HEAD)

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:31:43Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="ficha-validacion-contacto\.portal|tarjeta-evidencia\.portal" npx playwright test --config .local/playwright.ep003.config.ts < /dev/null 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [portal] › e2e/ficha-validacion-contacto.portal.spec.ts:26:7 › ficha del perfil (EP-003 · SS5) › código → ficha (verificado/declarado) → validación técnica desplegable → contacto → cambiarlo en el panel → la ficha lo refleja (3.2s)
  ✓  2 [portal] › e2e/tarjeta-evidencia.portal.spec.ts:27:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda» (4.6s)
  -  4 [panel] › e2e/tarjeta-evidencia.portal.spec.ts:27:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda»
  2 passed (9.5s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:31:53Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts < /dev/null 2>&1 | grep -E "✘|passed|failed|skipped|flaky"`

```
  ✘  65 [panel] › e2e/marco.panel.spec.ts:812:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (1.3s)
  ✘  67 [panel] › e2e/marco.panel.spec.ts:952:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.0s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  66 passed (1.6m)
```
- rc: 0

Las 2 fallas son las conocidas del entorno aislado (SS1–SS4): `marco.panel.spec.ts:812` envía `origin`
3101 fijo y `:952` navega a 3100 fijo (la demo, con otra BD). El e2e del reporte de EP-006
(`marco.panel.spec.ts:499`) y el recorrido integrado de EP-006 se actualizaron al formato de HU-155.
El gate `journey_smoke` NO se cierra aquí.
