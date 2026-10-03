# HU-178-ac1c-incompleto-sin-modalidad

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:17.034109Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/entrada.test.ts packages/infra/src/postgres/incompletos.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin modalidad de prueba → «{ modalidadPrueba: [Object] }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado con la modalidad desactivada → «{ modalidadPrueba: [Object] }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin modalidad, sin SARO ni DISC → «{ modalidadPrueba: [Object], …(2) }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin modalidad → cuenta como incompleto 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > modalidad inactiva → cuenta como incompleto 0ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > happy: cada heredado se marca con lo que le falta, sigue publicado y visible en el portal 67ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > happy: la API del listado marca los tres ejemplos (SARO, DISC, modalidad) y los deja publicados y en el portal 102ms
Test Files  3 passed (3)
Tests  42 passed (42)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M3 modalidad siempre cumple: rc=1 · 8 failed | 34 passed (42)
M4 listado sin marca: rc=1 · 5 failed | 15 passed (20)
M19 filtro incompleto deja pasar todo: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
