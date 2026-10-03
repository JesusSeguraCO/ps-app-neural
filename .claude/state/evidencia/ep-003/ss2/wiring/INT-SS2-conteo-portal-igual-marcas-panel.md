# INT-SS2-conteo-portal-igual-marcas-panel

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:23.119968Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/entrada.test.ts packages/infra/src/postgres/incompletos.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > los indicadores completos son publicables con la misma guarda 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin SARO → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin DISC → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin modalidad → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > modalidad inactiva → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin consentimiento vigente → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin trayectoria → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > 0 cuando todos los publicados están completos; el número sale de la guarda, no de una copia 0ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > happy: cada heredado se marca con lo que le falta, sigue publicado y visible en el portal 61ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > la marca es de los publicados: borradores, pausados y archivados no se marcan 24ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > edge: un publicado completo sin Sello Personal no se marca y se edita y publica sin registrarlo 28ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.3 · editar un publicado incompleto > error: cambiar el resumen sin registrar SARO → la pregunta de D1 con lo que falta; nada se escribe 34ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.3 · editar un publicado incompleto > edge: registrar la fecha DISC y confirmar → el cambio se ve en el portal y deja de marcarse 33ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.4 · el conteo del portal es el de las marcas del panel > ps_portal cuenta con la misma guarda los publicados que el panel marca 23ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.4 · el conteo del portal es el de las marcas del panel > completar los que faltan baja el conteo a 0 en las dos caras 41ms
Test Files  2 passed (2)
Tests  29 passed (29)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M11 conteo ignora DISC: rc=1 · 1 failed | 6 passed (7) (tras reforzar el test, commit 7c5cedd)
M10 0029 sin lectura del portal: rc=1 · 4 failed | 8 passed (12)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
