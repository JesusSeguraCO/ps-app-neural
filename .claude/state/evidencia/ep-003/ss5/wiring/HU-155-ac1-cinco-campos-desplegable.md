# HU-155-ac1-cinco-campos-desplegable

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:33:48.283064Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS5.test.ts packages/ui/src/FichaPerfil.test.ts apps/ficha-ss5-portal.test.ts apps/recorrido-ep006.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaPerfil.test.ts > FichaPerfil · validación técnica > Nivel 1 (HU-155, D59): prueba aplicada, qué se evaluó, «Cumple el estándar», evaluador y mes de año 2ms
✓ packages/ui/src/FichaSS5.test.ts > HU-155 · validación técnica desplegable > happy: bloque desplegable (clic/toque, abierto por omisión) con los cinco campos de D59 en orden fijo 6ms
✓ packages/ui/src/FichaSS5.test.ts > HU-155 · validación técnica desplegable > edge: ningún enlace, archivo ni repositorio; sí la línea de la sesión de alineación 2ms
✓ packages/ui/src/FichaSS5.test.ts > HU-155 · validación técnica desplegable > error: Nivel 0 → la prueba con el texto de cara al cliente, sin fecha, sin campos vacíos ni promesas 2ms
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-155 · validación técnica de Nivel 0 en el portal > desplegable, solo la prueba con el texto de cara al cliente, sin fecha, sin enlaces 15ms
Test Files  4 passed (4)
Tests  29 passed (29)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
S2 resultado con el texto libre (puntaje): rc=1 · 2 failed | 11 passed (13)
S3 orden de campos distinto: rc=1 · 1 failed | 12 passed (13)
S4 fecha sin mes de año: rc=1 · 2 failed | 11 passed (13)
S5 plegada por omisión: rc=1 · 2 failed | 16 passed (18)
```
(scratchpad/mutar-ss5.py; código restaurado tras cada mutante; S5, S6, S9–S15 y S17 con el portal recompilado; S16 con el panel)

## En navegador real (ss5/journey-smoke.md)

`e2e/ficha-validacion-contacto.portal.spec.ts` 1/1 verde; mutantes de recorrido: S16 la vista previa sin contacto: rc=1 · 1 failed · S17 recorrido: validación no desplegable: rc=1 · 1 failed
