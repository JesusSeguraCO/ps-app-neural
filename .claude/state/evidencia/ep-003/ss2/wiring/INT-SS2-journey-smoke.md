# SS2 · journey smoke (tarea 2.8)

Recorrido de HU-178 → HU-194 en navegador real (Chromium de Playwright) contra los servidores standalone de
ESTE worktree (portal 3200, panel 3201) y la BD aislada `ps_ep003` (migrada a la 0029; D125: la BD
compartida `ps` NO se migra). Mismo entorno que SS1 (`.local/playwright.ep003.config.ts`, fuera de Git, con
`SOLO_SPEC`). El heredado del recorrido lo fabrica el propio spec (publicado completo y luego sin SARO por
SQL), así no altera PS-0142 ni los demás ficticios fijados. Spec: `e2e/incompleto-lenguaje.panel.spec.ts`.
## Lint (eslint .)

- sha: ce09f7fe3b4ab53065a0cb315a424037120e7cab (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:04:22Z
- comando: `bash -c npx eslint . && echo "eslint: 0 errores"`

```
eslint: 0 errores
```
- rc: 0

## Tipos (npm run typecheck)

- sha: ce09f7fe3b4ab53065a0cb315a424037120e7cab (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:04:25Z
- comando: `bash -c npm run typecheck >/dev/null 2>&1 && echo "typecheck: workspaces sin errores"`

```
typecheck: workspaces sin errores
```
- rc: 0

## Recorrido SS2: marcado → editar sin completar (pregunta) → completar y confirmar (desmarca) → trayectoria con «stock» (aviso, guardado); borrador: aviso aparte del 422 y retirado al corregir

- sha: ce09f7fe3b4ab53065a0cb315a424037120e7cab (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:04:31Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="incompleto-lenguaje\.panel" npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:150:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › marcado → editar sin completar (pregunta) → completar y confirmar (deja de marcarse) → trayectoria con «stock» (aviso, guardado) (2.1s)
  ✓  2 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:242:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › borrador: el aviso va aparte del error de la fecha futura y se retira al corregir la frase (780ms)
  2 passed (4.3s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: ce09f7fe3b4ab53065a0cb315a424037120e7cab (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:04:36Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✘|passed|failed|skipped|flaky"`

```
  ✘  62 [panel] › e2e/marco.panel.spec.ts:811:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (632ms)
  ✘  64 [panel] › e2e/marco.panel.spec.ts:951:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.1s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  63 passed (1.3m)
```
- rc: 0

Las 2 fallas de la regresión son las mismas de SS1, del entorno aislado y no del código:
`marco.panel.spec.ts:811` envía `origin: http://127.0.0.1:3101` fijo (el CSRF del panel en 3201 lo
rechaza) y `marco.panel.spec.ts:951` navega a `http://127.0.0.1:3100` fijo (la demo, con otra BD).

## Veredicto
Recorrido SS2 verde en navegador real (2/2), suite completa verde (124 ficheros, 1386 tests), lint y tipos
limpios, regresión e2e 63 verdes + las 2 fallas de puerto fijo conocidas. El gate `journey_smoke` NO se
cierra aquí (se cierra al final de la épica).

## Mutación

```
M20 UI no retira el aviso: el e2e cae (1 failed | 1 passed)
M21 UI pregunta sin motivo: el e2e cae (1 failed | 1 passed)
```
