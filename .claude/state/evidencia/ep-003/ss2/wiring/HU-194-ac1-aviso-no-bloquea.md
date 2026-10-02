# HU-194-ac1-aviso-no-bloquea

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:20.933471Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/inventario/lenguaje.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/inventario/lenguaje.test.ts > avisosDeLenguaje (HU-194) > happy: «disponible para asignación» se señala tal como está escrita 1ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-194 · aviso de lenguaje de inventario > happy: «disponible para asignación» → guardado con el aviso; publicar no lo impide 30ms
Test Files  2 passed (2)
Tests  28 passed (28)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M16 borrador sin avisos: rc=1 · 4 failed | 9 passed (13)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)

## En navegador real (ss2/journey-smoke.md, mismo sha)

```
  ✓  1 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:150:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › marcado → editar sin completar (pregunta) → completar y confirmar (deja de marcarse) → trayectoria con «stock» (aviso, guardado) (2.1s)
  ✓  2 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:242:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › borrador: el aviso va aparte del error de la fecha futura y se retira al corregir la frase (780ms)
```
