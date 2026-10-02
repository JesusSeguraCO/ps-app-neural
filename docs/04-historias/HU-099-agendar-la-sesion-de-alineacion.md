---
id: HU-099
titulo: "Agendar la sesión de alineación"
epica: EP-005
prioridad: media
complejidad: S
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-098]
---

# HU-099 — Agendar la sesión de alineación

**Como** líder de proyecto con prisa que acaba de enviar su solicitud,
**quiero** abrir desde la confirmación la agenda de Trycore y elegir yo el horario de la sesión de alineación,
**para** arrancar el mismo día en que decidí, sin esperar a que me escriban para cuadrar una hora.

## Criterios de aceptación

> **Cómo se verifica.** Los escenarios **[portal]** los implementa el portal y se prueban con su suite. El **[HubSpot]** no lo implementa el portal: es el comportamiento nativo de la herramienta de reuniones de HubSpot y se verifica con una **prueba de aceptación en HubSpot** (portal real o sandbox con datos ficticios), como D84.

### Happy path [portal] — la confirmación abre la agenda con mis datos

**Dado** que envié SOL-2026-0042 como Luis Gómez con mi correo verificado luis.gomez@cliente.com y el portal tiene configurado el enlace de reuniones de equipo de alineación
**Cuando** toco «Agendar la sesión de alineación» en la confirmación
**Entonces** se abre en una pestaña nueva la página de reuniones de HubSpot de ese enlace, con mi nombre y mi correo verificado ya puestos
**Y** la confirmación sigue abierta en el portal, con SOL-2026-0042

### Happy path [HubSpot] — agendar por el enlace deja la fecha que mide O3

**Dado** que abrí la página de reuniones desde la confirmación de SOL-2026-0042 con mi correo verificado luis.gomez@cliente.com
**Cuando** agendo la reunión en un horario disponible
**Entonces** recibo la invitación de calendario de HubSpot en luis.gomez@cliente.com
**Y** el contacto luis.gomez@cliente.com tiene `engagements_last_meeting_booked` con el momento en que agendé, que la lectura diaria del portal toma para O3 (HU-107)

### Error [portal] — el enlace de reuniones no está configurado

**Dado** que estoy en el resumen de una solicitud y el portal no tiene configurado el enlace de reuniones de alineación
**Cuando** toco «Enviar solicitud de equipo»
**Entonces** llego a la confirmación, que no muestra el botón «Agendar la sesión de alineación» ni un enlace roto
**Y** dice que Coordinación de Servicio me escribirá para agendar la sesión
**Y** el registro del portal advierte que falta el enlace de reuniones, sin afectar el envío

### Edge case [portal] — salgo sin agendar

**Dado** que estoy en la confirmación de SOL-2026-0042 y no toqué «Agendar la sesión de alineación»
**Cuando** cierro la pestaña del portal
**Entonces** SOL-2026-0042 sigue guardada y su aviso a Coordinación de Servicio sale igual (HU-101)
**Y** la solicitud figura «sin alineación agendada» hasta que alguien la agende con la herramienta de reuniones (HU-107), sin marcarla como abandonada

## Notas

Cubre la oferta de agendar de **RF-5.4** («… y ofrece agendar») y el lado del cliente de **RF-17.3** y **RF-17.4** con el mecanismo de **D92**: la fecha que mide O3 es `engagements_last_meeting_booked` del contacto, que HubSpot llena cuando alguien agenda con un **enlace de la herramienta de reuniones**. Si el cliente agenda por ese enlace con su correo verificado, O3 se mide sin que nadie escriba una fecha.

**Refinamiento 2026-10-02 (discovery de EP-005).** La versión anterior hablaba de «elegir un horario disponible» en el portal, «la fecha se registra en el negocio» y «sin horarios → que el ejecutivo me contacte». Con **D92** la fecha ya no se escribe en el negocio, y los horarios y la invitación los gestiona HubSpot: el portal **no** tiene calendario propio ni proveedor de calendario (CRN-20), solo abre el enlace de reuniones. El caso «sin horarios disponibles» lo muestra la propia página de HubSpot y queda fuera del control del portal; el error que el portal sí puede tener es **no tener el enlace configurado**. El edge «no quiero agendar ahora» se conserva, con lo que observa el portal.

**D116 (sponsor, 2026-10-02) cierra las dos preguntas abiertas.** (1) **Entra en EP-005**: se construye con la épica, no en v1.1 (decisión del sponsor; CRN-20 de `docs/adr/_backlog-arquitectonico.md` queda desactualizado en ese punto). (2) El enlace es un **enlace de reuniones de equipo con rotación** de HubSpot (round robin entre quienes atienden la alineación), configurado una sola vez (`ENLACE_REUNIONES_ALINEACION`, nombre propuesto, no secreto). No depende del propietario de la cuenta, que el workflow asigna después (D55, HU-103). Quiénes entran en la rotación lo configura Mercadeo/RevOps en HubSpot con Coordinación de Servicio.

**Pestaña nueva, sin incrustar (propuesta).** Incrustar la agenda exige cargar un script de HubSpot en el portal (CSP y `stack-allowlist.json`); abrir el enlace en una pestaña nueva no. El nombre y el correo se pasan como parámetros del enlace. **Por verificar en el HubSpot real (D84), como prueba de aceptación y no como decisión pendiente:** que la página acepte esos parámetros y que una reunión agendada por el cliente llene `engagements_last_meeting_booked` igual que una agendada por el comercial.

**Riesgo aceptado (D92):** si el cliente cambia el correo en la página de HubSpot o agenda por fuera, la reunión no queda en su contacto y O3 no la mide.

**Plazo de RF-17.3** (T-28): sigue sin acordar con Delivery; la confirmación dice el SLA de 10 días hábiles de HU-098 y no promete un plazo de agendamiento.

**Prototipo:** «Confirmación», botón «Agendar la conversación» (`Portal de Perfiles v2.dc.html`): **marcado para revisión de copy** (D73): «conversación» frente a «sesión de alineación».

## Trazabilidad

Épica madre: **EP-005** · PRD v4.18 · RF-5.4 · RF-17.3 · RF-17.4 · RF-9.1.3 · O3 · D55, D73, D84, D92, D116 (sponsor, 2026-10-02) · T-28 · CRN-20 · discovery 2026-10-02 (refinamiento) · depende de HU-098 (confirmación) · relacionada con HU-101 (aviso a Coordinación), HU-103 y HU-107 (EP-007, lectura de la fecha)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: un botón en la confirmación de HU-098; la medición la hace HU-107 y no hace falta para probar esta historia |
| N | Negociable | ✓ son fijos que el cliente puede agendar sin esperar, que no hay enlace roto y que salir sin agendar no castiga la solicitud; el enlace de equipo con rotación (D116) también; si se incrusta y el texto del botón se negocian |
| V | Valiosa | ✓ el cliente con prisa agenda en el momento y O3 se mide sin que nadie escriba una fecha |
| E | Estimable | ✓ S: un enlace configurado con dos parámetros, un botón condicional y una advertencia de configuración; el escenario [HubSpot] es una prueba de aceptación, no código |
| S | Pequeña | ✓ S: una capacidad (ofrecer agendar) en cuatro escenarios |
| T | Testeable | ✓ e2e: el botón abre en pestaña nueva el enlace con nombre y correo, sin enlace configurado no hay botón y sí el texto, y salir sin agendar deja la solicitud guardada; en HubSpot, una reunión ficticia agendada por el enlace llena `engagements_last_meeting_booked` |
