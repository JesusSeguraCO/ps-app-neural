# HU-156-ac2-heredado-sin-dato-sin-marca

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:59:15.764431Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS6.test.ts apps/ficha-ss6-portal.test.ts packages/contratos/src/ficha-saro.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/contratos/src/ficha-saro.test.ts > armarFicha · SARO y DISC > sin dato (heredado o borrador): no viaja y el contrato del portal lo admite 1ms
✓ packages/ui/src/FichaSS6.test.ts > HU-156 · SARO y DISC como contenido > error · heredado sin SARO: ni la línea ni una marca; el resto completo 1ms
✓ packages/ui/src/FichaSS6.test.ts > HU-156 · SARO y DISC como contenido > error · heredado sin fecha DISC: ni la línea ni una marca; el Sello Personal registrado sigue a la vista 2ms
✓ apps/ficha-ss6-portal.test.ts > ficha · SARO/DISC y cierre (EP-003 · SS6) > HU-156 · SARO y DISC en la ficha del portal > error: los heredados sin SARO o sin DISC siguen abriendo su ficha, sin la línea y sin marca de incompleto 52ms
Test Files  3 passed (3)
Tests  16 passed (16)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M1 SARO ausente con marca «pendiente»: rc=1 · 2 failed | 10 passed (12)
M4 sin DISC se pierde el Sello Personal: rc=1 · 1 failed | 7 passed (8)
M16 el contrato no admite el heredado sin SARO: rc=1 · 1 failed | 3 passed (4)
```
(scratchpad/mutar-ss6.py; código restaurado tras cada mutante; M1, M7, M9, M14, M16–M18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/ficha-saro-cierre.portal.spec.ts` 1/1 verde; mutantes de recorrido: M17 recorrido: marca «pendiente» en el heredado: rc=1 · 1 failed · M18 recorrido: SLA en letra pequeña: rc=1 · 1 failed
