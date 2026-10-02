---
id: HU-167
titulo: "Registrar el recorrido del cliente como eventos de su visita"
epica: EP-008
prioridad: alta
complejidad: M
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: []
---

# HU-167 — Registrar el recorrido del cliente como eventos de su visita

**Como** Dirección de Mercadeo, que lee la telemetría de intención del portal,
**quiero** que cada paso que da un invitado en el portal quede registrado como un evento de su visita, atribuido en el servidor a su cuenta, su enlace y su edición de origen,
**para** que cada informe de Medición salga de lo que de verdad ocurrió y no de lo que alguien recuerda o reconstruye a mano.

## Criterios de aceptación

### Happy path — los pasos quedan registrados con su atribución y su ámbito

**Dado** que un invitado con su correo verificado está en el portal con un enlace que trae un conjunto curado,
**cuando** abre la ficha de un perfil del conjunto curado y después la de un perfil que encontró al ampliar la búsqueda,
**Entonces** quedan registrados dos eventos «ficha abierta», en el orden en que ocurrieron, con la cuenta, el enlace, el contacto y la edición que el servidor toma de la sesión
**Y** el primero queda marcado como interacción con el conjunto curado y el segundo como interacción por descubrimiento
**Y** ningún evento guarda el correo del invitado ni texto de la ficha: del perfil solo queda su identificador opaco

### Error — el registro de eventos falla y el invitado no se entera

**Dado** que el registro de eventos no está disponible,
**cuando** el invitado abre una ficha,
**Entonces** la ficha se muestra igual, sin espera añadida ni mensaje de error
**Y** el lote que no se pudo guardar queda contado como eventos perdidos en el registro técnico, sin datos del invitado

### Edge case — el invitado cierra la pestaña a mitad del recorrido

**Dado** que un invitado abrió fichas y tiene eventos que el navegador aún no envió,
**cuando** cierra la pestaña,
**Entonces** esos eventos llegan al servidor de todos modos
**Y** la visita queda cerrada con un evento «abandono» que dice el último paso que alcanzó

### Edge case — el reloj del navegador está desajustado

**Dado** que el reloj del dispositivo del invitado va horas por delante,
**cuando** el servidor recibe los eventos de su visita,
**Entonces** quedan ordenados por la secuencia en que ocurrieron dentro de la visita y fechados con la hora del servidor
**Y** ningún evento queda en un mes distinto del de su recepción

### Edge case — la visita es de alguien de Trycore

**Dado** que el invitado que entra tiene un correo `@trycore.com` (una vista previa de Mercadeo o del comercial),
**cuando** se registran los eventos de su visita,
**Entonces** quedan marcados como sesión interna y los indicadores de Medición no la cuentan como sesión de cliente
**Y** si el navegador manda en el lote una marca interna, una cuenta o una variante, el servidor ignora esos campos y conserva los que sacó de la sesión

## Notas

Cubre **RF-7.1** (el mecanismo y el catálogo de eventos), **RF-7.4** (cada interacción con un perfil se marca *curado* o *descubrimiento*, calculado en el servidor contra el conjunto curado del enlace), la parte de **RF-7.3** que depende de la sesión (la regla de atribución a la edición vive en HU-112) y la fila *Trazabilidad* de §8. Diseño en **ADR-0006** (emisión por lotes, enriquecimiento del lado del servidor, `contacto_id` en lugar del correo, orden por contador `n` de la visita, partición por `recibido_en`, sin SDK de analítica de terceros).

**Catálogo de RF-7.1 que este contrato acepta desde el primer día:** entrada, filtros aplicados, ampliación de búsqueda, ficha abierta, perfil sumado, perfil retirado, comparación, solicitud iniciada, solicitud enviada y abandono, más los eventos de acceso de HU-168. *Solicitud enviada* no depende del navegador: los informes la toman de las solicitudes registradas (HU-171). Los **eventos de falsación** de ADR-0006 (instrucción enviada, Perfil Objetivo editado, cero mostrado, cercanos mostrados, composición vista o descartada) se incorporan al contrato en el slice que los emite (EP-002, EP-009, EP-010), como fija la propia ADR; esta historia deja el contrato versionado para que añadirlos sea aditivo.

**Quién emite qué.** Esta historia conecta el emisor en las pantallas que ya existen cuando se construya (las de EP-001: aterrizaje, banco, ficha y selección). Las pantallas de épicas aún no construidas (búsqueda y filtros de EP-002, «Mi equipo» y comparador de EP-004, solicitud de EP-005) emiten sus eventos en su propio slice contra este contrato. **No es diferir**: el mecanismo queda completo aquí; cada pantalla emite cuando existe.

**Sesiones internas.** La marca `interna` para invitados `@trycore.com` es técnica y se captura siempre (ADR-0006). Que los indicadores las **excluyan** es la propuesta por defecto de ADR-0006, todavía pendiente de **T-26** (definición de «sesión real»). Este AC adopta la opción conservadora —fuera de los indicadores y contadas aparte (HU-171)— y la deja como pregunta al sponsor.

**Degradación aceptada (QA-6).** Si la escritura del lote falla, el evento se pierde y se cuenta; la experiencia del invitado no espera a la telemetría y la solicitud (EP-005) nunca depende de ella.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1, RF-7.4, RF-7.3 (enriquecimiento) · §8 Trazabilidad · ADR-0006 (UC-17, QA-21, QA-6, QA-2) · base de HU-108 a HU-112 y HU-168 a HU-173

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ solo necesita la sesión verificada de EP-001, ya construida; no espera a ninguna pantalla futura porque el contrato acepta todo el catálogo y cada épica emite al construirse |
| N | Negociable | ✓ fija qué se registra, quién lo atribuye (el servidor), que no viaje el correo y que la telemetría no frene al invitado; el tamaño del lote, la cadencia de envío y la forma de la cola son del equipo |
| V | Valiosa | ✓ sin esta captura ningún informe de Medición existe; es lo que convierte el interés del cliente en una señal medible (§2.2) |
| E | Estimable | ✓ M: esquema de evento versionado, emisor ligero en el portal, ruta de recepción con enriquecimiento desde la sesión, tabla particionada de solo inserción y marca interna; ADR-0006 resuelve el diseño |
| S | Pequeña | ✓ M: una capacidad (capturar con atribución) en cinco escenarios; la atribución a la edición, el paso de acceso y la retención salen a HU-112, HU-168 y HU-169 |
| T | Testeable | ✓ un recorrido con fichas curadas y de descubrimiento, la tabla de eventos bloqueada, un cierre de pestaña simulado, un reloj adelantado y un invitado `@trycore.com` dan filas y comportamientos observables |
