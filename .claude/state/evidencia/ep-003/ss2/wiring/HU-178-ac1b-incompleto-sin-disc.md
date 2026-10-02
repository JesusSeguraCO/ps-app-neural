# HU-178-ac1b-incompleto-sin-disc

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:17.033834Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/entrada.test.ts packages/infra/src/postgres/incompletos.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin la fecha DISC → «{ disc: { fecha: false } }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin SARO ni DISC → «{ saro: [Object], disc: [Object] }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > estadoDeEntrada (HU-178) > publicado sin modalidad, sin SARO ni DISC → «{ modalidadPrueba: [Object], …(2) }» 0ms
✓ packages/dominio/src/inventario/entrada.test.ts > conteo de incompletos sobre los indicadores (HU-178 · D80; 0029) > sin DISC → cuenta como incompleto 0ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.2 · marca en el listado > happy: cada heredado se marca con lo que le falta, sigue publicado y visible en el portal 67ms
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.3 · editar un publicado incompleto > edge: registrar la fecha DISC y confirmar → el cambio se ve en el portal y deja de marcarse 35ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > happy: la API del listado marca los tres ejemplos (SARO, DISC, modalidad) y los deja publicados y en el portal 102ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > edge: registrar la fecha DISC → impacto sin pregunta; confirmar lo muestra en el portal y deja de marcarse 56ms
Test Files  3 passed (3)
Tests  42 passed (42)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M2 DISC siempre cumple: rc=1 · 9 failed | 33 passed (42)
M4 listado sin marca: rc=1 · 5 failed | 15 passed (20)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)
