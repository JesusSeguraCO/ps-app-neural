# HU-081-ac1-sellos-distintos-sin-insignia

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:29.223813Z
- comando: `npx vitest run --reporter=verbose apps/portal/src/seleccion/TarjetaPerfil.test.ts apps/tarjeta-portal.test.ts packages/infra/src/postgres/catalogo-sello.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-081 · competencias del Sello Personal > happy: dos perfiles con sellos distintos muestran cada uno sus tres competencias como verificadas 2ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > un sello válido viaja tal cual (recortado), en su orden 4ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > happy y edge: sellos distintos, sin sello sin hueco, iguales sin equivalencia; ninguna insignia 9ms
Test Files  3 passed (3)
Tests  26 passed (26)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M6 tarjeta sin sello: rc=1 · 1 failed | 10 passed (11)
M18 la vista no lee el sello: rc=1 · 3 failed | 6 passed (9)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
