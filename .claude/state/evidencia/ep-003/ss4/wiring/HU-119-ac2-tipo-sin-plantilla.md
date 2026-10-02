# HU-119-ac2-tipo-sin-plantilla

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T21:01:33.360437Z
- comando: `npx vitest run --reporter=verbose packages/dominio/src/catalogo/evidencia.test.ts apps/portal/src/seleccion/TarjetaPerfil.test.ts apps/portal/src/banco/evidencia.test.ts` (REQUIERE_BD=1, BD real, portal standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ apps/portal/src/banco/evidencia.test.ts > registrarSinPlantilla (D96) > una vez por tipo sin plantilla, nombrando solo el tipo 0ms
✓ apps/portal/src/banco/evidencia.test.ts > registrarSinPlantilla (D96) > sin tipos nuevos no registra nada 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > tipo sin plantilla (D96 · error) > cumple=true → «✓ Cumple Disponibilidad inmediata», marcado para el registro técnico 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > tipo sin plantilla (D96 · error) > cumple=false → «– No cumple Disponibilidad inmediata», marcado para el registro técnico 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > tipo sin plantilla (D96 · error) > los tipos de la tabla no se marcan sin plantilla 0ms
✓ packages/dominio/src/catalogo/evidencia.test.ts > tipo sin plantilla (D96 · error) > nunca una línea en blanco: un valor vacío sigue nombrando el tipo 0ms
✓ apps/portal/src/seleccion/TarjetaPerfil.test.ts > HU-119 · evidencia ✓/– en la tarjeta > error: un tipo sin plantilla muestra el texto genérico en el mismo lugar y con la misma distinción 1ms
Test Files  3 passed (3)
Tests  53 passed (53)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
M8 genérico D96 en blanco: rc=1 · 4 failed | 43 passed (47)
M9 sin plantilla sin registro: rc=1 · 1 failed | 5 passed (6)
```
(scratchpad/mutar-ss4.py; código restaurado tras cada mutante; M14, M18, M24 y M25 con el portal recompilado)

## En navegador real (ss4/journey-smoke.md)

`e2e/tarjeta-evidencia.portal.spec.ts` 1/1 verde; mutantes de recorrido: M24 recorrido: tarjeta sin capacidad: rc=1 · 1 failed · M25 recorrido: ficha del banco sin evidencia: rc=1 · 1 failed
