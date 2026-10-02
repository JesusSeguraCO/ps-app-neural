---
id: HU-101
titulo: "Recibir la solicitud con contexto suficiente para preparar la sesión"
epica: EP-005
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
---

# HU-101 — Recibir la solicitud con contexto suficiente para preparar la sesión

**Como** integrante de Coordinación de Servicio responsable de la alineación,
**quiero** recibir por correo la especificación completa del cliente, y no solo los perfiles que eligió, con el enlace directo a su negocio en HubSpot,
**para** llegar a la sesión sabiendo qué problema tiene y registrar la alineación en el negocio sin buscarlo.

## Criterios de aceptación

### Happy path [portal] — el aviso sale al crearse el negocio

**Dado** que el worker creó en HubSpot el negocio de una solicitud (HU-102),
**cuando** termina ese trabajo,
**Entonces** Coordinación de Servicio recibe un correo desde `notify@people.trycore.com` con el reto declarado, la especificación completa, los perfiles seleccionados con su código, quién solicita y desde qué cuenta
**Y** el correo dice si el cliente revisó su especificación
**Y** el correo trae el enlace directo al negocio en HubSpot

### Edge case [portal] — especificación inferida

**Dado** que el cliente envió la solicitud sin abrir el Perfil Objetivo,
**cuando** Coordinación de Servicio recibe el correo,
**Entonces** la especificación inferida llega marcada «no revisada por el cliente (inferida)»
**Y** el correo trae lo suficiente para preparar la sesión igual

### Error [portal] — el negocio todavía no existe

**Dado** que la creación del negocio de una solicitud está fallando y el worker la reintenta (HU-105),
**cuando** pasa cada intento fallido,
**Entonces** Coordinación de Servicio no recibe un correo sin enlace ni con un enlace roto
**Y** el correo sale una sola vez, en cuanto el negocio exista

### Edge case [portal] — el negocio se creó tras una respuesta perdida

**Dado** que HubSpot creó el negocio, su respuesta se perdió y el worker lo encontró en el reintento por su «Id solicitud People Service»,
**cuando** el worker termina el trabajo,
**Entonces** Coordinación de Servicio recibe un solo correo de esa solicitud, con el enlace a ese negocio

## Notas

Cubre RF-17.1, RF-17.2 y RF-17.5 en el lado de Delivery, y la parte de **RF-9.7.1** que avisa a Coordinación de Servicio. Cierra el hueco entre «se envió la solicitud» y «alguien la convirtió en una sesión agendada», que es donde vive O3.

**Revisión 2026-10-02 (D76, D78, sponsor).** **D78**: el aviso a Coordinación de Servicio **lo envía el portal** por Mailgun **tras crear el negocio**, con el enlace directo. Es posible porque con **D76** el worker crea el negocio por la API y conoce su ID (en la versión del formulario, D52, el portal no lo conocía y esta historia quedaba sin enlace). Mecanismo propuesto (ADR-0009, enmienda D76): al terminar `crear_negocio` se encola un trabajo `notificar_coordinacion` con `clave_idempotencia` = la solicitud, así que un reintento nunca produce un segundo correo. El enlace sigue la forma del registro de negocio de HubSpot con `HUBSPOT_PORTAL_ID`. El aviso al **comercial** no es del portal: lo hace el workflow de HubSpot (D55, HU-103).

**Desde el enlace se registra la alineación.** La fecha de agendado la llena HubSpot en `engagements_last_meeting_booked` del contacto cuando el comercial agenda con la herramienta de reuniones (D92, HU-107); ya no hay marca «Agendada el» del workflow. El botón «Registrar fecha de alineación» del prototipo lleva al negocio: **marcado para revisión de copy**.

**Qué salió de esta historia.** El escenario anterior «sin responsable asignado → se activa el escalamiento» lo cubren HU-162 y HU-163 (EP-007), donde el workflow escala a la dirección comercial y a Dirección General. No es un recorte: pasa a la historia que lo implementa.

**Si la creación no sale nunca** (error permanente en la bandeja, HU-164), Coordinación de Servicio no recibe nada hasta que alguien la reintente o la enlace a un negocio creado a mano; al enlazarla, el correo sale con ese enlace. **Pregunta abierta para Delivery:** ¿quieren además un aviso sin enlace cuando la solicitud entra a la bandeja? Los escenarios no lo suponen.

**Destinatario nominal** (buzón de Coordinación de Servicio): configuración; hoy Eida Tinjacá M. según el contexto del proyecto.

**Datos personales:** nombre y primer apellido y código de los perfiles, sin tarifas (D-9) ni datos de la lista negra B.4.

**Prototipo:** `correo-aviso-interno` (variante para Delivery).

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-17.1, RF-17.2, RF-17.5, RF-9.7.1 · T-28 · D52 (sustituida en parte), D55, D76, D78 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76: `notificar_coordinacion`) · relacionada con HU-102, HU-105, HU-107, HU-161 y HU-164 (EP-007)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: se dispara al terminar la creación del negocio de HU-102; se prueba con un doble de la API y de Mailgun |
| N | Negociable | ✓ fija el contenido de RF-17.1, la marca revisada o inferida, que nunca sale sin enlace y que sale una sola vez; la redacción se negocia |
| V | Valiosa | ✓ Delivery prepara la sesión con el problema del cliente y llega al negocio en un clic para registrar la alineación |
| E | Estimable | ✓ S-M: un trabajo de correo más con la plantilla de la especificación, sobre el adaptador de Mailgun que ya existe |
| S | Pequeña | ✓ una capacidad (avisar a Delivery con contexto) en cuatro escenarios |
| T | Testeable | ✓ con dobles de la API y de Mailgun se ven el correo con enlace, la marca de inferida, la ausencia de correo mientras falla y un solo correo tras una respuesta perdida |
