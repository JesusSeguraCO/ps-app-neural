# SS3 · journey smoke (tarea 3.6)

Recorrido de HU-191 en navegador real (Chromium de Playwright) contra los servidores standalone de ESTE
worktree (portal 3200, panel 3201) y la BD aislada `ps_ep003` (D125), con el worker real del worktree
(`apps/worker/dist/worker.js`, fronteras como dobles con APP_ENV=local) arrancado por el spec para aplicar
el lote. Los tres heredados los fabrica el spec (publicados completos y luego sin SARO por SQL).
Spec: `e2e/importacion-saro.panel.spec.ts`.
## Lint (eslint .)

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:23:11Z
- comando: `bash -c npx eslint . && echo "eslint: 0 errores"`

```
eslint: 0 errores
```
- rc: 0

## Tipos (npm run typecheck)

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:23:13Z
- comando: `bash -c npm run typecheck >/dev/null 2>&1 && echo "typecheck: workspaces sin errores"`

```
typecheck: workspaces sin errores
```
- rc: 0

## Recorrido SS3: exportar → completar SARO/DISC de tres incompletos → pegar → vista previa → confirmar (worker) → listado sin marcas → ficha con SARO y DISC

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:23:19Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SPEC="importacion-saro\.panel" npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [panel] › e2e/importacion-saro.panel.spec.ts:173:7 › SARO y DISC por importación (HU-191) › exportar → completar tres incompletos → pegar → vista previa → confirmar → listado sin marcas → ficha con SARO y DISC (2.8s)
  1 passed (4.2s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:23:23Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✘|passed|failed|skipped|flaky"`

```
  ✘  63 [panel] › e2e/marco.panel.spec.ts:811:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (738ms)
  ✘  65 [panel] › e2e/marco.panel.spec.ts:951:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.0s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  64 passed (1.3m)
```
- rc: 0

Las 2 fallas son las conocidas del entorno aislado (SS1, SS2): `marco.panel.spec.ts:811` envía `origin`
3101 fijo y `:951` navega a 3100 fijo (la demo, con otra BD).

## Veredicto
Recorrido SS3 verde en navegador real (1/1, con el worker real), suite completa verde (128 ficheros,
1414 tests), lint y tipos limpios, regresión e2e 64 verdes + las 2 fallas de puerto fijo conocidas. El
gate `journey_smoke` NO se cierra aquí.
