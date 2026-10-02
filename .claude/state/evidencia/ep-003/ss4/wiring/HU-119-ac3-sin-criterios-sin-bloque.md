# HU-119-ac3-sin-criterios-sin-bloque

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:34.832368Z
- comando: `npx vitest run --reporter=verbose apps/portal/src/seleccion/TarjetaPerfil.test.ts packages/ui/src/FichaEvidencia.test.ts apps/tarjeta-portal.test.ts apps/portal/src/banco/evidencia.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/portal/src/banco/evidencia.test.ts > evidenciaDelBanco > sin filtro no hay evidencia para nadie 2ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-119 · evidencia ✓/– en la tarjeta > edge: sin criterios activos no hay bloque de evidencia, ni vacío ni con título 2ms
✓ packages/ui/src/FichaEvidencia.test.ts > FichaPerfil · «Frente a tu búsqueda» (HU-119) > edge: sin criterios activos no hay bloque, ni vacío ni con título 1ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-119 · evidencia ✓/– del filtro activo > sin criterios (la selección del correo): ni en la tarjeta ni en la ficha 30ms
Test Files  4 passed (4)
Tests  28 passed (28)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M7 evidencia vacía con título: rc=1 · 1 failed | 10 passed (11)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
