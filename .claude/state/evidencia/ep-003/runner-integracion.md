# EP-003 · runner de integración fuera del chat (fases de integration-check sobre ps_ep003)

- sha: 71305dac2f3f5c380721dc2b27319762924cc86e (árbol limpio)
- rama: feature/ep-003-evidencia-del-perfil
- inicio: 2026-10-02T22:36:39Z
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
⚡ Done in 54ms
```
- rc: 0 · 28 s

▶ migrar
```
{"ts":"2026-10-02T22:37:07.367Z","evento":"migraciones_aplicadas","aplicadas":[]}
{"ts":"2026-10-02T22:37:07.368Z","evento":"migrar_terminado","aplicadas":[],"porDelante":[]}
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
      Tests  1548 passed (1548)
   Start at  17:37:17
   Duration  31.29s (tests 92%, import 7%, transform 1%)
    Isolate  144 workers spawned · ~165ms startup each (spawn + environment, per file)
             at least ~2.47s faster with isolate: false — reuses workers across files instead of one per file
```
- rc: 0 · 32 s

▶ e2e
```
  ✓  58 [panel] › e2e/marco.panel.spec.ts:308:7 › editor de perfiles (HU-089, HU-125) › el sector admite varios valores del catálogo y se conservan al guardar y volver (D23) (1.0s)
  ✓  59 [panel] › e2e/marco.panel.spec.ts:328:7 › editor de perfiles (HU-089, HU-125) › un rol que no existe muestra los parecidos antes de dejar crearlo (420ms)
  ✓  60 [panel] › e2e/marco.panel.spec.ts:342:7 › editor de perfiles (HU-089, HU-125) › guardar un perfil nuevo lo deja en borrador y señala lo que falta (316ms)
  ✓  61 [panel] › e2e/marco.panel.spec.ts:361:7 › sesión vencida al guardar (HU-138 escenario 2, HU-151) › Guardar con la sesión vencida no escribe nada y lleva a la puerta con la causa (273ms)
  ✓  62 [panel] › e2e/marco.panel.spec.ts:476:7 › editar un publicado y su reporte (HU-126, HU-140, HU-130) › guardar declara el impacto y confirmar lo aplica; incompleto pregunta y pasa a borrador (10.4s)
  ✓  63 [panel] › e2e/marco.panel.spec.ts:502:7 › editar un publicado y su reporte (HU-126, HU-140, HU-130) › el reporte sale de la modalidad, se confirma con la revisión y la ficha pasa a Nivel 1 (1.7s)
  ✓  64 [panel] › e2e/marco.panel.spec.ts:548:7 › disponibilidad, pausa y vigencia (HU-132, HU-133, HU-136) › actualizar en bloque → pausar con motivo → a los 31 días en la bandeja → reactivar (5.4s)
  ✓  65 [panel] › e2e/marco.panel.spec.ts:654:7 › coherencia y archivo (HU-134, HU-135) › pausado con fecha → ALTA en la fila → publicar con esa disponibilidad → archivar → fuera del banco (7.3s)
  ✓  66 [panel] › e2e/marco.panel.spec.ts:736:7 › colocados (HU-137) › registrar sin liberación → aviso sin guardar → con liberación → fila destacada → hoja del cliente (2.0s)
  ✓  67 [panel] › e2e/marco.panel.spec.ts:815:7 › carga de Operaciones (HU-150) › xlsx rechazado → CSV aplicado con columna ignorada → diferencia con el panel aceptada (2.6s)
  ✓  68 [panel] › e2e/marco.panel.spec.ts:900:7 › observador (HU-124) › dirección de edición → consulta explicada → avisar a Talento Humano con el perfil (1.8s)
  ✓  69 [panel] › e2e/marco.panel.spec.ts:955:7 › administración (HU-151, HU-147, HU-138) › inscribir → entra → bajarla de rol corta su sesión → contacto → portal → registro con autor (1.5s)
  ✓  70 [panel] › e2e/validaciones-entrada.panel.spec.ts:119:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › crear un alcance → asignarlo con fecha → publicar sin DISC (bloqueado, al campo) → completar y publicar → la vista previa muestra SARO y DISC (2.1s)
  ✓  71 [panel] › e2e/validaciones-entrada.panel.spec.ts:189:7 › validaciones de entrada SARO/DISC (HU-177, HU-176) › una fecha futura no se guarda: el panel lo dice en el campo y el perfil conserva lo que tenía (1.2s)
  1) [portal] › e2e/estandar-recorrido.portal.spec.ts:83:7 › estándar Neural-Grid y recorrido de fichas (EP-003 · SS7) › selección con un incompleto (descriptiva) → completarlo en el panel → «ningún» → recorrer fichas hasta los extremos → cerrar en la misma posición 
    Error: expect(received).toMatch(expected)
    Expected pattern: /^\d{6}$/
    Received string:  ""
    Call Log:
    - Timeout 90000ms exceeded while waiting on the predicate
       at ayudas/perfiles-publicados.ts:216
      214 |         { timeout: 90_000, intervals: [300] },
      215 |       )
    > 216 |       .toMatch(/^\d{6}$/);
          |        ^
      217 |     return codigo;
      218 |   };
      219 |   return { proceso, codigoPara };
        at Object.codigoPara (/Users/cmo/Local/claude/Apps/App People Service/.wt/ep-003/e2e/ayudas/perfiles-publicados.ts:216:8)
        at /Users/cmo/Local/claude/Apps/App People Service/.wt/ep-003/e2e/estandar-recorrido.portal.spec.ts:122:37
    Error Context: ../../../../../../../../private/tmp/claude-501/-Users-cmo-Local-claude-Apps-App-People-Service/e5d4a5ad-ce69-4930-81c2-9b46673c9ba5/scratchpad/pw-resultados/estandar-recorrido.portal--18c48-cerrar-en-la-misma-posición-portal/error-context.md
    attachment #2: trace (application/zip) ─────────────────────────────────────────────────────────
    ../../../../../../../../private/tmp/claude-501/-Users-cmo-Local-claude-Apps-App-People-Service/e5d4a5ad-ce69-4930-81c2-9b46673c9ba5/scratchpad/pw-resultados/estandar-recorrido.portal--18c48-cerrar-en-la-misma-posición-portal/trace.zip
    Usage:
        npx playwright show-trace ../../../../../../../../private/tmp/claude-501/-Users-cmo-Local-claude-Apps-App-People-Service/e5d4a5ad-ce69-4930-81c2-9b46673c9ba5/scratchpad/pw-resultados/estandar-recorrido.portal--18c48-cerrar-en-la-misma-posición-portal/trace.zip
    ────────────────────────────────────────────────────────────────────────────────────────────────
  1 failed
    [portal] › e2e/estandar-recorrido.portal.spec.ts:83:7 › estándar Neural-Grid y recorrido de fichas (EP-003 · SS7) › selección con un incompleto (descriptiva) → completarlo en el panel → «ningún» → recorrer fichas hasta los extremos → cerrar en la misma posición 
  1 skipped
  69 passed (3.4m)
```
- rc: 1 · 205 s

- fin: 2026-10-02T22:41:13Z
## resultado: ROJO
