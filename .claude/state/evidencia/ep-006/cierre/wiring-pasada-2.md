# EP-006 · verificación adversarial del cableado — pasada 2 (incremental, última)

- Rama `feature/ep-006-administracion-del-inventario`. Pedida sobre `c9b06ed`; al verificar, HEAD era `32be39c` (solo docs: `git diff c9b06ed 32be39c -- apps packages e2e openspec` toca únicamente `proposal.md`). El código ejecutado es idéntico al de `c9b06ed`.
- Alcance: `git diff b4110f8 c9b06ed -- apps packages e2e openspec` + rutas gemelas; los 9 items failing de la pasada 1; los 2 items nuevos de D47; el arreglo D44.
- **Veredicto: HUECOS → `wiring_verified = false`** (0 ALTA, 1 MEDIA, 6 BAJA). La MEDIA está en el mismo componente que tocó el arreglo D45 y se cierra con un cambio de una línea + un test.

## Ejecutado en esta pasada (builds del 21:22–21:23, posteriores a c9b06ed)

| Qué | Resultado |
|---|---|
| vitest dirigido (`REQUIERE_BD=1`): ficha-portal, observador-panel, recorrido-ep006, aplicar-importacion, plan, recorrido (dominio), cliente (panel), catalogos-lexico-panel | 8 ficheros, 104 ✓ |
| vitest completo (`REQUIERE_BD=1`) | 109 ficheros ✓ / 1 omitido (frontera Gemini sin llave), 1227 ✓ / 1 omitido |
| Playwright completo (portal + panel) | 60 ✓ / 1 omitido; incluye «sesión vencida al guardar» (marco.panel:296), «D47 · HU-120» (acceso.portal:193) y HU-151 (marco.panel:843) |
| Comprobación de solo lectura en la BD de dev | tras mis dos corridas del e2e de sesión vencida, ningún perfil nuevo de `e2e-vence@trycore.com` (siguen los 2 de las 20:39, ver B2) |
| Newman | no se re-ejecutó: el diff no toca `apps/*/app/api` ni `packages/infra/src/http` (sin cambios desde b4110f8) |
| Gemini (evidencia viva) | `packages/infra/src/gemini/**` sin cambios desde `e772614`: sigue anclada |

## Hallazgos

### M1 · MEDIA · HU-124-ac1-consulta — gemelo de D45 sin cerrar
- **Escenario:** la observadora abre desde el historial (`/importar?lote=<id>`) un lote `abortado` o `calculado` (sin confirmar). Ve el botón «Volver a pegar», que es un control de importación. El AC dice «no veo ningún control de edición, publicación ni importación». No da 403 (lleva a `/importar`, que a la observadora le muestra el historial), pero el AC se incumple literalmente. D45 ocultó «Pegar las filas corregidas» en la rama con errores y dejó visible este control en la rama de lote no aplicado.
- **Dónde:** `apps/panel/src/importacion/Resultado.tsx:186-188` (rama `lote.fase === "abortado" || "calculado"`, líneas 160-191), que no mira `p.puedeImportar`.
- **Test que no lo cubre:** `apps/observador-panel.test.ts` (el nuevo «resultado de una importación con errores») solo prueba un lote aplicado.
- **Arreglo exacto:** envolver el enlace en `{p.puedeImportar && ( … )}`. En `observador-panel.test.ts`, crear un lote como admin con `POST /api/v1/importacion/lotes` **sin aplicarlo** (queda `calculado`) y comprobar que `pagina(/importar?lote=…, admin)` contiene «Volver a pegar» y que la de la observadora no lo contiene. Mutación: quitar la guarda → el test cae.

### B1 · BAJA · HU-138/HU-151 — descargas por `<a download>` fuera de `pedir`
- `Resultado.tsx:207` (`/reporte`) y `:322` (`/errores`) son enlaces nativos. Si la sesión vence, el navegador guarda como archivo el JSON `{"motivo":"sesion_expirada"}` y no lleva a la puerta. No escribe nada, y el AC habla de guardar, así que no bloquea. Arreglo opcional: descargar con `pedir` + blob, como hace `Asistente.bajar` (`Asistente.tsx:74-98`).

