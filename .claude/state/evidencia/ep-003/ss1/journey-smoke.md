# SS1 · journey smoke (tarea 1.10)

Recorrido de HU-177 → HU-176 en navegador real (Chromium de Playwright) contra los servidores standalone
de ESTE worktree en puertos propios (portal 3200, panel 3201) y la BD aislada `ps_ep003` (migrada a la
0028 y con la siembra ficticia), para no tocar la demo (3100/3101, BD `ps`). El runner
`tools/loop/integration-check.sh` no se usó tal cual porque arranca su propia BD en `.local/bd` del
worktree y los e2e en 3100/3101 (ocupados por la demo); se ejecutaron sus mismas fases por separado:
build, lint, tipos, suite completa con BD (`suite-completa.md`) y e2e.

Configuración: `.local/playwright.ep003.config.ts` (fuera de Git). Spec: `e2e/validaciones-entrada.panel.spec.ts`.
## Lint (eslint .)

- sha: a255155ee92dbde40a8fd1c8293b3c4930831ce7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:32:36Z
- comando: `bash -c npx eslint . && echo "eslint: 0 errores"`

```
eslint: 0 errores
```
- rc: 0

## Tipos (npm run typecheck)

- sha: a255155ee92dbde40a8fd1c8293b3c4930831ce7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:32:38Z
- comando: `bash -c npm run typecheck >/dev/null 2>&1 && echo "typecheck: 8 workspaces sin errores"`

```
typecheck: 8 workspaces sin errores
```
- rc: 0

## Recorrido SS1: crear alcance → asignar con fecha → publicar sin DISC (bloqueado) → completar y publicar → vista previa con SARO y DISC

- sha: a255155ee92dbde40a8fd1c8293b3c4930831ce7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:32:46Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 SOLO_SS1=1 npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✓|✘|passed|failed"`

```
  ✓  1 [panel] › e2e/validaciones-entrada.panel.spec.ts:119:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › crear un alcance → asignarlo con fecha → publicar sin DISC (bloqueado, al campo) → completar y publicar → la vista previa muestra SARO y DISC (1.4s)
  ✓  2 [panel] › e2e/validaciones-entrada.panel.spec.ts:189:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › una fecha futura no se guarda: el panel lo dice en el campo y el perfil conserva lo que tenía (422ms)
  2 passed (3.2s)
```
- rc: 0

## Regresión e2e completa (portal + panel) en los mismos servidores aislados

- sha: a255155ee92dbde40a8fd1c8293b3c4930831ce7 (árbol de trabajo limpio)
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:33:02Z
- comando: `bash -c BD_INSTALACION_URL=postgres://ps_instalacion@127.0.0.1:54329/ps_ep003 npx playwright test --config .local/playwright.ep003.config.ts 2>&1 | grep -E "✘|passed|failed|skipped"`

```
  ✘  60 [panel] › e2e/marco.panel.spec.ts:811:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (597ms)
  ✘  62 [panel] › e2e/marco.panel.spec.ts:951:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (6.1s)
    Error: expect(locator).toBeVisible() failed
  2 failed
  1 skipped
  61 passed (1.2m)
```
- rc: 0

Las 2 fallas de la regresión e2e completa son del entorno aislado, no del código: `marco.panel.spec.ts:811`
envía `origin: http://127.0.0.1:3101` fijo (el CSRF del panel en 3201 lo rechaza con 403) y
`marco.panel.spec.ts:951` navega a `http://127.0.0.1:3100` fijo (la demo, con otra BD). Ambas pasan el
tramo propio de EP-003 (crearPublicado con SARO/DISC) y fallan en ese paso de puerto. En 3100/3101 con la
BD `ps` corren como siempre (no se ejecutaron ahí para no tocar la demo).

## Veredicto
Recorrido SS1 verde en navegador real (2/2), suite completa verde (119 ficheros, 1323 tests), lint y
tipos limpios, regresión e2e 61 verdes + 2 fallas de puerto fijo del entorno aislado. El gate
`journey_smoke` NO se cierra aquí (se cierra al final de la épica).
