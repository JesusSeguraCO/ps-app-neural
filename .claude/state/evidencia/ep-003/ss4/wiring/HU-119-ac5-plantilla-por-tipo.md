# HU-119-ac5-plantilla-por-tipo

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:35.829606Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/evidencia.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > rol «Desarrollador backend» cumple=true dato=Desarrollador backend → «✓ Rol: Desarrollador backend» 1ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > rol «Desarrollador backend» cumple=false dato=Analista QA → «– Rol registrado: Analista QA» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > rol «Desarrollador backend» cumple=false dato=null → «– Sin rol declarado: Desarrollador backend» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > seniority «Senior» cumple=true dato=Senior → «✓ Seniority: Senior» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > seniority «Senior» cumple=false dato=Semi-senior → «– Seniority registrada: Semi-senior» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > seniority «Senior» cumple=false dato=null → «– Sin seniority declarada: Senior» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > tecnologia «Java» cumple=true dato=Java → «✓ Java en su stack declarado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > tecnologia «Java» cumple=false dato=null → «– Sin Java en su stack declarado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > tecnologia «Java» cumple=false dato=Kotlin → «– Sin Java en su stack declarado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > sector «Banca» cumple=true dato=8 → «✓ Banca · 8 años declarados» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > sector «Banca» cumple=true dato=1 → «✓ Banca · 1 año declarado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > sector «Seguros» cumple=false dato=null → «– Sin experiencia declarada en Seguros» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > idioma «Inglés» cumple=true dato=Inglés → «✓ Inglés registrado» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > idioma «Inglés» cumple=false dato=null → «– Sin idioma declarado: Inglés» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > idioma «Inglés» cumple=false dato=Francés → «– Sin idioma declarado: Inglés» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > modalidad «Remoto» cumple=true dato=Remoto → «✓ Modalidad: Remoto» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > modalidad «Remoto» cumple=false dato=Presencial → «– Modalidad registrada: Presencial» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > modalidad «Remoto» cumple=false dato=null → «– Sin modalidad declarada: Remoto» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > pais «Colombia» cumple=true dato=Colombia → «✓ País: Colombia» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > pais «Colombia» cumple=false dato=México → «– País registrado: México» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > pais «Colombia» cumple=false dato=null → «– Sin país declarado: Colombia» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=true dato=Desarrollo → «✓ Categoría: Desarrollo» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=false dato=Datos → «– Categoría registrada: Datos» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > categoria «Desarrollo» cumple=false dato=null → «– Sin categoría declarada: Desarrollo» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > los cinco ejemplos del esquema «cada tipo usa su plantilla fija» 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > happy: «Banca» y «Seguros» → una línea por criterio, en el orden de los criterios 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > edge: el dato ausente nunca se da por cumplido aunque llegue `cumple` sin dato 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > lineaDeEvidencia · tabla fija por tipo (HU-119) > ninguna línea lleva porcentajes ni puntajes 0ms
Test Files  1 passed (1)
Tests  36 passed (36)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M12 plantilla de seniority: rc=1 · 2 failed | 34 passed (36)
M11 sector sin años: rc=1 · 5 failed | 44 passed (49)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
