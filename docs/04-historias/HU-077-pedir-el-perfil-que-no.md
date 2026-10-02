---
id: HU-077
titulo: "Pedir el perfil que no existe todavía"
epica: EP-010
prioridad: alta
complejidad: M
estado: lista
fase: fase-2-rediseno
prd_version: 4.18
depende_de: [HU-075, HU-198]
---

# HU-077 — Pedir el perfil que no existe todavía

**Como** líder de proyecto que no encontró el perfil que necesita,
**quiero** solicitar formalmente ese perfil a medida, con mi especificación completa y el plazo a la vista,
**para** resolver mi necesidad aunque el banco no la cubra hoy, en lugar de cerrar la pestaña y buscar por fuera.

## Criterios de aceptación

### Happy path — la solicitud a medida sale con la especificación completa

**Dado** que hoy es 2 de octubre de 2026 y estoy en la pantalla de cero con un Perfil Objetivo con rol y seniority (obligatorios «Arquitectura de pagos», «Senior» e «ISO 20022»; deseables «Banca» e «Híbrido»), el reto escrito, el inicio «En 2 a 4 semanas» y la nota «Debe conocer la normativa de la Superintendencia Financiera»,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** veo «Recibimos tu solicitud» con su identificador SOL-AAAA-NNNN y el plazo «10 días hábiles desde el 2 de octubre de 2026», que no compromete a nadie
**Y** el portal guarda una sola solicitud marcada «a medida», con los obligatorios, los deseables, el reto, el inicio, la nota, la cuenta, el enlace y mi correo verificado
**Y** guarda, como contexto interno del registro de demanda, los códigos que tenía en «Mi equipo» en ese momento
**Y** queda un solo trabajo en cola para llevarla a HubSpot como negocio con medio «a-medida» (HU-102, HU-106)
**Y** la visita registra el evento «solicitud enviada» de tipo «a medida» (HU-167)

### Edge case — lo que no está en el banco viaja como necesidad no cubierta

**Dado** que en mi Perfil Objetivo añadí «COBOL» como tecnología que el banco no tiene, marcada «no está en el banco», y la ubicación «Medellín, Colombia» con modalidad presencial,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** la solicitud guardada lleva «COBOL» marcado como necesidad no cubierta, separado de los criterios que sí existen en el banco
**Y** lleva el país y la ciudad de la necesidad
**Y** «COBOL» no se usó como filtro de ningún resultado de la pantalla

### Edge case — ya hay una solicitud a medida igual y reciente

**Dado** que mi colega de la misma cuenta envió hace los días de la tabla SOL-2026-0047, a medida, con los mismos obligatorios que tengo ahora,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** el resultado es el de la tabla

| Días desde SOL-2026-0047 | Resultado |
|---|---|
| 7 | veo «Ya estamos buscando este perfil: SOL-2026-0047» con su fecha de envío y su plazo, y la opción de añadir contexto a esa solicitud (HU-201); no se crea una segunda |
| 8 | se guarda una solicitud a medida nueva con su propio SOL y su plazo |

### Error — el toque repetido no duplica la solicitud

**Esquema del escenario:** un envío repetido no crea una segunda solicitud a medida

**Dado** que toqué «Pedir el perfil a medida» con una especificación completa,
**cuando** <repeticion> antes de ver la confirmación,
**Entonces** el botón queda bloqueado desde el primer toque
**Y** hay una sola solicitud a medida y un solo trabajo en cola hacia HubSpot

**Ejemplos:**

| repeticion |
|---|
| vuelvo a tocar «Pedir el perfil a medida» |
| el navegador reenvía el formulario |

### Error — HubSpot no responde

**Dado** que HubSpot no responde y estoy en la pantalla de cero con una especificación completa,
**cuando** toco «Pedir el perfil a medida»,
**Entonces** veo la misma confirmación, con su SOL y su plazo, sin ninguna mención al fallo
**Y** la solicitud queda guardada con su trabajo en cola, que la lleva a HubSpot cuando vuelva a responder (reintento de EP-007)

## Notas

Cubre **RF-14.3** (solicitud dirigida con el SLA de 10 días hábiles hacia HubSpot), la parte de **RF-15.1** que viaja con la solicitud (especificación estructurada completa), **RF-13.7.3** (lo que no está en el banco viaja como necesidad no cubierta y no filtra) y **RF-13.5.4** (país y ciudad viajan a la solicitud y al registro de demanda). Según el análisis de la Fase 2, es la mejora con mayor retorno comercial del rediseño.

