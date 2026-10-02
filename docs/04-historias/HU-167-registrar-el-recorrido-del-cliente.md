---
id: HU-167
titulo: "Registrar el recorrido del cliente y consultarlo en Medición"
epica: EP-008
prioridad: alta
complejidad: M
estado: lista
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: []
---

# HU-167 — Registrar el recorrido del cliente y consultarlo en Medición

**Como** Dirección de Mercadeo, que lee la telemetría de intención del portal,
**quiero** que cada paso que da un invitado en el portal quede registrado como un evento de su visita, atribuido en el servidor a su cuenta, su enlace y su edición de origen, y poder abrir en Medición el recorrido de cualquier visita y el estado de la captura,
**para** comprobar qué hizo un cliente y que la captura está viva, y que cada informe de Medición salga de lo que de verdad ocurrió y no de lo que alguien recuerda o reconstruye a mano.

## Criterios de aceptación

### Happy path — el recorrido de una visita se ve en Medición con su atribución y su ámbito

**Dado** que un invitado con su correo verificado, que entró con un enlace que trae un conjunto curado, abrió la ficha de un perfil del conjunto curado y después la de un perfil que encontró al ampliar la búsqueda,
**cuando** abro en Medición el recorrido de esa visita,
**Entonces** veo dos eventos «ficha abierta», en el orden en que ocurrieron, cada uno con la cuenta, el enlace, el contacto y la edición que el servidor tomó de la sesión
**Y** el primero aparece marcado como interacción con el conjunto curado y el segundo como interacción por descubrimiento
**Y** ningún evento muestra el correo del invitado ni texto de la ficha: del perfil solo aparece su identificador opaco

### Error — el registro de eventos falla y el invitado no se entera

**Dado** que el registro de eventos no está disponible,
**cuando** el invitado abre una ficha,
**Entonces** la ficha se muestra igual, sin espera añadida ni mensaje de error
**Y** el lote que no se pudo guardar queda contado como eventos perdidos, sin datos del invitado
**Y** en Medición el estado de la captura muestra esos eventos perdidos y la hora del último evento recibido

### Edge case — cómo termina una visita

**Dado** que un invitado abrió fichas y el navegador tiene eventos de su visita que aún no envió,
**cuando** la visita sigue el camino de la tabla,
**Entonces** queda registrada como dice la tabla, sin perder ningún evento pendiente

| Camino de la visita | Cómo queda registrada |
|---|---|
| el invitado cierra la pestaña | los eventos pendientes llegan al servidor y la visita se cierra con un evento «abandono» que dice el último paso que alcanzó |
| pasan 30 minutos sin actividad | la visita se cierra con un evento «abandono» que dice el último paso que alcanzó |
| el invitado vuelve a actuar a los 29 minutos | la visita sigue abierta, sin «abandono» |

### Edge case — el reloj del navegador está desajustado

**Dado** que el reloj del dispositivo del invitado va horas por delante,
**cuando** el servidor recibe los eventos de su visita,
**Entonces** quedan ordenados por la secuencia en que ocurrieron dentro de la visita y fechados con la hora del servidor
**Y** ningún evento queda en un mes distinto del de su recepción

### Edge case — la visita no es una sesión real

**Dado** que entra al portal, con su código verificado, una visita del tipo de la tabla,
**cuando** se registran los eventos de su visita,
**Entonces** su recorrido aparece en Medición con la marca de la tabla y los indicadores de Medición la cuentan como dice la tabla
**Y** si el navegador manda en el lote una marca interna o demo, una cuenta o una variante, el servidor ignora esos campos y conserva los que sacó de la sesión y del enlace

| Visita | Marca en Medición | ¿Cuenta como sesión real? |
|---|---|---|
| correo `@trycore.com` (vista previa de Mercadeo o del comercial) | sesión interna | no |
| correo de cliente, por un enlace generado con la casilla «demo» (HU-188) | sesión demo | no |
| correo de cliente, por un enlace sin la casilla «demo» | ninguna | sí |

## Notas

Cubre **RF-7.1** (el mecanismo y el catálogo de eventos), **RF-7.4** (cada interacción con un perfil se marca *curado* o *descubrimiento*, calculado en el servidor contra el conjunto curado del enlace), la parte de **RF-7.3** que depende de la sesión (la regla de atribución a la edición vive en HU-112) y la fila *Trazabilidad* de §8. Diseño en **ADR-0006** (emisión por lotes, enriquecimiento del lado del servidor, `contacto_id` en lugar del correo, orden por contador `n` de la visita, partición por `recibido_en`, sin SDK de analítica de terceros).

**Catálogo de RF-7.1 que este contrato acepta desde el primer día:** entrada, filtros aplicados, ampliación de búsqueda, ficha abierta, perfil sumado, perfil retirado, comparación, solicitud iniciada, solicitud enviada y abandono, más los eventos de acceso de HU-168. *Solicitud enviada* no depende del navegador: los informes la toman de las solicitudes registradas (HU-171). Los **eventos de falsación** de ADR-0006 (instrucción enviada, Perfil Objetivo editado, cero mostrado, cercanos mostrados, composición vista o descartada) se incorporan al contrato en el slice que los emite (EP-002, EP-009, EP-010), como fija la propia ADR; esta historia deja el contrato versionado para que añadirlos sea aditivo.

