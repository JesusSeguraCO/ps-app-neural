# HU-120-ac4-cerrar-misma-lista-y-posicion

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:58.268825Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/recorrido.test.ts apps/ficha-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/recorrido.test.ts > recorrido de fichas (HU-120) > en medio: posición y vecinos 1ms
✓ packages/dominio/src/catalogo/recorrido.test.ts > recorrido de fichas (HU-120) > HU-120 · cerrar vuelve a la misma lista, con su filtro, en la posición del perfil que estaba abierto 0ms
✓ packages/dominio/src/catalogo/recorrido.test.ts > recorrido de fichas (HU-120) > el recorrido dice qué perfil está abierto (para volver a su posición) 0ms
✓ apps/ficha-portal.test.ts > ficha del perfil en el portal (D47) > HU-120: la ficha se abre sobre la lista (que sigue detrás, inerte), con su posición y los vecinos en el orden del correo 22ms
✓ apps/ficha-portal.test.ts > ficha del perfil en el portal (D47) > en el banco la ficha recorre la lista del banco y vuelve a ella al cerrar 29ms
✓ apps/ficha-portal.test.ts > ficha del perfil en el portal (D47) > con un filtro aplicado, la ficha recorre solo la lista filtrada y al cerrar conserva el filtro 19ms
Test Files  2 passed (2)
Tests  16 passed (16)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N14 cerrar sin la posición: rc=1 · 5 failed | 11 passed (16)
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
