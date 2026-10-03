# HU-178-ac3-completar-lo-que-falta

- sha: 7c5cedd43e6dd44e318884368f367802db709760
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:13:19.021287Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/incompletos.test.ts apps/incompletos-lenguaje-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.3 · editar un publicado incompleto > edge: registrar la fecha DISC y confirmar → el cambio se ve en el portal y deja de marcarse 33ms
✓ apps/incompletos-lenguaje-panel.test.ts > «Incompleto» y aviso de lenguaje en el panel (HU-178, HU-194) > HU-178 · marca y filtro «Incompleto» > edge: registrar la fecha DISC → impacto sin pregunta; confirmar lo muestra en el portal y deja de marcarse 50ms
Test Files  2 passed (2)
Tests  20 passed (20)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M9 completar siempre pregunta: rc=1 · 3 failed | 17 passed (20)
```
(scratchpad/mutar-ss2.py; código restaurado tras cada mutante; M20/M21 con el e2e en navegador)

## En navegador real (ss2/journey-smoke.md, mismo sha)

```
  ✓  1 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:150:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › marcado → editar sin completar (pregunta) → completar y confirmar (deja de marcarse) → trayectoria con «stock» (aviso, guardado) (2.1s)
  ✓  2 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:242:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › borrador: el aviso va aparte del error de la fecha futura y se retira al corregir la frase (780ms)
```