**Quién emite qué.** Esta historia conecta el emisor en las pantallas que ya existen cuando se construya (las de EP-001: aterrizaje, banco, ficha y selección). Las pantallas de épicas aún no construidas (búsqueda y filtros de EP-002, «Mi equipo» y comparador de EP-004, solicitud de EP-005) emiten sus eventos en su propio slice contra este contrato. **No es diferir**: el mecanismo queda completo aquí; cada pantalla emite cuando existe.

**Sesión real (D68, sponsor 2026-10-02; cierra T-26 en su definición).** Es la sesión con **código verificado de un correo que no es `@trycore.com`**. Las demos se marcan con una casilla «demo» al generar el enlace en el panel (HU-188) y tampoco cuentan. Las marcas `interna` y `demo` las pone el servidor (la primera por el dominio del correo, la segunda por el enlace) y se capturan siempre: el recorrido se ve, pero los indicadores las dejan fuera y las cuentan aparte (HU-171). D68 no fija un mínimo de sesiones para que una lectura sea concluyente; eso sigue abierto en cada lectura.

**Fin de la visita (D73, opción conservadora).** La visita se cierra al cerrar la pestaña o tras **30 minutos sin actividad**; los dos lados del límite (29 y 30 minutos) están en la tabla del edge. Es la ventana que usan el embudo y el rebote de HU-108.

**Vista de recorrido confirmada (D72).** El sponsor confirmó que esta historia incluye la vista de recorrido: Mercadeo abre el recorrido de una visita y el estado de la captura, sin correo y con el contacto en seudónimo pasados 12 meses (HU-169).

**Revisión 2026-10-02 (validador independiente: fallaba la V, habilitadora sin valor visible).** Entre las dos opciones —reformularla con un resultado observable propio o fusionar su cierre con el primer contador visible (HU-168)— se elige **reformular**: conserva todo el alcance de la captura y le da a Mercadeo dos resultados que puede comprobar sin esperar a ningún informe: **el recorrido de una visita** (sus eventos en orden, con atribución y ámbito, sin datos personales) y **el estado de la captura** (último evento recibido y eventos perdidos). Fusionarla con HU-168 habría juntado dos capacidades (captura en el portal y medición del acceso antes de la sesión) en una historia que dejaría de ser pequeña. El recorrido se lee desde una vista `v_*` del panel (ADR-0006: `ps_panel` solo lee vistas) y no expone el correo. El happy path deja la apertura de las dos fichas en el Given y su When pasa a ser una sola acción: abrir el recorrido. **Ampliación de alcance, no recorte.**

**Degradación aceptada (QA-6).** Si la escritura del lote falla, el evento se pierde y se cuenta; la experiencia del invitado no espera a la telemetría y la solicitud (EP-005) nunca depende de ella.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.1, RF-7.4, RF-7.3 (enriquecimiento) · §8 Trazabilidad · ADR-0006 (UC-17, QA-21, QA-6, QA-2) · D68, D72 y D73 (sponsor, 2026-10-02) · relacionada con HU-188 (casilla «demo») · base de HU-108 a HU-112, HU-168 a HU-173 y HU-184 a HU-186

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ solo necesita la sesión verificada de EP-001, ya construida; no espera a ninguna pantalla futura porque el contrato acepta todo el catálogo y cada épica emite al construirse |
| N | Negociable | ✓ fija qué se registra, quién lo atribuye (el servidor), que no viaje el correo, que la telemetría no frene al invitado, la ventana de 30 minutos (D73) y qué es sesión real (D68); el tamaño del lote, la cadencia de envío y la forma de la cola son del equipo |
| V | Valiosa | ✓ Mercadeo ve, sin pedírselo a nadie, el recorrido de una visita y si la captura está viva (último evento, perdidos), sin esperar a otro informe; además es la base de todos los de Medición (§2.2) |
| E | Estimable | ✓ M (en el límite alto): esquema de evento versionado, emisor ligero en el portal, ruta de recepción con enriquecimiento desde la sesión, tabla particionada de solo inserción, marcas interna y demo, cierre por 30 minutos sin actividad y una vista de recorrido y estado de captura en Medición; ADR-0006 resuelve el diseño. Sigue en el límite alto de M: si al estimar se pasa, partir el cierre por inactividad y las marcas, no recortarlas |
| S | Pequeña | ✓ M, justa: una capacidad (capturar con atribución y poder verlo) en cinco escenarios, dos de ellos con tabla de ejemplos; la atribución a la edición, el paso de acceso, la retención y la casilla «demo» salen a HU-112, HU-168, HU-169 y HU-188 |
| T | Testeable | ✓ abrir en Medición el recorrido de una visita fijada con fichas curadas y de descubrimiento, la tabla de eventos bloqueada, un cierre de pestaña simulado, un reloj de servidor movido 29 y 30 minutos, un reloj de navegador adelantado y visitas `@trycore.com`, demo y de cliente dan filas y comportamientos observables |
