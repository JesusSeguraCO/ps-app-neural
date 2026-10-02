# INT-SS4-catalogo-contrato-sello

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:37.272952Z
- comando: `npx vitest run --reporter=verbose packages/contratos/src/catalogo.test.ts packages/infra/src/postgres/catalogo-sello.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/contratos/src/catalogo.test.ts > contrato del catálogo (V8-4) > el Sello Personal viaja con 0 a 3 competencias no vacías (HU-081) 0ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > un sello válido viaja tal cual (recortado), en su orden 2ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > sin sello: lista vacía y ningún registro 1ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (cuatro competencias): sin sello, el resto de la lista intacto y registro sin datos personales 0ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (una competencia vacía): sin sello, el resto de la lista intacto y registro sin datos personales 0ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > fuera de contrato (una competencia solo con espacios): sin sello, el resto de la lista intacto y registro sin datos personales 0ms
✓ packages/infra/src/postgres/catalogo-sello.test.ts > proyección del catálogo · Sello Personal (HU-081) > las tecnologías llegan completas y en orden de carga; la banda, nunca la fecha 0ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > happy y edge: sellos distintos, sin sello sin hueco, iguales sin equivalencia; ninguna insignia 10ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > error: sello fuera de contrato → la tarjeta sin sello, la lista entera y el registro sin datos personales 8ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > la API del catálogo trae el sello validado (estricta, mismo contrato que el HTML) 5ms
Test Files  3 passed (3)
Tests  25 passed (25)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M18 la vista no lee el sello: rc=1 · 3 failed | 6 passed (9)
M23 contrato del catálogo sin tope: rc=1 · 1 failed | 9 passed (10)
M5 proyección no registra el sello: rc=1 · 3 failed | 3 passed (6)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
