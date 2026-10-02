# EP-003 · gate journey_smoke (fase smoke; tarea 8.1)

- sha HEAD: 9c041678cedf67de80f857d2c06289750d515abb · rama: feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T23:31:27Z
- Runner fuera del chat: `.local/runner-ep003.sh` = fases de `tools/loop/integration-check.sh` sobre la BD aislada
  `ps_ep003` y los puertos 3200/3201 (D125; la demo 3100/3101 y la BD `ps` no se tocan). Reporte completo:
  `runner-integracion.md` (mismo sha, árbol limpio).

| Fase | Resultado |
|---|---|
| build (portal, panel, worker) | rc 0 |
| migrar sobre ps_ep003 | rc 0 (sin pendientes) |
| lint | rc 0 |
| tipos | rc 0 |
| tests (REQUIERE_BD=1) | 144 ficheros, 1554 tests en verde, rc 0 |
| e2e en Chromium real (portal + panel) | 71 passed, 0 failed, rc 0 |

**Resultado del runner: VERDE.**

## Recorridos de la épica dentro de la corrida e2e
```
  ✓  19 [portal] › e2e/estandar-recorrido.portal.spec.ts:83:7 › estándar Neural-Grid y recorrido de fichas (EP-003 · SS7) › selección con un incompleto (descriptiva) → co
  ✓  20 [portal] › e2e/ficha-saro-cierre.portal.spec.ts:25:7 › ficha del perfil · SARO, DISC y cierre (EP-003 · SS6) › código → ficha completa (SARO, DISC, cierre, código
  ✓  21 [portal] › e2e/ficha-validacion-contacto.portal.spec.ts:26:7 › ficha del perfil (EP-003 · SS5) › código → ficha (verificado/declarado) → validación técnica desple
  ✓  22 [portal] › e2e/journey-ep003.portal.spec.ts:157:7 › recorrido integrado de EP-003 (tarea 8.1) › catálogo (alcance SARO) → editor (bloqueado sin DISC, publicar) → 
  ✓  23 [portal] › e2e/tarjeta-evidencia.portal.spec.ts:27:7 › tarjeta del perfil (EP-003 · SS4) › código → selección (capacidad, sello, código al pie, sin evidencia) → b
  ✓  30 [panel] › e2e/importacion-saro.panel.spec.ts:173:7 › SARO y DISC por importación (HU-191) › exportar → completar tres incompletos → pegar → vista previa → confirm
  ✓  31 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:150:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › marcado → editar sin completar (pregunta
  ✓  32 [panel] › e2e/incompleto-lenguaje.panel.spec.ts:242:7 › «Incompleto» y aviso de lenguaje de inventario (HU-178, HU-194) › borrador: el aviso va aparte del error d
  ✓  68 [panel] › e2e/marco.panel.spec.ts:815:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (3
  ✓  70 [panel] › e2e/marco.panel.spec.ts:955:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → regis
  ✓  71 [panel] › e2e/validaciones-entrada.panel.spec.ts:119:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › crear un alcance → asignarlo con fecha → publicar si
  ✓  72 [panel] › e2e/validaciones-entrada.panel.spec.ts:192:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › una fecha futura no se guarda: el panel lo dice en e
```
El recorrido integrado de punta a punta (tarea 8.1, `e2e/journey-ep003.portal.spec.ts`): alcance SARO en Catálogos →
editor bloqueado sin DISC y publicar → «Incompleto» en el listado y su filtro → importación con SARO/DISC aplicada por
el worker real → portal con enlace e invitado (tarjeta, ficha con el texto del alcance y la DISC, sin «Incompleto» al
cliente) → encabezado del estándar descriptivo. Detalle de los 6 pasos: `journey-integrado.md`.

## Arreglos de test hechos para llegar a verde (sin tocar producto)
- 71305da: `marco.panel` :824/:952 leen PORTAL_URL/PANEL_URL (por defecto 3100/3101).
- 9c04167: (1) `arrancarWorker().listo()`: los e2e esperan la primera vuelta del worker antes de pedir el código.
  Con la última vuelta de hace más de 2 min, el portal despacha el código él mismo (`workerCaido` →
  `procesarCodigoPropio`, comportamiento del producto) y el e2e no lo veía. Era la falla de `estandar-recorrido` en
  la regresión completa. (2) El catálogo pagina de 25 por uso, así que el alcance recién creado se busca con `?q=`
  tras comprobar el aviso «Alcance SARO creado: …».
