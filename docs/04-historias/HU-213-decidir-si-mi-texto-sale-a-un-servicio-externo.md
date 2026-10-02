---
id: HU-213
titulo: "Decidir si mi requerimiento pegado sale a un servicio externo"
epica: EP-009
prioridad: media
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-065]
---

# HU-213 — Decidir si mi requerimiento pegado sale a un servicio externo

**Como** líder de proyecto que pega un requerimiento interno que puede traer datos de mi empresa o de terceros,
**quiero** saber antes de enviarlo que lo leerá un servicio externo, qué viaja y qué no, y poder elegir que no salga,
**para** no exponer información de mi empresa sin haberlo decidido.

## Criterios de aceptación

### Happy path — aviso antes de cualquier envío

**Dado** que pegué en la barra un texto de 1.012 caracteres
**Cuando** pulso «Buscar»
**Entonces** veo «¿Leemos tu requerimiento con Gemini?», con «Se envía: solo el texto que pegaste y nuestra lista de roles y tecnologías» y «Nunca se envía: ningún dato de los profesionales del banco de talento»
**Y** veo dos opciones, «Interpretar sin servicio externo» y «Extraer criterios con Gemini»
**Y** hasta ese momento no ha salido ninguna llamada al servicio externo

### Happy path — interpretar sin servicio externo

**Dado** que veo el aviso de servicio externo
**Cuando** elijo «Interpretar sin servicio externo»
**Entonces** la lectura sale del intérprete propio (HU-065) sin ninguna llamada externa
**Y** si queda texto sin coincidencia, se registra marcado como no apto para el servicio externo (`modelo_permitido = false`)
**Y** la elección «sin servicio externo» queda guardada en este navegador

### Edge case — la elección se recuerda en el mismo navegador

**Dado** que en este navegador ya elegí «Interpretar sin servicio externo» para un texto anterior y pegué un segundo texto largo
**Cuando** pulso «Buscar»
**Entonces** no veo el aviso y el texto se interpreta sin servicio externo
**Y** veo la opción «Cambiar» junto a la lectura

### Error — cierro el aviso sin elegir

**Dado** que veo el aviso de servicio externo
**Cuando** lo cierro sin elegir ninguna opción
**Entonces** no se ejecuta ninguna búsqueda ni sale ninguna llamada externa
**Y** mi texto sigue completo en la barra

### Edge case — sale solo el texto saneado y la taxonomía, nunca datos de perfiles

**Dado** que el banco tiene publicado el perfil ficticio «Ana Gómez» con código PS-0142
**Y** que el texto que pegué contiene «escribir a ana.gomez@cliente-ficticio.com o al 300 123 4567, ver https://intranet.cliente-ficticio.com/req»
**Cuando** elijo «Extraer criterios con Gemini»
**Entonces** la petición al servicio lleva solo el texto sin el correo, el teléfono ni la dirección web, y la taxonomía (roles, tecnologías, sectores y seniority del catálogo)
**Y** no lleva nombres, códigos ni ningún otro dato de ningún perfil
**Y** mi texto en la barra sigue completo, sin cambios

## Notas

Cubre **RF-16.2** (al modelo se le envía la consulta y la taxonomía, nunca los datos de los perfiles) y las tácticas de ADR-0004 para **CON-8** (aviso al cliente antes de enviar, saneamiento determinista de correos, teléfonos y URL, minimización de datos, test de contrato del payload saliente: **V4-5**) y la marca `modelo_permitido` de la revisión adversarial (H43), que impide que una consulta que el cliente no quiso enviar llegue después al servicio por la vía de las propuestas de léxico (RF-8.12.1, HU-139).

**Nace el 2026-10-02 (discovery de EP-009)** de partir el recorrido del requerimiento pegado: la extracción y sus etiquetas quedan en **HU-067**; el aviso, la elección y lo que viaja, aquí. **Partición, no recorte.**

**Decisión por delegación del sponsor (elegida por el modelo):** la elección «sin servicio externo» se **recuerda siempre en el navegador** y se puede revertir con «Cambiar»; la elección «con Gemini» también se recuerda, de modo que el aviso solo aparece la primera vez en cada navegador. ADR-0004 dejaba abierto si se recuerda siempre o solo cuando el cliente lo pide; recordar siempre evita repetir el aviso a quien ya decidió. El copy sale del prototipo y queda **marcado para revisión de copy** (D73).

**Riesgo aceptado (ADR-0004):** el saneamiento no detecta nombres propios de terceros dentro del texto pegado; lo cubre solo el aviso. La base legal de la transferencia internacional queda como trade-off de negocio abierto en ADR-0004 §6.

**T-23 (2026-10-02): PASA, con reserva.** Precisión 100 % (0 etiquetas que sobran en 15 corridas), 0 criterios inventados, exhaustividad 98,2 % (109 de 111 esperados), salida con esquema válido 15/15. Reserva de método: los cinco textos y sus conjuntos esperados los escribió el agente, no Comercial (mismo autor, sesgo a favor). Es un ensayo válido del mecanismo, no la prueba definitiva. **D135** (cierra D131): RF-12.2 se construye.

**Prerrequisito del DoR de EP-009 (no es recorte):** repetir T-23 con 5 textos reales anonimizados por Comercial (método c), cambiando solo `esperados.json`, y registrar el resultado.

**Pregunta abierta del sponsor (D135):** la dimensión «idioma» («Inglés intermedio») que pedía HU-067 no existe hoy en el catálogo; mientras no se decida, no produce etiqueta.

**Línea de release.** Vuelve al MVP con HU-067 (D135).

**Fuente de diseño:** `docs/05-prototipo/pantallas/inicio-busqueda--requerimiento-pegado.html` (borrador).

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-16.2 · RF-12.2.1 · RF-8.12.1 · CON-8 · ADR-0004 (aviso, saneamiento, `modelo_permitido`, V4-5) · ADR-0006 (consultas sin coincidencia) · T-23 (PASA con reserva) · D131 → D135 · depende de HU-065 (intérprete, misma épica) · habilita HU-067 y HU-072 · relacionada con HU-139 (EP-006)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ RF-12.2 se construye tras T-23 (PASA, D135); solo depende de HU-065, de la misma épica |
| N | Negociable | ✓ son fijos el aviso antes de cualquier envío, la opción sin servicio externo, el saneamiento y que no viajen perfiles; el texto y la forma del aviso se negocian |
| V | Valiosa | ✓ el cliente decide qué sale de su empresa; Trycore cumple el deber de información y la promesa de RF-16.2 |
| E | Estimable | ✓ M: diálogo con elección guardada en el navegador, saneamiento por patrones, test de contrato del payload y la marca en la consulta sin coincidencia |
| S | Pequeña | ✓ M: cinco escenarios sobre una sola decisión del cliente |
| T | Testeable | ✓ e2e con interceptación de la petición saliente (doble del servicio): ausencia de llamada, payload saneado y sin datos de perfiles, elección recordada en el mismo contexto de navegador |
