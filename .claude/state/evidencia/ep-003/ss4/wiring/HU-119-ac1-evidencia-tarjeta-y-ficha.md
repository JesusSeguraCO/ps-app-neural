# HU-119-ac1-evidencia-tarjeta-y-ficha

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:32.812600Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/evidencia.test.ts apps/portal/src/seleccion/TarjetaPerfil.test.ts packages/ui/src/FichaEvidencia.test.ts apps/tarjeta-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > sector «Banca» cumple=true dato=8 → «✓ Banca · 8 años declarados» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > sector «Banca» cumple=true dato=1 → «✓ Banca · 1 año declarado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=false dato=null → «– Sin categoría declarada: Desarrollo» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > happy: «Banca» y «Seguros» → una línea por criterio, en el orden de los criterios 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > criteriosDelFiltro · fuente productiva de EP-003 (diseño §5) > categoría: un criterio con la familia del perfil como dato 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > criteriosDelFiltro · fuente productiva de EP-003 (diseño §5) > contexto de la selección: la categoría del perfil si está entre las de la selección 0ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-153 · la capacidad como descriptor inmediato > happy: capacidad primero, nombre y primer apellido, tecnologías, sector, modalidad, país, banda y código al pie 6ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-081 · competencias del Sello Personal > happy: dos perfiles con sellos distintos muestran cada uno sus tres competencias como verificadas 2ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-119 · evidencia ✓/– en la tarjeta > happy: una línea por criterio, cumple y no cumple distinguibles, sin porcentajes 2ms
✓ packages/ui/src/FichaEvidencia.test.ts > FichaPerfil · «Frente a tu búsqueda» (HU-119) > happy: una línea por criterio con el mismo texto y orden que la tarjeta; ✓ y – distinguibles 7ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-153 · la capacidad primero > happy: capacidad, nombre, tecnologías, sector, modalidad, país, banda y el código solo al pie 53ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-081 · Sello Personal > happy y edge: sellos distintos, sin sello sin hueco, iguales sin equivalencia; ninguna insignia 11ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-119 · evidencia ✓/– del filtro activo > con una categoría: cada tarjeta con su línea ✓ y la ficha con la MISMA línea en «Frente a tu búsqueda» 28ms
✓ apps/tarjeta-portal.test.ts > tarjeta y evidencia en el portal (EP-003 · SS4) > HU-119 · evidencia ✓/– del filtro activo > con un rol: «✓ Rol: …» en la tarjeta y en la ficha 23ms
Test Files  4 passed (4)
Tests  58 passed (58)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M11 sector sin años: rc=1 · 5 failed | 44 passed (49)
M13 ficha sin «Frente a tu búsqueda»: rc=1 · 1 failed | 1 passed (2)
M14 banco no pasa la evidencia a la tarjeta: rc=1 · 2 failed | 7 passed (9)
M16 orden distinto: rc=1 · 4 failed | 45 passed (49)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
