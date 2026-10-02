# Gate data · EP-003 (evidencia del perfil) — cierre

- HEAD: 71305dac2f3f5c380721dc2b27319762924cc86e
- Rama: feature/ep-003-evidencia-del-perfil
- Hora UTC: 2026-10-02T22:38Z (corridas 22:40–22:50Z)
- Verificador: data-consistency-checker (solo lectura de código; tests ejecutados con BD real efímera)
- Builds standalone portal/panel: BUILD_ID 17:36:59 / 17:36:47 (-0500), posteriores al commit HEAD (17:36:15).

## Comandos ejecutados

A) `eval "$(scripts/bd-local.sh entorno)" && REQUIERE_BD=1 npx vitest run` sobre:
   packages/dominio/src/inventario/{perfil,entrada,validaciones-entrada}.test.ts,
   packages/dominio/src/importacion/{plan,plan-saro}.test.ts,
   packages/contratos/src/{ficha-saro,importacion-saro,importacion}.test.ts,
   packages/infra/src/postgres/{incompletos,migracion-0027,migracion-0028,migracion-0029,migracion-0027-0028-down,importacion-saro,aplicar-importacion,importacion,saro-disc-perfil,indicadores-tiempo}.test.ts
   → Test Files 18 passed (18) · Tests 207 passed (207) · 0 skipped · rc=0

B) mismo entorno, `REQUIERE_BD=1 npx vitest run` sobre:
   apps/{estandar-portal,ficha-ss6-portal,importacion-saro-panel,incompletos-lenguaje-panel,catalogo-portal}.test.ts
   (portal/panel standalone reales en puerto libre efímero, rol ps_portal)
   → Test Files 5 passed (5) · Tests 40 passed (40) · 0 skipped · rc=0

## Invariantes

### 1. Una sola regla de publicación — CUMPLE (con observación)
- Fuente única: `packages/dominio/src/inventario/perfil.ts:98` `evaluarPublicacion`.
- Panel, guarda al publicar: `packages/infra/src/postgres/perfiles-panel.ts:364` (leerPerfil → evaluacion), `:972` (`no_publicable`), `:887/:905` (editar publicado → `deja_incompleto`).
- Panel, marca/filtro «Incompleto»: `perfiles-panel.ts:433` (`estadoDeEntrada(p.estado, p.evaluacion)`), `apps/panel/app/inventario/page.tsx:62-63,313`; editor `apps/panel/src/inventario/EditorPerfil.tsx:280`.
- Portal, conteo encabezado: `packages/infra/src/postgres/indicadores.ts` → `contarIncompletos` (`packages/dominio/src/inventario/entrada.ts:111`) → `evaluarPublicacion(datosDeIndicadores(...))`; la vista 0029 solo expone hechos (booleanos/enteros), la regla no se copia en SQL (`packages/infra/migraciones/0029_indicadores_publicacion.ts`).
- Espejo SQL: trigger `_publicar_exige_consentimiento` (0017/0028:60-81) exige consentimiento, modalidad activa, alcance SARO, fecha SARO, fecha DISC — defensa en profundidad coherente (subconjunto, no contradice). Tests: migracion-0028 «con los tres datos entra en publicado», «un publicado que ya estaba no se toca».
- Importación: `packages/dominio/src/importacion/plan.ts:603-631` `faltasDePublicado` es una lista paralela de campos (NO llama a `evaluarPublicacion`). Es coherente hoy porque lo que omite está cubierto por otras vías: nombre/primerApellido son NO_VACIABLES (`plan.ts:151`), vaciar SARO/DISC de un publicado da error (`plan.ts:518-522`), el consentimiento no viaja en el archivo. OBSERVACIÓN (no bloqueante): es una segunda enumeración que puede divergir si se añade una condición nueva a `evaluarPublicacion`; recomendable derivarla de `evaluarPublicacion` o añadir un test de paridad.

### 2. Conteo del encabezado = marcas del panel — CUMPLE
- Test: `packages/infra/src/postgres/incompletos.test.ts:173` «ps_portal cuenta con la misma guarda los publicados que el panel marca» (`contarIncompletosPublicados(portal) === Object.keys(marcas).length`, n>0 sobre los heredados sembrados) y `:179` «completar los que faltan baja el conteo a 0 en las dos caras». E2E portal real: `apps/estandar-portal.test.ts:110` (0 → afirma; 1 → describe; completar el último devuelve la afirmación), `:136` degradación por tiempo (D97). Pasan en corrida A/B.

### 3. B.4 nunca cruza al portal — CUMPLE
- `migracion-0028.test.ts:256` recorre todas las columnas de vistas `operacion` concedidas a ps_portal contra la lista negra (foto, correo, teléfono, contacto, CV, motivación/proyección, DISC detallado, promedio, certificación, vinculo, aporte): sin fugas; ficha_publicable trae saro_texto/saro_fecha/disc_fecha y no saro_alcance_id.
- `migracion-0029.test.ts:89` la vista de indicadores solo tiene booleanos y enteros (sin código, id ni dato personal); `:105` ps_worker no la lee.
- `migracion-0027.test.ts:121` batería: ps_portal sin SELECT en ninguna tabla base de `inventario`; `:104` el portal no lee el catálogo de alcances.
- Contratos: `packages/contratos/src/ficha-saro.test.ts:57` el contrato del portal no admite el id del alcance ni campos de más; `importacion-saro.test.ts:63` el DISC detallado sigue bloqueado (solo la fecha).

### 4. «Incompleto» nunca llega al cliente — CUMPLE
- Vista 0029 sin texto ni campo «incompleto» (solo hechos); el conteo solo elige la frase del estándar (`apps/portal/src/banco/estandar.ts`).
- `apps/ficha-ss6-portal.test.ts:131` sobre portal standalone real con heredados incompletos: HTML/RSC no contienen /Incompleto|estadoDeEntrada|incompleto/. Contratos del portal sin campo de estado de entrada (grep `packages/contratos/src`: solo tipos de vista previa del panel).

### 5. Ida y vuelta de la importación — CUMPLE
- Exportar → importar con SARO/DISC = «sin cambios»: `packages/dominio/src/importacion/plan-saro.test.ts:99`, `apps/importacion-saro-panel.test.ts:146` (exportación real del panel), `packages/infra/src/postgres/importacion.test.ts:143` (CSV/XLSX), `importacion-saro.test.ts:104`.
- `null` explícito: `[vaciar]` → `null` (`plan.ts:257-263`); vaciar DISC de un publicado → error y conserva fecha (`apps/importacion-saro-panel.test.ts:261`); lote anterior a EP-003 no vacía SARO/DISC al revertir (`importacion-saro.test.ts:160`).
- No publica ni concede consentimiento: `aplicar-importacion.test.ts:163` (consentimiento=true y estado=publicado se rechazan; nada se publica; consentimiento null); `importacion-saro.test.ts:118` completa incompletos sin cambiar estados; nuevos nacen borrador (`plan.ts:527`).

## Huecos / notas
- Sin tests property-based ni de determinismo por repetición (N corridas) para `evaluarPublicacion`/`contarIncompletos`; son funciones puras sin aleatoriedad (inspección), cubiertas por tabla de casos. No bloqueante.
- Observación invariante 1 (lista paralela en importación) arriba.

## Veredicto global: PASS (5/5 CUMPLE) → proponer `gates.data: true`
