# HU-157-ac2-sin-via-a-la-persona

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:33:49.839858Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS5.test.ts apps/ficha-ss5-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS5.test.ts > HU-157 · la conversación va por Trycore > error: ningún camino hacia la persona (correo, teléfono, redes, hoja de vida) 1ms
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-157 · la conversación va por Trycore > el contacto vigente con el texto de representación comercial; ninguna vía hacia la persona 13ms
Test Files  2 passed (2)
Tests  14 passed (14)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
S12 acción «Escribir a Trycore»: rc=1 · 1 failed | 12 passed (13)
S9 enlace al artefacto: rc=1 · 3 failed | 15 passed (18)
```
(scratchpad/mutar-ss5.py; código restaurado tras cada mutante; S5, S6, S9–S15 y S17 con el portal recompilado; S16 con el panel)

## En navegador real (ss5/journey-smoke.md)

`e2e/ficha-validacion-contacto.portal.spec.ts` 1/1 verde; mutantes de recorrido: S16 la vista previa sin contacto: rc=1 · 1 failed · S17 recorrido: validación no desplegable: rc=1 · 1 failed
