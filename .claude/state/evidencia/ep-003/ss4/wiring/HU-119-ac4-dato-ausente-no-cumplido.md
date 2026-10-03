# HU-119-ac4-dato-ausente-no-cumplido

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:35.355189Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/evidencia.test.ts apps/portal/src/seleccion/TarjetaPerfil.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > idioma «Inglés» cumple=true dato=Inglés → «✓ Inglés registrado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > idioma «Inglés» cumple=false dato=null → «– Sin idioma declarado: Inglés» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > idioma «Inglés» cumple=false dato=Francés → «– Sin idioma declarado: Inglés» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > edge: el dato ausente nunca se da por cumplido aunque llegue `cumple` sin dato 0ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-119 · evidencia ✓/– en la tarjeta > edge: idioma sin registrar → no cumplido, nunca cumplido por omisión 1ms
Test Files  2 passed (2)
Tests  47 passed (47)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M10 cumplido por omisión: rc=1 · 2 failed | 45 passed (47)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
