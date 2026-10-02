# HU-158-ac1-cierre-condiciones-sla-garantia

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:59:16.345694Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS6.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS6.test.ts > HU-158 · el cierre de la ficha > happy: condiciones operativas (Híbrido, 1 mes, idiomas, país) al final, SLA en el tamaño del texto y garantía de servicio 3ms
Test Files  1 passed (1)
Tests  8 passed (8)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M8 SLA en letra pequeña: rc=1 · 1 failed | 7 passed (8)
M11 la ciudad siempre: rc=1 · 1 failed | 7 passed (8)
M12 sin idiomas en las condiciones: rc=1 · 1 failed | 7 passed (8)
M13 sin la banda en las condiciones: rc=1 · 1 failed | 7 passed (8)
```
(scratchpad/mutar-ss6.py; código restaurado tras cada mutante; M1, M7, M9, M14, M16–M18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/ficha-saro-cierre.portal.spec.ts` 1/1 verde; mutantes de recorrido: M17 recorrido: marca «pendiente» en el heredado: rc=1 · 1 failed · M18 recorrido: SLA en letra pequeña: rc=1 · 1 failed
