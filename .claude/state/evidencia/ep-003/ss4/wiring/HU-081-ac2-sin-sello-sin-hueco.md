# HU-081-ac2-sin-sello-sin-hueco

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:29.224033Z
- comando: `npx vitest run --reporter=verbose apps/portal/src/seleccion/TarjetaPerfil.test.ts apps/tarjeta-portal.test.ts packages/infra/src/postgres/catalogo-sello.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-081 · competencias del Sello Personal > edge: sin Sello Personal → sin bloque, sin título ni hueco, sin relleno 1ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > sin sello: lista vacía y ningún registro 1ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > happy y edge: sellos distintos, sin sello sin hueco, iguales sin equivalencia; ninguna insignia 9ms
Test Files  3 passed (3)
Tests  26 passed (26)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M6 tarjeta sin sello: rc=1 · 1 failed | 10 passed (11)
M7 evidencia vacía con título: rc=1 · 1 failed | 10 passed (11)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
