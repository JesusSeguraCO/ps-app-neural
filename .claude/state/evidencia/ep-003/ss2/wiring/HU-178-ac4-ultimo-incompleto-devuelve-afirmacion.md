# HU-178-ac4-ultimo-incompleto-devuelve-afirmacion

- sha: f939e1d9a1de762f0410f5837d574ce7bcd22990
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-03T00:23:48Z
- comando: `npx vitest run --reporter=verbose packages/infra/src/postgres/incompletos.test.ts apps/estandar-portal.test.ts` (REQUIERE_BD=1, BD efímeras desde ps_ep003, portal standalone real con ps_portal)
- rc: 0

Escenario 4 de HU-178 (completar el último incompleto devuelve la afirmación), cubierto en dos tramos:
1. `packages/infra/src/postgres/incompletos.test.ts:179-204`: completar desde la escritura del panel deja el conteo de `ps_portal` en 0.
2. `apps/estandar-portal.test.ts:110`: con 0 el portal real afirma, con 1 describe, y al completar el último vuelve la afirmación.

```
 ✓ packages/infra/src/postgres/incompletos.test.ts > «Incompleto» y su conteo (HU-178) > tarea 2.4 · el conteo del portal es el de las marcas del panel > completar los que faltan baja el conteo a 0 en las dos caras 57ms
 ✓ apps/estandar-portal.test.ts > encabezado del estándar (EP-003 · SS7) > HU-159 · «ninguno» solo con 0 incompletos (D80, HU-178) > 0 → afirma; 1 → describe sin «ningún» ni número; completar el último devuelve la afirmación 31ms
 Test Files  2 passed (2)
      Tests  12 passed (12)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M-ac4 contarIncompletosPublicados nunca baja de 1 (indicadores.ts:37): rc=1 · 1 failed | 6 passed (7) — × completar los que faltan baja el conteo a 0 en las dos caras
```
Código restaurado tras el mutante (git diff vacío). El tramo del portal lo sostienen los mutantes N1 («con 1 incompleto afirma ningún», 3 fallan) y N2 («sin conteo afirma ningún», 2 fallan) de `ss7/mutaciones.txt`.
