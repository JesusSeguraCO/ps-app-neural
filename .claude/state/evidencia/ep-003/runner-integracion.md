# EP-003 · runner de integración fuera del chat (fases de integration-check sobre ps_ep003)

- sha: 9c041678cedf67de80f857d2c06289750d515abb (árbol limpio)
- rama: feature/ep-003-evidencia-del-perfil
- inicio: 2026-10-02T23:27:28Z
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
⚡ Done in 48ms
```
- rc: 0 · 26 s

▶ migrar
```
{"ts":"2026-10-02T23:27:54.451Z","evento":"migraciones_aplicadas","aplicadas":[]}
{"ts":"2026-10-02T23:27:54.452Z","evento":"migrar_terminado","aplicadas":[],"porDelante":[]}
```
- rc: 0 · 0 s

▶ lint
```
> lint
> eslint .
```
- rc: 0 · 2 s

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
- rc: 0 · 7 s

▶ tests
```
 RUN  v5.0.2 /Users/cmo/Local/claude/Apps/App People Service/.wt/ep-003
 Test Files  144 passed (144)
      Tests  1554 passed (1554)
   Start at  18:28:03
   Duration  30.31s (tests 91%, import 7%, transform 2%)
    Isolate  144 workers spawned · ~163ms startup each (spawn + environment, per file)
             at least ~2.45s faster with isolate: false — reuses workers across files instead of one per file
