# HU-157-ac1-conversacion-por-trycore

- sha: 54861233d1e0b8530deb651d5bb5b6e3cb34b011
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:33:49.839732Z
- comando: `npx vitest run --reporter=verbose packages/ui/src/FichaSS5.test.ts apps/ficha-ss5-portal.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/ui/src/FichaSS5.test.ts > HU-157 · la conversación va por Trycore > happy: el contacto vigente con el texto de representación comercial, sin desplegar y sin acción aparte 2ms
✓ packages/ui/src/FichaSS5.test.ts > HU-157 · la conversación va por Trycore > solo buzón: «People Service: …», como define HU-147 1ms
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-157 · la conversación va por Trycore > el contacto vigente con el texto de representación comercial; ninguna vía hacia la persona 13ms
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-157 · la conversación va por Trycore > edge: mismo texto de representación y de disponibilidad para los tres vínculos, sin etiqueta del vínculo 34ms
✓ apps/ficha-ss5-portal.test.ts > ficha · lista negra, validación y contacto (EP-003 · SS5) > HU-157 · la conversación va por Trycore > cambiar el contacto se refleja en la siguiente apertura; solo buzón → «People Service: …» 23ms
Test Files  2 passed (2)
Tests  14 passed (14)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
S10 el portal no pasa el contacto: rc=1 · 2 failed | 3 passed (5)
S11 sin el respaldo de Trycore: rc=1 · 2 failed | 16 passed (18)
S12 acción «Escribir a Trycore»: rc=1 · 1 failed | 12 passed (13)
```
(scratchpad/mutar-ss5.py; código restaurado tras cada mutante; S5, S6, S9–S15 y S17 con el portal recompilado; S16 con el panel)

## En navegador real (ss5/journey-smoke.md)

`e2e/ficha-validacion-contacto.portal.spec.ts` 1/1 verde; mutantes de recorrido: S16 la vista previa sin contacto: rc=1 · 1 failed · S17 recorrido: validación no desplegable: rc=1 · 1 failed
