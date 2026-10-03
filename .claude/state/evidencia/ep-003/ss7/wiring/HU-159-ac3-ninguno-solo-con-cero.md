# HU-159-ac3-ninguno-solo-con-cero

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:52.297072Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/estandar.test.ts apps/estandar-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/estandar.test.ts > fraseDelEstandar (HU-159, D80, D97) > 0 incompletos: afirma que ningún perfil llega al portal sin las tres validaciones 1ms
✓ packages/dominio/src/catalogo/estandar.test.ts > fraseDelEstandar (HU-159, D80, D97) > 1 o más incompletos: describe lo que el estándar exige, sin «ningún» ni afirmar que todos cumplen 0ms
✓ packages/dominio/src/catalogo/estandar.test.ts > fraseDelEstandar (HU-159, D80, D97) > ninguna frase incluye un número ni nombra perfiles 0ms
✓ apps/estandar-portal.test.ts > encabezado del estándar (EP-003 · SS7) > HU-159 · «ninguno» solo con 0 incompletos (D80, HU-178) > 0 → afirma; 1 → describe sin «ningún» ni número; completar el último devuelve la afirmación 32ms
Test Files  2 passed (2)
Tests  11 passed (11)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N1 con 1 incompleto afirma «ningún»: rc=1 · 3 failed | 8 passed (11)
N3 la frase dice el número: rc=1 · 4 failed | 2 passed (6)
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
