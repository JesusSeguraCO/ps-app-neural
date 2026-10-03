# Proposal

## Why

La tarjeta y la ficha son donde el cliente decide y donde se juega la marca: si un perfil se lee como una persona en un catálogo, o si la ficha afirma una verificación que nadie registró, el daño no se repara con copy. Hoy el portal muestra la ficha compartida de EP-006 (D47), pero le falta lo que el estándar Neural-Grid promete: la verificación de seguridad bajo SARO y la evaluación DISC no existen en el modelo, la validación técnica no es un bloque desplegable, la tarjeta no lidera con la capacidad ni diferencia por el Sello Personal, no hay evidencia ✓/– por criterio, el código sigue en la cabecera, no hay cierre con condiciones, SLA y garantía, y no hay encabezado del estándar. EP-003 entrega la evidencia del perfil completa —capturada en el panel y exigida para publicar, mostrada en la tarjeta y en la ficha sin afirmar nada que no esté en el inventario— sin reabrir EP-006 (D60).

## What Changes

- **Catálogo de alcances SARO (HU-177)**: catálogo cerrado administrable más en el panel, con texto de cara al cliente, sin duplicados (idéntico salvo mayúsculas se impide), corrección del texto con impacto previo sobre las fichas publicadas y desactivar sin borrar (el perfil que lo tiene lo conserva y puede re-publicarse).
- **Captura de SARO y DISC (HU-176)**: alcance SARO elegido del catálogo, fecha SARO y fecha DISC en el editor del perfil; fecha posterior a hoy rechazada; los tres datos pasan a ser obligatorios para publicar (D61) en la misma guarda de HU-128, con «Falta …» y salto al campo.
- **Validaciones de entrada e «Incompleto» (HU-178)**: un publicado sin SARO, sin fecha DISC o sin modalidad de prueba sigue publicado y visible (D62), marcado en el panel «Incompleto: falta …» y filtrable; editarlo sin completarlo recibe la pregunta de HU-126; el Sello Personal no cuenta (D63). La marca es la misma guarda `evaluarPublicacion`, no un estado nuevo.
- **Aviso de lenguaje de inventario (HU-194)**: al guardar, el panel advierte —sin bloquear (D73)— si la trayectoria usa «unidad», «ítem», «disponible para asignación» o «stock», por expresión completa y sin distinguir mayúsculas ni tildes.
- **Importación masiva (HU-191, D81)**: columnas alcance SARO (contra el catálogo cerrado), fecha SARO y fecha DISC en la importación, la plantilla y la exportación; ida y vuelta «sin cambios»; valores fuera de regla a error de fila; `[vaciar]` de una validación de un publicado es error.
- **Tarjeta (HU-153, HU-081, HU-119)**: capacidad primero (rol · seniority · años) con nombre y primer apellido; 5 tecnologías por orden de carga (D73), sector, modalidad, país y banda; código solo al pie; tres competencias del Sello Personal sin insignia (un sello fuera de contrato se omite y se registra); evidencia ✓/– por criterio activo con plantilla fija por tipo y texto genérico para un tipo sin plantilla (D96), sin porcentajes.
- **Ficha (HU-154, HU-155, HU-156, HU-157, HU-158)**: «Verificado por Trycore» frente a «Declarado por la persona»; validación técnica desplegable con los cinco campos de D59 y Nivel 0 sin fecha (D73); SARO con el texto del alcance y su mes, DISC con su mes, omitidos sin marca si faltan; la conversación va por Trycore con el contacto vigente, sin vía directa y sin declarar el vínculo; cierre con condiciones operativas, SLA de 10 días hábiles y garantía Neural Speed igual para todos; código solo al pie. Nada de la lista negra B.4 cruza al portal.
- **Encabezado del estándar (HU-159)**: una vez, antes del primer perfil, en la selección, el banco y el encuadre sin selección (D73), en cuatro dimensiones (D64); afirma «ningún perfil…» solo con 0 publicados incompletos (D80) y, si el conteo no está disponible, muestra la versión descriptiva y lo registra (D97); bloque de respaldo con el SLA.
- **Recorrido de fichas (HU-120)**: se re-verifican contra lo construido en EP-006 (D47) los extremos con botón y teclado y la vuelta a la misma lista en la misma posición, y se cierra lo que falte.

