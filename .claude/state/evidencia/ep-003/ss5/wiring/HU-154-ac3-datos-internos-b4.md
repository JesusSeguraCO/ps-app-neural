# HU-154-ac3-datos-internos-b4

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:33:45.626789Z
- comando: `npx vitest run --reporter=verbose apps/ficha-ss5-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-154 · datos internos que nunca cruzan al portal (B.4) > ni la ficha (selección y banco) ni la tarjeta ni la API traen la motivación ni nada de B.4 145ms
Test Files  1 passed (1)
Tests  5 passed (5)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
S14 la motivación cruza por el catálogo: rc=1 · 1 failed | 4 passed (5)
```
(scratchpad/mutar-ss5.py; código restaurado tras cada mutante; S5, S6, S9–S15 y S17 con el portal recompilado; S16 con el panel)

## En navegador real (ss5/journey-smoke.md)

`e2e/ficha-validacion-contacto.portal.spec.ts` 1/1 verde; mutantes de recorrido: S16 la vista previa sin contacto: rc=1 · 1 failed · S17 recorrido: validación no desplegable: rc=1 · 1 failed
