---
id: HU-107
titulo: "Registrar cuándo se agendó la alineación"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102]
---

# HU-107 — Registrar cuándo se agendó la alineación

**Como** directora de Mercadeo que mide el arranque comercial,
**quiero** que cada solicitud guarde cuándo quedó agendada su sesión de alineación, tomado del negocio en HubSpot,
**para** saber cuántos días pasan entre la solicitud y la sesión y cuántas solicitudes se quedan sin sesión.

## Criterios de aceptación

### Happy path — se agenda la sesión

**Dado** que una solicitud tiene su negocio en HubSpot sin fecha de alineación,
**cuando** Coordinación de Servicio escribe en el negocio la fecha de la sesión de alineación,
**Entonces** en la siguiente sincronización diaria la solicitud del portal guarda esa fecha como la primera fecha de alineación y el día en que apareció
**Y** el negocio en HubSpot muestra la misma primera fecha en su propiedad de primera alineación
**Y** el indicador de O3 cuenta para esa solicitud los días hábiles entre el envío y ese día

### Error — HubSpot no responde en la sincronización

**Dado** que la sincronización diaria no puede leer los negocios porque HubSpot no responde,
**cuando** corre la sincronización,
**Entonces** ninguna fecha ya guardada en el portal cambia ni se borra
**Y** la sincronización se reintenta y queda registrada como fallida

### Edge case — se reagenda la sesión

**Dado** que una solicitud ya tiene primera fecha de alineación,
**cuando** alguien cambia en HubSpot la fecha de la sesión,
**Entonces** el portal guarda la nueva como fecha actual
**Y** la primera fecha no cambia, ni en el portal ni en su propiedad de HubSpot
**Y** el indicador de O3 sigue midiendo hasta el primer agendamiento

### Edge case — la sesión nunca se agenda

**Dado** que una solicitud enviada no tiene fecha de alineación en su negocio,
**cuando** se consulta el indicador de O3,
**Entonces** la solicitud aparece como «sin alineación agendada» con los días hábiles que lleva desde el envío
**Y** no se descarta del cálculo como si no existiera

## Notas

Cubre **RF-9.1.3** y **RF-17.4**. **Sin esta historia O3 no se puede medir**: con las etapas del pipeline comercial (D-21) la alineación no tiene etapa propia y la propiedad de fecha es el único registro del tramo.

**Mecanismo (ADR-0009):** dos propiedades en el negocio, la fecha actual (la escribe quien agenda, en HubSpot) y la primera (la escribe el portal una sola vez). La tarea diaria `sincronizar_negocios` lee la actual y fija la primera si falta; **nunca la sobrescribe**. El indicador se calcula desde las solicitudes del portal. El tablero que lo muestra es de EP-008; esta historia deja el dato.

**Agendar por teléfono o fuera del portal** ya no es un caso aparte: la fecha siempre se escribe en el negocio, se agende como se agende. En la v1 el agendamiento en el portal (HU-099) es v1.1 y no existe.

**Preguntas abiertas al sponsor:**
- **Qué fecha mide O3.** «Días entre solicitud enviada y sesión de alineación agendada» puede ser hasta el **momento en que se agendó** (el compromiso, lo que decía esta historia) o hasta la **fecha de la sesión**. Los escenarios guardan las dos y miden hasta el momento en que se agendó; con sincronización diaria, la precisión es de un día. Si se quiere precisión horaria, hay que leer el historial de la propiedad en HubSpot.
- **El botón «Registrar fecha de alineación»** del correo a Coordinación de Servicio (prototipo `correo-aviso-interno--solicitud-delivery`, HU-101) sugiere registrar la fecha desde el portal o el panel y escribirla en HubSpot. ADR-0009 supone que se escribe en HubSpot directamente. Hay que decidir si ese botón lleva a HubSpot o a una pantalla del panel (más alcance, EP-005).
- **Plazo de agendamiento de RF-17.3** (T-28 sigue pendiente en ese punto): sin él, «sin alineación agendada» no sabe desde cuándo es un retraso.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.1.3, RF-17.4 · O3 · D-21 · ADR-0009 (`sincronizar_negocios`, `ps_fecha_alineacion_actual`, `ps_fecha_alineacion_primera`) · depende de HU-102 · relacionada con HU-101 y HU-099 (EP-005) y EP-008

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: lee el negocio de HU-102; no necesita el aviso ni el escalamiento |
| N | Negociable | ✓ fija que la primera fecha nunca se sobrescribe y que la solicitud sin sesión cuenta; qué fecha mide O3 y desde dónde se registra se negocian |
| V | Valiosa | ✓ sin este dato O3 no existe y nadie sabe cuántas solicitudes mueren antes de la sesión |
| E | Estimable | ✓ M: una tarea diaria, dos propiedades y un cálculo de días hábiles con el calendario de HU-162 |
| S | Pequeña | ✓ M: una capacidad (registrar el tramo hasta la alineación) en cuatro escenarios |
| T | Testeable | ✓ con reloj simulado y un doble de HubSpot con negocios sin fecha, con fecha, reagendados y caído, se observan las fechas del portal y la propiedad de HubSpot |
