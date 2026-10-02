# INT-SS4-filtro-banco-a-criterios

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:38.743383Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/evidencia.test.ts apps/portal/src/banco/evidencia.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > rol «Desarrollador backend» cumple=true dato=Desarrollador backend → «✓ Rol: Desarrollador backend» 1ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > rol «Desarrollador backend» cumple=false dato=Analista QA → «– Rol registrado: Analista QA» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > rol «Desarrollador backend» cumple=false dato=null → «– Sin rol declarado: Desarrollador backend» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=true dato=Desarrollo → «✓ Categoría: Desarrollo» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=false dato=Datos → «– Categoría registrada: Datos» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=false dato=null → «– Sin categoría declarada: Desarrollo» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > criteriosDelFiltro · fuente productiva de EP-003 (diseño §5) > sin filtro (banco completo o selección del correo) no hay criterios 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > criteriosDelFiltro · fuente productiva de EP-003 (diseño §5) > categoría: un criterio con la familia del perfil como dato 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > criteriosDelFiltro · fuente productiva de EP-003 (diseño §5) > rol: cumple si cualquiera de sus roles coincide (misma comparación que aplicarFiltro) 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > criteriosDelFiltro · fuente productiva de EP-003 (diseño §5) > contexto de la selección: la categoría del perfil si está entre las de la selección 0ms
✓ apps/portal/src/banco/evidencia.test.ts > evidenciaDelBanco > categoría: cada perfil con su línea, del mismo cálculo que el filtro 0ms
✓ apps/portal/src/banco/evidencia.test.ts > evidenciaDelBanco > rol: ✓ Rol con el valor del filtro 0ms
✓ apps/portal/src/banco/evidencia.test.ts > evidenciaDelBanco > contexto de la selección: la categoría del perfil 0ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-119 · evidencia ✓/– del filtro activo > con una categoría: cada tarjeta con su línea ✓ y la ficha con la MISMA línea en «Frente a tu búsqueda» 36ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-119 · evidencia ✓/– del filtro activo > con un rol: «✓ Rol: …» en la tarjeta y en la ficha 31ms
Test Files  3 passed (3)
Tests  51 passed (51)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M15 filtro y evidencia discrepan: rc=1 · 2 failed | 40 passed (42)
M14 banco no pasa la evidencia a la tarjeta: rc=1 · 2 failed | 7 passed (9)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
