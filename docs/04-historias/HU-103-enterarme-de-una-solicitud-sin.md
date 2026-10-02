---
id: HU-103
titulo: "Enterarme de una solicitud sin tener que vigilar el pipeline"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-102, HU-104]
---

# HU-103 — Enterarme de una solicitud sin tener que vigilar el pipeline

> **Historia de configuración en HubSpot.** Responsable: **Mercadeo/RevOps** (administración de HubSpot). Verificación: **prueba en el sandbox o el portal real de HubSpot con datos ficticios**, sobre un negocio creado por el worker. El portal no implementa la asignación ni el aviso comercial (D55, confirmado por D76); su única parte es el escenario de error, que es una consecuencia de HU-105.

**Como** ejecutivo comercial con varias cuentas a cargo,
**quiero** quedar como propietario del negocio y recibir un aviso con lo necesario para decidir cuando una de mis cuentas envía una solicitud,
**para** no descubrir días después, mirando el pipeline, que un cliente pidió algo.

## Criterios de aceptación

### Happy path [HubSpot] — el propietario de la cuenta queda a cargo y avisado

**Dado** que la empresa del contacto tiene propietario en HubSpot,
**cuando** el workflow procesa el negocio que creó el worker,
**Entonces** el negocio queda asignado a ese propietario, que recibe la notificación de asignación de HubSpot
**Y** el propietario recibe la notificación interna del workflow con la cuenta, quién solicita, el requerimiento («Solicitudes People Service»), el momento de incorporación y el enlace al negocio
**Y** esa notificación dice que la solicitud escala si nadie la atiende en 4 horas hábiles

### Edge case [HubSpot] — la empresa no tiene propietario

**Dado** que la empresa del contacto no tiene propietario en HubSpot o quedó «empresa por confirmar» (HU-104),
**cuando** el workflow procesa el negocio que creó el worker,
**Entonces** el negocio queda asignado a Dirección Comercial
**Y** Dirección Comercial recibe de inmediato la notificación con la marca «cuenta sin propietario en HubSpot»
**Y** no se espera a las 4 horas hábiles del escalamiento

### Error [portal] — el negocio todavía no existe en HubSpot

**Dado** que el primer intento de crear el negocio de una solicitud falló y el worker programó el siguiente,
**cuando** se consulta la solicitud en el panel,
**Entonces** aparece como «pendiente de llegar a HubSpot»
**Y** ningún comercial ha recibido aviso de esa solicitud, porque el aviso solo lo envía el workflow cuando el negocio existe

## Notas

Cubre **RF-9.5**, **RF-9.7.1**, **RF-9.7.2** y **RF-17.2** en su lado comercial, con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02 (D55, D73; segunda ronda D76, D78).** **D76** cambia cómo nace el negocio (lo crea el worker por la API, HU-102), no quién avisa al comercial: la asignación y la notificación **siguen en el workflow** (D55), que se dispara al crearse el negocio en el pipeline People Service. Los **dos canales sin integración nueva** de T-3 son (1) la **notificación interna** del workflow y (2) la **notificación nativa de asignación** de HubSpot. La cuenta sin propietario la recibe **Dirección Comercial** (D73, opción conservadora); la regla vive en el workflow.

**Coordinación de Servicio.** **D78**: el aviso a Delivery con la especificación y el **enlace directo al negocio** lo envía **el portal** por Mailgun tras crear el negocio (HU-101, EP-005). Queda resuelto el pendiente que dejaba D52.

**Enlace rastreado `/r/` y botón «Ya lo estoy atendiendo».** Dependían de que el correo saliera del portal; con D55 la señal de «atendida» se lee en HubSpot (HU-162). Su retirada se registra en la enmienda de ADR-0009.

**Destinatarios nominales** (qué usuario o equipo de HubSpot es «Dirección Comercial», R-36): configuración del workflow; pregunta abierta para Comercial.

**Prototipo:** `correo-aviso-interno` (aviso al comercial). Su contenido pasa a ser la plantilla de la notificación del workflow.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.5, RF-9.7.1, RF-9.7.2, RF-17.2 (comercial), RF-9.1.2 · T-3, T-28 · D52 (sustituida en parte), D55, D73, D76, D78 (sponsor, 2026-10-02) · ADR-0009 (enmiendas 2026-10-02 D52 y D76) · depende de HU-102 y HU-104 · relacionada con HU-101 (EP-005), HU-105 y HU-162

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: asigna y avisa sobre el negocio que crea el workflow de HU-102 con la empresa de HU-104; el escalamiento es otra historia |
| N | Negociable | ✓ fija el propietario de la cuenta como dueño, los cinco datos del aviso y que la cuenta sin propietario vaya a Dirección Comercial; la redacción y los destinatarios se configuran |
| V | Valiosa | ✓ con pipeline propio, es lo único que evita que una solicitud exista y nadie la vea |
| E | Estimable | ✓ S: en HubSpot, un workflow disparado por la creación del negocio, una rama (con o sin propietario) y dos acciones nativas (asignar y notificar); en el portal no hay trabajo nuevo, solo el estado que ya pone HU-105 |
| S | Pequeña | ✓ S: una capacidad (asignar y avisar) en tres escenarios |
| T | Testeable | ✓ negocios ficticios creados por el worker para una empresa con propietario y otra sin él dan asignación y notificaciones observables en HubSpot; un doble de la API que falla deja la solicitud «pendiente» en el panel sin aviso |