```
- rc: 0 · 30 s

▶ e2e
```
  ✓  35 [panel] › e2e/marco.panel.spec.ts:95:9 › marco del panel con sesión › móvil a 390 px: sin scroll horizontal del documento y «Cerrar sesión» a mano (156ms)
  ✓  36 [panel] › e2e/marco.panel.spec.ts:111:7 › marco del panel con sesión › accesibilidad del marco: 0 incidencias serias o críticas (371ms)
  ✓  37 [panel] › e2e/marco.panel.spec.ts:122:7 › marco del panel con sesión › Cerrar sesión vuelve a la puerta y la sesión deja de valer (303ms)
  ✓  38 [panel] › e2e/marco.panel.spec.ts:131:5 › HU-123: al pedir el código, el foco pasa a la primera casilla (prototipo panel-acceso--codigo) (198ms)
  ✓  39 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /enlaces: axe sin incidencias serias y sin scroll horizontal a 320/390 (343ms)
  ✓  40 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /enlaces/nuevo: axe sin incidencias serias y sin scroll horizontal a 320/390 (379ms)
  ✓  41 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /peticiones: axe sin incidencias serias y sin scroll horizontal a 320/390 (1.3s)
  ✓  42 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /peticiones/renovaciones: axe sin incidencias serias y sin scroll horizontal a 320/390 (1.2s)
  ✓  43 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /catalogos: axe sin incidencias serias y sin scroll horizontal a 320/390 (453ms)
  ✓  44 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /catalogos?tipo=modalidad_prueba: axe sin incidencias serias y sin scroll horizontal a 320/390 (383ms)
  ✓  45 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /catalogos?tipo=motivo_pausa: axe sin incidencias serias y sin scroll horizontal a 320/390 (396ms)
  ✓  46 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /lexico: axe sin incidencias serias y sin scroll horizontal a 320/390 (407ms)
  ✓  47 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /lexico?vista=candidatas: axe sin incidencias serias y sin scroll horizontal a 320/390 (464ms)
  ✓  48 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /inventario: axe sin incidencias serias y sin scroll horizontal a 320/390 (1.9s)
  ✓  49 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /inventario/nuevo: axe sin incidencias serias y sin scroll horizontal a 320/390 (497ms)
  ✓  50 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /inventario/PS-0187: axe sin incidencias serias y sin scroll horizontal a 320/390 (524ms)
  ✓  51 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /importar: axe sin incidencias serias y sin scroll horizontal a 320/390 (372ms)
  ✓  52 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /importar?vista=historial: axe sin incidencias serias y sin scroll horizontal a 320/390 (437ms)
  ✓  53 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /vigencia: axe sin incidencias serias y sin scroll horizontal a 320/390 (374ms)
  ✓  54 [panel] › e2e/marco.panel.spec.ts:165:9 › pantallas del panel con sesión (HU-122, HU-145, HU-146; EP-006: HU-089, HU-143, HU-139, HU-125, HU-127, HU-136) › /colocados: axe sin incidencias serias y sin scroll horizontal a 320/390 (377ms)
  ✓  55 [panel] › e2e/marco.panel.spec.ts:194:7 › resultado de una importación (HU-141, HU-142) › /importar?lote=…: axe sin incidencias serias, sin scroll horizontal a 320/390 y consola limpia (469ms)
  ✓  56 [panel] › e2e/marco.panel.spec.ts:240:7 › vista previa de la ficha (HU-129) › axe sin incidencias serias, sin scroll horizontal y la ciudad según la necesidad (537ms)
  ✓  57 [panel] › e2e/marco.panel.spec.ts:266:7 › vista previa de la ficha (HU-129) › HU-129 · falta un dato que la publicación exige: el bloque sale marcado, nombra el dato e impide publicar (382ms)
  ✓  58 [panel] › e2e/marco.panel.spec.ts:291:7 › editor de perfiles (HU-089, HU-125) › las tecnologías se eligen del catálogo; Enter nunca guarda lo escrito (569ms)
  ✓  59 [panel] › e2e/marco.panel.spec.ts:308:7 › editor de perfiles (HU-089, HU-125) › el sector admite varios valores del catálogo y se conservan al guardar y volver (D23) (1.0s)
  ✓  60 [panel] › e2e/marco.panel.spec.ts:328:7 › editor de perfiles (HU-089, HU-125) › un rol que no existe muestra los parecidos antes de dejar crearlo (434ms)
  ✓  61 [panel] › e2e/marco.panel.spec.ts:342:7 › editor de perfiles (HU-089, HU-125) › guardar un perfil nuevo lo deja en borrador y señala lo que falta (339ms)
  ✓  62 [panel] › e2e/marco.panel.spec.ts:361:7 › sesión vencida al guardar (HU-138 escenario 2, HU-151) › Guardar con la sesión vencida no escribe nada y lleva a la puerta con la causa (275ms)
  ✓  63 [panel] › e2e/marco.panel.spec.ts:476:7 › editar un publicado y su reporte (HU-126, HU-140, HU-130) › guardar declara el impacto y confirmar lo aplica; incompleto pregunta y pasa a borrador (10.7s)
  ✓  64 [panel] › e2e/marco.panel.spec.ts:502:7 › editar un publicado y su reporte (HU-126, HU-140, HU-130) › el reporte sale de la modalidad, se confirma con la revisión y la ficha pasa a Nivel 1 (2.0s)
  ✓  65 [panel] › e2e/marco.panel.spec.ts:548:7 › disponibilidad, pausa y vigencia (HU-132, HU-133, HU-136) › actualizar en bloque → pausar con motivo → a los 31 días en la bandeja → reactivar (6.8s)
  ✓  66 [panel] › e2e/marco.panel.spec.ts:654:7 › coherencia y archivo (HU-134, HU-135) › pausado con fecha → ALTA en la fila → publicar con esa disponibilidad → archivar → fuera del banco (9.1s)
  ✓  67 [panel] › e2e/marco.panel.spec.ts:736:7 › colocados (HU-137) › registrar sin liberación → aviso sin guardar → con liberación → fila destacada → hoja del cliente (2.4s)
  ✓  68 [panel] › e2e/marco.panel.spec.ts:815:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (3.2s)
  ✓  69 [panel] › e2e/marco.panel.spec.ts:900:7 › observador (HU-124) › dirección de edición → consulta explicada → avisar a Talento Humano con el perfil (1.8s)
  ✓  70 [panel] › e2e/marco.panel.spec.ts:955:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (1.6s)
  ✓  71 [panel] › e2e/validaciones-entrada.panel.spec.ts:119:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › crear un alcance → asignarlo con fecha → publicar sin DISC (bloqueado, al campo) → completar y publicar → la vista previa muestra SARO y DISC (2.6s)
  ✓  72 [panel] › e2e/validaciones-entrada.panel.spec.ts:192:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › una fecha futura no se guarda: el panel lo dice en el campo y el perfil conserva lo que tenía (1.5s)
  1 skipped
  71 passed (2.5m)
```
- rc: 0 · 150 s

- fin: 2026-10-02T23:31:03Z
## resultado: VERDE