Se construye en siete sub-slices del DoR, de uno en uno y con el recorrido verde entre cada uno: 1 catálogo de alcances y captura SARO/DISC · 2 «Incompleto» y aviso de lenguaje · 3 importación · 4 tarjeta · 5 ficha: verificado/declarado, validación técnica y conversación por Trycore · 6 ficha: SARO/DISC y cierre · 7 encabezado del estándar y re-verificación del recorrido.

## Capabilities

### New Capabilities

- `validaciones-de-entrada`: captura de SARO (alcance y fecha) y DISC (fecha), obligatorios para publicar, y marca «Incompleto» de los publicados que no cumplen las tres validaciones de entrada.
- `tarjeta-perfil`: tarjeta que lidera con la capacidad, diferencia por el Sello Personal y muestra la evidencia ✓/– por criterio.
- `ficha-evidencia`: ficha con lo verificado separado de lo declarado, validaciones técnica, de seguridad y DISC como contenido, conversación por Trycore y cierre con condiciones, SLA y garantía.
- `encabezado-estandar`: declaración única del estándar Neural-Grid antes del primer perfil, con la afirmación «ninguno» condicionada al conteo de incompletos y el bloque de respaldo.

### Modified Capabilities

- `catalogos-parametricos`: se añade el catálogo de alcances SARO con su texto de cara al cliente, corrección con impacto y conservación del valor desactivado.
- `perfiles-inventario`: aviso no bloqueante de lenguaje de inventario al guardar la trayectoria; la ficha del portal (D47) se re-verifica en sus extremos y en la vuelta a la misma posición de la lista.
- `importacion-masiva`: columnas SARO y DISC en la importación, la plantilla y la exportación.

`consentimiento-y-publicacion` no cambia de contrato: la guarda de publicar sigue siendo una sola (`evaluarPublicacion`); las dos condiciones nuevas se especifican en `validaciones-de-entrada`. `aterrizaje-curado` y `contacto-trycore` solo se consumen (selección reevaluada, contacto vigente).

## Impact

- **Código**: `apps/panel` (catálogos, editor y listado del inventario, importar), `apps/portal` (selección, banco, encuadre, ficha), `apps/worker` (`aplicar_importacion`, `sembrar_ficticios`), `packages/{dominio,infra,contratos,ui}`; dentro del `files_scope` de `.claude/state/evidencia/ep-003/dor-pass.md`.
- **Datos**: migraciones hacia adelante 0027–0029: `catalogo_alcances_saro`; `perfiles` + `saro_alcance_id`, `saro_fecha`, `disc_fecha` (CHECK de fecha no futura en la aplicación y en BD); vistas `operacion.catalogo_publicable` y `operacion.ficha_publicable` con lo que la tarjeta y la ficha necesitan; vista sin datos personales de indicadores de publicación de los publicados para el conteo del encabezado. Auditoría por campo con `auditoria.registrar(...)` (ADR-0003).
- **Fronteras externas**: ninguna. HubSpot, Gemini y Mailgun no intervienen; ningún modelo redacta sobre perfiles (RF-16).
- **Seguridad y datos personales**: Ley 1581; la lista negra B.4 (foto, contacto, hoja de vida, motivación, DISC detallado, promedio y certificaciones) nunca cruza al portal; `vinculo` y la marca «Incompleto» tampoco; `ps_portal` sigue leyendo solo vistas.
- **Dependencias**: ninguna nueva; todo dentro de `.claude/config/stack-allowlist.json`.

## Trazabilidad

- Épica: EP-003
- Historias: HU-081, HU-119, HU-120, HU-153, HU-154, HU-155, HU-156, HU-157, HU-158, HU-159, HU-176, HU-177, HU-178, HU-191, HU-194
- Discovery: docs/03-backlog/epicas.md#ep-003
- Fuera de este change aunque el hub las liste en la épica: **HU-079** (`estado: descartada`, reemplazada por HU-081) y **HU-175** (sumar/quitar desde la ficha, movida a EP-004 por D101). HU-174 pasó a EP-009 por D87.
- Decisiones: .claude/state/evidencia/ep-003/decisiones-sponsor-2026-10-02.md (D59–D64, D73, D80, D81, D87, D96, D97, D101)
- DoR: .claude/state/evidencia/ep-003/dor-pass.md (alcance de 15 HU, `files_scope` y orden de los 7 sub-slices)
- Arquitectura: docs/adr/0003, 0006, 0008, 0010 (UC-4, QA-2, QA-5, QA-17)
- Diseño: prototipo claude.ai/design v2 (espejo `docs/07-prototipo/`): tarjeta, ficha, `validacion-tecnica`, `hero-neural-grid`, `franja-servicio`
