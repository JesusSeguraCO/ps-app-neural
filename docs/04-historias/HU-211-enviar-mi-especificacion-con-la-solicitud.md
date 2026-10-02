---
id: HU-211
titulo: "Recibir la especificación del cliente con su solicitud, revisada o inferida"
epica: EP-009
prioridad: alta
complejidad: M
estado: lista
fase: cierre-de-huecos
prd_version: 4.18
depende_de: [HU-070, HU-198]
---

# HU-211 — Recibir la especificación del cliente con su solicitud, revisada o inferida

**Como** coordinadora de Servicio que prepara la sesión de alineación,
**quiero** que cada solicitud llegue con la especificación del cliente —reto, criterios obligatorios y deseables, necesidades que el banco no cubre y ubicación— y diga si el cliente la revisó o si es lo que el portal infirió,
**para** preparar la sesión con lo que el cliente necesita y no solo con a quién seleccionó.

## Criterios de aceptación

### Happy path — viaja la especificación revisada

**Dado** que un cliente tiene el Perfil Objetivo «Revisado por ti» con el reto «El portal transaccional en producción (ficticio)», «Desarrollador Frontend» obligatorio, «React» y «TypeScript» deseables, «Web Components» marcado como no disponible en el banco, modalidad «Híbrido» y ubicación Bogotá, Colombia, y 2 perfiles en «Mi equipo»
**Cuando** envía la solicitud (HU-198)
**Entonces** la solicitud guardada lleva esa especificación completa con la marca «revisada»
**Y** «Web Components» viaja como necesidad no cubierta
**Y** la especificación declara la versión de esquema 1 y el rol como una lista de un elemento

### Edge case — el cliente nunca abrió el Perfil Objetivo

**Dado** que un cliente envió la instrucción «desarrollador java senior», no abrió el Perfil Objetivo y sumó 1 perfil a «Mi equipo»
**Cuando** envía la solicitud
**Entonces** la solicitud se envía sin ningún paso adicional
**Y** lleva la especificación inferida («Desarrollador Backend» obligatorio, «Java» y «Senior» deseables) con la marca «inferida, no revisada por el cliente» y «sin reto declarado»

### Edge case — no hubo instrucción ni especificación

**Dado** que un cliente solo sumó perfiles desde la selección curada, sin escribir instrucción ni abrir el Perfil Objetivo
**Cuando** envía la solicitud
**Entonces** la solicitud se guarda con la marca «sin especificación»
**Y** no se le pide al cliente ningún dato de especificación para enviar

### Error — la especificación del navegador no cumple el esquema

**Dado** que la especificación guardada en el navegador del cliente está alterada o no cumple el esquema versionado
**Cuando** envía la solicitud
**Entonces** la solicitud se guarda con sus perfiles y la marca «especificación no recibida», y el servidor registra el rechazo por campo, sin valores
**Y** el cliente ve la confirmación con «No pudimos adjuntar tu especificación; la revisaremos contigo en la sesión de alineación»

## Notas

Cubre **RF-17.5** (la especificación inferida viaja marcada como no revisada; es información, no impedimento), **RF-13.4.2** (la especificación sale del navegador solo al enviar), **RF-13.7.3** y **RF-13.5.4** (lo no disponible en el banco, el país y la ciudad viajan a la solicitud), **RF-16.3** (esquema versionado) y **RF-16.4** (el rol nace como lista).

**Nace el 2026-10-02 (discovery de EP-009)** de partir HU-070: el panel queda allí y el viaje con la solicitud, aquí. **Partición, no recorte.** La solicitud y su modelo de datos (`operacion.solicitudes`, campo de especificación y su marca) son de **HU-198** (EP-005, lista), que ya dice «la marca revisada o inferida la pone EP-009». Lo que se hace después con la especificación es de otras épicas: el correo a Coordinación de Servicio (HU-101), el párrafo y la nota en HubSpot (HU-160, HU-161) y el registro de demanda (EP-010, RF-15.1).

**Decisión por delegación del sponsor (elegida por el modelo):** una especificación fuera de esquema **no impide enviar** la solicitud (RF-17.5: no es impedimento) y **no se calla** (convención de EP-006: ninguna pantalla muda ante un dato fuera de contrato). El servidor valida con el esquema de `packages/contratos`; nunca confía en la marca que mande el navegador para «revisada» sin el esquema válido.

## Trazabilidad

Épica madre: **EP-009** · PRD v4.18 · RF-17.5 · RF-13.4.2 · RF-13.7.3 · RF-13.5.4 · RF-16.3 · RF-16.4 · ADR-0004 (`PerfilObjetivo` versionado, `rol: string[]`) · depende de HU-070 (misma épica) y HU-198 (EP-005, envío de la solicitud) · alimenta HU-101 (EP-005), HU-160 y HU-161 (EP-007) y el registro de demanda de EP-010

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencias declaradas: el panel (HU-070, misma épica) y el envío (HU-198, EP-005, lista); sin EP-007 la solicitud igual se guarda |
| N | Negociable | ✓ son fijos lo que viaja, las cuatro marcas y que nada impide enviar; el formato exacto del campo se negocia |
| V | Valiosa | ✓ Delivery prepara la sesión con la necesidad del cliente y sabe cuánto fiarse de ella |
| E | Estimable | ✓ M: serializar y validar el esquema en el envío, cuatro marcas y el registro del rechazo |
| S | Pequeña | ✓ M: cuatro escenarios sobre un punto de integración |
| T | Testeable | ✓ e2e del envío con cuatro estados de navegador sembrados, lectura de la fila guardada y del registro del rechazo |
