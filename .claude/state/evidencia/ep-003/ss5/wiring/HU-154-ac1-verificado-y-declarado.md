# HU-154-ac1-verificado-y-declarado

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:33:43.860424Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS5.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS5.test.ts > HU-154 · verificado y declarado > happy: «Verificado por Trycore» con el sello y la validación con tratamiento propio; «Declarado por la persona» con trayectoria, formación y stack 6ms
✓ packages/ui/src/FichaSS5.test.ts > HU-154 · verificado y declarado > edge: la experiencia solo en lo declarado; la validación muestra solo la prueba, sin citar la trayectoria 2ms
✓ packages/ui/src/FichaSS5.test.ts > HU-155 · validación técnica desplegable > happy: bloque desplegable (clic/toque, abierto por omisión) con los cinco campos de D59 en orden fijo 3ms
✓ packages/ui/src/FichaSS5.test.ts > HU-157 · la conversación va por Trycore > happy: el contacto vigente con el texto de representación comercial, sin desplegar y sin acción aparte 1ms
Test Files  1 passed (1)
Tests  9 passed (9)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
S1 la validación cita la trayectoria: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar-ss5.py; código restaurado tras cada mutante; S5, S6, S9–S15 y S17 con el portal recompilado; S16 con el panel)

## En navegador real (ss5/journey-smoke.md)

`e2e/ficha-validacion-contacto.portal.spec.ts` 1/1 verde; mutantes de recorrido: S16 la vista previa sin contacto: rc=1 · 1 failed · S17 recorrido: validación no desplegable: rc=1 · 1 failed