### B2 · BAJA · HU-138-ac2 — el e2e no comprueba «no escribe nada», y quedaron restos en la BD de dev
- `e2e/marco.panel.spec.ts:296-313`: el título dice «no escribe nada», pero solo comprueba la URL y que no aparezca «No se pudo guardar». El no-escribir lo implica el 401 (y lo prueba la API en `registro-perfil.test.ts`), pero el e2e no lo comprueba.
- En la BD de dev hay **PS-1608 y PS-1609** («E2E vencida», borrador, `creado_por = e2e-vence@trycore.com`), creados a las 20:39 hora local, antes del arreglo `b833742`. Mis corridas no crearon ninguno. No los borré (solo lectura).
- **Arreglo:** tras el clic, `SELECT count(*) FROM inventario.perfiles WHERE nombre='E2E vencida' AND creado_en > <inicio del test>` = 0. Limpiar PS-1608/1609 o archivarlos (decisión del orquestador; no son ficticios).

### B3 · BAJA · HU-130-ac3-detalle-despues — en el portal no se mira «por criterio»
- En `apps/recorrido-ep006.test.ts:256-261` el reporte se confirma **antes** de publicar (pasos 4→5), y el paso 6 comprueba evaluador y resultado, pero no «Evaluó: …». La secuencia «publicado con Nivel 0 → reporte → el cliente ve los criterios» queda cubierta por partes, cada una ejecutada: `packages/infra/src/postgres/validaciones.test.ts:188-217` (`fichaDelPortal` antes y después, con criterios, sin republicar), `e2e/marco.panel.spec.ts:410` (el mismo `FichaPerfil` pinta «Evaluó:») y `ficha-portal.test.ts` (la página del portal usa `fichaDelPortal` con ese mismo `FichaPerfil`). **Arreglo:** añadir `expect(html).toContain("Evaluó:")` en el paso 6.

### B4 · BAJA · D46 — la dependencia de EP-009 solo está escrita en EP-006
- `ss1/journey-ss1.md:7-9` ya es honesto: la corrección dice que la búsqueda del portal todavía no llama al intérprete. Pero el «criterio del DoR de EP-009» solo consta en `decisiones-sponsor-2026-10-01.md` (D46) y en `design.md` §12 de este change. No está en `docs/03-backlog/epicas.md` (EP-009) ni en el estado del hub, que es lo que leerá el DoR de EP-009. **Arreglo:** registrarlo donde lo lea el DoR de EP-009 (nota en el hub o en la épica; si es un documento de discovery, lo decide una persona).

### B5 · BAJA · H7 de la pasada 1 sigue abierto
- `apps/panel/app/inventario/[codigo]/validacion/page.tsx:24`: la observadora es redirigida a la edición y el `acceso_rechazado` queda registrado con otro recurso. Es código anterior al cierre y no estaba en el alcance del arreglo.

### B6 · BAJA · textos que dicen más de lo que se comprueba
- `packages/dominio/src/importacion/plan.ts:536-538` dice «modalidad de prueba … activa», pero `catalogosImportacion` (`packages/infra/src/postgres/importacion.ts:121-126`) incluye las inactivas y `faltasDePublicado` no mira si está activa. No rechaza filas legítimas (deja pasar lo que el perfil ya tenía). Corregir el comentario o filtrar por activas.
- `apps/ficha-portal.test.ts:160` se titula «recorre la lista filtrada y conserva el filtro», pero no aplica ningún filtro. Que el filtro se conserve lo cubre `recorrido.test.ts` («la dirección de la ficha conserva el filtro»). Arreglo: `/banco?categoria=…` en el test o renombrarlo.

## Lo que intenté refutar y se sostiene
- **H1 (401 → puerta):** todas las peticiones del navegador del panel pasan por `pedir` (grep: el único `fetch(` de `apps/panel` está en `cliente.ts:14`). Las únicas fuentes de 401 son `envoltorios.ts:119,134` (sesión). Las rutas `/api/v1/acceso/*` quedan excluidas, así que un código errado en la puerta no redirige. `destinoTrasRechazo` no abre un redirector (test unitario). La baja da `sin_sesion` → `/acceso`. El e2e en un navegador real lleva a `/acceso?motivo=sesion_expirada`. Sin regresiones: Playwright completo en verde.
- **D45:** la observadora no ve «Ver para copiar», «Descargar…», «Pegar filas» ni la URL de `/errores` en un lote aplicado con errores; la administradora sí. El test lo comprueba con los dos roles.
- **D44:** `faltasDePublicado` solo bloquea lo que la fila deja incompleto (lo que ya faltaba no bloquea). Pasar a borrador en la misma fila sí se aplica. El cambio de rol con la modalidad de la familia nueva se aplica. Al aplicar, el worker recalcula el plan (`aplicar-importacion.ts:308`). El test de integración aplica de verdad y comprueba que los tres publicados quedan idénticos y siguen en `catalogo_publicable`, y que la fila legítima se aplica. Gemela revisada: la reversión restaura también `estado`, así que no puede dejar un publicado incompleto.
- **D47:** `fichaDelPortal` ya tiene quien la llame en producción (`apps/portal/src/banco/datos.ts:fichaDe`, desde `/` y `/banco`). Los clientes nombrados se filtran en la vista `operacion.experiencias_publicables` (0014), no en TS. Un código fuera de la lista, pausado, inventado o con `<script>` no abre ficha. Las flechas se deshabilitan en los extremos. En el teléfono la ficha ocupa 390×800 sin scroll horizontal. axe sin incidencias graves. Sin errores de consola.
- **HU-139:** `apps/catalogos-lexico-panel.test.ts:293-307` registra el término por la API del panel y `interpretarConsulta` lo reconoce con el rol `ps_portal` contra la BD, sin despliegue.

