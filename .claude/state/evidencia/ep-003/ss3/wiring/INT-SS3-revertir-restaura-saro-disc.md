# INT-SS3-revertir-restaura-saro-disc

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:28.776024Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/importacion-saro.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/infra/src/postgres/importacion-saro.test.ts > SARO y DISC en la importación (HU-191) > tarea 3.4 · aplicar completa los incompletos sin cambiar estados, con origen importación; revertir los devuelve 85ms
✓ packages/infra/src/postgres/importacion-saro.test.ts > SARO y DISC en la importación (HU-191) > un lote anterior a EP-003 (estado previo sin las tres claves) no vacía SARO ni DISC al revertirse 21ms
Test Files  1 passed (1)
Tests  4 passed (4)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N11 revertir no restaura SARO/DISC: rc=1 · 1 failed | 3 passed (4)
N12 revertir vacía lotes viejos: rc=1 · 1 failed | 3 passed (4)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
