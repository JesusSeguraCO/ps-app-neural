# HU-159-ac4-conteo-no-disponible

- sha: 84bc6851123e936d7ef634ffe8cbf3396c75da45
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T22:31:54.029140Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/estandar.test.ts apps/estandar-portal.test.ts packages/infra/src/postgres/indicadores-tiempo.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/estandar.test.ts > fraseDelEstandar (HU-159, D80, D97) > sin conteo (falla o vence): la versión descriptiva 0ms
✓ packages/infra/src/postgres/indicadores-tiempo.test.ts > contarIncompletosConTiempo (HU-159, D97) > a tiempo: el mismo conteo que la guarda sin límite 14ms
✓ packages/infra/src/postgres/indicadores-tiempo.test.ts > contarIncompletosConTiempo (HU-159, D97) > si la consulta no responde a tiempo, rechaza al vencer el límite (no cuelga) 309ms
✓ packages/infra/src/postgres/indicadores-tiempo.test.ts > contarIncompletosConTiempo (HU-159, D97) > si la consulta falla (sin permiso sobre la vista), rechaza 5ms
✓ apps/estandar-portal.test.ts > encabezado del estándar (EP-003 · SS7) > HU-159 · error: el conteo no está disponible (D97) > versión descriptiva, los perfiles cargan, sin error en el encabezado y con registro técnico 14ms
Test Files  3 passed (3)
Tests  14 passed (14)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N2 sin conteo afirma «ningún»: rc=1 · 2 failed | 9 passed (11)
N9 sin tiempo acotado: rc=1 · 1 failed | 2 passed (3)
N10 el fallo del conteo tumba la página: rc=1 · 1 failed | 4 passed (5)
N11 sin registro técnico: rc=1 · 1 failed | 4 passed (5)
```
(scratchpad/mutar-ss7.py; código restaurado tras cada mutante; N1, N2, N5–N7, N10–N12, N14–N18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/estandar-recorrido.portal.spec.ts` 1/1 verde (3 de 5 en computador y teléfono, extremos con botón y ←, cerrar en la misma posición, teléfono sin bloqueo); mutantes de recorrido: N15 recorrido: la tarjeta sin ancla: rc=1 · 1 failed · N16 recorrido: anterior da la vuelta: rc=1 · 1 failed · N17 recorrido: encabezado fijo encima de la lista: rc=1 · 1 failed · N18 recorrido: cerrar sin la posición: rc=1 · 1 failed
