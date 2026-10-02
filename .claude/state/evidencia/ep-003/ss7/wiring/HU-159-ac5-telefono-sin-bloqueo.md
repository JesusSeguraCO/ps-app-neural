# HU-159-ac5-telefono-sin-bloqueo

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:54.564434Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/EncabezadoEstandar.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/EncabezadoEstandar.test.ts > HU-159 · encabezado del estándar > en el flujo de la página: una sección, sin diálogo, sin botón de cerrar ni aceptar, sin fijarse 1ms
Test Files  1 passed (1)
Tests  5 passed (5)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N8 el encabezado como ventana: rc=1 · 1 failed | 4 passed (5)
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