**Refinamiento 2026-10-02 (discovery de EP-010, D76, D121).** El error «falla la creación en el CRM» deja de describir la cola de EP-007: con **D76** el portal guarda la solicitud con clave única por envío y **un solo trabajo** en cola; el worker crea contacto y negocio por API (**HU-102**) con la propiedad de valor único, y el origen «a-medida» lo pone **HU-106**. Esta historia se queda con lo que es del portal: guardar, confirmar sin depender de HubSpot, no duplicar. **D121** cierra que no hay solicitud de equipo sin perfiles: quien no encontró tiene este camino (HU-100 enlaza aquí vía **HU-228**).

**Elegidas por el modelo por delegación del sponsor (2026-10-02):**
- **Identificador y tabla.** La solicitud a medida usa el mismo identificador **SOL-AAAA-NNNN** y la misma tabla de solicitudes de EP-005 (HU-198), marcada «a medida»: un solo camino a HubSpot y una sola idempotencia (D76). El prototipo dice «SM-0047»: se corrige en la pasada de copy.
- **Plazo.** Se muestra como en EP-005 (HU-098): «10 días hábiles desde el <fecha de envío>», sin calcular una fecha con calendario de festivos. El prototipo muestra una fecha calculada («a más tardar el viernes 9 oct»); se corrige en la pasada de copy.
- **«Misma especificación» para una solicitud a medida** = **misma cuenta + mismos criterios obligatorios**, de cualquier invitado, dentro de **7 días** (D73, «solicitud reciente»), análogo a D119/D120 para las solicitudes de equipo. Añadir contexto reutiliza el mecanismo de HU-201.
- **Mi equipo no viaja.** La solicitud a medida lleva la especificación, no los perfiles de «Mi equipo» (D121 separa los dos caminos). Para el registro de demanda (§14.4.3: «la especificación y los perfiles seleccionados») la solicitud guarda, **solo como contexto interno**, los códigos que tenía en «Mi equipo» al enviarla; no van a HubSpot. Los muestra el registro de demanda (HU-078).

**Formato de la especificación.** Es el mismo esquema versionado con el que la solicitud de equipo recibe la especificación (**HU-211**, EP-009: reto, obligatorios, deseables, necesidades no cubiertas, ubicación; RF-16.3). Aquí no hay marca «inferida»: quien pide a medida está en la pantalla del cero con su Perfil Objetivo a la vista.

**Especificación en el servidor.** RF-13.4.2: la especificación vive en el navegador **hasta que se envía la solicitud**; esta es la solicitud, así que aquí sí viaja entera.

**D130 (2026-10-02, elegida por el modelo): RF-15.1 frente a RF-13.4.2.** Se mantienen PRD y ADR-0004: la especificación estructurada **solo existe en el servidor si hubo solicitud a medida** (esta historia). El cero sin solicitud no guarda especificación: muestra y registra el texto enmascarado (HU-075, HU-078).

**Copy** del prototipo (`solicitud-a-medida*.html`), **marcado para revisión de copy** (D73).

## Trazabilidad

Épica madre: **EP-010** · PRD v4.18 · RF-14.3 · RF-15.1 · RF-13.7.3 · RF-13.5.4 · RF-13.4.2 · RF-9 · §14.4 · D-7 · D73, D76, D119, D120 y D121 (sponsor, 2026-10-02) · D130 · ADR-0009 (enmienda D76) · ADR-0004 (UC-8) · prototipo `solicitud-a-medida`, `--enviada`, `--ya-existente` · depende de HU-075 y HU-198 (tabla de solicitudes, EP-005) · la lleva a HubSpot HU-102 (EP-007) con el medio de HU-106 · reutiliza HU-201 (EP-005) y el esquema de HU-211 (EP-009) · la lee HU-078

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se monta en la pantalla de cero de HU-075 y reutiliza la tabla de solicitudes con clave única de HU-198 (EP-005; si EP-010 se construye antes, la crea y EP-005 la reutiliza, se ordena en el DoR); HubSpot es asíncrono (EP-007) y se prueba con la cola, sin esperar a que el worker cree el negocio |
| N | Negociable | ✓ fija una sola solicitud por envío, la especificación completa con lo no cubierto separado, la ventana de 7 días y que la confirmación no dependa de HubSpot; textos y forma del formulario son negociables |
| V | Valiosa | ✓ convierte el cero en una oportunidad de reclutamiento con la especificación completa, en lugar de un abandono |
| E | Estimable | ✓ M: guardado con clave única reutilizando la tabla de EP-005, marca «a medida», encolado, detección de la solicitud reciente y un evento |
| S | Pequeña | ✓ M: una capacidad (enviar la solicitud a medida) en cinco escenarios |
| T | Testeable | ✓ especificaciones fijadas con y sin opción fuera del banco, una solicitud sembrada a 7 y 8 días, un doble toque y un HubSpot caído simulado dan filas, trabajos y pantallas observables |
