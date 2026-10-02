# SS7 · journey smoke (tarea 7.7) y re-verificación de HU-120 (tarea 7.5)

Recorrido en navegador real (Chromium de Playwright) contra portal 3200 + panel 3201 de ESTE worktree y la BD
aislada `ps_ep003` (D125). Cinco perfiles publicados por la API del panel en una selección; al quinto se le quita
SARO (heredado, D62). Los incompletos que ya había en `ps_ep003` se completan al empezar y se reponen tal cual al
terminar (verificado: 12 antes, 12 después). Spec: `e2e/estandar-recorrido.portal.spec.ts`; regresión de D47 en
`e2e/acceso.portal.spec.ts` (Esc vuelve ahora a `/#p-0142`).
## Recorrido SS7: estándar descriptivo → completar el último incompleto en el panel → «Ningún perfil…» → teléfono sin bloqueo → 3 de 5 → extremos con botón y ← → cerrar en la misma posición; más los recorridos de SS4 y SS6

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:27:50Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="estandar-recorrido\.portal|ficha-saro-cierre\.portal|tarjeta-evidencia\.portal" npx playwright test --config .local/playwright.ep003.config.ts --project portal < /dev/null 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [portal] › e2e/estandar-recorrido.portal.spec.ts:83:7 › estándar Neural-Grid y recorrido de fichas (EP-003 · SS7) › selección con un incompleto (descriptiva) → completarlo en el panel → «ningún» → recorrer fichas hasta los extremos → cerrar en la misma posición (9.0s)
  ✓  2 [portal] › e2e/ficha-saro-cierre.portal.spec.ts:25:7 › ficha del perfil · SARO, DISC y cierre (EP-003 · SS6) › código → ficha completa (SARO, DISC, cierre, código al pie) → heredado sin SARO (sin línea ni marca) → completarlo en el panel → la ficha muestra la línea (2.5s)
  ✓  3 [portal] › e2e/tarjeta-evidencia.portal.spec.ts:27:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → banco filtrado (✓) → ficha con «Frente a tu búsqueda» (8.5s)
  3 passed (21.4s)
```
- rc: 0

## D47 · HU-120 en acceso.portal (Esc vuelve a /#p-0142)

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:28:12Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="acceso\.portal" npx playwright test --config .local/playwright.ep003.config.ts --project portal < /dev/null 2>&1 | grep -E "HU-120|passed|failed"`

```
  ✓   7 [portal] › e2e/acceso.portal.spec.ts:195:7 › cara cliente › D47 · HU-120: la ficha se abre sobre la lista, se recorre con flechas y teclado, Esc vuelve; axe y pantalla completa en el teléfono (882ms)
  12 passed (31.4s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:28:44Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts < /dev/null 2>&1 | grep -E "✘|passed|failed|skipped|flaky"`

```
  ✘  67 [panel] › e2e/marco.panel.spec.ts:812:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (1.9s)
  ✘  69 [panel] › e2e/marco.panel.spec.ts:952:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.2s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  68 passed (2.0m)
```
- rc: 0

Notas: las 2 fallas de la regresión son las conocidas del entorno aislado (SS1–SS6: `marco.panel.spec.ts:812`
origin 3101 fijo, `:952` navega a 3100). Si `estandar-recorrido` corre JUSTO después de `acceso.portal`, el código
de acceso no llega en 30 s (los topes de código que agota `acceso.portal` siguen vigentes): es orden de e2e en el
entorno, no del producto; en la regresión completa pasa. El gate `journey_smoke` NO se cierra aquí.
