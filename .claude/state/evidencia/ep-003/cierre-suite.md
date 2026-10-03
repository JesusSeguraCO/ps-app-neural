# EP-003 · runner de integración fuera del chat (fases de integration-check sobre ps_ep003)

- sha: c084db87019159e7bf4d517f0988502e56807fa8 (árbol limpio)
- rama: feature/ep-003-evidencia-del-perfil
- inicio: 2026-10-03T00:35:34Z
- BD: ps_ep003 (PostgreSQL :54329 / PgBouncer :64329); portal 3200, panel 3201; la demo (3100/3101, BD ps) no se toca

▶ build
```
  ├ chunks/18-498168fb58dcd546.js        46.4 kB
  ├ chunks/87c73c54-24122e7b92478d00.js  54.2 kB
  └ other shared chunks (total)          1.91 kB
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
> @ps/portal@0.0.0 postbuild
> rm -rf .next/standalone/apps/portal/.next/static && cp -R .next/static .next/standalone/apps/portal/.next/static
> @ps/worker@0.0.0 build
> esbuild src/worker.ts src/migrar.ts --bundle --platform=node --target=node22 --format=esm --external:pg-native --alias:server-only=../../scripts/server-only-vacio.mjs --banner:js="import{createRequire}from'module';const require=createRequire(import.meta.url);" --outdir=dist
  dist/migrar.js  1.5mb ⚠️
  dist/worker.js  1.0mb ⚠️
⚡ Done in 58ms
```
- rc: 0 · 27 s

▶ migrar
```
{"ts":"2026-10-03T00:36:01.934Z","evento":"migraciones_aplicadas","aplicadas":[]}
{"ts":"2026-10-03T00:36:01.934Z","evento":"migrar_terminado","aplicadas":[],"porDelante":[]}
```
- rc: 0 · 0 s

▶ lint
```
> lint
> eslint .
```
- rc: 0 · 3 s

▶ tipos
```
> @ps/worker@0.0.0 typecheck
> tsc --noEmit -p .
> @ps/contratos@0.0.0 typecheck
> tsc --noEmit -p .
> @ps/dominio@0.0.0 typecheck
> tsc --noEmit -p .
> @ps/infra@0.0.0 typecheck
> tsc --noEmit -p .
> @ps/motor@0.0.0 typecheck
> tsc --noEmit -p .
> @ps/ui@0.0.0 typecheck
> tsc --noEmit -p .
```
- rc: 0 · 6 s

▶ tests
```
 RUN  v5.0.2 /Users/cmo/Local/claude/Apps/App People Service/.wt/ep-003
 Test Files  145 passed (145)
      Tests  1561 passed (1561)
   Start at  19:36:11
   Duration  30.52s (tests 91%, import 7%, transform 2%)
    Isolate  145 workers spawned · ~161ms startup each (spawn + environment, per file)
             at least ~2.43s faster with isolate: false — reuses workers across files instead of one per file
```
- rc: 0 · 31 s

