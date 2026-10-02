# HU-081-ac3b-sello-competencia-vacia

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:31.293804Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/tarjeta.test.ts packages/infra/src/postgres/catalogo-sello.test.ts packages/contratos/src/ficha-sello.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/tarjeta.test.ts > selloValido (HU-081 · error, diseño §5) > de una a tres competencias no vacías 0ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > selloValido (HU-081 · error, diseño §5) > fuera de contrato: cuatro competencias 0ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > selloValido (HU-081 · error, diseño §5) > fuera de contrato: una vacía 0ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > selloValido (HU-081 · error, diseño §5) > fuera de contrato: una solo con espacios 0ms
✓ packages/contratos/src/ficha-sello.test.ts > armarFicha · Sello Personal fuera de contrato (gemela de la tarjeta) > un sello válido se conserva, recortado y en su orden 2ms
✓ packages/contratos/src/ficha-sello.test.ts > armarFicha · Sello Personal fuera de contrato (gemela de la tarjeta) > cuatro competencias → sin sello (nunca las tres primeras ni las no vacías) 3ms
✓ packages/contratos/src/ficha-sello.test.ts > armarFicha · Sello Personal fuera de contrato (gemela de la tarjeta) > una vacía → sin sello (nunca las tres primeras ni las no vacías) 0ms
✓ packages/contratos/src/ficha-sello.test.ts > armarFicha · Sello Personal fuera de contrato (gemela de la tarjeta) > una solo con espacios → sin sello (nunca las tres primeras ni las no vacías) 0ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > sin sello: lista vacía y ningún registro 1ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (cuatro competencias): sin sello, el resto de la lista intacto y registro sin datos personales 1ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (una competencia vacía): sin sello, el resto de la lista intacto y registro sin datos personales 1ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (una competencia solo con espacios): sin sello, el resto de la lista intacto y registro sin datos personales 0ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > error: sello fuera de contrato → la tarjeta sin sello, la lista entera y el registro sin datos personales 9ms
Test Files  4 passed (4)
Tests  30 passed (30)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M3 sello acepta competencia vacía: rc=1 · 6 failed | 15 passed (21)
M5 proyección no registra el sello: rc=1 · 3 failed | 3 passed (6)
M17 ficha recorta el sello: rc=1 · 3 failed | 1 passed (4)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
