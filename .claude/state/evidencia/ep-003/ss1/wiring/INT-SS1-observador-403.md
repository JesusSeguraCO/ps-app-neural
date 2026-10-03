# INT-SS1-observador-403

- sha: d9641cd98e548f9704a6b855e6327490d89eb72b
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T19:40:26.695875Z
- comando: `npx vitest run --reporter=verbose apps/validaciones-entrada-panel.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/validaciones-entrada-panel.test.ts > Validaciones de entrada en el panel (HU-177, HU-176) > HU-177 · catálogo de alcances SARO > la observadora no administra el catálogo ni edita perfiles: 403 35ms
Test Files  1 passed (1)
Tests  15 passed (15)
```

## Sensibilidad
Test nuevo escrito en rojo antes del código (fase red: el tipo `alcance_saro`, la condición `saro_fecha` y el 403 no existían); la mutación M1/M2 equivalente cubre la rama gemela de la guarda.

## Mutación (cierre de la épica, 2026-10-02T22:36:15Z, sha 9519de3703a26049157acb1fa822a3764ddb5234)

```
M15 observadora con catalogo.escribir: rc=1 · 1 failed | 14 passed (15)
```
(scratchpad/mutar-cierre.py; código restaurado y panel recompilado tras cada mutante)
