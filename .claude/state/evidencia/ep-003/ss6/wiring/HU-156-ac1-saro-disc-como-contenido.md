# HU-156-ac1-saro-disc-como-contenido

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:59:14.079363Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS6.test.ts apps/ficha-ss6-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS6.test.ts > HU-156 · SARO y DISC como contenido > happy: SARO con el texto del alcance y «marzo de 2026»; DISC con «abril de 2026» y sus tres competencias 8ms
✓ packages/ui/src/FichaSS6.test.ts > HU-158 · el cierre de la ficha > happy: condiciones operativas (Híbrido, 1 mes, idiomas, país) al final, SLA en el tamaño del texto y garantía de servicio 6ms
✓ apps/ficha-ss6-portal.test.ts > ficha · SARO/DISC y cierre (EP-003 · SS6) > HU-156 · SARO y DISC en la ficha del portal > happy: un publicado completo muestra el texto del alcance con «marzo de 2026» y la DISC con «abril de 2026» 91ms
Test Files  2 passed (2)
Tests  12 passed (12)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M2 DISC sin sus competencias: rc=1 · 1 failed | 7 passed (8)
M3 Sello Personal también en fila aparte: rc=1 · 1 failed | 7 passed (8)
M6 SARO como insignia: rc=1 · 1 failed | 7 passed (8)
```
(scratchpad/mutar-ss6.py; código restaurado tras cada mutante; M1, M7, M9, M14, M16–M18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/ficha-saro-cierre.portal.spec.ts` 1/1 verde; mutantes de recorrido: M17 recorrido: marca «pendiente» en el heredado: rc=1 · 1 failed · M18 recorrido: SLA en letra pequeña: rc=1 · 1 failed
