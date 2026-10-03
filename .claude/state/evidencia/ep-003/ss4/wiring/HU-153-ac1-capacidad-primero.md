# HU-153-ac1-capacidad-primero

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:26.204431Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/tarjeta.test.ts apps/portal/src/seleccion/TarjetaPerfil.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/tarjeta.test.ts > capacidadDeTarjeta (HU-153 · happy) > rol · seniority · años de experiencia, en ese orden 1ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > capacidadDeTarjeta (HU-153 · happy) > un año en singular 0ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > capacidadDeTarjeta (HU-153 · happy) > sin rol usa la familia; sin seniority ni años, no deja separadores sueltos 0ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > capacidadDeTarjeta (HU-153 · happy) > el primer rol es el principal (orden de carga) 0ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > happy: capacidad primero, nombre y primer apellido, tecnologías, sector, modalidad, país, banda y código al pie 4ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > error: disponibilidad vencida y sin tocar > 30 días → «por confirmar», nunca «Inmediato» ni la fecha 1ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > edge: 8 tecnologías y sin sector → las 5 primeras en orden de carga, sin sector ni hueco 1ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > sin sector, modalidad ni país: no hay lista de datos vacía 0ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-153 · la capacidad primero > happy: capacidad, nombre, tecnologías, sector, modalidad, país, banda y el código solo al pie 66ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-153 · la capacidad primero > error: vencida y sin tocar > 30 días → «por confirmar», ni «Inmediato» ni la fecha 15ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-153 · la capacidad primero > edge: 8 tecnologías y sin sector → las 5 primeras en orden de carga y sin hueco; la ficha conserva las 8 27ms
Test Files  3 passed (3)
Tests  31 passed (31)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M1 capacidad sin seniority ni años: rc=1 · 5 failed | 17 passed (22)
M20 código en la cabecera: rc=1 · 1 failed | 10 passed (11)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
