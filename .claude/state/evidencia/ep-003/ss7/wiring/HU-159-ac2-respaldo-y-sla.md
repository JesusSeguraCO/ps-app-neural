# HU-159-ac2-respaldo-y-sla

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:50.702324Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/EncabezadoEstandar.test.ts apps/estandar-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/EncabezadoEstandar.test.ts > HU-159 · respaldo y plazo a la vista > Trycore University, Hive Mind, la Coordinación de Servicio dedicada y el SLA en el tamaño del texto 0ms
✓ apps/estandar-portal.test.ts > encabezado del estándar (EP-003 · SS7) > HU-159 · el respaldo y el plazo a la vista > la selección trae Trycore University, Hive Mind, la Coordinación de Servicio dedicada y el SLA 13ms
Test Files  2 passed (2)
Tests  10 passed (10)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N12 respaldo sin Hive Mind: rc=1 · 2 failed | 8 passed (10)
N13 SLA del respaldo en letra pequeña: rc=1 · 1 failed | 4 passed (5)
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
