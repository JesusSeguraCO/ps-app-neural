---
id: HU-160
titulo: "Ver el requerimiento completo en «Solicitudes People Service»"
epica: EP-007
prioridad: alta
complejidad: S
estado: draft
fase: integracion-hubspot
prd_version: 4.18
depende_de: [HU-102]
---

# HU-160 — Ver el requerimiento completo en «Solicitudes People Service»

**Como** ejecutivo comercial dueño de una cuenta,
**quiero** que cada negocio del portal llegue a HubSpot con su requerimiento escrito en un párrafo legible y con el mensaje del cliente aparte,
**para** entender qué pidió el cliente sin abrir el portal ni copiar datos de un correo.

## Criterios de aceptación

### Happy path [portal] — solicitud completa

**Dado** que un cliente envió una solicitud con dos perfiles seleccionados, sector, momento de incorporación, duración, modalidad, contexto y un mensaje libre,
**cuando** el worker crea el negocio en HubSpot,
**Entonces** la propiedad «Solicitudes People Service» del negocio lleva un párrafo con el identificador de la solicitud, cada perfil con su código y su nombre, la modalidad, el momento de incorporación como banda, el sector, la duración y el contexto
**Y** el mensaje libre va en `message` del contacto, sin mezclarse con el párrafo
**Y** cada valor es el que el cliente envió, sin reescribirlo

### Edge case [portal] — datos opcionales que el cliente no diligenció

**Dado** que un cliente envió una solicitud sin sector, sin contexto y sin mensaje libre,
**cuando** el worker crea el negocio,
**Entonces** el párrafo no incluye las partes de sector ni de contexto, en lugar de mostrar «N/A» o valores inventados
**Y** el worker no escribe `message`, así que el contacto conserva el que tenía
**Y** el negocio se crea igual

### Error [portal] — HubSpot rechaza la propiedad del requerimiento

**Dado** que en HubSpot no existe la propiedad «Solicitudes People Service» del negocio o no admite el párrafo,
**cuando** el worker crea el negocio y HubSpot responde 400 por esa propiedad,
**Entonces** el negocio no se crea sin el párrafo ni con el párrafo recortado
**Y** la solicitud queda en la bandeja de fallos con el nombre de la propiedad que HubSpot rechazó (HU-166)

### Happy path [HubSpot] — el requerimiento se ve desde el negocio

**Dado** que el worker creó el negocio de una solicitud,
**cuando** el comercial abre el negocio,
**Entonces** ve el párrafo de «Solicitudes People Service» en la ficha del negocio, sin buscarlo entre todas las propiedades
**Y** ve el mensaje libre en el contacto asociado

## Notas

Cubre **RF-9.3** con el mecanismo de la **enmienda v4.18 del PRD** corregida por **D76**.

**Revisión 2026-10-02 (D54; segunda ronda D76).** **D54 sigue**: nada de una propiedad por dato; propiedades por defecto donde existen (`email`, `firstname`, `lastname`, `jobtitle`, `message`, comprobadas en el HubSpot real en solo lectura) y **todo el requerimiento concatenado en un párrafo** en la propiedad nueva **«Solicitudes People Service»**. **D76** cambia dónde se escribe: como el worker crea el negocio por la API, el párrafo va **directamente en el negocio** (ya no en el contacto por un formulario ni copiado por el workflow a la descripción). Es una de las **2 propiedades nuevas** de D76 junto a «Id solicitud People Service». Mercadeo las crea y coloca el párrafo en la ficha del negocio (último escenario, configuración de la vista).

**`message` vive en el contacto** (propiedad por defecto): guarda el último mensaje del cliente. El mensaje de cada solicitud queda además en la nota de la solicitud (HU-161), así que una solicitud nueva no borra el rastro de la anterior.

**Forma del párrafo (propuesta, negociable):** «Solicitud SOL-2026-0042. Perfiles: PS-0142 Ana Gómez; PS-0187 Luis Pérez. Modalidad: remota. Incorporación: corto plazo. Sector: banca. Duración: 6 meses. Contexto: …». Solo nombre y primer apellido y código de los perfiles; **sin tarifas** (D-9) ni datos de la lista negra B.4. La especificación del Perfil Objetivo va en el mismo párrafo (HU-161).

**Momento de incorporación:** viaja como **banda** (inmediata, corto plazo, mediano plazo), sin inventar una fecha.

**Campaña y origen:** HU-106.

**Consecuencia para O4** (≥ 85 % de solicitudes con sector, fecha de inicio y duración): con un párrafo, HubSpot no lo cuenta sin leer el texto; O4 se calcula desde las solicitudes del portal. Trade-off aceptado por D54; queda en ADR-0009.

**Límite de tamaño:** una propiedad de texto multilínea admite 65 536 caracteres, de sobra para el párrafo; se comprueba con la solicitud más larga que permite el portal.

**D86 (sponsor, 2026-10-02).** Se **crea** la propiedad «Solicitudes People Service» (texto multilínea). No se reutiliza `formato_people_service`, que ya existe en los negocios con uso desconocido, ni `description`, que Comercial escribe a mano.

## Trazabilidad

Épica madre: **EP-007** · PRD v4.18 · RF-9.3 · O4 · RF-5.1 · D-9 · B.4 · D54, D76 (sponsor, 2026-10-02) · ADR-0009 (enmienda D76) · depende de HU-102 · relacionada con HU-106, HU-161 y HU-166

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: arma el contenido del negocio de HU-102; no depende del aviso ni de la bandeja |
| N | Negociable | ✓ fija qué entra en el párrafo, que nada se inventa y que un rechazo no se disimula; orden y redacción se negocian con Comercial |
| V | Valiosa | ✓ el comercial lee el requerimiento entero en el negocio |
| E | Estimable | ✓ S: una plantilla determinista de párrafo y el mapeo a propiedades por defecto; el rechazo ya está tipificado en HU-166 |
| S | Pequeña | ✓ S: una capacidad (escribir el requerimiento) en cuatro escenarios |
| T | Testeable | ✓ el doble de la API muestra el párrafo de una solicitud completa y de una sin opcionales, y el rechazo 400; en HubSpot, un negocio ficticio muestra el párrafo en su ficha |
