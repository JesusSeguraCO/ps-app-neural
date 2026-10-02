# HU-153-ac3-cinco-tecnologias-sin-sector

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:27.671879Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/tarjeta.test.ts apps/portal/src/seleccion/TarjetaPerfil.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/tarjeta.test.ts > tecnologiasDeTarjeta (HU-153 · edge, D73) > las cinco primeras en el orden en que Talento Humano las cargó 0ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > tecnologiasDeTarjeta (HU-153 · edge, D73) > con cuatro, las cuatro; no reordena ni muta la entrada 0ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > edge: 8 tecnologías y sin sector → las 5 primeras en orden de carga, sin sector ni hueco 1ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > sin sector, modalidad ni país: no hay lista de datos vacía 0ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-153 · la capacidad primero > edge: 8 tecnologías y sin sector → las 5 primeras en orden de carga y sin hueco; la ficha conserva las 8 27ms
Test Files  3 passed (3)
Tests  31 passed (31)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M2 tecnologías sin corte: rc=1 · 2 failed | 20 passed (22)
M21 sector vacío con hueco: rc=1 · 2 failed | 9 passed (11)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
