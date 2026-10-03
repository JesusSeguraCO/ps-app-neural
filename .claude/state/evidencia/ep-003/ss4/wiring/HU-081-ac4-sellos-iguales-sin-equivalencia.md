# HU-081-ac4-sellos-iguales-sin-equivalencia

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:31.294010Z
- comando: `npx vitest run --reporter=verbose apps/portal/src/seleccion/TarjetaPerfil.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-081 · competencias del Sello Personal > edge: dos perfiles con las mismas tres competencias se dibujan igual que cualquier otro, sin señal de equivalencia 1ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > happy y edge: sellos distintos, sin sello sin hueco, iguales sin equivalencia; ninguna insignia 9ms
Test Files  2 passed (2)
Tests  20 passed (20)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M22 señal de equivalencia: rc=1 · 2 failed | 9 passed (11)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
