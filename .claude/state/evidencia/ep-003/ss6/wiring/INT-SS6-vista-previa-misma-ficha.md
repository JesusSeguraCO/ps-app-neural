# INT-SS6-vista-previa-misma-ficha

- sha: a6a7fe08d0b75e5a65f2853b6e966077349f10d1
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:59:17.497310Z
- comando: `npx vitest run --reporter=verbose apps/ficha-compartida.test.ts` (REQUIERE_BD=1, BD real, portal standalone; abajo los escenarios del item)
- rc: 0

```
✓ apps/ficha-compartida.test.ts > ficha compartida panel/portal (HU-129, HU-130) > HU-129 · el HTML de la vista previa es el del portal para el mismo perfil, en cada necesidad 45ms
✓ apps/ficha-compartida.test.ts > ficha compartida panel/portal (HU-129, HU-130) > HU-129 · banda de arranque, no fecha; país siempre y ciudad solo si es presencial o híbrida 4ms
✓ apps/ficha-compartida.test.ts > ficha compartida panel/portal (HU-129, HU-130) > HU-130 · Nivel 0 con el enunciado de la modalidad de prueba, sin que nadie redacte nada 2ms
✓ apps/ficha-compartida.test.ts > ficha compartida panel/portal (HU-129, HU-130) > HU-129/HU-130 · los bloques opcionales sin datos no existen: ni título ni hueco 4ms
✓ apps/ficha-compartida.test.ts > ficha compartida panel/portal (HU-129, HU-130) > el consentimiento parcial despersonaliza la trayectoria; la motivación (B.4, D20) nunca viaja 4ms
✓ apps/ficha-compartida.test.ts > ficha compartida panel/portal (HU-129, HU-130) > un perfil no publicado no tiene ficha en el portal 4ms
Test Files  1 passed (1)
Tests  6 passed (6)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M15 la vista previa no lleva SARO: rc=1 · 1 failed | 5 passed (6)
```
(scratchpad/mutar-ss6.py; código restaurado tras cada mutante; M1, M7, M9, M14, M16–M18 con el portal recompilado)

## En navegador real (ss6/journey-smoke.md)

`e2e/ficha-saro-cierre.portal.spec.ts` 1/1 verde; mutantes de recorrido: M17 recorrido: marca «pendiente» en el heredado: rc=1 · 1 failed · M18 recorrido: SLA en letra pequeña: rc=1 · 1 failed
