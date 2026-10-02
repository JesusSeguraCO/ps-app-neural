# INT-SS3-emparejar-fecha-disc-sin-abrir-b4

- sha: d477219009cdee5dc23acb76c50428cf9e14f8e7
- rama: feature/ep-003-evidencia-del-perfil
- hora: 2026-10-02T20:28:25.799278Z
- comando: `npx vitest run --reporter=verbose packages/contratos/src/importacion-saro.test.ts packages/dominio/src/importacion/emparejar.test.ts` (REQUIERE_BD=1, BD real, panel standalone; ficheros completos, abajo los escenarios del item)
- rc: 0

```
✓ packages/dominio/src/importacion/emparejar.test.ts > propuesta por nombre (HU-086 · pegar desde la hoja de cálculo) > empareja código y disponibilidad de un bloque de Excel por encabezado, alias o clave 1ms
✓ packages/dominio/src/importacion/emparejar.test.ts > propuesta por nombre (HU-086 · pegar desde la hoja de cálculo) > reconoce el encabezado exacto del formato, la clave del JSON y alias sin acentos ni mayúsculas 0ms
✓ packages/dominio/src/importacion/emparejar.test.ts > propuesta por nombre (HU-086 · pegar desde la hoja de cálculo) > columnas de la lista negra B.4 quedan bloqueadas en «no importar» con su motivo 1ms
✓ packages/dominio/src/importacion/emparejar.test.ts > propuesta por nombre (HU-086 · pegar desde la hoja de cálculo) > propiedad: ninguna columna B.4 termina emparejada con un campo, sea cual sea el adorno 2ms
✓ packages/dominio/src/importacion/emparejar.test.ts > corregir el emparejamiento > una columna bloqueada (B.4 o rechazada) no se puede emparejar 0ms
✓ packages/dominio/src/importacion/emparejar.test.ts > plantillas de emparejamiento (HU-148) > una plantilla nunca abre una columna B.4 aunque se hubiera guardado emparejada 0ms
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > tres columnas con encabezado autoexplicativo y ejemplo, de cara al cliente (no internas) 1ms
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > el importador reconoce sus encabezados y sus alias 1ms
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > el resultado DISC detallado sigue bloqueado (B.4): solo pasa la fecha 1ms
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > la plantilla trae los tres con un alcance activo del catálogo, tal como está registrado 1ms
✓ packages/contratos/src/importacion-saro.test.ts > columnas SARO y DISC (HU-191) > sin ningún alcance activo, la plantilla deja la celda del alcance vacía (nunca inventa uno) 0ms
Test Files  2 passed (2)
Tests  25 passed (25)
```

## Mutación (el test cae si se rompe el código que lo sostiene)

```
N13 fecha DISC bloqueada por B.4: rc=1 · 5 failed | 46 passed (51)
N14 cualquier DISC se abre: rc=1 · 3 failed | 41 passed (44)
```
(scratchpad/mutar-ss3.py; código restaurado tras cada mutante; N16 con el e2e en navegador y el worker real)
