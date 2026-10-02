# HU-155-ac2-nivel0-sin-fecha

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:33:49.839388Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS5.test.ts apps/ficha-ss5-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS5.test.ts > HU-155 · validación técnica desplegable > error: Nivel 0 → la prueba con el texto de cara al cliente, sin fecha, sin campos vacíos ni promesas 1ms
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-155 · validación técnica de Nivel 0 en el portal > desplegable, solo la prueba con el texto de cara al cliente, sin fecha, sin enlaces 17ms
Test Files  2 passed (2)
Tests  14 passed (14)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
S6 Nivel 0 con fecha pendiente: rc=1 · 2 failed | 16 passed (18)
S8 alineación también en Nivel 0: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar-ss5.py; código restaurado tras cada mutante; S5, S6, S9–S15 y S17 con el portal recompilado; S16 con el panel)

## En navegador real (ss5/journey-smoke.md)

`e2e/ficha-validacion-contacto.portal.spec.ts` 1/1 verde; mutantes de recorrido: S16 la vista previa sin contacto: rc=1 · 1 failed · S17 recorrido: validación no desplegable: rc=1 · 1 failed
