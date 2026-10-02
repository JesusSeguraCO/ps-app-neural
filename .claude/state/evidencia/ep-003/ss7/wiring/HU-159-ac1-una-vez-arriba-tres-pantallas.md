# HU-159-ac1-una-vez-arriba-tres-pantallas

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:49.089106Z
- comando: `npx vitest run --reporter=verbose apps/estandar-portal.test.ts packages/ui/src/EncabezadoEstandar.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/EncabezadoEstandar.test.ts > HU-159 · encabezado del estándar > explica las cuatro dimensiones y dice la frase una sola vez (Ningún perfi…) 5ms
✓ packages/ui/src/EncabezadoEstandar.test.ts > HU-159 · encabezado del estándar > explica las cuatro dimensiones y dice la frase una sola vez (El estándar …) 1ms
✓ packages/ui/src/EncabezadoEstandar.test.ts > HU-159 · encabezado del estándar > en el flujo de la página: una sección, sin diálogo, sin botón de cerrar ni aceptar, sin fijarse 1ms
✓ apps/estandar-portal.test.ts > encabezado del estándar (EP-003 · SS7) > HU-159 · el estándar se declara una vez, arriba > selección, banco y encuadre sin selección: antes del primer contenido, una vez, sin insignias en las tarjetas 169ms
✓ apps/estandar-portal.test.ts > encabezado del estándar (EP-003 · SS7) > HU-159 · el estándar se declara una vez, arriba > en el flujo de la página: sin diálogo ni nada que cerrar o aceptar 14ms
Test Files  2 passed (2)
Tests  10 passed (10)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N5 el encabezado después de la lista: rc=1 · 1 failed | 4 passed (5)
N6 sin encabezado en el encuadre: rc=1 · 1 failed | 4 passed (5)
N7 sin encabezado en el banco: rc=1 · 1 failed | 4 passed (5)
N4 cinco componentes: rc=1 · 3 failed | 8 passed (11)
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
