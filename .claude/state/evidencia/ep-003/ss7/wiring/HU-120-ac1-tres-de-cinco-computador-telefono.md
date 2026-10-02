# HU-120-ac1-tres-de-cinco-computador-telefono

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:56.141250Z
- comando: `npx vitest run --reporter=verbose apps/ficha-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ apps/ficha-portal.test.ts > ficha del perfil en el portal (D47) > HU-120: cada perfil disponible ofrece «Ver ficha»; el que cambió de estado no; sin ficha pedida no hay diálogo 73ms
✓ apps/ficha-portal.test.ts > ficha del perfil en el portal (D47) > HU-120: la ficha se abre sobre la lista (que sigue detrás, inerte), con su posición y los vecinos en el orden del correo 23ms
✓ apps/ficha-portal.test.ts > ficha del perfil en el portal (D47) > HU-120 · error: en el primero la flecha anterior está deshabilitada; en el último, la siguiente 38ms
Test Files  1 passed (1)
Tests  9 passed (9)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N16 recorrido: anterior da la vuelta: rc=1 · 1 failed
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
