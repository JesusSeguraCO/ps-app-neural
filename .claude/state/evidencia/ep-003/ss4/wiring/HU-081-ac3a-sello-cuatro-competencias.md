# HU-081-ac3a-sello-cuatro-competencias

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:29.813580Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/tarjeta.test.ts packages/infra/src/postgres/catalogo-sello.test.ts packages/contratos/src/ficha-sello.test.ts packages/contratos/src/catalogo.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/tarjeta.test.ts > tecnologiasDeTarjeta (HU-153 · edge, D73) > con cuatro, las cuatro; no reordena ni muta la entrada 1ms
✓ packages/dominio/src/catalogo/tarjeta.test.ts > selloValido (HU-081 · error, diseño §5) > fuera de contrato: cuatro competencias 0ms
✓ packages/contratos/src/catalogo.test.ts > contrato del catálogo (V8-4) > el Sello Personal viaja con 0 a 3 competencias no vacías (HU-081) 0ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (cuatro competencias): sin sello, el resto de la lista intacto y registro sin datos personales 1ms
✓ packages/contratos/src/ficha-sello.test.ts > armarFicha · Sello Personal fuera de contrato (gemela de la tarjeta) > cuatro competencias → sin sello (nunca las tres primeras ni las no vacías) 4ms
Test Files  4 passed (4)
Tests  31 passed (31)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M4 sello acepta cuatro: rc=1 · 3 failed | 18 passed (21)
M5 proyección no registra el sello: rc=1 · 3 failed | 3 passed (6)
M17 ficha recorta el sello: rc=1 · 3 failed | 1 passed (4)
M23 contrato del catálogo sin tope: rc=1 · 1 failed | 9 passed (10)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