## Items de `wiring_checklist[]`

**Passing, reproducidos en esta pasada** (estampar `verified_at_sha = c9b06ed`; el código es idéntico en `32be39c`):
- `HU-138-ac2-sin-identidad`, `HU-151-ac2-bajar-rol`, `HU-151-ac3-baja`: e2e marco.panel:296 y :843, `cliente.test.ts`, `registro-perfil.test.ts`.
- `HU-130-ac3-detalle-despues` (con la nota B3), `HU-127-ac4-parcial-despersonaliza`, `HU-129-ac1-vista-fiel`: `ficha-portal.test.ts`, recorrido paso 6, e2e D47, `validaciones.test.ts`, `ficha-compartida.test.ts`.
- `HU-139-ac1-equivalencia`, a nivel del intérprete (D46): `catalogos-lexico-panel.test.ts`.
- `I-ficha-portal-lista-componente`, `HU-120-d47-recorrer`: e2e acceso.portal:193, `ficha-portal.test.ts`, `recorrido.test.ts`.
- El item del arreglo D44 (gate data H1): `plan.test.ts` (bloque D44) y `aplicar-importacion.test.ts` («una fila que deja incompleto a un publicado…»).
- Además, la suite completa (vitest 1227 ✓, Playwright 60 ✓) reprodujo en este HEAD el resto de items deterministas que la pasada 1 dio por `passing`.

**Failing:**
- `HU-124-ac1-consulta`, por M1. Se cierra con el arreglo exacto de arriba y su mutación.

**No es `passing` en EP-006:**
- `IP-ss1-lexico-portal`: el punto de integración «búsqueda del portal → intérprete → léxico» **no está cableado** y el sponsor lo llevó a EP-009 (D46). Hay que marcarlo como transferido a EP-009, no como `passing`.

**Sin cambios desde su sello, no re-ejecutados aparte:**
- Contratos HTTP de Newman: sin cambios desde `b4110f8` (el diff no toca rutas API).
- `BND-llm-interpreter-suggest-lexicon-entries`: evidencia viva anclada en `e772614`.

**Diferidos por D29 (no evaluados):** `HU-131-ac1..ac5`, `I-spaces-subida-csp`.

## Cierre de la pasada 2 (sin tercera pasada, `dod.md`)

- **M1 · cerrado con mutación verificada.** `Resultado.tsx`: «Volver a pegar» solo con `puedeImportar`. Test nuevo en
  `apps/observador-panel.test.ts` («un lote sin aplicar…»): con el código anterior (sin la guarda) cae
  (`not.toContain("Volver a pegar")`), con el arreglo pasa (8/8). `HU-124-ac1-consulta` → passing.
- **B2 · cerrado:** el e2e de sesión vencida comprueba en la BD que no existe ningún perfil con el nombre escrito.
- **B3 · cerrado:** el paso 6 del recorrido comprueba «Evaluó: …» en la ficha del cliente.
- **B6 · cerrado:** comentario de `faltasDePublicado` corregido (el catálogo de la importación solo trae activas); test
  del banco renombrado y caso nuevo con filtro real (`categoria`) que recorre solo la lista filtrada, conserva el filtro
  al cerrar y no abre un perfil de otra familia (9/9).
- **Diferidos al Release Gate (declarados en el PR):** B1 (descargas nativas con sesión vencida guardan el JSON del 401),
  B5 (H7: la observadora en `/validacion` se registra con otro recurso).
- **B4 / `IP-ss1-lexico-portal`:** transferido a EP-009 por D46 (sponsor); el hub no admite retirar items, queda
  failing y declarado en el PR. Su registro en el DoR de EP-009 es acto humano (documento de discovery / hub).