▶ e2e
```
  ✓  35 [panel] › e2e/marco.panel.spec.ts:95:9 › marco del panel con sesión › móvil a 390 px: sin scroll horizontal del documento y «Cerrar sesión» a mano (167ms)
  ✓  36 [panel] › e2e/marco.panel.spec.ts:111:7 › marco del panel con sesión › accesibilidad del marco: 0 incidencias serias o críticas (344ms)
  ✓  37 [panel] › e2e/marco.panel.spec.ts:122:7 › marco del panel con sesión › Cerrar sesión vuelve a la puerta y la sesión deja de valer (301ms)
  ✓  38 [panel] › e2e/marco.panel.spec.ts:131:5 › HU-123: al pedir el código, el foco pasa a la primera casilla (prototipo panel-acceso--codigo) (194ms)
  ✓  39 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /enlaces: axe sin incidencias serias y sin scroll horizontal a 320/390 (367ms)
  ✓  40 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /enlaces/nuevo: axe sin incidencias serias y sin scroll horizontal a 320/390 (386ms)
  ✓  41 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /peticiones: axe sin incidencias serias y sin scroll horizontal a 320/390 (1.4s)
  ✓  42 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /peticiones/renovaciones: axe sin incidencias serias y sin scroll horizontal a 320/390 (1.3s)
  ✓  43 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /catalogos: axe sin incidencias serias y sin scroll horizontal a 320/390 (504ms)
  ✓  44 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /catalogos?tipo=modalidad_prueba: axe sin incidencias serias y sin scroll horizontal a 320/390 (417ms)
  ✓  45 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /catalogos?tipo=motivo_pausa: axe sin incidencias serias y sin scroll horizontal a 320/390 (410ms)
  ✓  46 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /lexico: axe sin incidencias serias y sin scroll horizontal a 320/390 (410ms)
  ✓  47 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /lexico?vista=candidatas: axe sin incidencias serias y sin scroll horizontal a 320/390 (455ms)
  ✓  48 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /inventario: axe sin incidencias serias y sin scroll horizontal a 320/390 (2.1s)
  ✓  49 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /inventario/nuevo: axe sin incidencias serias y sin scroll horizontal a 320/390 (500ms)
  ✓  50 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /inventario/PS-0187: axe sin incidencias serias y sin scroll horizontal a 320/390 (548ms)
  ✓  51 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /importar: axe sin incidencias serias y sin scroll horizontal a 320/390 (379ms)
  ✓  52 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /importar?vista=historial: axe sin incidencias serias y sin scroll horizontal a 320/390 (463ms)
  ✓  53 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /vigencia: axe sin incidencias serias y sin scroll horizontal a 320/390 (396ms)
  ✓  54 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /colocados: axe sin incidencias serias y sin scroll horizontal a 320/390 (368ms)
  ✓  55 [panel] › e2e/marco.panel.spec.ts:194:7 › resultado de una importación (HU-141, HU-142) › /importar?lote=…: axe sin incidencias serias, sin scroll horizontal a 320/390 y consola limpia (462ms)
  ✓  56 [panel] › e2e/marco.panel.spec.ts:240:7 › vista previa de la ficha (HU-129) › axe sin incidencias serias, sin scroll horizontal y la ciudad según la necesidad (536ms)
  ✓  57 [panel] › e2e/marco.panel.spec.ts:266:7 › vista previa de la ficha (HU-129) › HU-129 · falta un dato que la publicación exige: el bloque sale marcado, nombra el dato e impide publicar (404ms)
  ✓  58 [panel] › e2e/marco.panel.spec.ts:291:7 › editor de perfiles (HU-089, HU-125) › las tecnologías se eligen del catálogo; Enter nunca guarda lo escrito (581ms)
  ✓  59 [panel] › e2e/marco.panel.spec.ts:308:7 › editor de perfiles (HU-089, HU-125) › el sector admite varios valores del catálogo y se conservan al guardar y volver (D23) (1.1s)
  ✓  60 [panel] › e2e/marco.panel.spec.ts:328:7 › editor de perfiles (HU-089, HU-125) › un rol que no existe muestra los parecidos antes de dejar crearlo (499ms)
  ✓  61 [panel] › e2e/marco.panel.spec.ts:342:7 › editor de perfiles (HU-089, HU-125) › guardar un perfil nuevo lo deja en borrador y señala lo que falta (368ms)
  ✓  62 [panel] › e2e/marco.panel.spec.ts:361:7 › sesión vencida al guardar (HU-138 escenario 2, HU-151) › Guardar con la sesión vencida no escribe nada y lleva a la puerta con la causa (290ms)
  ✓  63 [panel] › e2e/marco.panel.spec.ts:476:7 › editar un publicado y su reporte (HU-126, HU-140, HU-130) › guardar declara el impacto y confirmar lo aplica; incompleto pregunta y pasa a borrador (10.5s)
  ✓  64 [panel] › e2e/marco.panel.spec.ts:502:7 › editar un publicado y su reporte (HU-126, HU-140, HU-130) › el reporte sale de la modalidad, se confirma con la revisión y la ficha pasa a Nivel 1 (2.3s)
  ✓  65 [panel] › e2e/marco.panel.spec.ts:548:7 › disponibilidad, pausa y vigencia (HU-132, HU-133, HU-136) › actualizar en bloque → pausar con motivo → a los 31 días en la bandeja → reactivar (8.2s)
  ✓  66 [panel] › e2e/marco.panel.spec.ts:654:7 › coherencia y archivo (HU-134, HU-135) › pausado con fecha → ALTA en la fila → publicar con esa disponibilidad → archivar → fuera del banco (10.4s)
  ✓  67 [panel] › e2e/marco.panel.spec.ts:736:7 › colocados (HU-137) › registrar sin liberación → aviso sin guardar → con liberación → fila destacada → hoja del cliente (2.7s)
  ✓  68 [panel] › e2e/marco.panel.spec.ts:815:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (3.7s)
  ✓  69 [panel] › e2e/marco.panel.spec.ts:900:7 › observador (HU-124) › dirección de edición → consulta explicada → avisar a Talento Humano con el perfil (2.1s)
  ✓  70 [panel] › e2e/marco.panel.spec.ts:955:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (1.7s)
  ✓  71 [panel] › e2e/validaciones-entrada.panel.spec.ts:119:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › crear un alcance → asignarlo con fecha → publicar sin DISC (bloqueado, al campo) → completar y publicar → la vista previa muestra SARO y DISC (2.9s)
  ✓  72 [panel] › e2e/validaciones-entrada.panel.spec.ts:192:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › una fecha futura no se guarda: el panel lo dice en el campo y el perfil conserva lo que tenía (1.7s)
  1 skipped
  71 passed (2.7m)
```
- rc: 0 · 164 s

- fin: 2026-10-03T00:39:25Z
## resultado: VERDE

## Contexto del cierre (diff f939e1d..c084db8)
- c26c710: mapa campo→ancla único (`apps/panel/src/inventario/anclas.ts` + `anclas.test.ts`) para EditorPerfil, VistaPrevia y PublicacionMasiva (ruta gemela: la tercera copia estaba en EditorPerfil); `textoDeLinea` pasa a `packages/dominio/src/pruebas/evidencia.ts` (solo lo usaban tests).
  Mutantes: A1 ancla inexistente en el editor → 2 fallan · A2 copia propia en publicar varios → 1 falla · A3 trayectoria como validación de entrada → 1 falla. Restaurado tras cada uno.
- c084db8: la primera corrida de este runner en c26c710 salió ROJA por un único test dependiente del reloj (`apps/tarjeta-portal.test.ts:145`, 00:32 UTC = 19:32 Bogotá): la siembra de ficticios fechaba la disponibilidad con el día de UTC. Corregido a día civil de Bogotá con test de reloj fijo; mutante «vuelve a UTC» → 1 falla. Las 71 e2e de aquella corrida ya pasaban.
- Item nuevo HU-178-ac4: `ss2/wiring/HU-178-ac4-ultimo-incompleto-devuelve-afirmacion.md` (mutante M-ac4 muerto).
