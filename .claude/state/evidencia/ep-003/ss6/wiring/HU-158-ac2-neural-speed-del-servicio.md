# HU-158-ac2-neural-speed-del-servicio

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:59:16.345868Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS6.test.ts apps/ficha-ss6-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS6.test.ts > HU-158 · el cierre de la ficha > happy: condiciones operativas (Híbrido, 1 mes, idiomas, país) al final, SLA en el tamaño del texto y garantía de servicio 6ms
✓ packages/ui/src/FichaSS6.test.ts > HU-158 · el cierre de la ficha > edge · Neural Speed: mismo texto para un no vinculado sin IA y para uno con LLM en la trayectoria; nunca de la persona 3ms
✓ apps/ficha-ss6-portal.test.ts > ficha · SARO/DISC y cierre (EP-003 · SS6) > HU-158 · cierre y código al pie > edge: la garantía y el SLA son los mismos para los tres vínculos; la IA solo en la trayectoria de quien la tiene 64ms
Test Files  2 passed (2)
Tests  12 passed (12)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M9 la garantía cambia según la persona: rc=1 · 2 failed | 10 passed (12)
M10 Neural Speed como insignia de la persona: rc=1 · 1 failed | 7 passed (8)
```
(scratchpad/mutar-ss6.py; código restaurado tras cada mutante; M1, M7, M9, M14, M16–M18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/ficha-saro-cierre.portal.spec.ts` 1/1 verde; mutantes de recorrido: M17 recorrido: marca «pendiente» en el heredado: rc=1 · 1 failed · M18 recorrido: SLA en letra pequeña: rc=1 · 1 failed
