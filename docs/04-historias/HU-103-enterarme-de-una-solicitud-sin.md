---
id: HU-103
titulo: "Enterarme de una solicitud sin tener que vigilar el pipeline"
epica: EP-007
prioridad: alta
complejidad: M
estado: draft
fase: integracion-hubspot
prd_version: 4.17
depende_de: [HU-102, HU-104]
---

# HU-103 — Enterarme de una solicitud sin tener que vigilar el pipeline

**Como** ejecutivo comercial con varias cuentas a cargo,
**quiero** quedar como propietario del negocio y recibir un aviso con lo necesario para decidir cuando una de mis cuentas envía una solicitud,
**para** no descubrir días después, mirando el pipeline, que un cliente pidió algo.

## Criterios de aceptación

### Happy path — el propietario de la cuenta queda a cargo y avisado

**Dado** que la empresa de la solicitud tiene propietario en HubSpot y el portal ya creó el negocio,
**cuando** el portal termina de procesar la solicitud,
**Entonces** el negocio queda asignado a ese propietario, que recibe la notificación de asignación de HubSpot
**Y** el propietario recibe un correo del portal con la cuenta, quién solicita, los perfiles o la especificación, el momento de incorporación y un enlace al negocio
**Y** el correo dice cuándo escala si nadie lo abre

### Error — HubSpot todavía no confirmó el negocio

**Dado** que el portal guardó la solicitud y el primer intento de crear el negocio en HubSpot falló,
**cuando** el portal programa el siguiente intento,
**Entonces** el propietario previsto no recibe ningún correo comercial
**Y** la solicitud en el portal muestra «aviso al propietario: cuando HubSpot confirme», porque el correo solo sale con el enlace a un negocio que ya existe

### Edge case — la empresa no tiene propietario en HubSpot

**Dado** que la empresa de la solicitud no tiene propietario en HubSpot o quedó «por confirmar» (HU-104),
**cuando** el portal termina de procesar la solicitud,
**Entonces** el negocio queda sin propietario
**Y** el correo va de inmediato a la dirección comercial y dice «cuenta sin propietario en HubSpot»
**Y** no se espera a las 4 horas hábiles del escalamiento

## Notas

Cubre **RF-9.5**, **RF-9.7.1**, **RF-9.7.2** y **RF-17.2** en su lado comercial; RF-9.1.2 explica por qué el aviso es el mecanismo y no una cortesía.

**Dos canales sin integración nueva** (decisión del sponsor, 2026-09-25, T-3): el correo del portal y la notificación nativa que HubSpot envía al asignar el propietario. No se integra Slack, Chat ni WhatsApp.

**Coordinación de Servicio** también recibe aviso (RF-9.7.1). Ese correo, con la especificación completa, es **HU-101 (EP-005)** por la decisión T-28 del 2026-09-27; aquí no se repite. HU-101 necesita el enlace al negocio que crea esta épica.

**Error: el comercial espera a HubSpot.** Lo fijan las pantallas aprobadas del prototipo (`correo-aviso-interno--fallo-integracion`: «aún no recibe el aviso comercial»; `integraciones-fallidas`: «recibe el aviso cuando HubSpot confirme»). Mientras tanto avisa al responsable técnico HU-105. Así queda cerrado el trade-off del «aviso degradado» que ADR-0009 dejaba abierto.

**Sin propietario: pregunta abierta al sponsor.** El PRD no dice qué pasa si la cuenta no tiene propietario. Supuesto conservador: nadie queda sin enterarse, así que el aviso va directo a la dirección comercial. Los **destinatarios nominales** (qué buzón es «la dirección comercial») tampoco están definidos (R-36): pregunta abierta.

**Enlace al negocio.** El enlace del correo es el rastreado de ADR-0009 (`/r/<id>` en el panel): abrirlo cuenta como apertura para el escalamiento (HU-162).

**Prototipo:** `correo-aviso-interno` (aviso al comercial).

## Trazabilidad

Épica madre: **EP-007** · PRD v4.17 · RF-9.5, RF-9.7.1, RF-9.7.2, RF-17.2 (comercial), RF-9.1.2 · T-3, T-28 · ADR-0009 (`notificar`, `/r/`) · depende de HU-102 y HU-104 · relacionada con HU-101 (EP-005), HU-105 y HU-162

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: asigna y avisa sobre el negocio de HU-102 asociado por HU-104; el escalamiento es otra historia |
| N | Negociable | ✓ fija el propietario de la cuenta como dueño, los cinco datos del aviso, el aviso solo tras confirmar y el caso sin propietario; la redacción del correo y los buzones se negocian |
| V | Valiosa | ✓ con pipeline propio, es lo único que evita que una solicitud exista y nadie la vea |
| E | Estimable | ✓ M: leer el propietario, asignarlo y encolar un correo con plantilla; el adaptador de correo ya existe |
| S | Pequeña | ✓ M: una capacidad (asignar y avisar) en tres escenarios |
| T | Testeable | ✓ un doble de HubSpot con empresa con y sin propietario, y un doble de Mailgun, dan asignación y correos observables, incluido que no sale nada antes de confirmar |
